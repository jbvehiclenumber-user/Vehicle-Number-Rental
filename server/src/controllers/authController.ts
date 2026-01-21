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
      contactPerson,
      phone,
      email,
      password,
    } = req.body;
    const result = await authService.registerCompany({
      businessNumber,
      companyName,
      representative,
      contactPerson,
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
    const { phone, password, userType } = req.body;
    if (!phone?.trim() || !password?.trim() || !userType?.trim()) {
      return res.status(400).json({ message: "전화번호, 비밀번호, 사용자 타입을 입력해주세요." });
    }

    if (userType !== "user" && userType !== "company") {
      return res.status(400).json({ message: "사용자 타입이 올바르지 않습니다." });
    }

    const result = await authService.login({ phone, password, userType });
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

    const { name, phone, email, password } = req.body;
    const result = await authService.updateUserProfile(req.user.userId, {
      name,
      phone,
      email,
      password,
    });

    res.json({ user: result, userType: "user" as const });
  } catch (error) {
    logger.error("Update user profile error", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "프로필 수정에 실패했습니다.";
    const statusCode = message.includes("등록된") || message.includes("형식") ? 400 : 500;
    res.status(statusCode).json({ message });
  }
};
