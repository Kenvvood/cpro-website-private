// P5W 8/14 5 王牌独立 seed (PM 拍板方案 A - 如实标注 MartingailExpert 风控)
// 跑: npx tsx prisma/seed_ace5.ts
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require(require('path').join(process.cwd(), 'src', 'generated', 'prisma'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    "name": "DCA_Gold_Grid",
    "description": "专为黄金 (XAUUSD) 设计的网格加仓策略, 自动捕捉趋势回调, 配合阶梯式加仓拉低均价, 适合中长线趋势行情。",
    "category": "EA",
    "fileUrl": "/downloads/products/DCA_Gold_Grid.mq5",
    "ex5Url": "/downloads/products/DCA_Gold_Grid.ex5",
    "ex4Url": null,
    "version": "1.0",
    "requiredPlan": "WEEKLY",
    "isFree": false,
    "tier": "Tier 1 (典藏级 VIP)",
    "score": 18,
    "positioning": "XAUUSD 黄金网格加仓王 - 109 处 Grid 逻辑 + 自动开仓 + 完整 SL/TP",
    "productHighlights": "专为黄金 (XAUUSD) 设计的网格加仓策略, 自动捕捉趋势回调, 配合阶梯式加仓拉低均价, 适合中长线趋势行情。",
    "algorithmicCore": "网格间距自动计算 + 阶梯加仓系数 + 多空双向挂单 + 趋势过滤信号。",
    "practicalApplication": "推荐 1H/4H 周期, 适用 5000 USD 起步账户, 单次最大持仓 0.5 手。",
    "riskControl": "✅ StopLoss × 15  + ✅ TakeProfit × 10  + ✅ sl/tp 实时可调",
    "subcategory": "网格",
    "capabilityTags": "[\"黄金\", \"网格\", \"加仓\", \"XAUUSD\", \"趋势\", \"中长线\", \"王牌\"]",
    "isActive": true,
    "isFeatured": true
  },
  {
    "name": "MartingailExpert",
    "description": "经典 Martingale 倍投策略, 价格逆行时按 1.6 倍系数加仓拉均价, 触发全局 TP 一次性全平, 适合震荡行情快速反转捕捉。\n\n⚠️ 【马丁风控如实标注】\n本 EA 采用【全局 TP 全平 + 账户保证金监控】风控策略:\n  ✅ 账户保证金监控 (L76): 自由保证金 ≤ 余额 1/2 时停止开仓\n  ✅ 全局 TP 全平 (L110): tp=total*proffactor 触发后一次性 OrderClose 全平\n  ❌ 无单仓 StopLoss 函数\n  ❌ 无单仓 TrailingStop 跟踪\n  ❌ 无 DollarSL 美元止损\n适用人群: 理解马丁策略的资深用户, 适合追求'加仓拉均价 + 全平锁利'盈利模型。",
    "category": "EA",
    "fileUrl": "/downloads/products/MartingailExpert.mq5",
    "ex5Url": "/downloads/products/MartingailExpert.ex5",
    "ex4Url": "/downloads/products/MartingailExpert.ex4",
    "version": "1.0",
    "requiredPlan": "WEEKLY",
    "isFree": false,
    "tier": "Tier 2 (专业级 Pro)",
    "score": 14,
    "positioning": "经典马丁格尔加仓王 - 1.6 倍倍投 + 账户保证金监控 + 全局 TP 全平",
    "productHighlights": "经典 Martingale 倍投策略, 价格逆行时按 1.6 倍系数加仓拉均价, 触发全局 TP 一次性全平, 适合震荡行情快速反转捕捉。",
    "algorithmicCore": "Stochastic 随机指标信号 + 马丁 1.6 倍倍投 + 全局盈亏目标 + 账户保证金监控。",
    "practicalApplication": "推荐 1000 USD 起步账户, 单次首仓 0.03 手, 加仓 8-10 次后必触发全平。",
    "riskControl": "⚠️ 【马丁风控如实标注】\n本 EA 采用【全局 TP 全平 + 账户保证金监控】风控策略:\n  ✅ 账户保证金监控 (L76): 自由保证金 ≤ 余额 1/2 时停止开仓\n  ✅ 全局 TP 全平 (L110): tp=total*proffactor 触发后一次性 OrderClose 全平\n  ❌ 无单仓 StopLoss 函数\n  ❌ 无单仓 TrailingStop 跟踪\n  ❌ 无 DollarSL 美元止损\n适用人群: 理解马丁策略的资深用户, 适合追求'加仓拉均价 + 全平锁利'盈利模型。",
    "subcategory": "马丁",
    "capabilityTags": "[\"马丁\", \"加仓\", \"倍投\", \"震荡\", \"Stochastic\", \"全平\", \"王牌\", \"如实标注风控\"]",
    "isActive": true,
    "isFeatured": true
  },
  {
    "name": "GoldArbitrageXpert",
    "description": "专为黄金设计的对冲套利策略, 监控多品种价差, 触发阈值后开对冲单, 配合美元金额 SL/TP 严格风控, 是 MTT 跨品种套利核心产品。",
    "category": "EA",
    "fileUrl": "/downloads/products/GoldArbitrageXpert.mq5",
    "ex5Url": "/downloads/products/GoldArbitrageXpert.ex5",
    "ex4Url": null,
    "version": "1.0",
    "requiredPlan": "WEEKLY",
    "isFree": false,
    "tier": "Tier 1 (典藏级 VIP)",
    "score": 19,
    "positioning": "XAUUSD 黄金对冲套利王 - 跨品种对冲 + 美元金额风控 (DollarTP/DollarSL)",
    "productHighlights": "专为黄金设计的对冲套利策略, 监控多品种价差, 触发阈值后开对冲单, 配合美元金额 SL/TP 严格风控, 是 MTT 跨品种套利核心产品。",
    "algorithmicCore": "跨品种价差监控 + 网格对冲开仓 (Grid×42) + 美元盈亏风控 + UI 参数实时调整。",
    "practicalApplication": "推荐 3000 USD 起步账户, 适用 XAUUSD 主对, 支持多账号同时跑。",
    "riskControl": "✅ DollarTP 美元止盈 (L130): pnl ≥ DollarTP 自动全平\n✅ DollarSL 美元止损 (L135-136): pnl ≤ DollarSL 自动全平\n✅ UI 实时调整 (L433-434): 边跑边调 SL/TP 数值",
    "subcategory": "对冲套利",
    "capabilityTags": "[\"黄金\", \"对冲\", \"套利\", \"跨品种\", \"XAUUSD\", \"美元风控\", \"王牌\"]",
    "isActive": true,
    "isFeatured": true
  },
  {
    "name": "XAU_USD_Scalper_M1",
    "description": "专为黄金 M1 周期设计的剥头皮策略, 高频捕捉微小波动, 配合完整追踪止损, 适合短线高频交易者。",
    "category": "EA",
    "fileUrl": "/downloads/products/XAU_USD_Scalper_M1.mq5",
    "ex5Url": null,
    "ex4Url": "/downloads/products/XAU_USD_Scalper_M1.ex4",
    "version": "1.0",
    "requiredPlan": "WEEKLY",
    "isFree": false,
    "tier": "Tier 2 (专业级 Pro)",
    "score": 16,
    "positioning": "XAUUSD 黄金 M1 剥头皮王 - 13 处 trailing + 7 处 TrailingStop + 5 处 StopLoss",
    "productHighlights": "专为黄金 M1 周期设计的剥头皮策略, 高频捕捉微小波动, 配合完整追踪止损, 适合短线高频交易者。",
    "algorithmicCore": "M1 周期信号触发 + 实时 TrailingStop 追踪 + 多级 SL/TP 保护。",
    "practicalApplication": "推荐 500 USD 起步账户, 仅适用 XAUUSD M1, 需 VPS 低延迟。",
    "riskControl": "✅ trailing × 13 (最高频追踪止损)\n✅ TakeProfit × 8 (多级 TP)\n✅ sl= × 7 (7 处 SL 赋值)\n✅ TrailingStop × 7 (追踪止损函数)\n✅ StopLoss × 5 (硬止损)",
    "subcategory": "剥头皮",
    "capabilityTags": "[\"黄金\", \"剥头皮\", \"M1\", \"高频\", \"XAUUSD\", \"追踪止损\", \"王牌\"]",
    "isActive": true,
    "isFeatured": true
  },
  {
    "name": "Goldwarrior02b",
    "description": "经典黄金对冲战士 EA, 集成多空对冲 + 完整 SL/TP 体系, 适合追求稳健对冲的黄金交易者。",
    "category": "EA",
    "fileUrl": "/downloads/products/Goldwarrior02b.mq5",
    "ex5Url": null,
    "ex4Url": "/downloads/products/Goldwarrior02b.ex4",
    "version": "1.0",
    "requiredPlan": "WEEKLY",
    "isFree": false,
    "tier": "Tier 1 (典藏级 VIP)",
    "score": 17,
    "positioning": "XAUUSD 黄金对冲战士 - 21 处 Hedge 逻辑 + 15 处 TakeProfit + 14 处 StopLoss",
    "productHighlights": "经典黄金对冲战士 EA, 集成多空对冲 + 完整 SL/TP 体系, 适合追求稳健对冲的黄金交易者。",
    "algorithmicCore": "对冲开仓 + 21 处 Hedge 对冲逻辑 + 完整 SL/TP + TrailingStop 跟踪。",
    "practicalApplication": "推荐 2000 USD 起步账户, 适用 XAUUSD, 兼容多周期。",
    "riskControl": "✅ Hedge × 21 (对冲风控)\n✅ TakeProfit × 15\n✅ StopLoss × 14\n✅ TrailingStop × 1 + trailing × 1 (追踪止损)",
    "subcategory": "通用",
    "capabilityTags": "[\"黄金\", \"对冲\", \"Hedge\", \"XAUUSD\", \"稳健\", \"通用\", \"王牌\"]",
    "isActive": true,
    "isFeatured": true
  }
];

async function main() {
  console.log(`Seeding 5 ace products (isFeatured=true)...`);
  for (const p of products) {
    // Product.name 不是 unique, 用 findFirst + update OR create
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    let result;
    if (existing) {
      result = await prisma.product.update({
        where: { id: existing.id },
        data: {
          isFeatured: true,
          isActive: true,
          tier: p.tier,
          score: p.score,
          positioning: p.positioning,
          productHighlights: p.productHighlights,
          algorithmicCore: p.algorithmicCore,
          practicalApplication: p.practicalApplication,
          riskControl: p.riskControl,
          subcategory: p.subcategory,
          capabilityTags: p.capabilityTags,
          description: p.description,
          ex5Url: p.ex5Url,
          ex4Url: p.ex4Url,
        },
      });
      console.log(`  ✅ ${p.name} (updated, isFeatured=${result.isFeatured})`);
    } else {
      result = await prisma.product.create({ data: p });
      console.log(`  ✅ ${p.name} (created, isFeatured=${result.isFeatured})`);
    }
  }
  console.log(`\nDone. ${products.length} 5 王牌 seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
