import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// CLAUDE.md §6.2: SQLite (libsql) 是项目锁定路线 (与 seed.ts 保持一致)
// ARCHIVE v7.3 (task-0037): prisma.ts 与 seed.ts 必须共用同一 adapter 避免连接器分裂
// 修复: PrismaClient 7 client engine 要求显式 adapter, 不再默认连接

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
