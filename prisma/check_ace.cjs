const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'src/generated/prisma'));
const { PrismaLibSql } = require(path.join(__dirname, '..', 'node_modules/@prisma/adapter-libsql'));
const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
(async () => {
  const names = ['DCA_Gold_Grid','MartingailExpert','GoldArbitrageXpert','XAU_USD_Scalper_M1','Goldwarrior02b'];
  const ps = await prisma.product.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true, isFeatured: true, isActive: true, tier: true, score: true, downloadCount: true, positioning: true }
  });
  console.log('--- 5 王牌当前状态 ---');
  for (const p of ps) {
    console.log(`${p.name.padEnd(28)} | id=${p.id.padEnd(35)} | isFeatured=${p.isFeatured} | isActive=${p.isActive} | tier=${(p.tier||'').padEnd(20)} | score=${p.score} | dl=${p.downloadCount}`);
  }
  const all = await prisma.product.findMany({ where: { isFeatured: true }, select: { id: true, name: true } });
  console.log('---');
  console.log('isFeatured=true 共', all.length, '款:', all.map(p => p.name).join(', '));
  await prisma.$disconnect();
})();
