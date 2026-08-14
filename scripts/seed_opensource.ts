// /scripts/seed_opensource.ts
// Dev seed: 6 教程 (投研) + 12 release (开源合规再分发)
// 运行: npx tsx scripts/seed_opensource.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

// 简化的 License / MembershipPlan 字面量 (避免 Prisma 7 enum import 失败)
const L = {
  GPL_2: 'GPL_2', GPL_3: 'GPL_3', APACHE_2_0: 'APACHE_2_0', MIT: 'MIT',
  BSD_3: 'BSD_3', UNLICENSE: 'UNLICENSE', LGPL: 'LGPL', MPL_2_0: 'MPL_2_0',
  PROPRIETARY: 'PROPRIETARY',
} as const;
const P = {
  WEEKLY: 'WEEKLY', MONTHLY: 'MONTHLY', YEARLY: 'YEARLY', LIFETIME: 'LIFETIME',
} as const;

// 6 个投研教程
const TUTORIALS = [
  { id: 'tut-mtt-aurora-trend', releaseId: 'rel-mtt-aurora', slug: 'mtt-aurora-trend-guide', marketRegime: '趋势', symbols: 'EURUSD,USDJPY', timeframe: 'H4', riskLevel: '中', strategyLogic: 'MTT-Pro Aurora 多周期共振趋势跟踪实战 (D1/H4/H1 三周期均线共振 + ATR 动态止盈)' },
  { id: 'tut-mtt-cobra-ema', releaseId: 'rel-mtt-cobra', slug: 'mtt-cobra-ema-strategy', marketRegime: '趋势', symbols: 'EURUSD', timeframe: 'H4', riskLevel: '中低', strategyLogic: 'MTT-Trend Cobra 三线 EMA 金叉死叉策略 (20/50/200) 配合 ADX 过滤震荡' },
  { id: 'tut-mtt-honeycomb-grid', releaseId: 'rel-mtt-honeycomb', slug: 'mtt-honeycomb-grid', marketRegime: '震荡', symbols: 'EURUSD,GBPUSD', timeframe: 'M15', riskLevel: '中高', strategyLogic: 'MTT-Grid Honeycomb 等距网格马丁实战 (7 层封顶 + 趋势过滤防单边深套)' },
  { id: 'tut-mtt-falcon-scalp', releaseId: 'rel-mtt-falcon', slug: 'mtt-falcon-scalp', marketRegime: '高波动', symbols: 'EURUSD', timeframe: 'M1', riskLevel: '高', strategyLogic: 'MTT-Scalper Falcon 1M 剥头皮实战 (1M K 线 + 5 点止盈 + 3 点止损)' },
  { id: 'tut-mtt-signal-aggregator', releaseId: 'rel-mtt-signal-agg', slug: 'mtt-signal-aggregator', marketRegime: '通用', symbols: 'All', timeframe: 'H1', riskLevel: '低', strategyLogic: 'MTT-Signal Aggregator 多指标综合信号 (MA/MACD/RSI/BB/Stoch/ADX/CCI/WPR 8 合 1)' },
  { id: 'tut-mtt-trademgr', releaseId: 'rel-mtt-trademgr', slug: 'mtt-trademgr-lib', marketRegime: '通用', symbols: 'All', timeframe: '通用', riskLevel: '低', strategyLogic: 'MTT-Util TradeMgr 交易管理库 OOP 封装 (市价单/挂单/止损单统一接口)' },
];

