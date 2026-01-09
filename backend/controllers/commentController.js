import Comment from "../models/Comment.js";

// Add a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { newsId } = req.params;

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const comment = await Comment.create({
      newsId,
      userId: req.user.id, // from JWT middleware
      text,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get comments for a news
export const getComments = async (req, res) => {
  try {
    const { newsId } = req.params;

    const comments = await Comment.find({ newsId })
      .populate("userId", "name") // populate user name
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
