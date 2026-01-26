// src/stores/authStore.ts
import { create } from "zustand";
import { User, Company, UserType } from "../types/user";

interface AuthState {
  token: string | null;
  user: User | Company | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  companies: Company[]; // 회사 목록 (회사 로그인 시)
  defaultCompanyId: string | null; // 기본 회사 ID

  // Actions
  setAuth: (token: string, user: User | Company, userType: UserType, companies?: Company[]) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setCompanies: (companies: Company[]) => void;
  setDefaultCompanyId: (companyId: string | null) => void;
  getDefaultCompanyId: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  userType: null,
  isAuthenticated: false,
  companies: [],
  defaultCompanyId: null,

  setAuth: (token, user, userType, companies) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", userType);
    if (companies && companies.length > 0) {
      localStorage.setItem("companies", JSON.stringify(companies));
    }

    set({
      token,
      user,
      userType,
      isAuthenticated: true,
      companies: companies || [],
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("companies");
    // 기본 회사 ID는 유지 (로그아웃해도 기본 설정은 유지)

    set({
      token: null,
      user: null,
      userType: null,
      isAuthenticated: false,
      companies: [],
    });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const userType = localStorage.getItem("userType") as UserType | null;
    const companiesStr = localStorage.getItem("companies");
    const defaultCompanyId = localStorage.getItem("defaultCompanyId");

    if (token && userStr && userType) {
      set({
        token,
        user: JSON.parse(userStr),
        userType,
        isAuthenticated: true,
        companies: companiesStr ? JSON.parse(companiesStr) : [],
        defaultCompanyId: defaultCompanyId || null,
      });
    } else {
      set({
        defaultCompanyId: defaultCompanyId || null,
      });
    }
  },

  setCompanies: (companies) => {
    localStorage.setItem("companies", JSON.stringify(companies));
    set({ companies });
  },

  setDefaultCompanyId: (companyId) => {
    if (companyId) {
      localStorage.setItem("defaultCompanyId", companyId);
    } else {
      localStorage.removeItem("defaultCompanyId");
    }
    set({ defaultCompanyId: companyId });
  },

  getDefaultCompanyId: () => {
    return get().defaultCompanyId || localStorage.getItem("defaultCompanyId");
  },
}));
