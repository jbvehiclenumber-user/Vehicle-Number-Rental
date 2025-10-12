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

    // TODO: 실제로는 국세청 API를 호출해야 함
    // 여기서는 간단히 형식만 검증
    const isValid = /^\d{3}-\d{2}-\d{5}$/.test(businessNumber);

    res.json({ valid: isValid });
  } catch (error) {
    console.error("Verify business number error:", error);
    res.status(500).json({ message: "인증에 실패했습니다." });
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
