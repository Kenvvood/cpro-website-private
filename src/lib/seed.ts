import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// 14个MQL5模块积木系统 - Phase 2 模块定义
const modules = [
  {
    name: "CProviderTracker",
    displayName: "Provider跟单追踪",
    description: "Provider跟单核心，追踪信号提供者的持仓和交易行为，支持多种同步模式",
    category: "copytrade",
    fileUrl: "/modules/implementations/CProviderTracker.mqh",
    icon: "GitFork",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "providerId", displayName: "Provider ID", type: "string", default: "", description: "信号提供者ID" },
      { name: "trackingMode", displayName: "追踪模式", type: "select", default: "mirror", options: ["mirror", "fixed", "proportional"], description: "跟单模式" },
      { name: "syncInterval", displayName: "同步间隔(秒)", type: "int", default: "5", min: 1, max: 60, description: "持仓同步间隔" }
    ]),
    dependencies: JSON.stringify(["IModule", "IProviderTracker"])
  },
  {
    name: "CVolatilityFilter",
    displayName: "波动率过滤器",
    description: "基于ATR或标准差的波动率过滤器，过滤异常市场条件",
    category: "filter",
    fileUrl: "/modules/implementations/CVolatilityFilter.mqh",
    icon: "Activity",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "filterType", displayName: "过滤类型", type: "select", default: "ATR", options: ["ATR", "StdDev", "Bollinger"], description: "波动率计算方式" },
      { name: "atrPeriod", displayName: "ATR周期", type: "int", default: "14", min: 1, max: 100, description: "ATR计算周期" },
      { name: "threshold", displayName: "阈值", type: "float", default: "1.5", min: 0.1, max: 10, step: 0.1, description: "波动率阈值倍数" },
      { name: "minVolatility", displayName: "最小波动率", type: "float", default: "0.5", min: 0, max: 5, step: 0.1, description: "允许的最小波动率" }
    ]),
    dependencies: JSON.stringify(["IModule", "IVolatilityFilter"])
  },
  {
    name: "CScalpingModule",
    displayName: "头皮信号模块",
    description: "基于快速价格变动的头皮交易信号，支持多指标共振确认",
    category: "signal",
    fileUrl: "/modules/implementations/CScalpingModule.mqh",
    icon: "Zap",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "atrPeriod", displayName: "ATR周期", type: "int", default: "14", min: 1, max: 100, description: "ATR计算周期" },
      { name: "atrMultiplier", displayName: "ATR倍数", type: "float", default: "0.5", min: 0.1, max: 5, step: 0.1, description: "入场信号ATR倍数" },
      { name: "filterMode", displayName: "过滤模式", type: "select", default: "ATR", options: ["ATR", "StdDev", "Bollinger", "None"], description: "信号过滤方式" },
      { name: "signalStrength", displayName: "信号强度", type: "int", default: "70", min: 0, max: 100, description: "信号强度阈值%" }
    ]),
    dependencies: JSON.stringify(["IModule", "ISignalModule"])
  },
  {
    name: "CExecutionModule",
    displayName: "执行模块",
    description: "封装CTrade订单执行，支持滑点控制、重试机制、多种执行模式",
    category: "execution",
    fileUrl: "/modules/implementations/CExecutionModule.mqh",
    icon: "Rocket",
    isRunnable: true,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "executionMode", displayName: "执行模式", type: "select", default: "instant", options: ["instant", "market", "limit"], description: "订单执行模式" },
      { name: "slippage", displayName: "允许滑点", type: "int", default: "3", min: 0, max: 50, description: "允许滑点点数" },
      { name: "retryCount", displayName: "重试次数", type: "int", default: "3", min: 0, max: 10, description: "下单失败重试次数" }
    ]),
    dependencies: JSON.stringify(["IModule", "IExecutionModule"])
  },
  {
    name: "CBreakevenModule",
    displayName: "保本模块",
    description: "自动将止损移至入场价（保本），锁定利润并提供额外保护",
    category: "breakeven",
    fileUrl: "/modules/implementations/CBreakevenModule.mqh",
    icon: "Shield",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "triggerDistance", displayName: "触发距离(点)", type: "int", default: "30", min: 0, max: 1000, description: "浮盈多少点后触发保本" },
      { name: "lockProfit", displayName: "锁定利润(点)", type: "int", default: "5", min: 0, max: 100, description: "保本时锁定的利润点数" }
    ]),
    dependencies: JSON.stringify(["IModule", "IBreakevenModule"])
  },
  {
    name: "CTrailingModule",
    displayName: "追踪止损模块",
    description: "9种追踪止损模式，动态调整止损位置，支持追踪止盈",
    category: "trailing",
    fileUrl: "/modules/implementations/CTrailingModule.mqh",
    icon: "TrendingUp",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "mode", displayName: "模式", type: "select", default: "atr", options: ["atr", "fixed", "percent", "step", "stepwise", "chandelier", "volatility", "time", "custom"], description: "追踪止损模式" },
      { name: "stepPoints", displayName: "步进点数", type: "int", default: "10", min: 1, max: 500, description: "步进追踪的点数" },
      { name: "activationDistance", displayName: "激活距离(点)", type: "int", default: "50", min: 0, max: 5000, description: "浮盈达到多少点后激活追踪" }
    ]),
    dependencies: JSON.stringify(["IModule", "ITrailingModule"])
  },
  {
    name: "CMultiPositionManager",
    displayName: "多仓位管理",
    description: "支持网格、马丁格尔等策略的多仓位管理系统",
    category: "multi",
    fileUrl: "/modules/implementations/CMultiPositionManager.mqh",
    icon: "Layers",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "mode", displayName: "模式", type: "select", default: "grid", options: ["grid", "martingale", "reverse", "custom"], description: "多仓位策略模式" },
      { name: "gridSize", displayName: "网格间距(点)", type: "int", default: "100", min: 1, max: 10000, description: "网格订单间距" },
      { name: "maxPositions", displayName: "最大仓位数", type: "int", default: "10", min: 1, max: 100, description: "最大同时持仓数" },
      { name: "martingaleFactor", displayName: "马丁系数", type: "float", default: "1.5", min: 1, max: 5, step: 0.1, description: "马丁格尔手数倍数" }
    ]),
    dependencies: JSON.stringify(["IModule", "IMultiPositionManager"])
  },
  {
    name: "CEquityGuard",
    displayName: "净值保护",
    description: "账户级风险控制，监控净值、回撤和日亏损",
    category: "risk",
    fileUrl: "/modules/implementations/CEquityGuard.mqh",
    icon: "ShieldCheck",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "maxDrawdownPercent", displayName: "最大回撤%", type: "float", default: "20", min: 1, max: 100, step: 0.5, description: "账户最大回撤百分比" },
      { name: "dailyLossLimit", displayName: "日亏损限制%", type: "float", default: "5", min: 0.1, max: 50, step: 0.5, description: "单日最大亏损百分比" },
      { name: "equityFloor", displayName: "净值底线", type: "float", default: "1000", min: 0, description: "账户净值最低限制" }
    ]),
    dependencies: JSON.stringify(["IModule", "IEquityGuard"])
  },
  {
    name: "CModuleRegistry",
    displayName: "模块注册表",
    description: "模块依赖管理和版本控制，生命周期初始化",
    category: "registry",
    fileUrl: "/modules/implementations/CModuleRegistry.mqh",
    icon: "Package",
    isRunnable: true,
    requiresMT5: false,
    parameters: JSON.stringify([
      { name: "autoInit", displayName: "自动初始化", type: "boolean", default: "true", description: "启动时自动初始化所有模块" },
      { name: "dependencyCheck", displayName: "依赖检查", type: "boolean", default: "true", description: "启用模块依赖检查" }
    ]),
    dependencies: JSON.stringify(["IModule", "IModuleRegistry"])
  },
  {
    name: "CCopyTradeSignal",
    displayName: "跟单信号接收",
    description: "接收并解析喊单信号，支持多种信号格式和货币对映射",
    category: "copytrade",
    fileUrl: "/modules/implementations/CCopyTradeSignal.mqh",
    icon: "Radio",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "signalFormat", displayName: "信号格式", type: "select", default: "json", options: ["json", "xml", "custom"], description: "信号数据格式" },
      { name: "symbolMapping", displayName: "品种映射", type: "string", default: "{}", description: "信号品种到本地品种的映射JSON" }
    ]),
    dependencies: JSON.stringify(["IModule", "ICopyTradeSignal"])
  },
  {
    name: "CCopyTradeLotManual",
    displayName: "独立手数跟单",
    description: "基于固定或比例手数的跟单方式，信号与仓位解耦",
    category: "copytrade",
    fileUrl: "/modules/implementations/CCopyTradeLotManual.mqh",
    icon: "Sliders",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "fixedLot", displayName: "固定手数", type: "float", default: "0.1", min: 0.01, max: 100, step: 0.01, description: "跟单固定手数" },
      { name: "lotMultiplier", displayName: "手数倍数", type: "float", default: "1.0", min: 0.1, max: 10, step: 0.1, description: "相对于信号源的手数倍数" }
    ]),
    dependencies: JSON.stringify(["IModule", "ICopyTradeLotManual"])
  },
  {
    name: "CCopyTradeExecutor",
    displayName: "跟单执行引擎",
    description: "跟单执行核心，支持正反向跟单、信号关闭等功能",
    category: "copytrade",
    fileUrl: "/modules/implementations/CCopyTradeExecutor.mqh",
    icon: "Play",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "reverseMode", displayName: "反向模式", type: "boolean", default: "false", description: "是否反向跟单" },
      { name: "closeOnSignal", displayName: "信号平仓", type: "boolean", default: "true", description: "信号消失时是否平仓" }
    ]),
    dependencies: JSON.stringify(["IModule", "ICopyTradeExecutor"])
  },
  {
    name: "CPlatformAdapter",
    displayName: "多平台适配器",
    description: "统一接口适配不同经纪商平台，事件回调机制",
    category: "copytrade",
    fileUrl: "/modules/implementations/CPlatformAdapter.mqh",
    icon: "Globe",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "syncPositions", displayName: "同步持仓", type: "boolean", default: "true", description: "启动时同步现有持仓" },
      { name: "eventCallback", displayName: "事件回调", type: "boolean", default: "true", description: "启用交易事件回调" }
    ]),
    dependencies: JSON.stringify(["IModule", "IPlatformAdapter"])
  },
  {
    name: "CCopyTradeGuard",
    displayName: "跟单风控",
    description: "跟单专用风控，限制总仓位、最大开仓数、过滤不良信号",
    category: "risk",
    fileUrl: "/modules/implementations/CCopyTradeGuard.mqh",
    icon: "Lock",
    isRunnable: false,
    requiresMT5: true,
    parameters: JSON.stringify([
      { name: "maxLot", displayName: "最大单量", type: "float", default: "1.0", min: 0.01, max: 100, step: 0.01, description: "单笔最大交易量" },
      { name: "maxPositions", displayName: "最大持仓", type: "int", default: "5", min: 1, max: 50, description: "最大同时持仓数" },
      { name: "providerFilter", displayName: "过滤Provider", type: "boolean", default: "true", description: "启用不良Provider过滤" }
    ]),
    dependencies: JSON.stringify(["IModule", "ICopyTradeGuard"])
  }
];

