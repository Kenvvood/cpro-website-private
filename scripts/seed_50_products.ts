// /scripts/seed_50_products.ts
// Dev seed: 50 款 demo EA 商品 (首批 50 款 · 虚位以待)
// 运行: npx tsx scripts/seed_50_products.ts
import { PrismaClient, ProductCategory, MembershipPlan } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

interface Seed {
  id: string;
  name: string;
  positioning: string;
  description: string;
  tier: 'Tier 1 (Premium/VIP)' | 'Tier 2 (Pro)' | 'Tier 3 (Basic)';
  category: ProductCategory;
  requiredPlan: MembershipPlan;
  downloadCount: number;
  score: number; // 0-20
  capabilityTags: string[];
  fileUrl: string;
  isFree: boolean;
}

const SEEDS: Seed[] = [
  // ===== MTT-Pro 系列 (8 款, Tier 1, EA) =====
  { id: 'mtt-pro-aurora',      name: 'MTT-Pro Aurora v3.2',     positioning: '多周期共振趋势跟踪',  description: 'Aurora 系列旗舰款, 融合 D1/H4/H1 三周期均线共振, 配合 ATR 动态止盈, 在 EURUSD/USDJPY 趋势段表现稳定。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 2847, score: 18, capabilityTags: ['Strategy: Trend', 'Pair: Major', 'TF: D1-H1', 'Risk: Medium'],
    fileUrl: '/files/mtt-pro-aurora.zip', isFree: false },
  { id: 'mtt-pro-orion',       name: 'MTT-Pro Orion v2.7',      positioning: '伦敦-纽约双时段突破',  description: 'Orion 专注欧美两大流动性高峰, 突破前 1 小时高低点入场, 持仓 4-12 小时, 年化回撤比 1:1.8。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1932, score: 17, capabilityTags: ['Strategy: Breakout', 'Pair: Major', 'TF: M15', 'Risk: Medium'],
    fileUrl: '/files/mtt-pro-orion.zip', isFree: false },
  { id: 'mtt-pro-vega',        name: 'MTT-Pro Vega v1.5',       positioning: '波动率均值回归',        description: 'Vega 基于布林带 + RSI 双重过滤的均值回归, 适配黄金/XAUUSD 高波动品种, 适合震荡市。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1654, score: 16, capabilityTags: ['Strategy: MeanRev', 'Pair: XAUUSD', 'TF: H1', 'Risk: High'],
    fileUrl: '/files/mtt-pro-vega.zip', isFree: false },
  { id: 'mtt-pro-sirius',      name: 'MTT-Pro Sirius v4.1',     positioning: '机构订单流跟随',        description: 'Sirius 通过成交量异常 + COT 持仓差识别机构订单流, 跟随主力方向持仓, 中长线 (3-7 天) 策略。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1428, score: 17, capabilityTags: ['Strategy: OrderFlow', 'Pair: Index', 'TF: H4', 'Risk: Low'],
    fileUrl: '/files/mtt-pro-sirius.zip', isFree: false },
  { id: 'mtt-pro-lyra',        name: 'MTT-Pro Lyra v2.3',       positioning: '枢轴点日内反转',        description: 'Lyra 以日线枢轴点 (P/R1/R2/S1/S2) 为核心, 抓 09:00-15:00 GMT 时段反转, 平均持仓 2-4 小时。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1156, score: 15, capabilityTags: ['Strategy: Pivot', 'Pair: Major', 'TF: M30', 'Risk: Medium'],
    fileUrl: '/files/mtt-pro-lyra.zip', isFree: false },
  { id: 'mtt-pro-andromeda',   name: 'MTT-Pro Andromeda v3.0',  positioning: '跨品种对冲套利',        description: 'Andromeda 专注 EURUSD/GBPUSD 高度相关对, 通过价差回归套利, 持仓 1-3 天, 最大回撤 3.2%。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 982, score: 15, capabilityTags: ['Strategy: Arbitrage', 'Pair: Cross', 'TF: H4', 'Risk: Low'],
    fileUrl: '/files/mtt-pro-andromeda.zip', isFree: false },
  { id: 'mtt-pro-cassiopeia',  name: 'MTT-Pro Cassiopeia v1.8', positioning: '新闻事件驱动',         description: 'Cassiopeia 在 NFP/CPI/FOMC 三大数据前 30 分钟暂停, 数据后 5 分钟顺势入场, 单笔快进快出。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 743, score: 14, capabilityTags: ['Strategy: News', 'Pair: Major', 'TF: M5', 'Risk: High'],
    fileUrl: '/files/mtt-pro-cassiopeia.zip', isFree: false },
  { id: 'mtt-pro-perseus',     name: 'MTT-Pro Perseus v2.4',    positioning: 'AI 神经网络趋势预测',   description: 'Perseus 集成 6 层 LSTM 神经网络, 训练样本 12 年 1 分钟数据, 预测 4 小时方向概率, 置信度 > 70% 入场。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.EA, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 612, score: 14, capabilityTags: ['Strategy: AI-ML', 'Pair: Major', 'TF: H4', 'Risk: Medium'],
    fileUrl: '/files/mtt-pro-perseus.zip', isFree: false },

  // ===== MTT-Trend 系列 (8 款, Tier 2, EA) =====
  { id: 'mtt-trend-cobra',     name: 'MTT-Trend Cobra v2.1',    positioning: 'EMA 三线趋势',          description: 'Cobra 用 20/50/200 EMA 金叉死叉判断趋势, 配合 ADX 过滤震荡, 经典稳定款, 适合新手。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 4521, score: 16, capabilityTags: ['Strategy: Trend', 'Pair: Major', 'TF: H4', 'Risk: Low'],
    fileUrl: '/files/mtt-trend-cobra.zip', isFree: false },
  { id: 'mtt-trend-mamba',     name: 'MTT-Trend Mamba v1.9',    positioning: 'MACD 柱状背离',         description: 'Mamba 捕捉 MACD 柱状图顶/底背离, 配合成交量确认, 抓中长线趋势反转, 持仓 5-10 天。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 3298, score: 15, capabilityTags: ['Strategy: Divergence', 'Pair: Major', 'TF: D1', 'Risk: Low'],
    fileUrl: '/files/mtt-trend-mamba.zip', isFree: false },
  { id: 'mtt-trend-viper',     name: 'MTT-Trend Viper v3.0',    positioning: '海龟通道突破',          description: 'Viper 复刻经典海龟交易法则, 20 日突破入场, 10 日反向止损, 2N 止盈, 适合趋势市。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 2876, score: 15, capabilityTags: ['Strategy: Breakout', 'Pair: Major', 'TF: D1', 'Risk: Medium'],
    fileUrl: '/files/mtt-trend-viper.zip', isFree: false },
  { id: 'mtt-trend-python',    name: 'MTT-Trend Python v1.4',   positioning: '一目均衡表云层',         description: 'Python 用一目均衡表云突破 + 基准线交叉 + 迟行带确认, 经典日式技术指标组合。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 2145, score: 14, capabilityTags: ['Strategy: Ichimoku', 'Pair: Major', 'TF: H4', 'Risk: Medium'],
    fileUrl: '/files/mtt-trend-python.zip', isFree: false },
  { id: 'mtt-trend-boa',       name: 'MTT-Trend Boa v2.6',      positioning: '抛物线 SAR 跟踪',       description: 'Boa 经典 SAR 抛物线跟踪策略, 配合 ATR 动态止损, 适合强趋势品种如黄金和原油。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1834, score: 13, capabilityTags: ['Strategy: Trend', 'Pair: XAUUSD', 'TF: H4', 'Risk: Medium'],
    fileUrl: '/files/mtt-trend-boa.zip', isFree: false },
  { id: 'mtt-trend-anaconda',  name: 'MTT-Trend Anaconda v1.7', positioning: 'DMI 趋向指标',          description: 'Anaconda 用 +DI/-DI 交叉 + ADX 强度过滤, 顺势而为, 适合中等周期持仓。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1567, score: 13, capabilityTags: ['Strategy: Trend', 'Pair: Major', 'TF: H1', 'Risk: Low'],
    fileUrl: '/files/mtt-trend-anaconda.zip', isFree: false },
  { id: 'mtt-trend-rattlesnake', name: 'MTT-Trend Rattlesnake v2.0', positioning: 'VWAP 机构均价回归', description: 'Rattlesnake 以 VWAP 为锚, 价格偏离 1.5σ 入场回归, 适合高流动性品种。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1289, score: 12, capabilityTags: ['Strategy: MeanRev', 'Pair: Index', 'TF: M30', 'Risk: Low'],
    fileUrl: '/files/mtt-trend-rattlesnake.zip', isFree: false },
  { id: 'mtt-trend-taipan',    name: 'MTT-Trend Taipan v1.2',   positioning: '超级趋势指标',          description: 'Taipan 复刻 SuperTrend 指标, ATR 通道突破, 极简参数 (周期/倍率), 适合多品种组合。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1043, score: 12, capabilityTags: ['Strategy: Trend', 'Pair: Multi', 'TF: H1', 'Risk: Low'],
    fileUrl: '/files/mtt-trend-taipan.zip', isFree: false },

  // ===== MTT-Grid 系列 (7 款, Tier 2, EA) =====
  { id: 'mtt-grid-honeycomb',  name: 'MTT-Grid Honeycomb v2.4', positioning: '等距网格马丁',          description: 'Honeycomb 经典等距网格, 每跌 30 点加仓 1.5 倍, 7 层封顶, 配合趋势过滤器防单边深套。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 3954, score: 14, capabilityTags: ['Strategy: Grid', 'Pair: Major', 'TF: M15', 'Risk: High'],
    fileUrl: '/files/mtt-grid-honeycomb.zip', isFree: false },
  { id: 'mtt-grid-coral',      name: 'MTT-Grid Coral v1.8',     positioning: '斐波那契网格',          description: 'Coral 用斐波那契数列 (1/1/2/3/5/8) 布网, 加仓间距递增, 抗回撤能力比等距网格强 30%。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 2467, score: 13, capabilityTags: ['Strategy: Grid', 'Pair: Major', 'TF: M30', 'Risk: High'],
    fileUrl: '/files/mtt-grid-coral.zip', isFree: false },
  { id: 'mtt-grid-lattice',    name: 'MTT-Grid Lattice v3.1',   positioning: '动态 ATR 网格',         description: 'Lattice 用 ATR 动态计算网格间距, 适应高波动/低波动自动调整, 比固定网格更稳。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1876, score: 13, capabilityTags: ['Strategy: Grid', 'Pair: XAUUSD', 'TF: M15', 'Risk: High'],
    fileUrl: '/files/mtt-grid-lattice.zip', isFree: false },
  { id: 'mtt-grid-mesh',       name: 'MTT-Grid Mesh v2.0',      positioning: '对冲双向网格',          description: 'Mesh 同时挂买单和卖单, 中间价震荡盈利, 适合窄幅震荡品种如 EURCHF。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1432, score: 12, capabilityTags: ['Strategy: Grid', 'Pair: Cross', 'TF: M15', 'Risk: Medium'],
    fileUrl: '/files/mtt-grid-mesh.zip', isFree: false },
  { id: 'mtt-grid-lattice-pro',name: 'MTT-Grid Lattice Pro v1.3', positioning: '网格 + 趋势过滤',     description: 'Lattice Pro 在动态网格基础上叠加 H1 趋势判断, 单边市自动减仓防深套。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1154, score: 12, capabilityTags: ['Strategy: Grid', 'Pair: Major', 'TF: M30', 'Risk: High'],
    fileUrl: '/files/mtt-grid-lattice-pro.zip', isFree: false },
  { id: 'mtt-grid-pyramid',    name: 'MTT-Grid Pyramid v2.7',   positioning: '金字塔加仓',           description: 'Pyramid 金字塔式加仓, 每涨 50 点加 1 单, 顺势加仓锁利润, 适合 V 形反转。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 928, score: 11, capabilityTags: ['Strategy: Pyramid', 'Pair: Major', 'TF: H1', 'Risk: Medium'],
    fileUrl: '/files/mtt-grid-pyramid.zip', isFree: false },
  { id: 'mtt-grid-martingale-lite', name: 'MTT-Grid Martingale Lite v1.0', positioning: '轻量马丁',       description: 'Martingale Lite 简化版马丁, 只加 3 层 (1/1.5/2.25), 适合小资金账户, 月化 5-8%。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 673, score: 10, capabilityTags: ['Strategy: Martingale', 'Pair: Major', 'TF: M30', 'Risk: High'],
    fileUrl: '/files/mtt-grid-martingale-lite.zip', isFree: false },

  // ===== MTT-Scalper 系列 (6 款, Tier 3, EA) =====
  { id: 'mtt-scalp-falcon',    name: 'MTT-Scalper Falcon v1.6', positioning: '1 分钟剥头皮',         description: 'Falcon 高频剥头皮, 1M K 线 + 5 点止盈 + 3 点止损, 适合低点差 ECN 账户。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1523, score: 12, capabilityTags: ['Strategy: Scalp', 'Pair: Major', 'TF: M1', 'Risk: High'],
    fileUrl: '/files/mtt-scalp-falcon.zip', isFree: false },
  { id: 'mtt-scalp-hawk',      name: 'MTT-Scalper Hawk v2.2',   positioning: '5 分钟伦敦剥头皮',     description: 'Hawk 专攻伦敦早盘 07-09 GMT, 5M K 线 + 点差过滤, 平均每笔 8-12 点。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1145, score: 11, capabilityTags: ['Strategy: Scalp', 'Pair: Major', 'TF: M5', 'Risk: High'],
    fileUrl: '/files/mtt-scalp-hawk.zip', isFree: false },
  { id: 'mtt-scalp-eagle',     name: 'MTT-Scalper Eagle v1.4',  positioning: '纽约快进快出',         description: 'Eagle 纽约时段 13-16 GMT 双向剥头皮, 配合订单流, 日均 5-10 笔。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 876, score: 10, capabilityTags: ['Strategy: Scalp', 'Pair: Major', 'TF: M5', 'Risk: High'],
    fileUrl: '/files/mtt-scalp-eagle.zip', isFree: false },
  { id: 'mtt-scalp-merlin',    name: 'MTT-Scalper Merlin v1.1', positioning: '智能点差过滤',         description: 'Merlin 智能识别点差扩大时段, 主动暂停避免滑点, 适合 VPS 部署。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 654, score: 10, capabilityTags: ['Strategy: Scalp', 'Pair: Major', 'TF: M5', 'Risk: Medium'],
    fileUrl: '/files/mtt-scalp-merlin.zip', isFree: false },
  { id: 'mtt-scalp-osprey',    name: 'MTT-Scalper Osprey v1.3', positioning: '黄金剥头皮',           description: 'Osprey 专为 XAUUSD 黄金设计, 5M K 线 + ATR 动态止盈, 抗点差能力比主流剥头皮强。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 489, score: 9, capabilityTags: ['Strategy: Scalp', 'Pair: XAUUSD', 'TF: M5', 'Risk: High'],
    fileUrl: '/files/mtt-scalp-osprey.zip', isFree: false },
  { id: 'mtt-scalp-kestrel',   name: 'MTT-Scalper Kestrel v0.9', positioning: '新手入门剥头皮',      description: 'Kestrel 极简剥头皮, 固定 5 点止盈止损, 适合新手练手, 单笔风险 < 1%。',
    tier: 'Tier 3 (Basic)', category: ProductCategory.EA, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 312, score: 8, capabilityTags: ['Strategy: Scalp', 'Pair: Major', 'TF: M5', 'Risk: Low'],
    fileUrl: '/files/mtt-scalp-kestrel.zip', isFree: true },

  // ===== MTT-Tool 系列 (6 款, Tier 2, SCRIPT) =====
  { id: 'mtt-tool-position-calc', name: 'MTT-Tool Position Calc v1.0', positioning: '仓位计算器',     description: '一键计算基于账户余额/风险比例/止损点数的下单手数, 支持多品种预设。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 5421, score: 16, capabilityTags: ['Tool: Calc', 'Feature: PositionSize', 'Risk: None'],
    fileUrl: '/files/mtt-tool-position-calc.zip', isFree: true },
  { id: 'mtt-tool-trade-copier', name: 'MTT-Tool Trade Copier v2.3', positioning: '多账户跟单',         description: '主从账户跟单系统, 支持反向跟单/比例跟单/分组跟单, 延迟 < 50ms。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 3876, score: 15, capabilityTags: ['Tool: Copier', 'Feature: MultiAccount', 'Risk: None'],
    fileUrl: '/files/mtt-tool-trade-copier.zip', isFree: false },
  { id: 'mtt-tool-news-filter',  name: 'MTT-Tool News Filter v1.5', positioning: '新闻日历过滤',       description: '内置经济日历, 数据发布前 N 分钟自动暂停 EA, 支持 NFP/CPI/FOMC 等 8 类高影响事件。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 2543, score: 14, capabilityTags: ['Tool: Filter', 'Feature: News', 'Risk: None'],
    fileUrl: '/files/mtt-tool-news-filter.zip', isFree: true },
  { id: 'mtt-tool-chart-pattern', name: 'MTT-Tool Chart Pattern v1.2', positioning: '图表形态识别',   description: '自动识别双底/双底/头肩顶/三角整理等 12 种经典形态, 在图表上画线标注。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1987, score: 13, capabilityTags: ['Tool: Pattern', 'Feature: Auto', 'Risk: None'],
    fileUrl: '/files/mtt-tool-chart-pattern.zip', isFree: false },
  { id: 'mtt-tool-session-clock', name: 'MTT-Tool Session Clock v1.0', positioning: '交易时段时钟',   description: '图表上叠加伦敦/纽约/东京/悉尼四大交易时段, 实时显示当前活跃市场。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 1432, score: 12, capabilityTags: ['Tool: Clock', 'Feature: Session', 'Risk: None'],
    fileUrl: '/files/mtt-tool-session-clock.zip', isFree: true },
  { id: 'mtt-tool-pip-calc',    name: 'MTT-Tool Pip Calc v0.8',  positioning: '点数价值计算',         description: '实时显示当前品种 1 标准手每点价值, 换算成账户币种, 方便风控。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.SCRIPT, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 856, score: 11, capabilityTags: ['Tool: Calc', 'Feature: PipValue', 'Risk: None'],
    fileUrl: '/files/mtt-tool-pip-calc.zip', isFree: true },

  // ===== MTT-Signal 系列 (6 款, Tier 1, INDICATOR) =====
  { id: 'mtt-signal-aggregator', name: 'MTT-Signal Aggregator v2.0', positioning: '多指标综合信号',  description: '聚合 8 个经典指标 (MA/MACD/RSI/BB/Stoch/ADX/CCI/WPR) 信号, 红绿箭头统一标注买卖点。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 3765, score: 17, capabilityTags: ['Indicator: Multi', 'Feature: Signal', 'Pair: All'],
    fileUrl: '/files/mtt-signal-aggregator.zip', isFree: false },
  { id: 'mtt-signal-trend-strength', name: 'MTT-Signal Trend Strength v1.4', positioning: '趋势强度计', description: '0-100 数值化当前趋势强度, 类似 ADX 但更敏感, 配合颜色变化提示强度级别。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 2654, score: 16, capabilityTags: ['Indicator: Trend', 'Feature: Meter', 'Pair: All'],
    fileUrl: '/files/mtt-signal-trend-strength.zip', isFree: false },
  { id: 'mtt-signal-volume-profile', name: 'MTT-Signal Volume Profile v1.8', positioning: '成交量分布', description: '直方图显示历史成交量在价格区间的分布, 快速识别关键支撑阻力位 (POC/VAH/VAL)。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1876, score: 16, capabilityTags: ['Indicator: Volume', 'Feature: Profile', 'Pair: Major'],
    fileUrl: '/files/mtt-signal-volume-profile.zip', isFree: false },
  { id: 'mtt-signal-mtf-momentum', name: 'MTT-Signal MTF Momentum v1.2', positioning: '多周期动量',     description: '同时显示 5/15/30/60 分钟动量曲线, 红绿颜色标识当前处于哪个周期强势。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1432, score: 15, capabilityTags: ['Indicator: MTF', 'Feature: Momentum', 'Pair: All'],
    fileUrl: '/files/mtt-signal-mtf-momentum.zip', isFree: false },
  { id: 'mtt-signal-market-structure', name: 'MTT-Signal Market Structure v2.1', positioning: '市场结构', description: '自动标注 HH/HL/LH/LL 摆点, 画趋势线 + 通道, 一眼看懂当前结构。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 1098, score: 15, capabilityTags: ['Indicator: Structure', 'Feature: Auto', 'Pair: All'],
    fileUrl: '/files/mtt-signal-market-structure.zip', isFree: false },
  { id: 'mtt-signal-cot',        name: 'MTT-Signal COT v1.0',     positioning: 'COT 持仓差',            description: '可视化显示 CFTC 公布的 COT 持仓数据, 多空持仓差变化, 跟随机构资金流向。',
    tier: 'Tier 1 (Premium/VIP)', category: ProductCategory.INDICATOR, requiredPlan: MembershipPlan.MONTHLY, downloadCount: 643, score: 14, capabilityTags: ['Indicator: COT', 'Feature: Institutional', 'Pair: Index'],
    fileUrl: '/files/mtt-signal-cot.zip', isFree: false },

  // ===== MTT-Util 系列 (5 款, Tier 2, LIBRARY) =====
  { id: 'mtt-util-trade-mgr',   name: 'MTT-Util TradeMgr v1.6',  positioning: '交易管理库',           description: '统一封装下单/改单/平仓/查询函数, 支持市价单/挂单/止损单, 错误码标准化处理。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.LIBRARY, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 987, score: 14, capabilityTags: ['Lib: Trade', 'Feature: Wrapper', 'API: OOP'],
    fileUrl: '/files/mtt-util-trade-mgr.zip', isFree: true },
  { id: 'mtt-util-risk-mgr',    name: 'MTT-Util RiskMgr v1.3',   positioning: '风控管理库',           description: '封装仓位/回撤/日亏等风控规则, 触发后自动减仓或暂停, 保护账户安全。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.LIBRARY, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 765, score: 13, capabilityTags: ['Lib: Risk', 'Feature: AutoStop', 'API: OOP'],
    fileUrl: '/files/mtt-util-risk-mgr.zip', isFree: true },
  { id: 'mtt-util-indicators',  name: 'MTT-Util Indicators v2.0', positioning: '指标计算库',           description: '常用技术指标统一封装 (MA/EMA/RSI/MACD/BB/ATR), 避免每个 EA 重复实现。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.LIBRARY, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 654, score: 13, capabilityTags: ['Lib: Indicator', 'Feature: Common', 'API: OOP'],
    fileUrl: '/files/mtt-util-indicators.zip', isFree: true },
  { id: 'mtt-util-time',        name: 'MTT-Util Time v1.1',      positioning: '时间处理库',           description: 'GMT/EST/CST 时区转换, 交易时段判断, 节假日过滤, 各种时间格式化函数。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.LIBRARY, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 432, score: 12, capabilityTags: ['Lib: Time', 'Feature: TZ', 'API: OOP'],
    fileUrl: '/files/mtt-util-time.zip', isFree: true },
  { id: 'mtt-util-logger',      name: 'MTT-Util Logger v1.0',    positioning: '日志管理库',           description: '分级日志 (DEBUG/INFO/WARN/ERROR), 自动写入文件 + 控制台, 支持日志轮转。',
    tier: 'Tier 2 (Pro)', category: ProductCategory.LIBRARY, requiredPlan: MembershipPlan.WEEKLY, downloadCount: 321, score: 11, capabilityTags: ['Lib: Log', 'Feature: Level', 'API: OOP'],
    fileUrl: '/files/mtt-util-logger.zip', isFree: true },
];

