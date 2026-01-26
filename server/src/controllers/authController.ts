// src/controllers/authController.ts
import { Request, Response } from "express";
import { authService } from "../services/authService";
import * as businessNumberService from "../services/businessNumberService";
import { logger } from "../utils/logger";

// 개인(기사) 회원가입
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password } = req.body;
    const result = await authService.registerUser({ name, phone, email, password });
    res.status(201).json(result);
  } catch (error) {
    logger.error("Register user error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
    res.status(400).json({ message });
  }
};

// 회사 회원가입
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const {
      businessNumber,
      companyName,
      representative,
      phone,
      email,
      password,
    } = req.body;
    const result = await authService.registerCompany({
      businessNumber,
      companyName,
      representative,
      phone,
      email,
      password,
    });
    res.status(201).json(result);
  } catch (error) {
    logger.error("Register company error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
    res.status(400).json({ message });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, isEmail, password, userType, defaultCompanyId } = req.body;
    if (!identifier?.trim() || !password?.trim() || !userType?.trim()) {
      return res.status(400).json({ message: "전화번호/이메일, 비밀번호, 사용자 타입을 입력해주세요." });
    }

    if (userType !== "user" && userType !== "company") {
      return res.status(400).json({ message: "사용자 타입이 올바르지 않습니다." });
    }

    const result = await authService.login({ 
      identifier, 
      isEmail: isEmail || false, 
      password, 
      userType,
      defaultCompanyId,
    });
    res.json(result);
  } catch (error) {
    logger.error("Login error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
    const statusCode = message.includes("잘못되었습니다") ? 401 : 500;
    res.status(statusCode).json({ message });
  }
};

// 사업자등록번호 인증
export const verifyBusinessNumber = async (req: Request, res: Response) => {
  try {
    const { businessNumber } = req.body;
    const result = await businessNumberService.verifyBusinessNumber(businessNumber);
    res.json(result);
  } catch (error) {
    logger.error("Verify business number error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "인증에 실패했습니다.";
    const statusCode = message.includes("형식") ? 400 : 500;
    res.status(statusCode).json({ message });
  }
};


// 현재 사용자 정보
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const { userId, userType } = req.user;
    const result = await authService.getCurrentUser(userId, userType);
    res.json(result);
  } catch (error) {
    logger.error("Get current user error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "사용자 정보를 불러오는데 실패했습니다.";
    const statusCode = message.includes("찾을 수 없습니다") ? 404 : 500;
    res.status(statusCode).json({ message });
  }
};

// 개인 사용자 프로필 업데이트
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== "user") {
      return res.status(403).json({ message: "개인 사용자만 수정할 수 있습니다." });
    }

    const { name, phone, email, currentPassword, newPassword } = req.body;
    const result = await authService.updateUserProfile(req.user.userId, {
      name,
      phone,
      email,
      currentPassword,
      newPassword,
    });

    res.json({ user: result, userType: "user" as const });
  } catch (error) {
    logger.error("Update user profile error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "프로필 수정에 실패했습니다.";
    const statusCode = message.includes("등록된") || message.includes("형식") || message.includes("비밀번호") ? 400 : 500;
    res.status(statusCode).json({ message });
  }
};

// 회사 전환
export const switchCompany = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== "company") {
      return res.status(403).json({ message: "회사 사용자만 전환할 수 있습니다." });
    }

    const { companyId, password } = req.body;
    if (!companyId || !password) {
      return res.status(400).json({ message: "회사 ID와 비밀번호를 입력해주세요." });
    }

    // 현재 사용자의 전화번호 가져오기
    const currentUser = await authService.getCurrentUser(req.user.userId, "company");
    const phone = currentUser.user.phone;

    const result = await authService.switchCompany(phone, companyId, password);
    res.json(result);
  } catch (error) {
    logger.error("Switch company error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "회사 전환에 실패했습니다.";
    const statusCode = message.includes("비밀번호") || message.includes("권한") ? 401 : message.includes("찾을 수 없습니다") ? 404 : 500;
    res.status(statusCode).json({ message });
  }
};

// 비밀번호 찾기 요청
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { identifier, isEmail } = req.body;
    if (!identifier?.trim()) {
      return res.status(400).json({ message: "전화번호 또는 이메일을 입력해주세요." });
    }

    const result = await authService.requestPasswordReset(identifier.trim(), isEmail || false);
    res.json(result);
  } catch (error) {
    logger.error("Request password reset error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "비밀번호 찾기에 실패했습니다.";
    res.status(500).json({ message });
  }
};

// 비밀번호 재설정
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "토큰과 새 비밀번호를 입력해주세요." });
    }

    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    logger.error("Reset password error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "비밀번호 재설정에 실패했습니다.";
    const statusCode = message.includes("유효하지") || message.includes("만료") || message.includes("사용된") ? 400 : 500;
    res.status(statusCode).json({ message });
  }
};
