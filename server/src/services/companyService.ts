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

  /**
   * 기존 계정 정보를 사용하여 새 회사 추가
   */
  async addCompanyWithExistingAccount(
    currentCompanyId: string,
    data: {
      businessNumber: string;
      companyName: string;
      representative: string;
      contactPhone?: string;
    }
  ) {
    // 현재 회사 정보 가져오기
    const currentCompany = await companyRepository.findById(currentCompanyId);
    if (!currentCompany) {
      throw new Error("현재 회사 정보를 찾을 수 없습니다.");
    }

    // 사업자등록번호 중복 확인
    const existingCompany = await companyRepository.findByBusinessNumber(data.businessNumber);
    if (existingCompany) {
      throw new Error("이미 등록된 사업자등록번호입니다.");
    }

    // 사업자등록번호 인증 확인
    const { isBusinessNumberVerified } = await import("../services/businessNumberService");
    const isVerified = isBusinessNumberVerified(data.businessNumber);
    if (!isVerified) {
      throw new Error("사업자등록번호 인증이 필요합니다. 먼저 인증을 완료해주세요.");
    }

    // 기존 계정의 전화번호, 이메일, 비밀번호 사용하여 새 회사 생성
    if (!currentCompany.email) {
      throw new Error("기존 회사에 이메일이 등록되어 있지 않습니다.");
    }
    
    const newCompany = await companyRepository.create({
      businessNumber: data.businessNumber,
      companyName: data.companyName,
      representative: data.representative,
      phone: currentCompany.phone, // 기존 전화번호 사용
      email: currentCompany.email, // 기존 이메일 사용 (필수)
      password: currentCompany.password, // 기존 비밀번호 사용
      contactPhone: data.contactPhone,
    });

    // 인증 상태 업데이트
    await companyRepository.updateVerification(newCompany.id, true);

    return {
      id: newCompany.id,
      businessNumber: newCompany.businessNumber,
      companyName: newCompany.companyName,
      representative: newCompany.representative,
      phone: newCompany.phone,
      email: newCompany.email,
      contactPhone: newCompany.contactPhone,
      verified: true,
      createdAt: newCompany.createdAt,
    };
  }
}

export const companyService = new CompanyService();


