// src/routes/companyRoutes.ts
import express from "express";
import {
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyVerification,
  getCompanyStats,
} from "../controllers/companyController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// 회사 관련 라우트
router.get("/profile", authMiddleware, getCompanyProfile);
router.put("/profile", authMiddleware, updateCompanyProfile);
router.get("/stats", authMiddleware, getCompanyStats);
router.put("/verify/:companyId", authMiddleware, updateCompanyVerification);

export default router;
