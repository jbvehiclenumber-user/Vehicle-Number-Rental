"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * JWT 토큰 생성
 */
const generateToken = (id, type) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    // @ts-ignore - jsonwebtoken types issue with expiresIn
    return jsonwebtoken_1.default.sign({ id, type }, secret, { expiresIn });
};
exports.generateToken = generateToken;
/**
 * JWT 토큰 검증
 */
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
