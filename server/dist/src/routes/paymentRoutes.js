"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/paymentRoutes.ts
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// 결제 관련 라우트
router.post("/", authMiddleware_1.authMiddleware, paymentController_1.createPayment);
router.get("/my", authMiddleware_1.authMiddleware, paymentController_1.getMyPayments);
router.get("/status/:vehicleId", authMiddleware_1.authMiddleware, paymentController_1.getPaymentStatus);
router.get("/contact/:vehicleId", authMiddleware_1.authMiddleware, paymentController_1.getContactAfterPayment);
exports.default = router;
