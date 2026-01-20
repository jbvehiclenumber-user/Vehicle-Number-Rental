"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/vehicleRoutes.ts
const express_1 = __importDefault(require("express"));
const vehicleController_1 = require("../controllers/vehicleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// 공개 엔드포인트 (인증 불필요)
router.get("/", vehicleController_1.getVehicles);
router.get("/stats/region", vehicleController_1.getRegionStats);
router.get("/stats/type", vehicleController_1.getVehicleTypeStats);
// 인증 필요 엔드포인트 (구체적인 경로는 동적 라우트보다 먼저 정의)
router.get("/my", authMiddleware_1.authMiddleware, vehicleController_1.getMyVehicles);
// 선택적 인증 엔드포인트 (로그인한 사용자는 추가 정보 제공)
router.get("/:id", authMiddleware_1.optionalAuthMiddleware, vehicleController_1.getVehicle);
router.post("/", authMiddleware_1.authMiddleware, vehicleController_1.createVehicle);
router.put("/:id", authMiddleware_1.authMiddleware, vehicleController_1.updateVehicle);
router.delete("/:id", authMiddleware_1.authMiddleware, vehicleController_1.deleteVehicle);
exports.default = router;
