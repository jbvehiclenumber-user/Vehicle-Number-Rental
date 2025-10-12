// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  type: "user" | "company";
}

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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as JwtPayload;

    // req 객체에 사용자 정보 추가
    (req as any).user = {
      userId: decoded.id,
      userType: decoded.type,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};
