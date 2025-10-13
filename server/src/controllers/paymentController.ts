// src/controllers/paymentController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 고정 결제 금액 (1만원)
const FIXED_PAYMENT_AMOUNT = 10000;

// 결제 요청 (번호 조회를 위한 결제)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { vehicleId } = req.body;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 결제할 수 있습니다." });
    }

    // 차량 존재 확인
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { company: true },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "차량을 찾을 수 없습니다." });
    }

    if (!vehicle.isAvailable) {
      return res
        .status(400)
        .json({ message: "현재 이용 불가능한 차량입니다." });
    }

    // 이미 결제한 번호인지 확인
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        vehicleId,
        status: "completed",
      },
    });

    if (existingPayment) {
      return res.status(400).json({ message: "이미 결제한 번호입니다." });
    }

    // 결제 생성 (실제로는 토스페이먼츠 등 연동 필요)
    const payment = await prisma.payment.create({
      data: {
        userId,
        vehicleId,
        amount: FIXED_PAYMENT_AMOUNT,
        status: "pending",
      },
    });

    // TODO: 실제 결제 API 연동 (토스페이먼츠, 이니시스 등)
    // 여기서는 시뮬레이션으로 바로 완료 처리
    const completedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        paidAt: new Date(),
        paymentMethod: "card", // 실제로는 결제 수단에 따라
      },
    });

    res.status(201).json({
      payment: completedPayment,
      message: "결제가 완료되었습니다.",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "결제에 실패했습니다." });
  }
};

// 결제 완료 후 연락처 조회
export const getContactAfterPayment = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { vehicleId } = req.params;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    // 결제 완료 확인
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        vehicleId,
        status: "completed",
      },
      include: {
        vehicle: {
          include: {
            company: {
              select: {
                companyName: true,
                phone: true,
                contactPerson: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(403).json({
        message: "결제가 완료되지 않아 연락처를 조회할 수 없습니다.",
      });
    }

    res.json({
      vehicle: {
        id: payment.vehicle.id,
        vehicleNumber: payment.vehicle.vehicleNumber,
        vehicleType: payment.vehicle.vehicleType,
        region: payment.vehicle.region,
        description: payment.vehicle.description,
      },
      company: payment.vehicle.company,
      payment: {
        amount: payment.amount,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({ message: "연락처 조회에 실패했습니다." });
  }
};

// 내 결제 내역 조회
export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        vehicle: {
          include: {
            company: {
              select: {
                companyName: true,
                phone: true,
                contactPerson: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (error) {
    console.error("Get my payments error:", error);
    res.status(500).json({ message: "결제 내역을 불러오는데 실패했습니다." });
  }
};

// 결제 상태 확인
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { vehicleId } = req.params;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 조회할 수 있습니다." });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        vehicleId,
      },
      include: {
        vehicle: {
          select: {
            vehicleNumber: true,
            region: true,
          },
        },
      },
    });

    if (!payment) {
      return res.json({
        hasPaid: false,
        message: "결제가 필요합니다.",
      });
    }

    res.json({
      hasPaid: payment.status === "completed",
      payment,
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ message: "결제 상태 조회에 실패했습니다." });
  }
};
