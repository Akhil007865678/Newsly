import { index } from "../config/pinecone.js";
import { createEmbedding } from "../utils/embedding.js";
import News from "../models/News.js";
import { Pinecone } from "@pinecone-database/pinecone";
import redisClient from "../config/redis.js";
import { ChatGroq } from "@langchain/groq";


const pinecone = new Pinecone({
  apiKey: process.env.PineCone_Key,
});

const index2 = pinecone.index("rag-news");

function averageVectors(vectors) {
  if (!vectors || vectors.length === 0) return [];

  const dimension = vectors[0].length;
  const avgVector = new Array(dimension).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < dimension; i++) {
      avgVector[i] += vector[i];
    }
  }

  for (let i = 0; i < dimension; i++) {
    avgVector[i] /= vectors.length;
  }

  return avgVector;
}

export const storeNewsVector = async (req, res) => {
  try {
    const { _id, title, content, category, author, createdAt } = req.body;

    if (!_id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    ////Store data for recommendations
    const embedding = await createEmbedding(
      `${title} ${content} ${category || ""}`
    );

    await index.upsert([
      {
        id: _id.toString(),
        values: embedding,
        metadata: {
          title,
          category,
          author,
          createdAt,
        },
      },
    ]);
    
    ////Store data for Rag Ai
    const text = `${title}\n\n${content}`;

    // chunking
    const chunks = [];
    for (let i = 0; i < text.length; i += 500) {
      chunks.push(text.slice(i, i + 500));
    }

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);

      await index2.upsert([
        {
          id: `rag_${_id}_${i}`,
          values: embedding,
          metadata: {
            type: "rag",
            newsId: _id.toString(),
            title,
            category,
            author,
            createdAt,
            chunk_text: chunks[i],
          },
        },
      ]);
    }

    res.status(200).json({ message: "News vector stored successfully" });
  } catch (error) {
    console.error("VECTOR ERROR 👉", error);
    res.status(500).json({
      error: "Vector insert failed",
      details: error.message,
    });
  }
};

export const recommendNews = async (req, res) => {
  try {
    const cacheKey = `news:${req.user.id}`;
    const likedNews = await News.find({ likes: req.user.id });
    const cachedNews = await redisClient.get(cacheKey);

    if (cachedNews) {
      console.log("Redis called and it is working");
      return res.json(JSON.parse(cachedNews));
    }

    // Cold start: new user
    if (likedNews.length === 0) {
      const allNews = await News.find()
        .sort({ createdAt: -1 })
        .limit(20);

      return res.json({
        coldStart: true,
        recommendations: allNews,
      });
    }

    // Generate embeddings for liked news
    const embeddings = await Promise.all(
      likedNews.map(news =>
        createEmbedding(`${news.title} ${news.content}`) // keep same as stored
      )
    );

    // Average embeddings to create user vector
    const userVector = averageVectors(embeddings);

    // Query Pinecone (recommendation type only)
    const result = await index.query({
      vector: userVector,
      topK: 10,
      includeMetadata: true,
    });

    const likedIds = new Set(likedNews.map(n => n._id.toString()));

    // Extract news IDs correctly (strip "rec_" prefix)
    const ids = result.matches.map(m => m.id).filter(id => !likedIds.has(id));

    if (!ids.length) {
      return res.json({ recommendations: [] });
    }

    // Fetch news from DB and preserve Pinecone order
    const newsDocs = await News.find({ _id: { $in: ids } });
    const newsMap = new Map(newsDocs.map(n => [n._id.toString(), n]));
    const recommendations = ids.map(id => newsMap.get(id)).filter(Boolean);

    // Cache
    await redisClient.setEx(cacheKey, 600, JSON.stringify(recommendations));

    res.json({ recommendations });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: "Recommendation failed" });
  }
};

export const askRagAI = async (req, res) => {
  try {
    const sessionId = req.user?.id || req.body.sessionId;
    const memoryKey = `chat:memory:${sessionId}`;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Question is required" });
    }

    // 1️⃣ Load memory from Redis
    let memory = [];
    const redisMemory = await redisClient.get(memoryKey);
    if (redisMemory) {
      memory = JSON.parse(redisMemory);
    }

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-20b",
    });

    // 2️⃣ Get last assistant answer (for follow-ups)
    const lastAssistantAnswer = memory
      .filter(m => m.role === "assistant")
      .slice(-1)[0]?.content || "";

    // 3️⃣ Rewrite follow-up question
    const rewritePrompt = [
      {
        role: "system",
        content:
          "Rewrite the follow-up question into a standalone question using the previous answer topic. Do not answer."
      },
      {
        role: "user",
        content: `
Previous answer:
${lastAssistantAnswer}

Follow-up question:
${query}

Standalone question:
`
      }
    ];

    const rewriteRes = await llm.invoke(rewritePrompt);
    const standaloneQuery = rewriteRes.content.trim();

    // 4️⃣ Embed rewritten query
    const queryEmbedding = await createEmbedding(standaloneQuery);

    // 5️⃣ Pinecone search
    const results = await index2.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    let context = results.matches
      .map(m => m.metadata?.chunk_text)
      .filter(Boolean)
      .join("\n\n");

    // 6️⃣ Fallback to previous answer if Pinecone is weak
    if (!context || context.length < 100) {
      context = lastAssistantAnswer;
    }

    // 🔒 Safety: still no context → refuse
    if (!context) {
      return res.json({
        answer:
          "I'm an Newsly AI assistant trained specifically on the Newsly project. I don't have enough information to answer that."
      });
    }

    // 7️⃣ Add user question to memory AFTER loading
    memory.push({ role: "user", content: query });

    const messages = [
      {
        role: "system",
        content: `
          You are a strict Newsly AI.
          Rules:
          - Answer using ONLY the provided context.
          - Do NOT mention the context, source, or phrases like
            "in the context provided", "according to the text", or "based on the information".
          - Write naturally, as if explaining the news directly to a reader.
          - Do NOT add external knowledge.
          - If the answer is not present, say you do not know.
          - Respond in plain text only.
          If the answer is NOT present in the context, say:
          "I'm an Newsly AI assistant trained specifically on the Newsly project. I can answer any questions about Newsly's news, but I don't have information outside of it."
          `
      },
      ...memory.slice(-6),
      {
        role: "user",
        content: `
          Context:
          ${context}

          Question:
          ${standaloneQuery}
        `
      }
    ];

    // 8️⃣ Final answer
    const response = await llm.invoke(messages);

    // 9️⃣ Save assistant answer
    memory.push({
      role: "assistant",
      content: response.content
    });

    // 🔟 Limit memory BEFORE saving
    memory = memory.slice(-10);

    await redisClient.setEx(memoryKey, 300, JSON.stringify(memory));

    res.json({ answer: response.content });

  } catch (error) {
    console.error("RAG error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/*
export const ragDataUpload = async (req, res) => {
  try {
    const { _id, title, content, category, author, createdAt } = req.body;

    if (!_id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const text = `${title}\n\n${content}`;

    // chunking
    const chunks = [];
    for (let i = 0; i < text.length; i += 500) {
      chunks.push(text.slice(i, i + 500));
    }

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);

      await index2.upsert([
        {
          id: `rag_${_id}_${i}`,
          values: embedding,
          metadata: {
            type: "rag",
            newsId: _id.toString(),
            title,
            category,
            author,
            createdAt,
            chunk_text: chunks[i],
          },
        },
      ]);
    }

    console.log(`✅ Backfilled news: ${title}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Backfill error:", error);
    res.status(500).json({ error: "Backfill failed" });
  }
};
*/