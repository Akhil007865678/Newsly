// this folder runs only ones when we want to create an index(database) in pincone
// A Pinecone index is like a database, similar to a college database, but instead of storing rows & columns, it stores vectors (embeddings).
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const pinecone = new Pinecone({
  apiKey: "pcsk_6znCJr_AsbTMta75dZQHib2gQ3oEeqqiFn1yzReh3UvAeyn5GFEkS1jDJUviGiF6TZLtTF",
});

async function createIndex() {
  await pinecone.createIndex({
    name: "news-index",
    dimension: 384, // 🔥 MiniLM embedding size
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });

  console.log("✅ Pinecone index created successfully");
}

createIndex();
