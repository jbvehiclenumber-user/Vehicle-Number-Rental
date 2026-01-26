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
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";
import {
  getKakaoAuthUrl,
  kakaoCallback,
  getGoogleAuthUrl,
  googleCallback,
} from "../controllers/oauthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// 회원가입/로그인
router.post("/register/user", registerUser);
router.post("/register/company", registerCompany);
router.post("/login", login);

// OAuth 인증
router.get("/oauth/kakao/url", getKakaoAuthUrl);
router.get("/oauth/kakao/callback", kakaoCallback);
router.get("/oauth/google/url", getGoogleAuthUrl);
router.get("/oauth/google/callback", googleCallback);

// 인증 관련
router.post("/verify-business", verifyBusinessNumber);

// 사용자 정보
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateUserProfile);

// 회사 전환
router.post("/switch-company", authMiddleware, switchCompany);

// 비밀번호 찾기
router.post("/password/reset-request", requestPasswordReset);
router.post("/password/reset", resetPassword);

export default router;
