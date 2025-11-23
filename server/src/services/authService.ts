// src/services/authService.ts
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository";
import { companyRepository } from "../repositories/companyRepository";
import { generateToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export interface RegisterUserData {
  name: string;
  phone: string;
  password: string;
}

export interface RegisterCompanyData {
  businessNumber: string;
  companyName: string;
  representative: string;
  address: string;
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
    // 전화번호 중복 확인
    const existingUser = await userRepository.findByPhone(data.phone);
    if (existingUser) {
      throw new Error("이미 등록된 전화번호입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 사용자 생성
    const user = await userRepository.create({
      name: data.name,
      phone: data.phone,
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
    // 사업자등록번호 중복 확인
    const existingCompany = await companyRepository.findByBusinessNumber(
      data.businessNumber
    );
    if (existingCompany) {
      throw new Error("이미 등록된 사업자등록번호입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 회사 생성
    const company = await companyRepository.create({
      businessNumber: data.businessNumber,
      companyName: data.companyName,
      representative: data.representative,
      address: data.address,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
    });

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
        verified: company.verified,
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

  /**
   * 사용자 인증 (전화번호 인증)
   */
  async verifyUser(userId: string, verificationCode: string) {
    // TODO: 실제로는 SMS 인증 API를 호출해야 함
    // 여기서는 시뮬레이션으로 처리
    const validCode = "123456"; // 실제로는 랜덤 생성된 코드

    if (verificationCode !== validCode) {
      throw new Error("인증번호가 올바르지 않습니다.");
    }

    // 사용자 인증 상태 업데이트
    await userRepository.updateVerification(userId, true);

    return {
      valid: true,
      message: "본인인증이 완료되었습니다.",
    };
  }
}

export const authService = new AuthService();
