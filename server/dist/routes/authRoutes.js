"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// 회원가입/로그인
router.post("/register/user", authController_1.registerUser);
router.post("/register/company", authController_1.registerCompany);
router.post("/login", authController_1.login);
// 인증 관련
router.post("/verify-business", authController_1.verifyBusinessNumber);
// 사용자 정보
router.get("/me", authMiddleware_1.authMiddleware, authController_1.getCurrentUser);
router.put("/profile", authMiddleware_1.authMiddleware, authController_1.updateUserProfile);
exports.default = router;
