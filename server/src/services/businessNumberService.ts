// src/services/businessNumberService.ts
import axios from "axios";
import { companyRepository } from "../repositories/companyRepository";
import { logger } from "../utils/logger";

// 인증된 사업자등록번호를 임시로 저장하는 메모리 캐시 (24시간 유효)
interface VerifiedBusinessNumber {
  businessNumber: string;
  verifiedAt: Date;
}

const verifiedBusinessNumbers = new Map<string, VerifiedBusinessNumber>();

// 24시간마다 만료된 항목 정리
const cleanupInterval = setInterval(() => {
  const now = new Date();
  for (const [key, value] of verifiedBusinessNumbers.entries()) {
    const hoursSinceVerification = (now.getTime() - value.verifiedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceVerification >= 24) {
      verifiedBusinessNumbers.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1시간마다 정리

// 테스트/서버 종료를 막지 않도록 unref
cleanupInterval.unref();

/**
 * 사업자등록번호 형식 검증
 */
export const validateBusinessNumberFormat = (businessNumber: string): boolean => {
  const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
  return businessNumberRegex.test(businessNumber);
};

/**
 * 사업자등록번호 인증 (공공데이터포털 국세청 사업자등록상태조회 API 연동)
 */
export const verifyBusinessNumber = async (businessNumber: string) => {
  // 사업자등록번호 형식 검증
  if (!validateBusinessNumberFormat(businessNumber)) {
    throw new Error("올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)");
  }

  // 테스트 환경에서만 시뮬레이션 모드 사용
  const isTestEnvironment = process.env.NODE_ENV === "test";
  
  if (isTestEnvironment) {
    // 테스트 환경: 시뮬레이션 모드
    const invalidNumbers = ["000-00-00000", "111-11-11111", "999-99-99999"];
    const isValid = !invalidNumbers.includes(businessNumber);
    
    if (isValid) {
      verifiedBusinessNumbers.set(businessNumber, {
        businessNumber,
        verifiedAt: new Date(),
      });
      
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
  }

  // 실제 환경: 공공데이터포털 API 호출
  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  const apiUrl = process.env.PUBLIC_DATA_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error("사업자등록번호 인증 API 설정이 없습니다. 관리자에게 문의해주세요.");
  }

  let isValid = false;

  try {
    logger.info(`사업자등록번호 인증 API 호출(공공데이터포털): ${businessNumber}`);
    
    // 공공데이터포털 국세청 사업자등록상태조회 API
    // 참고: POST { b_no: ["1234567890"] } / 응답 data[0].b_stt_cd === "01" -> 계속사업자
    const digitsOnly = businessNumber.replace(/-/g, "");
    const response = await axios.post(
      `${apiUrl}?serviceKey=${encodeURIComponent(apiKey)}`,
      { b_no: [digitsOnly] },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10초 타임아웃
      }
    );

    const statusItem = response.data?.data?.[0];
    const statusCode = statusItem?.b_stt_cd; // "01"이면 정상
    const validFlag = statusItem?.valid === true || statusItem?.valid_yn === "Y";

    isValid = validFlag || statusCode === "01";

    logger.info(`사업자등록번호 인증 결과: ${businessNumber} - ${isValid ? "유효" : "무효"}`);
  } catch (error: any) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error(`사업자등록번호 인증 API 오류: ${error.message}`, errorObj, {
      businessNumber,
      apiError: error.response?.data || error.message,
    });

    // API 호출 실패 시 사용자에게 명확한 에러 메시지 전달
    if (error.response) {
      // API 서버에서 에러 응답을 받은 경우
      const statusCode = error.response.status;
      if (statusCode === 401 || statusCode === 403) {
        throw new Error("사업자등록번호 인증 API 인증에 실패했습니다. 관리자에게 문의해주세요.");
      } else if (statusCode === 400) {
        throw new Error("잘못된 사업자등록번호입니다. 다시 확인해주세요.");
      } else if (statusCode >= 500) {
        throw new Error("사업자등록번호 인증 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      throw new Error("사업자등록번호 인증 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error("사업자등록번호 인증 서비스에 연결할 수 없습니다. 관리자에게 문의해주세요.");
    }

    // 기타 오류
    throw new Error("사업자등록번호 인증에 실패했습니다. 다시 시도해주세요.");
  }

  if (isValid) {
    // 인증된 사업자등록번호를 캐시에 저장 (24시간 유효)
    verifiedBusinessNumbers.set(businessNumber, {
      businessNumber,
      verifiedAt: new Date(),
    });

    // 이미 존재하는 회사가 있으면 인증 상태 업데이트
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
 * 사업자등록번호가 인증되었는지 확인 (캐시 확인)
 */
export const isBusinessNumberVerified = (businessNumber: string): boolean => {
  const verified = verifiedBusinessNumbers.get(businessNumber);
  if (!verified) {
    return false;
  }

  // 24시간 이내인지 확인
  const now = new Date();
  const hoursSinceVerification = (now.getTime() - verified.verifiedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceVerification >= 24) {
    verifiedBusinessNumbers.delete(businessNumber);
    return false;
  }

  return true;
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
