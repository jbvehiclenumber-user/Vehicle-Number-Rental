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
            throw new Error("이미 등록된 전화번호입니다. 로그인하시거나 비밀번호 찾기를 이용해주세요.");
        }
        // 이메일 중복 확인
        const existingUserByEmail = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            throw new Error("이미 등록된 이메일입니다. 로그인하시거나 비밀번호 찾기를 이용해주세요.");
        }
        // 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(data.password)) {
            throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
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
     * 개인 사용자 프로필 업데이트
     */
    async updateUserProfile(userId, data) {
        const user = await userRepository_1.userRepository.findById(userId);
        if (!user) {
            throw new Error("사용자를 찾을 수 없습니다.");
        }
        const updates = {};
        if (data.name?.trim()) {
            updates.name = data.name.trim();
        }
        if (data.phone?.trim() && data.phone.trim() !== user.phone) {
            const duplicatedPhone = await userRepository_1.userRepository.findByPhone(data.phone.trim());
            if (duplicatedPhone && duplicatedPhone.id !== user.id) {
                throw new Error("이미 등록된 전화번호입니다.");
            }
            updates.phone = data.phone.trim();
        }
        if (data.email !== undefined && data.email?.trim()) {
            const email = data.email.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("올바른 이메일 형식이 아닙니다.");
            }
            const duplicatedEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (duplicatedEmail && duplicatedEmail.id !== user.id) {
                throw new Error("이미 등록된 이메일입니다.");
            }
            updates.email = email;
        }
        // 비밀번호 변경 시 기존 비밀번호 확인
        if (data.newPassword?.trim()) {
            if (!data.currentPassword?.trim()) {
                throw new Error("기존 비밀번호를 입력해주세요.");
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(data.currentPassword.trim(), user.password);
            if (!isCurrentPasswordValid) {
                throw new Error("기존 비밀번호가 올바르지 않습니다.");
            }
            // 새 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
            if (!passwordRegex.test(data.newPassword)) {
                throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
            }
            updates.password = await bcryptjs_1.default.hash(data.newPassword.trim(), 10);
        }
        const updated = await userRepository_1.userRepository.update(user.id, updates);
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
    async registerCompany(data) {
        if (!data.businessNumber?.trim() ||
            !data.companyName?.trim() ||
            !data.representative?.trim() ||
            !data.phone?.trim() ||
            !data.email?.trim() ||
            !data.password?.trim()) {
            throw new Error("모든 필드를 입력해주세요.");
        }
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            throw new Error("올바른 이메일 형식이 아닙니다.");
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
        // 비밀번호 조건 검증 (8자 이상, 영어와 숫자 포함)
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(data.password)) {
            throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
        }
        // 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // 회사 생성 (인증 상태를 true로 설정)
        const company = await companyRepository_1.companyRepository.create({
            businessNumber: data.businessNumber,
            companyName: data.companyName,
            representative: data.representative,
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
        logger_1.logger.info(`로그인 시도: userType=${data.userType}, identifier=${data.identifier}, isEmail=${data.isEmail}`);
        if (data.userType === "user") {
            // 개인 로그인 - 전화번호 또는 이메일로 조회
            let user = null;
            if (data.isEmail) {
                user = await userRepository_1.userRepository.findByEmail(data.identifier);
                logger_1.logger.info(`이메일로 사용자 조회 결과: ${user ? `찾음 (id: ${user.id})` : "찾을 수 없음"}`);
            }
            else {
                user = await userRepository_1.userRepository.findByPhone(data.identifier);
                logger_1.logger.info(`전화번호로 사용자 조회 결과: ${user ? `찾음 (id: ${user.id})` : "찾을 수 없음"}`);
            }
            if (!user) {
                logger_1.logger.warn(`사용자를 찾을 수 없음: identifier=${data.identifier}`);
                throw new Error("전화번호/이메일 또는 비밀번호가 잘못되었습니다.");
            }
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
            logger_1.logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
            if (!isPasswordValid) {
                logger_1.logger.warn(`비밀번호 불일치: identifier=${data.identifier}`);
                throw new Error("전화번호/이메일 또는 비밀번호가 잘못되었습니다.");
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
            // 회사 로그인 - 전화번호 또는 이메일로 모든 회사 조회
            let allCompanies = [];
            if (data.isEmail) {
                allCompanies = await companyRepository_1.companyRepository.findAllByEmail(data.identifier);
                logger_1.logger.info(`이메일로 회사 조회 결과: ${allCompanies.length}개 회사 발견`);
            }
            else {
                allCompanies = await companyRepository_1.companyRepository.findAllByPhone(data.identifier);
                logger_1.logger.info(`전화번호로 회사 조회 결과: ${allCompanies.length}개 회사 발견`);
            }
            if (allCompanies.length === 0) {
                logger_1.logger.warn(`회사를 찾을 수 없음: identifier=${data.identifier}`);
                throw new Error("전화번호/이메일 또는 비밀번호가 잘못되었습니다.");
            }
            // 첫 번째 회사로 비밀번호 검증 (모든 회사가 같은 비밀번호 사용)
            const firstCompany = allCompanies[0];
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, firstCompany.password);
            logger_1.logger.info(`비밀번호 검증 결과: ${isPasswordValid ? "성공" : "실패"}`);
            if (!isPasswordValid) {
                logger_1.logger.warn(`비밀번호 불일치: identifier=${data.identifier}`);
                throw new Error("전화번호/이메일 또는 비밀번호가 잘못되었습니다.");
            }
            // 기본 회사 ID가 있으면 해당 회사로, 없으면 첫 번째 회사로 로그인
            let targetCompany = firstCompany;
            if (data.defaultCompanyId) {
                const defaultCompany = allCompanies.find(c => c.id === data.defaultCompanyId);
                if (defaultCompany) {
                    targetCompany = defaultCompany;
                    logger_1.logger.info(`기본 회사로 로그인: ${targetCompany.companyName} (${targetCompany.id})`);
                }
                else {
                    logger_1.logger.warn(`기본 회사 ID를 찾을 수 없음: ${data.defaultCompanyId}, 첫 번째 회사로 로그인`);
                }
            }
            const token = (0, jwt_1.generateToken)(targetCompany.id, "company");
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
                userType: "company",
                companies: companiesList, // 모든 회사 목록
            };
        }
    }
    /**
     * 회사 전환 (비밀번호 확인 후 다른 회사로 전환)
     */
    async switchCompany(phone, companyId, password) {
        logger_1.logger.info(`회사 전환 시도: phone=${phone}, companyId=${companyId}`);
        // 회사 조회
        const company = await companyRepository_1.companyRepository.findById(companyId);
        if (!company) {
            throw new Error("회사를 찾을 수 없습니다.");
        }
        // 전화번호 일치 확인
        const normalizedInput = companyRepository_1.companyRepository.normalizePhone(phone);
        const normalizedCompanyPhone = companyRepository_1.companyRepository.normalizePhone(company.phone);
        if (normalizedInput !== normalizedCompanyPhone) {
            throw new Error("해당 회사에 대한 권한이 없습니다.");
        }
        // 비밀번호 확인
        const isPasswordValid = await bcryptjs_1.default.compare(password, company.password);
        if (!isPasswordValid) {
            throw new Error("비밀번호가 올바르지 않습니다.");
        }
        // 새 토큰 생성
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
    /**
     * 비밀번호 찾기 요청 (이메일 또는 전화번호로)
     */
    async requestPasswordReset(identifier, isEmail) {
        let user = null;
        if (isEmail) {
            user = await userRepository_1.userRepository.findByEmail(identifier);
        }
        else {
            user = await userRepository_1.userRepository.findByPhone(identifier);
        }
        if (!user) {
            // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
            return { message: "비밀번호 재설정 링크가 이메일로 전송되었습니다." };
        }
        // 이메일이 없는 경우 처리
        if (!user.email) {
            logger_1.logger.warn(`User ${user.id} does not have an email address`);
            // 보안을 위해 이메일이 없어도 성공 메시지 반환
            return { message: "비밀번호 재설정 링크가 이메일로 전송되었습니다." };
        }
        // 재설정 토큰 생성 (24시간 유효)
        const resetToken = require("crypto").randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        // 기존 토큰 삭제 (사용자가 여러 번 요청한 경우)
        await prisma_1.prisma.passwordReset.deleteMany({
            where: { userId: user.id, used: false },
        });
        // 새 토큰 저장
        await prisma_1.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt,
            },
        });
        const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        const isDevEnv = process.env.NODE_ENV !== "production";
        // 이메일 전송 시도
        try {
            const { sendPasswordResetEmail, isEmailServiceAvailable } = await Promise.resolve().then(() => __importStar(require("./emailService")));
            if (isEmailServiceAvailable()) {
                await sendPasswordResetEmail({
                    email: user.email,
                    resetToken,
                    userName: user.name,
                });
                logger_1.logger.info(`Password reset email sent to user: ${user.id}, email: ${user.email}`);
            }
            else {
                logger_1.logger.warn("Email service not configured. RESEND_API_KEY not set.");
            }
        }
        catch (error) {
            // 이메일 전송 실패해도 토큰은 반환 (개발 환경 대비)
            logger_1.logger.error("Failed to send password reset email, but token generated", error instanceof Error ? error : new Error(String(error)), {
                user_id: user.id,
                email: user.email,
            });
        }
        logger_1.logger.info(`Password reset token generated for user: ${user.id}, email: ${user.email}`);
        // 개발 환경에서는 이메일이 오지 않아도 디버깅을 위해 토큰/링크를 함께 반환
        if (isDevEnv) {
            return {
                message: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
                token: resetToken,
                resetUrl,
            };
        }
        return {
            message: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
        };
    }
    /**
     * 비밀번호 재설정 (토큰으로)
     */
    async resetPassword(token, newPassword) {
        // 토큰으로 재설정 요청 찾기
        const resetRequest = await prisma_1.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetRequest) {
            throw new Error("유효하지 않은 재설정 링크입니다.");
        }
        if (resetRequest.used) {
            throw new Error("이미 사용된 재설정 링크입니다.");
        }
        if (resetRequest.expiresAt < new Date()) {
            throw new Error("만료된 재설정 링크입니다. 다시 요청해주세요.");
        }
        // 비밀번호 조건 검증
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new Error("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
        }
        // 새 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // 비밀번호 업데이트
        await userRepository_1.userRepository.update(resetRequest.userId, {
            password: hashedPassword,
        });
        // 토큰 사용 처리
        await prisma_1.prisma.passwordReset.update({
            where: { id: resetRequest.id },
            data: { used: true },
        });
        logger_1.logger.info(`Password reset completed for user: ${resetRequest.userId}`);
        return { message: "비밀번호가 성공적으로 변경되었습니다." };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
