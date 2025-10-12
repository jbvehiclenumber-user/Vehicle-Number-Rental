// src/types/user.ts
export interface User {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  businessNumber: string;
  companyName: string;
  representative: string;
  address: string;
  contactPerson: string;
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
}
