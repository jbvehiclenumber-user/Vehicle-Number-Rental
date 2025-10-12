// src/routes/paymentRoutes.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 결제 생성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "user") {
      return res.status(403).json({ message: "기사만 결제할 수 있습니다." });
    }

    const { vehicleId, amount } = req.body;

    // 이미 결제했는지 확인
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        vehicleId,
        status: "completed",
      },
    });

    if (existingPayment) {
      return res.status(400).json({ message: "이미 결제한 차량입니다." });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        vehicleId,
        amount,
        status: "completed", // 실제로는 토스페이먼츠 응답 후 업데이트
        paidAt: new Date(),
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "결제에 실패했습니다." });
  }
});
// 내 결제 내역
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const { userId, userType } = (req as any).user;

    if (userType !== "user") {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "결제 내역을 불러오는데 실패했습니다." });
  }
});

export default router;
