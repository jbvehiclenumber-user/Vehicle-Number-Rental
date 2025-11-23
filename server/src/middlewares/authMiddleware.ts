// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { logger } from "../utils/logger";

/**
 * 인증 미들웨어 (필수)
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const decoded = verifyToken(token);

    // req 객체에 사용자 정보 추가
    req.user = {
      userId: decoded.id,
      userType: decoded.type,
    };

    next();
  } catch (error) {
    logger.warn("Invalid token", { error: error instanceof Error ? error.message : String(error) });
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 사용자 정보를 설정, 없어도 통과)
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = verifyToken(token);

      // req 객체에 사용자 정보 추가
      req.user = {
        userId: decoded.id,
        userType: decoded.type,
      };
    }

    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 통과 (선택적 인증)
    next();
  }
};
