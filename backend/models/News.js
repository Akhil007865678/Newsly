import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    category: { type: String, default: "General" },
    location: { type: String, default: "Global" },
    category: String,
    imageUrl: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ratings: [{ userId: String, value: Number }],
    averageRating: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
