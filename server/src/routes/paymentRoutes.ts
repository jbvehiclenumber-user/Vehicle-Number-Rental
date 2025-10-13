// src/routes/paymentRoutes.ts
import express from "express";
import {
  createPayment,
  getContactAfterPayment,
  getMyPayments,
  getPaymentStatus,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// 결제 관련 라우트
router.post("/", authMiddleware, createPayment);
router.get("/my", authMiddleware, getMyPayments);
router.get("/status/:vehicleId", authMiddleware, getPaymentStatus);
router.get("/contact/:vehicleId", authMiddleware, getContactAfterPayment);

export default router;
