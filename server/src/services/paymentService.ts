// src/services/paymentService.ts
import { paymentRepository } from "../repositories/paymentRepository";
import { vehicleRepository } from "../repositories/vehicleRepository";
import { logger } from "../utils/logger";

// 고정 결제 금액 (1만원)
export const FIXED_PAYMENT_AMOUNT = 10000;

export class PaymentService {
  /**
   * 결제 생성
   */
  async createPayment(userId: string, vehicleId: string) {
    // 차량 존재 확인
    const vehicle = await vehicleRepository.findById(vehicleId, true);
    if (!vehicle) {
      throw new Error("차량을 찾을 수 없습니다.");
    }

    if (!vehicle.isAvailable) {
      throw new Error("현재 이용 불가능한 차량입니다.");
    }

    // 이미 결제한 번호인지 확인
    const existingPayment = await paymentRepository.findCompletedByUserAndVehicle(
      userId,
      vehicleId
    );
    if (existingPayment) {
      throw new Error("이미 결제한 번호입니다.");
    }

    // 결제 생성 (실제로는 토스페이먼츠 등 연동 필요)
    const payment = await paymentRepository.create({
      userId,
      vehicleId,
      amount: FIXED_PAYMENT_AMOUNT,
      status: "pending",
    });

    // TODO: 실제 결제 API 연동 (토스페이먼츠, 이니시스 등)
    // 여기서는 시뮬레이션으로 바로 완료 처리
    const completedPayment = await paymentRepository.update(payment.id, {
      status: "completed",
      paidAt: new Date(),
      paymentMethod: "card", // 실제로는 결제 수단에 따라
    });

    logger.info("Payment completed", {
      paymentId: completedPayment.id,
      userId,
      vehicleId,
      amount: completedPayment.amount,
    });

    return completedPayment;
  }

  /**
   * 결제 완료 후 연락처 조회
   */
  async getContactAfterPayment(userId: string, vehicleId: string) {
    // 결제 완료 확인
    const payment = await paymentRepository.findCompletedWithVehicleAndCompany(
      userId,
      vehicleId
    );

    if (!payment) {
      throw new Error("결제가 완료되지 않아 연락처를 조회할 수 없습니다.");
    }

    return {
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
    };
  }

  /**
   * 내 결제 내역 조회
   */
  async getMyPayments(userId: string) {
    return paymentRepository.findByUserId(userId);
  }

  /**
   * 결제 상태 확인
   */
  async getPaymentStatus(userId: string, vehicleId: string) {
    const payment = await paymentRepository.findStatusByUserAndVehicle(
      userId,
      vehicleId
    );

    if (!payment) {
      return {
        hasPaid: false,
        message: "결제가 필요합니다.",
      };
    }

    return {
      hasPaid: payment.status === "completed",
      payment,
    };
  }
}

export const paymentService = new PaymentService();
