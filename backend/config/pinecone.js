import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

export const pinecone = new Pinecone({
  apiKey: process.env.PineCone_Key,
});

export const index = pinecone.index("news-index");
