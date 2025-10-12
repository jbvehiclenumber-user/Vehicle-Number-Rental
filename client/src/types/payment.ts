export interface Payment {
  id: string;
  userId: string;
  vehicleId: string;
  amount: number;
  paymentMethod?: string;
  paymentKey?: string;
  status: "pending" | "completed" | "failed";
  paidAt?: string;
  createdAt: string;
}

export interface PaymentRequest {
  vehicleId: string;
  amount: number;
}
