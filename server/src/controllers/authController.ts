// src/controllers/authController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// JWT 토큰 생성
const generateToken = (id: string, type: "user" | "company") => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// 개인(기사) 회원가입
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, phone, password } = req.body;

    // 전화번호 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({ message: "이미 등록된 전화번호입니다." });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
      },
    });

    // 토큰 생성
    const token = generateToken(user.id, "user");

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      userType: "user",
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({ message: "회원가입에 실패했습니다." });
  }
};

// 회사 회원가입
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const {
      businessNumber,
      companyName,
      representative,
      address,
      contactPerson,
      phone,
      email,
      password,
    } = req.body;

    // 사업자등록번호 중복 확인
    const existingCompany = await prisma.company.findUnique({
      where: { businessNumber },
    });

    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "이미 등록된 사업자등록번호입니다." });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회사 생성
    const company = await prisma.company.create({
      data: {
        businessNumber,
        companyName,
        representative,
        address,
        contactPerson,
        phone,
        email,
        password: hashedPassword,
      },
    });

    // 토큰 생성
    const token = generateToken(company.id, "company");

    res.status(201).json({
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
      userType: "company",
    });
  } catch (error) {
    console.error("Register company error:", error);
    res.status(500).json({ message: "회원가입에 실패했습니다." });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password, userType } = req.body;

    if (userType === "user") {
      // 개인 로그인
      const user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "전화번호 또는 비밀번호가 잘못되었습니다." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "전화번호 또는 비밀번호가 잘못되었습니다." });
      }

      // 마지막 로그인 시간 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const token = generateToken(user.id, "user");

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        userType: "user",
      });
    } else {
      // 회사 로그인
      const company = await prisma.company.findFirst({
        where: { phone },
      });

      if (!company) {
        return res
          .status(401)
          .json({ message: "전화번호 또는 비밀번호가 잘못되었습니다." });
      }

      const isPasswordValid = await bcrypt.compare(password, company.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "전화번호 또는 비밀번호가 잘못되었습니다." });
      }

      const token = generateToken(company.id, "company");

      res.json({
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
        userType: "company",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "로그인에 실패했습니다." });
  }
};

// 사업자등록번호 인증 (국세청 API 연동 필요)
export const verifyBusinessNumber = async (req: Request, res: Response) => {
  try {
    const { businessNumber } = req.body;

    // 사업자등록번호 형식 검증
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberRegex.test(businessNumber)) {
      return res.status(400).json({
        valid: false,
        message: "올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)",
      });
    }

    // TODO: 실제로는 국세청 API를 호출해야 함
    // 여기서는 시뮬레이션으로 처리
    // 실제 구현 시에는 국세청 사업자등록번호 진위확인 서비스 API 사용

    // 시뮬레이션: 일부 번호는 유효하지 않다고 처리
    const invalidNumbers = ["000-00-00000", "111-11-11111", "999-99-99999"];
    const isValid = !invalidNumbers.includes(businessNumber);

    if (isValid) {
      // 회사 인증 상태 업데이트
      const company = await prisma.company.findUnique({
        where: { businessNumber },
      });

      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            verified: true,
            verifiedAt: new Date(),
          },
        });
      }
    }

    res.json({
      valid: isValid,
      message: isValid
        ? "인증이 완료되었습니다."
        : "유효하지 않은 사업자등록번호입니다.",
    });
  } catch (error) {
    console.error("Verify business number error:", error);
    res.status(500).json({ message: "인증에 실패했습니다." });
  }
};

// 개인 사용자 본인인증 (전화번호 인증)
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = (req as any).user;
    const { phone, verificationCode } = req.body;

    if (userType !== "user") {
      return res
        .status(403)
        .json({ message: "개인 사용자만 인증할 수 있습니다." });
    }

    // TODO: 실제로는 SMS 인증 API를 호출해야 함
    // 여기서는 시뮬레이션으로 처리
    const validCode = "123456"; // 실제로는 랜덤 생성된 코드

    if (verificationCode !== validCode) {
      return res.status(400).json({
        valid: false,
        message: "인증번호가 올바르지 않습니다.",
      });
    }

    // 사용자 인증 상태 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    res.json({
      valid: true,
      message: "본인인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ message: "인증에 실패했습니다." });
  }
};

// 인증번호 발송 (시뮬레이션)
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // TODO: 실제로는 SMS 발송 API를 호출해야 함
    // 여기서는 시뮬레이션으로 처리

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)",
      });
    }

    // 시뮬레이션: 인증번호 발송 성공
    res.json({
      success: true,
      message: "인증번호가 발송되었습니다. (시뮬레이션: 123456)",
      // 실제로는 인증번호를 반환하지 않음
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({ message: "인증번호 발송에 실패했습니다." });
  }
};

// 현재 사용자 정보
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // authMiddleware에서 설정한 user 정보 사용
    const { userId, userType } = (req as any).user;

    if (userType === "user") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        userType: "user",
      });
    } else {
      const company = await prisma.company.findUnique({
        where: { id: userId },
      });

      if (!company) {
        return res.status(404).json({ message: "회사를 찾을 수 없습니다." });
      }

      res.json({
        user: {
          id: company.id,
          businessNumber: company.businessNumber,
          companyName: company.companyName,
          representative: company.representative,
          phone: company.phone,
          verified: company.verified,
          createdAt: company.createdAt,
        },
        userType: "company",
      });
    }
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "사용자 정보를 불러오는데 실패했습니다." });
  }
};
