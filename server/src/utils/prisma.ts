// src/utils/prisma.ts
// NOTE: In some setups, `@prisma/client` can resolve to a stub that requires
// `#main-entry-point` and crashes under CommonJS. Import the generated client directly.
import { PrismaClient } from "../../node_modules/.prisma/client";

// PrismaClient를 singleton으로 관리
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;


