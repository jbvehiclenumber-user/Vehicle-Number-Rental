// src/routes/authRoutes.ts
import express from "express";
import {
  registerUser,
  registerCompany,
  login,
  verifyBusinessNumber,
  getCurrentUser,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register/user", registerUser);
router.post("/register/company", registerCompany);
router.post("/login", login);
router.post("/verify-business", verifyBusinessNumber);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
