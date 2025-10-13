// src/controllers/vehicleController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const where: any = {
      isAvailable: true,
    };

    // 지역 필터
    if (region) {
      where.region = {
        contains: region as string,
        mode: "insensitive",
      };
    }

    // 차량 타입 필터
    if (vehicleType) {
      where.vehicleType = {
        contains: vehicleType as string,
        mode: "insensitive",
      };
    }

    // 톤수 필터
    if (tonnage) {
      where.tonnage = {
        contains: tonnage as string,
        mode: "insensitive",
      };
    }

    // 연식 필터
    if (yearModel) {
      where.yearModel = parseInt(yearModel as string);
    }

    // 월 지입료 필터
    if (minFee || maxFee) {
      where.monthlyFee = {};
      if (minFee) where.monthlyFee.gte = parseInt(minFee as string);
      if (maxFee) where.monthlyFee.lte = parseInt(maxFee as string);
    }

    // 검색어 필터 (차량번호, 차종, 지역에서 검색)
    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search as string, mode: "insensitive" } },
        { vehicleType: { contains: search as string, mode: "insensitive" } },
        { region: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          company: {
            select: {
              companyName: true,
              // 연락처는 결제 후에만 공개
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNum,
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      vehicles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ message: "차량 목록을 불러오는데 실패했습니다." });
  }
};

// 차량 상세 조회 - 연락처는 제외, 조회수 증가
export const getVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            companyName: true,
            // 연락처는 결제 후에만 공개
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "차량을 찾을 수 없습니다." });
    }

    // 조회수 증가 (비동기로 처리)
    prisma.vehicle
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(console.error);

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

// 차량 등록 (회사만, 인증된 회사만)
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "company") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    // 회사 인증 상태 확인
    const company = await prisma.company.findUnique({
      where: { id: userId },
      select: { verified: true },
    });

    if (!company?.verified) {
      return res.status(403).json({
        message:
          "사업자등록번호 인증이 완료된 회사만 차량을 등록할 수 있습니다.",
      });
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

    // 차량번호 중복 확인 (같은 회사 내에서)
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        companyId: userId,
        vehicleNumber,
      },
    });

    if (existingVehicle) {
      return res.status(400).json({
        message: "이미 등록된 차량번호입니다.",
      });
    }

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

// 지역별 통계 조회
export const getRegionStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.vehicle.groupBy({
      by: ["region"],
      where: {
        isAvailable: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        monthlyFee: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    res.json(stats);
  } catch (error) {
    console.error("Get region stats error:", error);
    res.status(500).json({ message: "지역별 통계 조회에 실패했습니다." });
  }
};

// 차량 타입별 통계 조회
export const getVehicleTypeStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: {
        isAvailable: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        monthlyFee: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    res.json(stats);
  } catch (error) {
    console.error("Get vehicle type stats error:", error);
    res.status(500).json({ message: "차량 타입별 통계 조회에 실패했습니다." });
  }
};
