// src/services/authService.ts
import api from "./api";
import { AuthResponse } from "../types/user";

export const authService = {
  // 회사 회원가입
  registerCompany: async (data: {
    businessNumber: string;
    companyName: string;
    representative: string;
    phone: string;
    email?: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/register/company", data);
    return response.data;
  },

  // 개인(기사) 회원가입
  registerUser: async (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/register/user", data);
    return response.data;
  },

  // 로그인
  login: async (data: {
    identifier: string; // 전화번호 또는 이메일
    isEmail: boolean;
    password: string;
    userType: "user" | "company";
    defaultCompanyId?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // 사업자번호 인증
  verifyBusinessNumber: async (businessNumber: string): Promise<{ valid: boolean; message: string }> => {
    const response = await api.post("/auth/verify-business", {
      businessNumber,
    });
    return {
      valid: response.data.valid,
      message: response.data.message || (response.data.valid ? "인증이 완료되었습니다." : "인증에 실패했습니다."),
    };
  },

  // 현재 사용자 정보
  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // 개인 프로필 수정
  updateUserProfile: async (data: {
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<AuthResponse> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  // 회사 프로필 조회/수정
  getCompanyProfile: async () => {
    const response = await api.get("/companies/profile");
    return response.data;
  },

  updateCompanyProfile: async (data: {
    companyName?: string;
    representative?: string;
    phone?: string;
    email?: string;
    contactPhone?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const response = await api.put("/companies/profile", data);
    return response.data;
  },

  // 연락받을 번호 업데이트 (회사)
  updateContactPhone: async (contactPhone: string): Promise<void> => {
    await api.put("/companies/contact-phone", { contactPhone });
  },

  // 회사 전환
  switchCompany: async (companyId: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/switch-company", {
      companyId,
      password,
    });
    return response.data;
  },

  // 기존 계정 정보로 새 회사 추가
  addCompany: async (data: {
    businessNumber: string;
    companyName: string;
    representative: string;
    contactPhone?: string;
  }) => {
    const response = await api.post("/companies/add", data);
    return response.data;
  },

  // OAuth 인증 URL 가져오기
  getKakaoAuthUrl: async (): Promise<string> => {
    const response = await api.get("/auth/oauth/kakao/url");
    return response.data.authUrl;
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await api.get("/auth/oauth/google/url");
    return response.data.authUrl;
  },

  // 비밀번호 찾기 요청
  requestPasswordReset: async (identifier: string, isEmail: boolean): Promise<{ message: string; token?: string; resetUrl?: string }> => {
    const response = await api.post("/auth/password/reset-request", {
      identifier,
      isEmail,
    });
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/password/reset", {
      token,
      newPassword,
    });
    return response.data;
  },
};
