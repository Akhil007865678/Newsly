import express from "express";
import { addComment, getComments } from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/:newsId", verifyToken, addComment);
router.get("/:newsId", getComments);

export default router;
