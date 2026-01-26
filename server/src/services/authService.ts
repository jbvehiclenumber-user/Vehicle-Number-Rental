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
  phone: string;
  email?: string;
  password: string;
}

export interface LoginData {
  phone: string;
  password: string;
  userType: "user" | "company";
  defaultCompanyId?: string; // 기본 회사 ID (옵션)
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

    // 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(data.password)) {
      throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
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
   * 개인 사용자 프로필 업데이트
   */
  async updateUserProfile(userId: string, data: Partial<RegisterUserData> & { currentPassword?: string; newPassword?: string }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const updates: Partial<{ name: string; phone: string; email: string | null; password: string }> = {};

    if (data.name?.trim()) {
      updates.name = data.name.trim();
    }

    if (data.phone?.trim() && data.phone.trim() !== user.phone) {
      const duplicatedPhone = await userRepository.findByPhone(data.phone.trim());
      if (duplicatedPhone && duplicatedPhone.id !== user.id) {
        throw new Error("이미 등록된 전화번호입니다.");
      }
      updates.phone = data.phone.trim();
    }

    if (data.email !== undefined) {
      const email = data.email?.trim() || null;
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("올바른 이메일 형식이 아닙니다.");
        }
        const duplicatedEmail = await prisma.user.findUnique({ where: { email } });
        if (duplicatedEmail && duplicatedEmail.id !== user.id) {
          throw new Error("이미 등록된 이메일입니다.");
        }
      }
      updates.email = email;
    }

    // 비밀번호 변경 시 기존 비밀번호 확인
    if (data.newPassword?.trim()) {
      if (!data.currentPassword?.trim()) {
        throw new Error("기존 비밀번호를 입력해주세요.");
      }
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword.trim(), user.password);
      if (!isCurrentPasswordValid) {
        throw new Error("기존 비밀번호가 올바르지 않습니다.");
      }
      // 새 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(data.newPassword)) {
        throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
      }
      updates.password = await bcrypt.hash(data.newPassword.trim(), 10);
    }

    const updated = await userRepository.update(user.id, updates);

    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      verified: updated.verified,
      createdAt: updated.createdAt,
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

    // 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(data.password)) {
      throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 회사 생성 (인증 상태를 true로 설정)
    const company = await companyRepository.create({
      businessNumber: data.businessNumber,
      companyName: data.companyName,
      representative: data.representative,
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
      // 회사 로그인 - 전화번호로 모든 회사 조회
      const allCompanies = await companyRepository.findAllByPhone(data.phone);
      logger.info(`회사 조회 결과: ${allCompanies.length}개 회사 발견`);
      
      if (allCompanies.length === 0) {
        logger.warn(`회사를 찾을 수 없음: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      // 첫 번째 회사로 비밀번호 검증 (모든 회사가 같은 비밀번호 사용)
      const firstCompany = allCompanies[0];
      const isPasswordValid = await bcrypt.compare(
        data.password,
        firstCompany.password
      );
      logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
      
      if (!isPasswordValid) {
        logger.warn(`비밀번호 불일치: phone=${data.phone}`);
        throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
      }

      // 기본 회사 ID가 있으면 해당 회사로, 없으면 첫 번째 회사로 로그인
      let targetCompany = firstCompany;
      if (data.defaultCompanyId) {
        const defaultCompany = allCompanies.find(c => c.id === data.defaultCompanyId);
        if (defaultCompany) {
          targetCompany = defaultCompany;
          logger.info(`기본 회사로 로그인: ${targetCompany.companyName} (${targetCompany.id})`);
        } else {
          logger.warn(`기본 회사 ID를 찾을 수 없음: ${data.defaultCompanyId}, 첫 번째 회사로 로그인`);
        }
      }

      const token = generateToken(targetCompany.id, "company");

      // 모든 회사 목록 반환 (비밀번호 제외)
      const companiesList = allCompanies.map((company) => ({
        id: company.id,
        businessNumber: company.businessNumber,
        companyName: company.companyName,
        representative: company.representative,
        phone: company.phone,
        verified: company.verified,
        createdAt: company.createdAt,
      }));

      return {
        token,
        user: {
          id: targetCompany.id,
          businessNumber: targetCompany.businessNumber,
          companyName: targetCompany.companyName,
          representative: targetCompany.representative,
          phone: targetCompany.phone,
          verified: targetCompany.verified,
          createdAt: targetCompany.createdAt,
        },
        userType: "company" as const,
        companies: companiesList, // 모든 회사 목록
      };
    }
  }

  /**
   * 회사 전환 (비밀번호 확인 후 다른 회사로 전환)
   */
  async switchCompany(phone: string, companyId: string, password: string) {
    logger.info(`회사 전환 시도: phone=${phone}, companyId=${companyId}`);
    
    // 회사 조회
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new Error("회사를 찾을 수 없습니다.");
    }

    // 전화번호 일치 확인
    const normalizedInput = companyRepository.normalizePhone(phone);
    const normalizedCompanyPhone = companyRepository.normalizePhone(company.phone);
    if (normalizedInput !== normalizedCompanyPhone) {
      throw new Error("해당 회사에 대한 권한이 없습니다.");
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      throw new Error("비밀번호가 올바르지 않습니다.");
    }

    // 새 토큰 생성
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
