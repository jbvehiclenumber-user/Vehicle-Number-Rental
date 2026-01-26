// src/types/user.ts
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  businessNumber: string;
  companyName: string;
  representative: string;
  phone: string;
  email?: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export type UserType = "user" | "company";

export interface AuthResponse {
  token: string;
  user: User | Company;
  userType: UserType;
  companies?: Company[]; // 회사 로그인 시 소유한 모든 회사 목록
}
