// src/routes/vehicleRoutes.ts
import express from "express";
import {
  getVehicles,
  getVehicle,
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRegionStats,
  getVehicleTypeStats,
} from "../controllers/vehicleController";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middlewares/authMiddleware";

const router = express.Router();

// 공개 엔드포인트 (인증 불필요)
router.get("/", getVehicles);
router.get("/stats/region", getRegionStats);
router.get("/stats/type", getVehicleTypeStats);

// 선택적 인증 엔드포인트 (로그인한 사용자는 추가 정보 제공)
router.get("/:id", optionalAuthMiddleware, getVehicle);

// 인증 필요 엔드포인트
router.get("/my", authMiddleware, getMyVehicles);
router.post("/", authMiddleware, createVehicle);
router.put("/:id", authMiddleware, updateVehicle);
router.delete("/:id", authMiddleware, deleteVehicle);

export default router;
