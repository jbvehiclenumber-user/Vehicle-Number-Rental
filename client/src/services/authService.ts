// src/services/authService.ts
import api from "./api";
import { AuthResponse } from "../types/user";

export const authService = {
  // 회사 회원가입
  registerCompany: async (data: {
    businessNumber: string;
    companyName: string;
    representative: string;
    contactPerson: string;
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
    phone: string;
    password: string;
    userType: "user" | "company";
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
    password?: string;
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
    address?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  }) => {
    const response = await api.put("/companies/profile", data);
    return response.data;
  },

  // 연락받을 번호 업데이트 (회사)
  updateContactPhone: async (contactPhone: string): Promise<void> => {
    await api.put("/companies/contact-phone", { contactPhone });
  },
};
