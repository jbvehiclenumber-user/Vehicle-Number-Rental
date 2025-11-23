// src/services/businessNumberService.ts
import { companyRepository } from "../repositories/companyRepository";

/**
 * 사업자등록번호 형식 검증
 */
export const validateBusinessNumberFormat = (businessNumber: string): boolean => {
  const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
  return businessNumberRegex.test(businessNumber);
};

/**
 * 사업자등록번호 인증 (국세청 API 연동 필요)
 */
export const verifyBusinessNumber = async (businessNumber: string) => {
  // 사업자등록번호 형식 검증
  if (!validateBusinessNumberFormat(businessNumber)) {
    throw new Error("올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)");
  }

  // TODO: 실제로는 국세청 API를 호출해야 함
  // 여기서는 시뮬레이션으로 처리
  // 실제 구현 시에는 국세청 사업자등록번호 진위확인 서비스 API 사용

  // 시뮬레이션: 일부 번호는 유효하지 않다고 처리
  const invalidNumbers = ["000-00-00000", "111-11-11111", "999-99-99999"];
  const isValid = !invalidNumbers.includes(businessNumber);

  if (isValid) {
    // 회사 인증 상태 업데이트
    const company = await companyRepository.findByBusinessNumber(businessNumber);
    if (company) {
      await companyRepository.updateVerification(company.id, true);
    }
  }

  return {
    valid: isValid,
    message: isValid
      ? "인증이 완료되었습니다."
      : "유효하지 않은 사업자등록번호입니다.",
  };
};

/**
 * 전화번호 형식 검증
 */
export const validatePhoneFormat = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 인증번호 발송 (시뮬레이션)
 */
export const sendVerificationCode = async (phone: string) => {
  // 전화번호 형식 검증
  if (!validatePhoneFormat(phone)) {
    throw new Error("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)");
  }

  // TODO: 실제로는 SMS 발송 API를 호출해야 함
  // 여기서는 시뮬레이션으로 처리

  return {
    success: true,
    message: "인증번호가 발송되었습니다. (시뮬레이션: 123456)",
    // 실제로는 인증번호를 반환하지 않음
  };
};
