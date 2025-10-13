// src/controllers/companyController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 회사 정보 조회
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "company") {
      return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
    }

    const company = await prisma.company.findUnique({
      where: { id: userId },
      select: {
        id: true,
        businessNumber: true,
        companyName: true,
        representative: true,
        address: true,
        contactPerson: true,
        phone: true,
        email: true,
        verified: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: "회사 정보를 찾을 수 없습니다." });
    }

    res.json(company);
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({ message: "회사 정보를 불러오는데 실패했습니다." });
  }
};

// 회사 정보 수정
export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const {
      companyName,
      representative,
      address,
      contactPerson,
      phone,
      email,
    } = req.body;

    if (userType !== "company") {
      return res.status(403).json({ message: "회사만 수정할 수 있습니다." });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: userId },
      data: {
        companyName,
        representative,
        address,
        contactPerson,
        phone,
        email,
      },
      select: {
        id: true,
        businessNumber: true,
        companyName: true,
        representative: true,
        address: true,
        contactPerson: true,
        phone: true,
        email: true,
        verified: true,
        updatedAt: true,
      },
    });

    res.json(updatedCompany);
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({ message: "회사 정보 수정에 실패했습니다." });
  }
};

// 회사 인증 상태 업데이트 (관리자용)
export const updateCompanyVerification = async (
  req: Request,
  res: Response
) => {
  try {
    const { companyId } = req.params;
    const { verified } = req.body;

    // TODO: 관리자 권한 확인 로직 추가

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
      select: {
        id: true,
        businessNumber: true,
        companyName: true,
        verified: true,
        verifiedAt: true,
      },
    });

    res.json(updatedCompany);
  } catch (error) {
    console.error("Update company verification error:", error);
    res.status(500).json({ message: "인증 상태 업데이트에 실패했습니다." });
  }
};

// 회사 통계 조회
export const getCompanyStats = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "company") {
      return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
    }

    // 등록된 차량 수
    const totalVehicles = await prisma.vehicle.count({
      where: { companyId: userId },
    });

    // 이용 가능한 차량 수
    const availableVehicles = await prisma.vehicle.count({
      where: {
        companyId: userId,
        isAvailable: true,
      },
    });

    // 결제 완료된 조회 수
    const totalViews = await prisma.payment.count({
      where: {
        vehicle: { companyId: userId },
        status: "completed",
      },
    });

    // 최근 30일 조회 수
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentViews = await prisma.payment.count({
      where: {
        vehicle: { companyId: userId },
        status: "completed",
        paidAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      totalVehicles,
      availableVehicles,
      totalViews,
      recentViews,
    });
  } catch (error) {
    console.error("Get company stats error:", error);
    res.status(500).json({ message: "통계 조회에 실패했습니다." });
  }
};
