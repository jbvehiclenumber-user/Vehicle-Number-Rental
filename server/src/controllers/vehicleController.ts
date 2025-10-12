// src/controllers/vehicleController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 차량 목록 조회 (필터링)
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { region, vehicleType, minFee, maxFee } = req.query;

    const where: any = {
      isAvailable: true,
    };

    if (region) where.region = region as string;
    if (vehicleType) where.vehicleType = vehicleType as string;
    if (minFee || maxFee) {
      where.monthlyFee = {};
      if (minFee) where.monthlyFee.gte = parseInt(minFee as string);
      if (maxFee) where.monthlyFee.lte = parseInt(maxFee as string);
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        company: {
          select: {
            companyName: true,
            phone: true,
            contactPerson: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(vehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ message: "차량 목록을 불러오는데 실패했습니다." });
  }
};

// 차량 상세 조회
export const getVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            companyName: true,
            phone: true,
            contactPerson: true,
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "차량을 찾을 수 없습니다." });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);
    res.status(500).json({ message: "차량 정보를 불러오는데 실패했습니다." });
  }
};

// 내 차량 목록 조회 (회사만)
export const getMyVehicles = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        companyId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(vehicles);
  } catch (error) {
    console.error("Get my vehicles error:", error);
    res.status(500).json({ message: "차량 목록을 불러오는데 실패했습니다." });
  }
};

// 차량 등록 (회사만)
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

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

    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: userId,
        vehicleNumber,
        vehicleType,
        tonnage,
        yearModel,
        region,
        insuranceRate,
        monthlyFee,
        description,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({ message: "차량 등록에 실패했습니다." });
  }
};

// 차량 수정 (회사만, 본인 차량만)
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { id } = req.params;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    // 본인 차량인지 확인
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "차량을 찾을 수 없습니다." });
    }

    if (vehicle.companyId !== userId) {
      return res
        .status(403)
        .json({ message: "본인의 차량만 수정할 수 있습니다." });
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

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleNumber,
        vehicleType,
        tonnage,
        yearModel,
        region,
        insuranceRate,
        monthlyFee,
        description,
        isAvailable,
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ message: "차량 수정에 실패했습니다." });
  }
};

// 차량 삭제 (회사만, 본인 차량만)
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { id } = req.params;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    // 본인 차량인지 확인
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "차량을 찾을 수 없습니다." });
    }

    if (vehicle.companyId !== userId) {
      return res
        .status(403)
        .json({ message: "본인의 차량만 삭제할 수 있습니다." });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    res.json({ message: "차량이 삭제되었습니다." });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ message: "차량 삭제에 실패했습니다." });
  }
};