async function main() {
  console.log('🌱 Seeding 50 款 MTT demo products...');
  console.log(`   Total SEEDS: ${SEEDS.length}`);

  // 1) 删旧 demo (id 以 mtt- 开头)
  const oldCount = await prisma.product.deleteMany({
    where: { id: { startsWith: 'mtt-' } },
  });
  console.log(`🗑  Deleted old mtt-* demo products: ${oldCount.count}`);

  // 2) 用 createMany 批量插入 (Prisma SQLite 支持 createMany)
  let ok = 0, fail = 0;
  for (const s of SEEDS) {
    try {
      await prisma.product.create({
        data: {
          id: s.id,
          name: s.name,
          positioning: s.positioning,
          description: s.description,
          tier: s.tier,
          category: s.category,
          requiredPlan: s.requiredPlan,
          downloadCount: s.downloadCount,
          score: s.score,
          capabilityTags: JSON.stringify(s.capabilityTags),
          fileUrl: s.fileUrl,
          isFree: s.isFree,
          isActive: true,
        },
      });
      ok++;
    } catch (e: any) {
      fail++;
      console.error(`  ❌ ${s.id}: ${e.message}`);
    }
  }
  console.log(`✅ Inserted ${ok}, failed ${fail}`);

  // 3) 统计
  const total = await prisma.product.count();
  const active = await prisma.product.count({ where: { isActive: true } });
  console.log(`📊 Total products: ${total}, active: ${active}`);

  const tierDist = await prisma.product.groupBy({
    by: ['tier'], _count: { tier: true }, where: { id: { startsWith: 'mtt-' } },
  });
  console.log('📈 MTT demo tier dist:');
  for (const r of tierDist) console.log(`   ${r.tier}: ${r._count.tier}`);

  const catDist = await prisma.product.groupBy({
    by: ['category'], _count: { category: true }, where: { id: { startsWith: 'mtt-' } },
  });
  console.log('📈 MTT demo category dist:');
  for (const r of catDist) console.log(`   ${r.category}: ${r._count.category}`);

  await prisma.$disconnect();
  console.log('🎉 Seed done!');
}

main().catch((e) => { console.error(e); process.exit(1); });
