import { index } from "../config/pinecone.js";
import { createEmbedding } from "../utils/embedding.js";
import News from "../models/News.js";
import User from "../models/User.js";
import redisClient from "../config/redis.js";

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
      console.log("redis called and it is working");
      return res.json(JSON.parse(cachedNews));
    }

    // 🧊 COLD START: New user
    if (likedNews.length === 0) {
      const allNews = await News.find()
        .sort({ createdAt: -1 }) // latest first
        .limit(20);

      return res.json({
        coldStart: true,
        recommendations: allNews,
      });
    }

    /*
    it converts :
    likedNews = [
      { title: "AI in Healthcare", embedding: [0.1, 0.2, 0.3] },
      { title: "Future of AI", embedding: [0.2, 0.1, 0.4] },
      { title: "Machine Learning Trends", embedding: [0.15, 0.25, 0.35] }
    ];
    into after .map():
    embeddings = [
      [0.1, 0.2, 0.3],
      [0.2, 0.1, 0.4],
      [0.15, 0.25, 0.35]
    ];

    */
    const embeddings = await Promise.all(
      likedNews.map(news =>
        createEmbedding(`${news.title} ${news.content} ${news.category || ""}`)
      )
    );

    //averageVectors converts all vectors into one average vector
    const userVector = averageVectors(embeddings);
    
    //this block of code return top 10 relevent news on the basis of userVector
    const result = await index.query({
      vector: userVector,
      topK: 10,
      includeMetadata: true,
    });

    const likedIds = new Set(likedNews.map(n => n._id.toString()));

    //It removes already-liked news from the recommendations and extracts only the IDs of the remaining news.
    const ids = result.matches.filter(m => !likedIds.has(m.id)).map(m => m.id);
    const recommendations = await News.find({ _id: { $in: ids } });

    await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(recommendations)
    );
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: "Recommendation failed" });
  }
};
