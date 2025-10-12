// src/stores/authStore.ts
import { create } from "zustand";
import { User, Company, UserType } from "../types/user";

interface AuthState {
  token: string | null;
  user: User | Company | null;
  userType: UserType | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: User | Company, userType: UserType) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  userType: null,
  isAuthenticated: false,

  setAuth: (token, user, userType) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", userType);

    set({
      token,
      user,
      userType,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");

    set({
      token: null,
      user: null,
      userType: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const userType = localStorage.getItem("userType") as UserType | null;

    if (token && userStr && userType) {
      set({
        token,
        user: JSON.parse(userStr),
        userType,
        isAuthenticated: true,
      });
    }
  },
}));
