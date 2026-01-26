"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
/// <reference path="./types/express.d.ts" />
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// 라우트 import
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const vehicleRoutes_1 = __importDefault(require("./routes/vehicleRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
// 미들웨어 import
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 미들웨어 설정
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : ["http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // origin이 없는 경우 (같은 도메인에서의 요청 등) 허용
        if (!origin)
            return callback(null, true);
        // 허용된 origin인지 확인 (슬래시 제거 후 비교)
        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some((allowed) => allowed.replace(/\/$/, "") === normalizedOrigin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 루트 경로
app.get("/", (req, res) => {
    res.json({
        message: "Vehicle Number Rental API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: "/api/auth",
            vehicles: "/api/vehicles",
            companies: "/api/companies",
            payments: "/api/payments"
        }
    });
});
// 헬스체크
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// API 라우트
app.use("/api/auth", authRoutes_1.default);
app.use("/api/companies", companyRoutes_1.default);
app.use("/api/vehicles", vehicleRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
// 에러 핸들러 (마지막에 배치)
app.use(errorHandler_1.errorHandler);
exports.default = app;
