// src/routes/authRoutes.ts
import express from "express";
import {
  registerUser,
  registerCompany,
  login,
  verifyBusinessNumber,
  getCurrentUser,
  updateUserProfile,
  switchCompany,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// 회원가입/로그인
router.post("/register/user", registerUser);
router.post("/register/company", registerCompany);
router.post("/login", login);

// 인증 관련
router.post("/verify-business", verifyBusinessNumber);

// 사용자 정보
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateUserProfile);

// 회사 전환
router.post("/switch-company", authMiddleware, switchCompany);

export default router;
