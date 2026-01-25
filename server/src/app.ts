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
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // origin이 없는 경우 (같은 도메인에서의 요청 등) 허용
      if (!origin) return callback(null, true);
      
      // 허용된 origin인지 확인 (슬래시 제거 후 비교)
      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, "") === normalizedOrigin
      );
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
