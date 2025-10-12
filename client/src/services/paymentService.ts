import api from "./api";
import { Payment, PaymentRequest } from "../types/payment";

export const paymentService = {
  // 결제 요청
  createPayment: async (data: PaymentRequest): Promise<Payment> => {
    const response = await api.post("/payments", data);
    return response.data;
  },

  // 결제 승인 (토스페이먼츠 콜백)
  confirmPayment: async (
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<Payment> => {
    const response = await api.post("/payments/confirm", {
      paymentKey,
      orderId,
      amount,
    });
    return response.data;
  },

  // 내 결제 내역
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await api.get("/payments/my");
    return response.data;
  },
};
