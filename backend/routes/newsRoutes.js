import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createNews, getAllNews, getUserNews, updateNews, toggleLike, isLike, getAuthor, getSearchNews } from "../controllers/newsController.js";
import { ai } from "../controllers/ai.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "newsly_images", allowed_formats: ["jpg", "png", "jpeg"] },
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("image"), createNews);
router.get("/", getAllNews);
router.get("/user", verifyToken, getUserNews);
router.post("/newsly", ai);

router.get("/search/:query", getSearchNews);
router.put("/:id", verifyToken, updateNews);
router.post("/:id/like", verifyToken, toggleLike);
router.get("/islike/:id", verifyToken, isLike);
router.get("/author/:authorId", getAuthor);

export default router;