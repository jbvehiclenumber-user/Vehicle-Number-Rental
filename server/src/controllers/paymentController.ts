// src/controllers/paymentController.ts
import { Request, Response } from "express";
import { paymentService } from "../services/paymentService";
import { logger } from "../utils/logger";

// 결제 요청 (번호 조회를 위한 결제)
export const createPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const { vehicleId } = req.body;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 결제할 수 있습니다." });
    }

    const payment = await paymentService.createPayment(userId, vehicleId);

    res.status(201).json({
      payment,
      message: "결제가 완료되었습니다.",
    });
  } catch (error) {
    logger.error("Create payment error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "결제에 실패했습니다.";
    let statusCode = 500;
    if (message.includes("찾을 수 없습니다")) statusCode = 404;
    else if (message.includes("이미 결제") || message.includes("불가능")) statusCode = 400;
    res.status(statusCode).json({ message });
  }
};

// 결제 완료 후 연락처 조회
export const getContactAfterPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const { vehicleId } = req.params;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    const result = await paymentService.getContactAfterPayment(userId, vehicleId);
    res.json(result);
  } catch (error) {
    logger.error("Get contact error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "연락처 조회에 실패했습니다.";
    const statusCode = message.includes("완료되지 않아") ? 403 : 500;
    res.status(statusCode).json({ message });
  }
};

// 내 결제 내역 조회
export const getMyPayments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    const payments = await paymentService.getMyPayments(userId);
    res.json(payments);
  } catch (error) {
    logger.error("Get my payments error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "결제 내역을 불러오는데 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 결제 상태 확인
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const { vehicleId } = req.params;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    const result = await paymentService.getPaymentStatus(userId, vehicleId);
    res.json(result);
  } catch (error) {
    logger.error("Get payment status error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "결제 상태 조회에 실패했습니다.";
    res.status(500).json({ message });
  }
};
