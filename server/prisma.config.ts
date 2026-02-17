import { defineConfig } from "@prisma/internals";

export default defineConfig({
  seed: "ts-node prisma/seed.ts",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
