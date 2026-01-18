import express from "express";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/* ================== CLIENT SETUP ================== */

const openai = new OpenAI({
  apiKey: process.env.Ai_key,
  baseURL: "https://api.groq.com/openai/v1",
});

const pinecone = new Pinecone({
  apiKey: process.env.PineCone_Key,
});

const index = pinecone.index("developer-quickstart-js");

/* ================== ASK ROUTE ================== */

export const ai = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    /* ===== 1. Search similar chunks from Pinecone ===== */

    const results = await index.searchRecords({query: {
        topK: 5,
        inputs: { text: query },
      },
    });

    const context = results.result.hits
      .map(hit => hit.fields.chunk_text)
      .join("\n\n");

    /* ===== 2. Prepare messages ===== */

    const messages = [
      {
        role: "system",
        content: `
            You are a strict question-answering system.
            You must answer ONLY using the provided context.
            If the answer is NOT present in the context, say:
            "I’m an AI assistant trained specifically on the Newsly project. I can answer any questions about Newsly, but I don’t have information outside of it."
            Do NOT use prior knowledge.
            Do NOT make assumptions.
            Respond in plain text only. Do not use any Markdown formatting, symbols, or special characters like asterisks or hashtags for emphasis.
        `,
      },
      {
        role: "user",
        content: `
            Context:
            ${context}
            
            Question:
            ${query}
        `,
      },
    ];

    /* ===== 3. Generate answer from LLM ===== */

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages,
    });

    const answer = completion.choices[0].message.content;

    /* ===== 4. Send response ===== */

    return res.status(200).json({
      success: true,
      query,
      answer,
    });

  } catch (error) {
    console.error("ASK ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};