"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleService = exports.VehicleService = void 0;
// src/services/vehicleService.ts
const vehicleRepository_1 = require("../repositories/vehicleRepository");
const companyRepository_1 = require("../repositories/companyRepository");
class VehicleService {
    /**
     * 차량 목록 조회 (필터링)
     */
    async getVehicles(filter, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const [vehicles, total] = await Promise.all([
            vehicleRepository_1.vehicleRepository.findMany({ ...filter, isAvailable: true }, { skip, take: limit }),
            vehicleRepository_1.vehicleRepository.count({ ...filter, isAvailable: true }),
        ]);
        return {
            vehicles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * 차량 상세 조회
     */
    async getVehicle(id) {
        const vehicle = await vehicleRepository_1.vehicleRepository.findById(id, true);
        if (!vehicle) {
            throw new Error("차량을 찾을 수 없습니다.");
        }
        // 조회수 증가 (비동기로 처리)
        vehicleRepository_1.vehicleRepository.incrementViewCount(id).catch(console.error);
        return vehicle;
    }
    /**
     * 내 차량 목록 조회 (회사만)
     */
    async getMyVehicles(companyId) {
        return vehicleRepository_1.vehicleRepository.findByCompanyId(companyId);
    }
    /**
     * 차량 등록 (회사만, 인증된 회사만)
     */
    async createVehicle(companyId, data) {
        // 회사 인증 상태 확인
        const company = await companyRepository_1.companyRepository.findById(companyId);
        if (!company?.verified) {
            throw new Error("사업자등록번호 인증이 완료된 회사만 차량을 등록할 수 있습니다.");
        }
        // 차량번호 중복 확인 (같은 회사 내에서)
        const exists = await vehicleRepository_1.vehicleRepository.existsByVehicleNumber(companyId, data.vehicleNumber);
        if (exists) {
            throw new Error("이미 등록된 차량번호입니다.");
        }
        return vehicleRepository_1.vehicleRepository.create({
            companyId,
            ...data,
        });
    }
    /**
     * 차량 수정 (회사만, 본인 차량만)
     */
    async updateVehicle(vehicleId, companyId, data) {
        // 본인 차량인지 확인
        const vehicle = await vehicleRepository_1.vehicleRepository.findById(vehicleId);
        if (!vehicle) {
            throw new Error("차량을 찾을 수 없습니다.");
        }
        if (vehicle.companyId !== companyId) {
            throw new Error("본인의 차량만 수정할 수 있습니다.");
        }
        return vehicleRepository_1.vehicleRepository.update(vehicleId, data);
    }
    /**
     * 차량 삭제 (회사만, 본인 차량만)
     */
    async deleteVehicle(vehicleId, companyId) {
        // 본인 차량인지 확인
        const vehicle = await vehicleRepository_1.vehicleRepository.findById(vehicleId);
        if (!vehicle) {
            throw new Error("차량을 찾을 수 없습니다.");
        }
        if (vehicle.companyId !== companyId) {
            throw new Error("본인의 차량만 삭제할 수 있습니다.");
        }
        await vehicleRepository_1.vehicleRepository.delete(vehicleId);
        return { message: "차량이 삭제되었습니다." };
    }
    /**
     * 지역별 통계 조회
     */
    async getRegionStats() {
        return vehicleRepository_1.vehicleRepository.getRegionStats();
    }
    /**
     * 차량 타입별 통계 조회
     */
    async getVehicleTypeStats() {
        return vehicleRepository_1.vehicleRepository.getVehicleTypeStats();
    }
}
exports.VehicleService = VehicleService;
exports.vehicleService = new VehicleService();
