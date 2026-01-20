"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = exports.CompanyService = void 0;
// src/services/companyService.ts
const companyRepository_1 = require("../repositories/companyRepository");
class CompanyService {
    /**
     * 회사 정보 조회
     */
    async getCompanyProfile(companyId) {
        const company = await companyRepository_1.companyRepository.findById(companyId);
        if (!company) {
            throw new Error("회사 정보를 찾을 수 없습니다.");
        }
        return {
            id: company.id,
            businessNumber: company.businessNumber,
            companyName: company.companyName,
            representative: company.representative,
            address: company.address,
            contactPerson: company.contactPerson,
            phone: company.phone,
            email: company.email,
            verified: company.verified,
            verifiedAt: company.verifiedAt,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }
    /**
     * 회사 정보 수정
     */
    async updateCompanyProfile(companyId, data) {
        const updatedCompany = await companyRepository_1.companyRepository.update(companyId, data);
        return {
            id: updatedCompany.id,
            businessNumber: updatedCompany.businessNumber,
            companyName: updatedCompany.companyName,
            representative: updatedCompany.representative,
            address: updatedCompany.address,
            contactPerson: updatedCompany.contactPerson,
            phone: updatedCompany.phone,
            email: updatedCompany.email,
            verified: updatedCompany.verified,
            updatedAt: updatedCompany.updatedAt,
        };
    }
    /**
     * 회사 인증 상태 업데이트 (관리자용)
     */
    async updateCompanyVerification(companyId, verified) {
        // TODO: 관리자 권한 확인 로직 추가
        const updatedCompany = await companyRepository_1.companyRepository.updateVerification(companyId, verified);
        return {
            id: updatedCompany.id,
            businessNumber: updatedCompany.businessNumber,
            companyName: updatedCompany.companyName,
            verified: updatedCompany.verified,
            verifiedAt: updatedCompany.verifiedAt,
        };
    }
    /**
     * 회사 통계 조회
     */
    async getCompanyStats(companyId) {
        return companyRepository_1.companyRepository.getStats(companyId);
    }
    /**
     * 연락받을 번호 업데이트
     */
    async updateContactPhone(companyId, contactPhone) {
        const updatedCompany = await companyRepository_1.companyRepository.update(companyId, { contactPhone });
        return {
            id: updatedCompany.id,
            businessNumber: updatedCompany.businessNumber,
            companyName: updatedCompany.companyName,
            contactPhone: updatedCompany.contactPhone,
            updatedAt: updatedCompany.updatedAt,
        };
    }
}
exports.CompanyService = CompanyService;
exports.companyService = new CompanyService();
