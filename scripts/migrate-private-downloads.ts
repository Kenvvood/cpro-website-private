// task061-1: 把 Product.fileUrl 从 /public/downloads/xxx.zip 改为 /private-assets/xxx.zip
// (配合 task060 已把物理目录从 public/downloads 改名为 cpro-website/_private_assets)
// Prisma 7 client 输出到 src/generated/prisma
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const before = await prisma.product.findMany({
    where: { fileUrl: { startsWith: "/public/downloads/" } },
    select: { id: true, fileUrl: true },
  });
  console.log(`[SCAN] 命中 ${before.length} 条 /public/downloads/ 路径`);
  if (before.length === 0) {
    console.log("[DONE] 无需迁移");
    return;
  }
  // 改名映射: /public/downloads/X.zip → /private-assets/X.zip
  const result = await prisma.$transaction(
    before.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: {
          fileUrl: p.fileUrl.replace(/^\/public\/downloads\//, "/private-assets/"),
        },
      })
    )
  );
  console.log(`[UPDATE] 成功 ${result.length} 条`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());