// src/routes/vehicleRoutes.ts
import express from "express";
import {
  getVehicles,
  getVehicle,
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getVehicles);
router.get("/my", authMiddleware, getMyVehicles);
router.get("/:id", authMiddleware, getVehicle);
router.post("/", authMiddleware, createVehicle);
router.put("/:id", authMiddleware, updateVehicle);
router.delete("/:id", authMiddleware, deleteVehicle);

export default router;
