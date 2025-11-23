// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userType: "user" | "company";
      };
    }
  }
}

// 타입 정의를 활성화하기 위한 빈 export
export {};
