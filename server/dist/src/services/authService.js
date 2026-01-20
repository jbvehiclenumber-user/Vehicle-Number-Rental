"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
// src/services/authService.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepository_1 = require("../repositories/userRepository");
const companyRepository_1 = require("../repositories/companyRepository");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../utils/prisma");
class AuthService {
    /**
     * 개인 사용자 회원가입
     */
    async registerUser(data) {
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
        const existingUser = await userRepository_1.userRepository.findByPhone(data.phone);
        if (existingUser) {
            throw new Error("이미 등록된 전화번호입니다.");
        }
        // 이메일 중복 확인
        const existingUserByEmail = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            throw new Error("이미 등록된 이메일입니다.");
        }
        // 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // 사용자 생성 (이메일은 정규화된 값 사용)
        const user = await userRepository_1.userRepository.create({
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: email,
            password: hashedPassword,
        });
        // 토큰 생성
        const token = (0, jwt_1.generateToken)(user.id, "user");
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
            userType: "user",
        };
    }
    /**
     * 회사 회원가입
     */
    async registerCompany(data) {
        if (!data.businessNumber?.trim() ||
            !data.companyName?.trim() ||
            !data.representative?.trim() ||
            !data.contactPerson?.trim() ||
            !data.phone?.trim() ||
            !data.password?.trim()) {
            throw new Error("모든 필드를 입력해주세요.");
        }
        // 사업자등록번호 중복 확인
        const existingCompany = await companyRepository_1.companyRepository.findByBusinessNumber(data.businessNumber);
        if (existingCompany) {
            throw new Error("이미 등록된 사업자등록번호입니다.");
        }
        // 사업자등록번호 인증 확인
        const { isBusinessNumberVerified } = await Promise.resolve().then(() => __importStar(require("../services/businessNumberService")));
        const isVerified = isBusinessNumberVerified(data.businessNumber);
        if (!isVerified) {
            throw new Error("사업자등록번호 인증이 필요합니다. 먼저 인증을 완료해주세요.");
        }
        // 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // 회사 생성 (인증 상태를 true로 설정)
        const company = await companyRepository_1.companyRepository.create({
            businessNumber: data.businessNumber,
            companyName: data.companyName,
            representative: data.representative,
            contactPerson: data.contactPerson,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
        });
        // 인증 상태 업데이트
        await companyRepository_1.companyRepository.updateVerification(company.id, true);
        // 토큰 생성
        const token = (0, jwt_1.generateToken)(company.id, "company");
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
            userType: "company",
        };
    }
    /**
     * 로그인
     */
    async login(data) {
        logger_1.logger.info(`로그인 시도: userType=${data.userType}, phone=${data.phone}`);
        if (data.userType === "user") {
            // 개인 로그인
            const user = await userRepository_1.userRepository.findByPhone(data.phone);
            logger_1.logger.info(`사용자 조회 결과: ${user ? `찾음 (id: ${user.id})` : "찾을 수 없음"}`);
            if (!user) {
                logger_1.logger.warn(`사용자를 찾을 수 없음: phone=${data.phone}`);
                throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
            }
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
            logger_1.logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
            if (!isPasswordValid) {
                logger_1.logger.warn(`비밀번호 불일치: phone=${data.phone}`);
                throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
            }
            // 마지막 로그인 시간 업데이트
            await userRepository_1.userRepository.updateLastLogin(user.id);
            const token = (0, jwt_1.generateToken)(user.id, "user");
            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    verified: user.verified,
                    createdAt: user.createdAt,
                },
                userType: "user",
            };
        }
        else {
            // 회사 로그인
            const company = await companyRepository_1.companyRepository.findByPhone(data.phone);
            logger_1.logger.info(`회사 조회 결과: ${company ? `찾음 (id: ${company.id}, businessNumber: ${company.businessNumber})` : "찾을 수 없음"}`);
            if (!company) {
                logger_1.logger.warn(`회사를 찾을 수 없음: phone=${data.phone}`);
                throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
            }
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, company.password);
            logger_1.logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
            if (!isPasswordValid) {
                logger_1.logger.warn(`비밀번호 불일치: phone=${data.phone}`);
                throw new Error("전화번호 또는 비밀번호가 잘못되었습니다.");
            }
            const token = (0, jwt_1.generateToken)(company.id, "company");
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
                userType: "company",
            };
        }
    }
    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser(userId, userType) {
        if (userType === "user") {
            const user = await userRepository_1.userRepository.findById(userId);
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
                userType: "user",
            };
        }
        else {
            const company = await companyRepository_1.companyRepository.findById(userId);
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
                userType: "company",
            };
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
