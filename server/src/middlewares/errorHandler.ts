// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  res.status(500).json({
    message: "서버 오류가 발생했습니다.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
