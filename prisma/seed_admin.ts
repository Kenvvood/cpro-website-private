/**
 * seed_admin.ts — 补种 admin 账号 (v21.3 排版验证需要)
 *
 * 只补种 / 升级 admin 用户, 不动其他表数据
 * - 默认账号: admin / admin123
 * - role: ADMIN, status: ACTIVE
 * - 如果 username 已存在, 升级 role + 重置密码
 * - 如果 username 不存在, 新建
 *
 * 严禁:
 *   - 删其他 user
 *   - 重置整个 db
 *   - 改其他表
 *
 * 用法: npx tsx prisma/seed_admin.ts
 *   或: cd /var/www/cpro-website && npx tsx prisma/seed_admin.ts
 */

// Prisma 7 (prisma-client provider) 无 index.js, 显式 import client.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

const ADMIN_USERNAME = 'admin';
const ADMIN_PHONE = '13800000001';
const ADMIN_PASSWORD = 'admin123';  // PM 用完请改

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  console.log('[seed_admin] bcrypt hash generated, length:', passwordHash.length);

  // upsert: by username
  const existing = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
    select: { id: true, role: true, status: true },
  });

  if (existing) {
    console.log('[seed_admin] existing user found:', existing);
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash,
        phone: ADMIN_PHONE,
      },
      select: { id: true, username: true, phone: true, role: true, status: true },
    });
    console.log('[seed_admin] updated to:', updated);
  } else {
    const created = await prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        phone: ADMIN_PHONE,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        kycVerified: false,
        totalSpent: 0,
      },
      select: { id: true, username: true, phone: true, role: true, status: true },
    });
    console.log('[seed_admin] created:', created);
  }

  // verify
  const verify = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
    select: { id: true, username: true, phone: true, role: true, status: true },
  });
  console.log('[seed_admin] final state:', verify);

  // sanity: total user count (should be >= 1)
  const count = await prisma.user.count();
  console.log('[seed_admin] total users in db:', count);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[seed_admin] FAILED:', err);
  prisma.$disconnect();
  process.exit(1);
});
