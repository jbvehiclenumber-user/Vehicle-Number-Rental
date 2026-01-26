// src/services/companyService.ts
import { companyRepository } from "../repositories/companyRepository";
import bcrypt from "bcryptjs";

export interface UpdateCompanyData {
  companyName?: string;
  representative?: string;
  phone?: string;
  email?: string;
  contactPhone?: string;
  password?: string; // 기존 호환성 유지
  currentPassword?: string;
  newPassword?: string;
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
      phone: company.phone,
      contactPhone: company.contactPhone,
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
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new Error("회사 정보를 찾을 수 없습니다.");
    }

    const updateData: any = { ...data };

    // 비밀번호 변경 시 기존 비밀번호 확인
    if (data.newPassword?.trim()) {
      // 새 비밀번호가 있으면 기존 비밀번호 확인 필요
      if (!data.currentPassword?.trim()) {
        throw new Error("기존 비밀번호를 입력해주세요.");
      }
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword.trim(), company.password);
      if (!isCurrentPasswordValid) {
        throw new Error("기존 비밀번호가 올바르지 않습니다.");
      }
      // 새 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(data.newPassword)) {
        throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
      }
      updateData.password = await bcrypt.hash(data.newPassword.trim(), 10);
    } else if (data.password?.trim()) {
      // 기존 방식 호환성 유지 (currentPassword 없이 password만 오는 경우)
      // 비밀번호 조건 검증
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(data.password)) {
        throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
      }
      updateData.password = await bcrypt.hash(data.password.trim(), 10);
    } else {
      // 비밀번호가 없으면 업데이트에서 제외
      delete updateData.password;
    }

    // currentPassword와 newPassword는 DB에 저장하지 않으므로 제거
    delete updateData.currentPassword;
    delete updateData.newPassword;

    const updatedCompany = await companyRepository.update(companyId, updateData);

    return {
      id: updatedCompany.id,
      businessNumber: updatedCompany.businessNumber,
      companyName: updatedCompany.companyName,
      representative: updatedCompany.representative,
      phone: updatedCompany.phone,
      contactPhone: updatedCompany.contactPhone,
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

  /**
   * 연락받을 번호 업데이트
   */
  async updateContactPhone(companyId: string, contactPhone: string) {
    const updatedCompany = await companyRepository.update(companyId, { contactPhone });

    return {
      id: updatedCompany.id,
      businessNumber: updatedCompany.businessNumber,
      companyName: updatedCompany.companyName,
      contactPhone: updatedCompany.contactPhone,
      updatedAt: updatedCompany.updatedAt,
    };
  }
}

export const companyService = new CompanyService();


