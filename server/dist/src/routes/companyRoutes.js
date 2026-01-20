"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/companyRoutes.ts
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// 회사 관련 라우트
router.get("/profile", authMiddleware_1.authMiddleware, companyController_1.getCompanyProfile);
router.put("/profile", authMiddleware_1.authMiddleware, companyController_1.updateCompanyProfile);
router.put("/contact-phone", authMiddleware_1.authMiddleware, companyController_1.updateContactPhone);
router.get("/stats", authMiddleware_1.authMiddleware, companyController_1.getCompanyStats);
router.put("/verify/:companyId", authMiddleware_1.authMiddleware, companyController_1.updateCompanyVerification);
exports.default = router;
