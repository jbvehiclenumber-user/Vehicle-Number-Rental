// src/services/companyService.ts
import { companyRepository } from "../repositories/companyRepository";

export interface UpdateCompanyData {
  companyName?: string;
  representative?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export class CompanyService {
  /**
   * 회사 정보 조회
   */
  async getCompanyProfile(companyId: string) {
    const company = await companyRepository.findById(companyId);
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
  async updateCompanyProfile(companyId: string, data: UpdateCompanyData) {
    const updatedCompany = await companyRepository.update(companyId, data);

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
  async updateCompanyVerification(companyId: string, verified: boolean) {
    // TODO: 관리자 권한 확인 로직 추가
    const updatedCompany = await companyRepository.updateVerification(
      companyId,
      verified
    );

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
  async getCompanyStats(companyId: string) {
    return companyRepository.getStats(companyId);
  }
}

export const companyService = new CompanyService();


