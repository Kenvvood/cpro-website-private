// shim for prisma/seed_assets.ts: `import('../src/generated/prisma').Prisma`
// (Prisma 5+ 不再生成 index.ts, 但旧代码引用了它)
// 重导出 Prisma namespace
export * from './client';
export { Prisma } from './client';
export type * from './models';
