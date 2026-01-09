import User from "../models/User.js";
import News from "../models/News.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed });
    res.json({ message: "User registered", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId=req.user.id;
    
    const user = await User.findById(userId).select("-password");
    const userNews = await News.find({ author: userId }).sort({ createdAt: -1 }); // latest first
    // ✅ Calculate total likes
    const totalLikes = userNews.reduce((sum, news) => sum + news.likes.length,0);
    res.status(200).json({
      success: true,
      user,
      totalLikes: totalLikes,
      newsCount: userNews.length,
      userNews,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const news = await News.findById(req.params.id);
    const targetId = news.author.toString();

    console.log(targetId);
    if (targetId === userId) return res.status(400).json({ message: "You can't follow yourself" });

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
    } else {
      currentUser.following.push(targetId);
      targetUser.followers.push(userId);
    }
    await currentUser.save();
    await targetUser.save();
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const isFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const news = await News.findById(req.params.id);
    const targetId = news.author.toString();

    const currentUser = await User.findById(userId);
    const isFollowing = currentUser.following.includes(targetId);

    res.json({ following: isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};