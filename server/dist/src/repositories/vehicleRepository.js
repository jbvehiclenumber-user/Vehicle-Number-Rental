"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepository = exports.VehicleRepository = void 0;
// src/repositories/vehicleRepository.ts
const prisma_1 = require("../utils/prisma");
class VehicleRepository {
    /**
     * ID로 차량 조회
     */
    async findById(id, includeCompany = false) {
        return prisma_1.prisma.vehicle.findUnique({
            where: { id },
            include: includeCompany
                ? {
                    company: {
                        select: {
                            companyName: true,
                        },
                    },
                }
                : undefined,
        });
    }
    /**
     * 차량 목록 조회 (필터링)
     */
    async findMany(filter, pagination) {
        const where = this.buildWhereClause(filter);
        return prisma_1.prisma.vehicle.findMany({
            where,
            include: {
                company: {
                    select: {
                        companyName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            ...pagination,
        });
    }
    /**
     * 차량 개수 조회
     */
    async count(filter) {
        const where = this.buildWhereClause(filter);
        return prisma_1.prisma.vehicle.count({ where });
    }
    /**
     * 회사별 차량 목록 조회
     */
    async findByCompanyId(companyId) {
        return prisma_1.prisma.vehicle.findMany({
            where: {
                companyId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    /**
     * 차량 생성
     */
    async create(data) {
        return prisma_1.prisma.vehicle.create({
            data,
        });
    }
    /**
     * 차량 업데이트
     */
    async update(id, data) {
        return prisma_1.prisma.vehicle.update({
            where: { id },
            data,
        });
    }
    /**
     * 조회수 증가
     */
    async incrementViewCount(id) {
        await prisma_1.prisma.vehicle.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }
    /**
     * 차량 삭제
     */
    async delete(id) {
        await prisma_1.prisma.vehicle.delete({
            where: { id },
        });
    }
    /**
     * 차량번호 중복 확인
     */
    async existsByVehicleNumber(companyId, vehicleNumber) {
        const vehicle = await prisma_1.prisma.vehicle.findFirst({
            where: {
                companyId,
                vehicleNumber,
            },
        });
        return !!vehicle;
    }
    /**
     * 지역별 통계
     */
    async getRegionStats() {
        return prisma_1.prisma.vehicle.groupBy({
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
    }
    /**
     * 차량 타입별 통계
     */
    async getVehicleTypeStats() {
        return prisma_1.prisma.vehicle.groupBy({
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
    }
    /**
     * WHERE 절 생성
     */
    buildWhereClause(filter) {
        const where = {};
        if (filter.isAvailable !== undefined) {
            where.isAvailable = filter.isAvailable;
        }
        if (filter.region) {
            where.region = {
                contains: filter.region,
                mode: "insensitive",
            };
        }
        if (filter.vehicleType) {
            where.vehicleType = {
                contains: filter.vehicleType,
                mode: "insensitive",
            };
        }
        if (filter.tonnage) {
            where.tonnage = {
                contains: filter.tonnage,
                mode: "insensitive",
            };
        }
        if (filter.yearModel) {
            where.yearModel = filter.yearModel;
        }
        if (filter.minFee || filter.maxFee) {
            where.monthlyFee = {};
            if (filter.minFee)
                where.monthlyFee.gte = filter.minFee;
            if (filter.maxFee)
                where.monthlyFee.lte = filter.maxFee;
        }
        if (filter.search) {
            where.OR = [
                { vehicleNumber: { contains: filter.search, mode: "insensitive" } },
                { vehicleType: { contains: filter.search, mode: "insensitive" } },
                { region: { contains: filter.search, mode: "insensitive" } },
                { description: { contains: filter.search, mode: "insensitive" } },
            ];
        }
        return where;
    }
}
exports.VehicleRepository = VehicleRepository;
exports.vehicleRepository = new VehicleRepository();
