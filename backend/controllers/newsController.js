import News from "../models/News.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import redisClient from "../config/redis.js";

/*export const createNews = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = req.file.path;

    const news = await News.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      imageUrl,
      author: req.user.id,
    });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};*/
export const createNews = async (req, res) => {
  try {
    const { title, content, category, location, tags } = req.body;
    let imageUrl = "";
    if (req.file) imageUrl = req.file.path;
    const news = await News.create({
      title,
      content,
      category,
      location,
      tags,
      imageUrl,
      author: req.user.id,
    });

    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const cacheKey = "news:all";
    // 1️⃣ Check cache
    const cachedNews = await redisClient.get(cacheKey);
    if (cachedNews) {
      console.log("redis called and it is working");
      return res.json(JSON.parse(cachedNews));
    }
    // 2️⃣ Fetch from DB
    const news = await News.find().populate("author", "name profilePic").sort({ createdAt: -1 });
    // 3️⃣ Store in cache (5 minutes)
    await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(news)
    );
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//not used till now
export const getUserNews = async (req, res) => {
  try {
    const news = await News.find({ userId: req.userId });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

//not used till now
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    news.title = req.body.title;
    news.description = req.body.description;

    // Optional: allow updating image if sent
    if (req.body.image) news.image = req.body.image;

    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const userId = req.user.id;
    const isLiked = news.likes.includes(userId);
    
    if (isLiked) {
      news.likes = news.likes.filter((id) => id.toString() !== userId);
    } else {
      news.likes.push(userId);
    }

    await news.save();
    res.json({ likes: news.likes.length, isLiked: !isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAuthor = async (req, res) => {
  try{
    const { authorId } = req.params;
    const author = await User.findById(authorId);
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
}

export const getSearchNews = async (req, res) => {
  try {
    const { query } = req.params;
    const cacheKey = `search${query}`;
    // 1️⃣ Check cache
    const cachedNews = await redisClient.get(cacheKey);
    if (cachedNews) {
      console.log("redis called and it is working");
      return res.json(JSON.parse(cachedNews));
    }
    const news = await News.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    });
    await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(news)
    );
    //console.log("news: ", news);
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};