// 12 个开源 release (4 OPEN + 4 MEMBER + 4 EXCLUSIVE 权限分层)
//   OPEN: isFree=true, 任何人都能下 (含游客) - 普及类工具
//   MEMBER: requiredPlan=WEEKLY, 注册会员可下 - 基础策略
//   EXCLUSIVE: requiredPlan=MONTHLY+, 必须订阅 - 高级策略/EA
const RELEASES = [
  // ===== 4 OPEN (isFree=true, 游客也能下) =====
  { id: 'rel-mtt-position',   sourceFileId: 'sf-009', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'github.com/cpro/pos',       title: 'MTT-Tool Position Calc 仓位计算器',    description: '基于余额/风险比/止损点数的下单手数',                tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 5421, viewCount: 9876, isFeatured: false, isFree: true },
  { id: 'rel-mtt-news',       sourceFileId: 'sf-010', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/news',     title: 'MTT-Tool News Filter 新闻过滤',        description: 'NFP/CPI/FOMC 数据前 N 分钟自动暂停',                tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 2543, viewCount: 4321, isFeatured: false, isFree: true },
  { id: 'rel-mtt-trademgr',   sourceFileId: 'sf-006', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'github.com/cpro/trademgr',  title: 'MTT-Util TradeMgr 交易管理库',         description: 'OOP 封装下单/改单/平仓/查询函数',                    tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 987, viewCount: 1432,  isFeatured: false, isFree: true },
  { id: 'rel-mtt-rskmgr',     sourceFileId: 'sf-011', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'github.com/cpro/risk',      title: 'MTT-Util RiskMgr 风控库',              description: '封装仓位/回撤/日亏规则, 触发自动减仓',              tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 765, viewCount: 1230,  isFeatured: false, isFree: true },

  // ===== 4 MEMBER (注册会员可下, requiredPlan=WEEKLY) =====
  { id: 'rel-mtt-cobra',      sourceFileId: 'sf-002', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'github.com/cpro/cobra',     title: 'MTT-Trend Cobra EMA 三线 EA',            description: '20/50/200 EMA 金叉死叉 + ADX 过滤',                tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 4521, viewCount: 8912, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-honeycomb',  sourceFileId: 'sf-003', license: L.GPL_3,         originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/honeycomb', title: 'MTT-Grid Honeycomb 等距网格',          description: '7 层封顶, 跌 30 点加仓 1.5 倍, 配趋势过滤',         tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 3954, viewCount: 6231, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-falcon',     sourceFileId: 'sf-004', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/falcon',   title: 'MTT-Scalper Falcon 1M 剥头皮',          description: 'ECN 账户 5 点止盈 + 3 点止损',                       tier: 'Tier 3 (Basic)',     requiredPlan: P.WEEKLY,   downloadCount: 1523, viewCount: 2891, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-viper',      sourceFileId: 'sf-008', license: L.GPL_3,         originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/viper',    title: 'MTT-Trend Viper 海龟通道',             description: '20 日突破入场 + 10 日反向止损 + 2N 止盈',         tier: 'Tier 2 (Pro)',       requiredPlan: P.WEEKLY,   downloadCount: 2876, viewCount: 4521, isFeatured: true,  isFree: false },

  // ===== 4 EXCLUSIVE (必须订阅, requiredPlan=MONTHLY+) =====
  { id: 'rel-mtt-aurora',     sourceFileId: 'sf-001', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/aurora',  title: 'MTT-Pro Aurora 趋势跟踪 EA',           description: '多周期均线共振, 适配 EURUSD/USDJPY 趋势段',     tier: 'Tier 1 (Premium/VIP)', requiredPlan: P.MONTHLY,  downloadCount: 1847, viewCount: 3210, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-signal-agg', sourceFileId: 'sf-005', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/agg',      title: 'MTT-Signal Aggregator 多指标',          description: 'MA/MACD/RSI/BB/Stoch/ADX/CCI/WPR 8 合 1',            tier: 'Tier 1 (Premium/VIP)', requiredPlan: P.YEARLY,   downloadCount: 3765, viewCount: 5430, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-orion',      sourceFileId: 'sf-007', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/orion',    title: 'MTT-Pro Orion 突破 EA',                 description: '伦敦-纽约双时段突破, 4-12 小时持仓',               tier: 'Tier 1 (Premium/VIP)', requiredPlan: P.LIFETIME, downloadCount: 1932, viewCount: 3654, isFeatured: true,  isFree: false },
  { id: 'rel-mtt-cot',        sourceFileId: 'sf-012', license: L.MIT,           originalAuthor: 'CProTrading 投研',     originalSource: 'mql5.com/en/code/cot',      title: 'MTT-Signal COT 持仓差',                description: 'CFTC COT 持仓差, 跟随机构资金流向',                tier: 'Tier 1 (Premium/VIP)', requiredPlan: P.MONTHLY,  downloadCount: 643, viewCount: 982,   isFeatured: true,  isFree: false },
];

async function main() {
  console.log('Seeding OpenSource (6 tutorial + 12 release)');

  // 1) 清掉旧的 (id starts with 'tut-' / 'rel-mtt-')
  const t1 = await prisma.openSourceTutorial.deleteMany({ where: { id: { startsWith: 'tut-' } } });
  const t2 = await prisma.openSourceRelease.deleteMany({ where: { id: { startsWith: 'rel-mtt-' } } });
  console.log(`Deleted: ${t1.count} tutorial, ${t2.count} release`);

  // 2) Insert release (FK: tutorial → release)
  let okR = 0, failR = 0;
  for (const r of RELEASES) {
    try {
      await prisma.openSourceRelease.create({
        data: {
          ...r,
          fileUrl: `/files/${r.id}.zip`,
          publishedAt: new Date(),
        } as any,
      });
      okR++;
    } catch (e: any) {
      failR++;
      console.error(`  release ${r.id}: ${e.message}`);
    }
  }
  console.log(`release: ok ${okR}, fail ${failR}`);

  // 3) Insert tutorial
  let okT = 0, failT = 0;
  for (const t of TUTORIALS) {
    try {
      await prisma.openSourceTutorial.create({
        data: {
          ...t,
          maxDrawdownPct: 15.0,
          riskWarnings: '历史回测不代表未来表现, 投资有风险, 决策需谨慎',
          keyParameters: JSON.stringify([
            { name: 'lot', value: 0.01, note: '标准手数' },
            { name: 'maxSlippage', value: 3, note: '最大滑点' },
          ]),
          content: `# ${t.strategyLogic}\n\n本教程详细讲解 ${t.slug} 策略逻辑, 风险参数, 实盘注意事项。\n\n## 适用场景\n- ${t.marketRegime} 市\n- ${t.symbols} 品种\n- ${t.timeframe} 周期\n\n## 风险等级\n${t.riskLevel}\n\n## 关键参数\n- 标准手数: 0.01 起\n- 最大回撤: 15%\n- 风险预警: 严格止损\n\n> 历史回测不代表未来表现, 投资有风险, 决策需谨慎`,
          author: 'CProTrading 投研团队',
          status: 'PUBLISHED',
          publishedAt: new Date(),
        } as any,
      });
      okT++;
    } catch (e: any) {
      failT++;
      console.error(`  tutorial ${t.id}: ${e.message}`);
    }
  }
  console.log(`tutorial: ok ${okT}, fail ${failT}`);

  const total = await prisma.openSourceTutorial.count();
  const totalR = await prisma.openSourceRelease.count();
  console.log(`Final: ${total} tutorial, ${totalR} release`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
