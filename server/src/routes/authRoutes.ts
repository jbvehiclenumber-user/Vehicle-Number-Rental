// src/routes/authRoutes.ts
import express from "express";
import {
  registerUser,
  registerCompany,
  login,
  verifyBusinessNumber,
  verifyUser,
  sendVerificationCode,
  getCurrentUser,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// 회원가입/로그인
router.post("/register/user", registerUser);
router.post("/register/company", registerCompany);
router.post("/login", login);

// 인증 관련
router.post("/verify-business", verifyBusinessNumber);
router.post("/send-verification", sendVerificationCode);
router.post("/verify-user", authMiddleware, verifyUser);

// 사용자 정보
router.get("/me", authMiddleware, getCurrentUser);

export default router;
