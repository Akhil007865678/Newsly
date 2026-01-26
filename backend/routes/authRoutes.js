import express from "express";
import { register, login, getMe, toggleFollow, isFollow } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { storeNewsVector, recommendNews, askRagAI } from "../controllers/recommendation.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/store-vector", storeNewsVector);
router.get("/recommend", verifyToken, recommendNews);
router.post("/ask",askRagAI);

router.post("/follow/:id", verifyToken, toggleFollow);
router.post("/:id/isfollow", verifyToken, isFollow);

export default router;