// src/services/authService.ts
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository";
import { companyRepository } from "../repositories/companyRepository";
import { generateToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { prisma } from "../utils/prisma";

export interface RegisterUserData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface RegisterCompanyData {
  businessNumber: string;
  companyName: string;
  representative: string;
  contactPerson: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginData {
  phone: string;
  password: string;
  userType: "user" | "company";
}

export class AuthService {
  /**
   * 개인 사용자 회원가입
   */
  async registerUser(data: RegisterUserData) {
    if (!data.name?.trim() || !data.phone?.trim() || !data.password?.trim()) {
      throw new Error("이름, 전화번호, 비밀번호를 입력해주세요.");
    }
    
    // 이메일 검증 및 정규화
    const email = data.email?.trim() || null;
    if (!email) {
      throw new Error("이메일을 입력해주세요.");
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("올바른 이메일 형식이 아닙니다.");
    }

    // 전화번호 중복 확인
    const existingUser = await userRepository.findByPhone(data.phone);
    if (existingUser) {
      throw new Error("이미 등록된 전화번호입니다.");
    }

    // 이메일 중복 확인
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new Error("이미 등록된 이메일입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 사용자 생성 (이메일은 정규화된 값 사용)
    const user = await userRepository.create({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: email,
      password: hashedPassword,
    });

    // 토큰 생성
    const token = generateToken(user.id, "user");

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      userType: "user" as const,
    };
  }

  /**
   * 회사 회원가입
   */
  async registerCompany(data: RegisterCompanyData) {
    if (
      !data.businessNumber?.trim() ||
      !data.companyName?.trim() ||
      !data.representative?.trim() ||
      !data.contactPerson?.trim() ||
      !data.phone?.trim() ||
      !data.password?.trim()
    ) {
      throw new Error("모든 필드를 입력해주세요.");
    }

    // 사업자등록번호 중복 확인
    const existingCompany = await companyRepository.findByBusinessNumber(
      data.businessNumber
    );
    if (existingCompany) {
      throw new Error("이미 등록된 사업자등록번호입니다.");
    }

    // 사업자등록번호 인증 확인
    const { isBusinessNumberVerified } = await import("../services/businessNumberService");
    const isVerified = isBusinessNumberVerified(data.businessNumber);
    if (!isVerified) {
      throw new Error("사업자등록번호 인증이 필요합니다. 먼저 인증을 완료해주세요.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 회사 생성 (인증 상태를 true로 설정)
    const company = await companyRepository.create({
      businessNumber: data.businessNumber,
      companyName: data.companyName,
      representative: data.representative,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
    });

    // 인증 상태 업데이트
    await companyRepository.updateVerification(company.id, true);

    // 토큰 생성
    const token = generateToken(company.id, "company");

    return {
      token,
      user: {
        id: company.id,
        businessNumber: company.businessNumber,
        companyName: company.companyName,
        representative: company.representative,
        phone: company.phone,
        verified: true, // 인증 완료 상태
        createdAt: company.createdAt,
      },
      userType: "company" as const,
    };
  }

  /**
   * 로그인
   */
  async login(data: LoginData) {
    logger.info(`로그인 시도: userType=${data.userType}, phone=${data.phone}`);
    
    if (data.userType === "user") {
      // 개인 로그인
      const user = await userRepository.findByPhone(data.phone);
      logger.info(`사용자 조회 결과: ${user ? `찾음 (id: ${user.id})` : "찾을 수 없음"}`);
      
      if (!user) {
        logger.warn(`사용자를 찾을 수 없음: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
      
      if (!isPasswordValid) {
        logger.warn(`비밀번호 불일치: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      // 마지막 로그인 시간 업데이트
      await userRepository.updateLastLogin(user.id);

      const token = generateToken(user.id, "user");

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        userType: "user" as const,
      };
    } else {
      // 회사 로그인
      const company = await companyRepository.findByPhone(data.phone);
      logger.info(`회사 조회 결과: ${company ? `찾음 (id: ${company.id}, businessNumber: ${company.businessNumber})` : "찾을 수 없음"}`);
      
      if (!company) {
        logger.warn(`회사를 찾을 수 없음: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        company.password
      );
      logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
      
      if (!isPasswordValid) {
        logger.warn(`비밀번호 불일치: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      const token = generateToken(company.id, "company");

      return {
        token,
        user: {
          id: company.id,
          businessNumber: company.businessNumber,
          companyName: company.companyName,
          representative: company.representative,
          phone: company.phone,
          verified: company.verified,
          createdAt: company.createdAt,
        },
        userType: "company" as const,
      };
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(userId: string, userType: "user" | "company") {
    if (userType === "user") {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        userType: "user" as const,
      };
    } else {
      const company = await companyRepository.findById(userId);
      if (!company) {
        throw new Error("회사를 찾을 수 없습니다.");
      }

      return {
        user: {
          id: company.id,
          businessNumber: company.businessNumber,
          companyName: company.companyName,
          representative: company.representative,
          phone: company.phone,
          verified: company.verified,
          createdAt: company.createdAt,
        },
        userType: "company" as const,
      };
    }
  }

}

export const authService = new AuthService();
