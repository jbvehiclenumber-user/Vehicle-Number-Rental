// src/app.ts
/// <reference path="./types/express.d.ts" />
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

// 라우트 import
import authRoutes from "./routes/authRoutes";
import companyRoutes from "./routes/companyRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";
import paymentRoutes from "./routes/paymentRoutes";

// 미들웨어 import
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

// 미들웨어 설정
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API 라우트
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);

// 에러 핸들러 (마지막에 배치)
app.use(errorHandler);

export default app;