async function main() {
  console.log("开始种子数据...");

  // Create demo user
  const demoPassword = await hash("demo123", 12);
  const demoUser = await prisma.user.upsert({
    where: { phone: "138****8888" },
    update: {},
    create: {
      username: "demo",
      phone: "138****8888",
      passwordHash: demoPassword,
    },
  });
  console.log("演示用户:", demoUser.username);

  // Create products
  const products = [
    {
      name: "趋势追踪EA",
      description: "基于趋势跟随策略的智能交易EA，支持多货币对，自动止损止盈",
      category: "ea",
      fileUrl: "/downloads/趋势追踪EA_v1.2.zip",
      version: "v1.2",
      downloadCount: 156,
    },
    {
      name: "多空信号指标",
      description: "多空趋势一目了然，实时信号提示，MT4/MT5通用",
      category: "INDICATOR",
      fileUrl: "/downloads/多空信号指标_v2.0.zip",
      version: "v2.0",
      downloadCount: 132,
    },
    {
      name: "网格马丁EA",
      description: "智能网格加仓策略，抗震荡能力强，适合稳健型投资者",
      category: "ea",
      fileUrl: "/downloads/网格马丁EA_v1.5.zip",
      version: "v1.5",
      downloadCount: 98,
    },
    {
      name: "RSI超买超卖指标",
      description: "经典RSI指标优化版，多周期显示，信号精准",
      category: "INDICATOR",
      fileUrl: "/downloads/RSI超买超卖指标_v1.0.zip",
      version: "v1.0",
      downloadCount: 87,
    },
    {
      name: "批量平仓脚本",
      description: "一键平仓所有订单，支持按盈亏、类型筛选",
      category: "SCRIPT",
      fileUrl: "/downloads/批量平仓脚本_v1.1.zip",
      version: "v1.1",
      downloadCount: 76,
    },
    {
      name: "新闻事件EA",
      description: "自动识别重大新闻事件，智能止损避免滑点",
      category: "ea",
      fileUrl: "/downloads/新闻事件EA_v1.0.zip",
      version: "v1.0",
      downloadCount: 45,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          category: product.category as any,
        },
      });
      console.log("创建产品:", product.name);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: { downloadCount: product.downloadCount },
      });
    }
  }
  console.log(`产品数据已同步`);

  // 种子MQL5模块数据
  console.log("\n开始模块数据...");
  for (const mod of modules) {
    const existing = await prisma.module.findFirst({
      where: { name: mod.name },
    });
    if (!existing) {
      await prisma.module.create({ data: mod });
      console.log("创建模块:", mod.displayName);
    } else {
      await prisma.module.update({
        where: { id: existing.id },
        data: { description: mod.description, parameters: mod.parameters },
      });
    }
  }
  console.log(`模块数据已同步，共${modules.length}个模块`);

  console.log("种子数据完成!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
