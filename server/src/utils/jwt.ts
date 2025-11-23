// src/utils/jwt.ts
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  type: "user" | "company";
}

/**
 * JWT 토큰 생성
 */
export const generateToken = (id: string, type: "user" | "company"): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // @ts-ignore - jsonwebtoken types issue with expiresIn
  return jwt.sign({ id, type }, secret, { expiresIn });
};

/**
 * JWT 토큰 검증
 */
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  return jwt.verify(token, secret) as JwtPayload;
};
