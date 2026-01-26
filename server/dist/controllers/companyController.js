"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactPhone = exports.getCompanyStats = exports.updateCompanyVerification = exports.updateCompanyProfile = exports.getCompanyProfile = void 0;
const companyService_1 = require("../services/companyService");
const logger_1 = require("../utils/logger");
// 회사 정보 조회
const getCompanyProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        if (userType !== "company") {
            return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
        }
        const company = await companyService_1.companyService.getCompanyProfile(userId);
        res.json(company);
    }
    catch (error) {
        logger_1.logger.error("Get company profile error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "회사 정보를 불러오는데 실패했습니다.";
        const statusCode = message.includes("찾을 수 없습니다") ? 404 : 500;
        res.status(statusCode).json({ message });
    }
};
exports.getCompanyProfile = getCompanyProfile;
// 회사 정보 수정
const updateCompanyProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        const { companyName, representative, phone, email, contactPhone, password, currentPassword, newPassword, } = req.body;
        if (userType !== "company") {
            return res.status(403).json({ message: "회사만 수정할 수 있습니다." });
        }
        const updatedCompany = await companyService_1.companyService.updateCompanyProfile(userId, {
            companyName,
            representative,
            phone,
            email,
            contactPhone,
            password,
            currentPassword,
            newPassword,
        });
        res.json(updatedCompany);
    }
    catch (error) {
        logger_1.logger.error("Update company profile error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "회사 정보 수정에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.updateCompanyProfile = updateCompanyProfile;
// 회사 인증 상태 업데이트 (관리자용)
const updateCompanyVerification = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { verified } = req.body;
        const updatedCompany = await companyService_1.companyService.updateCompanyVerification(companyId, verified);
        res.json(updatedCompany);
    }
    catch (error) {
        logger_1.logger.error("Update company verification error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "인증 상태 업데이트에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.updateCompanyVerification = updateCompanyVerification;
// 회사 통계 조회
const getCompanyStats = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        if (userType !== "company") {
            return res.status(403).json({ message: "회사만 조회할 수 있습니다." });
        }
        const stats = await companyService_1.companyService.getCompanyStats(userId);
        res.json(stats);
    }
    catch (error) {
        logger_1.logger.error("Get company stats error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "통계 조회에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.getCompanyStats = getCompanyStats;
// 연락받을 번호 업데이트
const updateContactPhone = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { userId, userType } = req.user;
        const { contactPhone } = req.body;
        if (userType !== "company") {
            return res.status(403).json({ message: "회사만 수정할 수 있습니다." });
        }
        if (!contactPhone?.trim()) {
            return res.status(400).json({ message: "연락받을 번호를 입력해주세요." });
        }
        const updatedCompany = await companyService_1.companyService.updateContactPhone(userId, contactPhone);
        res.json(updatedCompany);
    }
    catch (error) {
        logger_1.logger.error("Update contact phone error", error instanceof Error ? error : new Error(String(error)));
        const message = error instanceof Error ? error.message : "연락받을 번호 업데이트에 실패했습니다.";
        res.status(500).json({ message });
    }
};
exports.updateContactPhone = updateContactPhone;
