// src/controllers/vehicleController.ts
import { Request, Response } from "express";
import { vehicleService } from "../services/vehicleService";
import { logger } from "../utils/logger";

// 차량 목록 조회 (필터링) - 연락처는 제외
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const {
      region,
      vehicleType,
      minFee,
      maxFee,
      tonnage,
      yearModel,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      region: region as string | undefined,
      vehicleType: vehicleType as string | undefined,
      minFee: minFee ? parseInt(minFee as string) : undefined,
      maxFee: maxFee ? parseInt(maxFee as string) : undefined,
      tonnage: tonnage as string | undefined,
      yearModel: yearModel ? parseInt(yearModel as string) : undefined,
      search: search as string | undefined,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await vehicleService.getVehicles(filter, pagination);
    res.json(result);
  } catch (error) {
    logger.error("Get vehicles error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 목록을 불러오는데 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 차량 상세 조회 - 연락처는 제외, 조회수 증가
export const getVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicle(id);
    res.json(vehicle);
  } catch (error) {
    logger.error("Get vehicle error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 정보를 불러오는데 실패했습니다.";
    const statusCode = message.includes("찾을 수 없습니다") ? 404 : 500;
    res.status(statusCode).json({ message });
  }
};

// 내 차량 목록 조회 (회사만)
export const getMyVehicles = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const vehicles = await vehicleService.getMyVehicles(userId);
    res.json(vehicles);
  } catch (error) {
    logger.error("Get my vehicles error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 목록을 불러오는데 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 차량 등록 (회사만, 인증된 회사만)
export const createVehicle = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const {
      vehicleNumber,
      vehicleType,
      tonnage,
      yearModel,
      region,
      insuranceRate,
      monthlyFee,
      description,
    } = req.body;

    const vehicle = await vehicleService.createVehicle(userId, {
      vehicleNumber,
      vehicleType,
      tonnage,
      yearModel,
      region,
      insuranceRate,
      monthlyFee,
      description,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    logger.error("Create vehicle error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 등록에 실패했습니다.";
    let statusCode = 500;
    if (message.includes("인증이 완료") || message.includes("이미 등록")) statusCode = 403;
    else if (message.includes("이미 등록")) statusCode = 400;
    res.status(statusCode).json({ message });
  }
};

// 차량 수정 (회사만, 본인 차량만)
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const { id } = req.params;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const {
      vehicleNumber,
      vehicleType,
      tonnage,
      yearModel,
      region,
      insuranceRate,
      monthlyFee,
      description,
      isAvailable,
    } = req.body;

    const updatedVehicle = await vehicleService.updateVehicle(id, userId, {
      vehicleNumber,
      vehicleType,
      tonnage,
      yearModel,
      region,
      insuranceRate,
      monthlyFee,
      description,
      isAvailable,
    });

    res.json(updatedVehicle);
  } catch (error) {
    logger.error("Update vehicle error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 수정에 실패했습니다.";
    let statusCode = 500;
    if (message.includes("찾을 수 없습니다")) statusCode = 404;
    else if (message.includes("본인의 차량만")) statusCode = 403;
    res.status(statusCode).json({ message });
  }
};

// 차량 삭제 (회사만, 본인 차량만)
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const { id } = req.params;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const result = await vehicleService.deleteVehicle(id, userId);
    res.json(result);
  } catch (error) {
    logger.error("Delete vehicle error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 삭제에 실패했습니다.";
    let statusCode = 500;
    if (message.includes("찾을 수 없습니다")) statusCode = 404;
    else if (message.includes("본인의 차량만")) statusCode = 403;
    res.status(statusCode).json({ message });
  }
};

// 지역별 통계 조회
export const getRegionStats = async (req: Request, res: Response) => {
  try {
    const stats = await vehicleService.getRegionStats();
    res.json(stats);
  } catch (error) {
    logger.error("Get region stats error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "지역별 통계 조회에 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 차량 타입별 통계 조회
export const getVehicleTypeStats = async (req: Request, res: Response) => {
  try {
    const stats = await vehicleService.getVehicleTypeStats();
    res.json(stats);
  } catch (error) {
    logger.error("Get vehicle type stats error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "차량 타입별 통계 조회에 실패했습니다.";
    res.status(500).json({ message });
  }
};
