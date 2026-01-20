"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicleTypeStats = exports.getRegionStats = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getMyVehicles = exports.getVehicle = exports.getVehicles = void 0;
const vehicleService_1 = require("../services/vehicleService");
const logger_1 = require("../utils/logger");
// 차량 목록 조회 (필터링) - 연락처는 제외
const getVehicles = async (req, res) => {
    try {
        const { region, vehicleType, minFee, maxFee, tonnage, yearModel, search, page = 1, limit = 20, } = req.query;
        const filter = {
            region: region,
            vehicleType: vehicleType,
            minFee: minFee ? parseInt(minFee) : undefined,
            maxFee: maxFee ? parseInt(maxFee) : undefined,
            tonnage: tonnage,
            yearModel: yearModel ? parseInt(yearModel) : undefined,
            search: search,
        };
        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
        };
        const result = await vehicleService_1.vehicleService.getVehicles(filter, pagination);
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error("Get vehicles error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 목록을 불러오는데 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.getVehicles = getVehicles;
// 차량 상세 조회 - 연락처는 제외, 조회수 증가
const getVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await vehicleService_1.vehicleService.getVehicle(id);
        res.json(vehicle);
    }
    catch (error) {
        logger_1.logger.error("Get vehicle error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 정보를 불러오는데 실패했습니다.";
        const statusCode = message.includes("찾을 수 없습니다") ? 404 : 500;
        res.status(statusCode).json({ message });
    }
};
exports.getVehicle = getVehicle;
// 내 차량 목록 조회 (회사만)
const getMyVehicles = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        if (userType !== "company") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        const vehicles = await vehicleService_1.vehicleService.getMyVehicles(userId);
        res.json(vehicles);
    }
    catch (error) {
        logger_1.logger.error("Get my vehicles error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 목록을 불러오는데 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.getMyVehicles = getMyVehicles;
// 차량 등록 (회사만, 인증된 회사만)
const createVehicle = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        if (userType !== "company") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        const { vehicleNumber, vehicleType, tonnage, yearModel, region, insuranceRate, monthlyFee, description, } = req.body;
        const vehicle = await vehicleService_1.vehicleService.createVehicle(userId, {
            vehicleNumber,
            vehicleType,
            tonnage,
            yearModel,
            region,
            insuranceRate,
            monthlyFee,
            description,
        });
        res.status(201).json(vehicle);
    }
    catch (error) {
        logger_1.logger.error("Create vehicle error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 등록에 실패했습니다.";
        let statusCode = 500;
        if (message.includes("인증이 완료") || message.includes("이미 등록"))
            statusCode = 403;
        else if (message.includes("이미 등록"))
            statusCode = 400;
        res.status(statusCode).json({ message });
    }
};
exports.createVehicle = createVehicle;
// 차량 수정 (회사만, 본인 차량만)
const updateVehicle = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        const { id } = req.params;
        if (userType !== "company") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        const { vehicleNumber, vehicleType, tonnage, yearModel, region, insuranceRate, monthlyFee, description, isAvailable, } = req.body;
        const updatedVehicle = await vehicleService_1.vehicleService.updateVehicle(id, userId, {
            vehicleNumber,
            vehicleType,
            tonnage,
            yearModel,
            region,
            insuranceRate,
            monthlyFee,
            description,
            isAvailable,
        });
        res.json(updatedVehicle);
    }
    catch (error) {
        logger_1.logger.error("Update vehicle error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 수정에 실패했습니다.";
        let statusCode = 500;
        if (message.includes("찾을 수 없습니다"))
            statusCode = 404;
        else if (message.includes("본인의 차량만"))
            statusCode = 403;
        res.status(statusCode).json({ message });
    }
};
exports.updateVehicle = updateVehicle;
// 차량 삭제 (회사만, 본인 차량만)
const deleteVehicle = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        const { id } = req.params;
        if (userType !== "company") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        const result = await vehicleService_1.vehicleService.deleteVehicle(id, userId);
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error("Delete vehicle error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 삭제에 실패했습니다.";
        let statusCode = 500;
        if (message.includes("찾을 수 없습니다"))
            statusCode = 404;
        else if (message.includes("본인의 차량만"))
            statusCode = 403;
        res.status(statusCode).json({ message });
    }
};
exports.deleteVehicle = deleteVehicle;
// 지역별 통계 조회
const getRegionStats = async (req, res) => {
    try {
        const stats = await vehicleService_1.vehicleService.getRegionStats();
        res.json(stats);
    }
    catch (error) {
        logger_1.logger.error("Get region stats error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "지역별 통계 조회에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.getRegionStats = getRegionStats;
// 차량 타입별 통계 조회
const getVehicleTypeStats = async (req, res) => {
    try {
        const stats = await vehicleService_1.vehicleService.getVehicleTypeStats();
        res.json(stats);
    }
    catch (error) {
        logger_1.logger.error("Get vehicle type stats error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "차량 타입별 통계 조회에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.getVehicleTypeStats = getVehicleTypeStats;
