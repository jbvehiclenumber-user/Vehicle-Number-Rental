// src/controllers/companyController.ts
import { Request, Response } from "express";
import { companyService } from "../services/companyService";
import { logger } from "../utils/logger";

// 회사 정보 조회
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;

    if (userType !== "company") {
      return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
    }

    const company = await companyService.getCompanyProfile(userId);
    res.json(company);
  } catch (error) {
    logger.error("Get company profile error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "회사 정보를 불러오는데 실패했습니다.";
    const statusCode = message.includes("찾을 수 없습니다") ? 404 : 500;
    res.status(statusCode).json({ message });
  }
};

// 회사 정보 수정
export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
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

    const updatedCompany = await companyService.updateCompanyProfile(userId, {
      companyName,
      representative,
      address,
      contactPerson,
      phone,
      email,
    });

    res.json(updatedCompany);
  } catch (error) {
    logger.error("Update company profile error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "회사 정보 수정에 실패했습니다.";
    res.status(500).json({ message });
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

    const updatedCompany = await companyService.updateCompanyVerification(
      companyId,
      verified
    );

    res.json(updatedCompany);
  } catch (error) {
    logger.error("Update company verification error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "인증 상태 업데이트에 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 회사 통계 조회
export const getCompanyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;

    if (userType !== "company") {
      return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
    }

    const stats = await companyService.getCompanyStats(userId);
    res.json(stats);
  } catch (error) {
    logger.error("Get company stats error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "통계 조회에 실패했습니다.";
    res.status(500).json({ message });
  }
};
