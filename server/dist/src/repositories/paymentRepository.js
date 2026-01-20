"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
// src/repositories/paymentRepository.ts
const prisma_1 = require("../utils/prisma");
class PaymentRepository {
    /**
     * 결제 생성
     */
    async create(data) {
        return prisma_1.prisma.payment.create({
            data: {
                userId: data.userId,
                vehicleId: data.vehicleId,
                amount: data.amount,
                status: data.status || "pending",
            },
        });
    }
    /**
     * 결제 업데이트
     */
    async update(id, data) {
        return prisma_1.prisma.payment.update({
            where: { id },
            data,
        });
    }
    /**
     * 사용자 ID와 차량 ID로 완료된 결제 조회
     */
    async findCompletedByUserAndVehicle(userId, vehicleId) {
        return prisma_1.prisma.payment.findFirst({
            where: {
                userId,
                vehicleId,
                status: "completed",
            },
        });
    }
    /**
     * 결제 완료 후 연락처 조회용
     */
    async findCompletedWithVehicleAndCompany(userId, vehicleId) {
        return prisma_1.prisma.payment.findFirst({
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
    }
    /**
     * 사용자의 모든 결제 내역 조회
     */
    async findByUserId(userId) {
        return prisma_1.prisma.payment.findMany({
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
    }
    /**
     * 결제 상태 확인
     */
    async findStatusByUserAndVehicle(userId, vehicleId) {
        return prisma_1.prisma.payment.findFirst({
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
    }
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
