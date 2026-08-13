// src/app/(marketing)/tools/[slug]/page.tsx
// v22.0 Phase 4.2: 工具详情页 (动态路由 + 6 工具分发)
// v22.0 Phase 7.24 Batch 10: 升级 calculator 容器视觉 + 显示 useCase 实战场景 + 相关工具推荐
// v22.0 Phase 7.24 BATCH 15 PATCH 13: 注册会员守卫
// v22.0 Phase 7.24 BATCH 15 PATCH 15: 改 "已登录即可" (PM 2026-08-13 产品策略)
//   - PM 2026-08-13 拍板: 工具"已登录即可"推动注册留资, 订阅是收费模式
//   - 4 个守卫位置策略:
//     1. 工具详情 (这里): 未登录跳 /login, 已登录即可用 + 顶部 UpgradeBanner 推动订阅
//     2. 工具列表 /tools: 完全公开 (品宣入口, 引导注册)
//     3. 产品详情 /products/[id]: 公开浏览, hasAccess 仅用于 StickyActionPanel CTA
//     4. 下载 API /api/downloads/[productId]: 保持订阅限制 (PM: "下载服务肯定是只限于订阅用户")
//   - PATCH 15 之前: 工具详情 hasActiveMembership(WEEKLY) → PaywallGate 阻止计算器渲染
//   - PATCH 15 之后: 工具详情 !!userId → UpgradeBanner 顶部小横幅 (不阻止工具)
//   - 删死代码: hasPaidSub 变量 + PaywallGate 函数 (97 行, 已没人调)
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TOOLS } from "../layout";
import { FibonacciCalculator } from "@/components/tools/FibonacciCalculator";
import { PivotPointCalculator } from "@/components/tools/PivotPointCalculator";
import { PositionSizeCalculator } from "@/components/tools/PositionSizeCalculator";
import { PipValueCalculator } from "@/components/tools/PipValueCalculator";
import { RiskRewardCalculator } from "@/components/tools/RiskRewardCalculator";
import { ForexCalculator } from "@/components/tools/ForexCalculator";

const CALCULATORS: Record<string, React.ComponentType> = {
  fibonacci: FibonacciCalculator,
  "pivot-point": PivotPointCalculator,
  "position-size": PositionSizeCalculator,
  "pip-value": PipValueCalculator,
  "risk-reward": RiskRewardCalculator,
  "forex-calculator": ForexCalculator,
};

// v22.0 BATCH 15 PATCH 13: 强制 server-render 每次, 才能查 session 验证会员
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return { title: "工具未找到 - CProTrading" };
  return {
    title: `${tool.name} - CProTrading 交易者工具箱`,
    description: `${tool.name}: ${tool.desc}`,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Calculator = CALCULATORS[slug];
  if (!Calculator) notFound();

  const tool = TOOLS.find((t) => t.slug === slug)!;
  const relatedTools = TOOLS.filter((t) => t.slug !== slug);

  // v22.0 BATCH 15 PATCH 15: PM 产品策略
  //   - 未登录 → 跳 /login (注册留资入口)
  //   - 已登录 → 正常显示工具, 顶部 UpgradeBanner 根据订阅状态显示
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    redirect(`/login?redirect=/tools/${slug}`);
  }

  // 查询用户订阅状态 (顶部 Banner 用)
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expireAt: { gt: new Date() },
    },
    orderBy: { expireAt: "desc" },
    select: { plan: true, expireAt: true },
  });

  return (
    <div className="space-y-6 pt-2 sm:pt-12 lg:pt-14 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
      {/* 工具头部: 行业细节 + 类目标签 (避免 AI 演示的居中对称) */}
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-text-muted border border-border px-2 py-0.5">
            {tool.category}
          </span>
          <span className="text-[10px] text-text-muted">
            客户端计算 · 数据不上传
          </span>
        </div>
        <h1 className="h1 mb-2">{tool.name}</h1>
        <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
      </header>

      {/* 订阅状态条 / 升级横幅 (PATCH 15 推动注册留资 + 订阅转化) */}
      <UpgradeBanner membership={membership} />

      {/* 工具计算器主体 (升级: section 标题 + bg-card 背景) */}
      <section className="border border-border bg-bg-card">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-text-muted">
            实战计算
          </div>
          <div className="text-xs text-text-muted">
            输入参数 · 实时输出
          </div>
        </div>
        <div className="p-5">
          <Calculator />
        </div>
      </section>

      {/* 实战场景案例 (Batch 10: useCase 字段) */}
      <section className="border border-border bg-bg-secondary p-5">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-2">
          实战场景
        </div>
        <h2 className="text-base font-semibold text-text-primary leading-snug mb-2">
          {tool.name}在 XAUUSD 实战中怎么用
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">{tool.useCase}</p>
      </section>

      {/* 相关工具: 1px 底边线横向 list (PM 排版铁律) */}
      <section className="border-y border-border">
        <div className="px-2 py-3 text-xs uppercase tracking-wider text-text-muted">
          你可能还需要
        </div>
        <div>
          {relatedTools.map((rt) => (
            <Link
              key={rt.slug}
              href={`/tools/${rt.slug}`}
              className="flex items-center justify-between gap-3 px-2 py-2.5 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors group"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-[10px] text-text-muted num w-8 shrink-0">
                  {String(TOOLS.findIndex((t) => t.slug === rt.slug) + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                  {rt.name}
                </span>
                <span className="text-[10px] text-text-muted hidden sm:inline shrink-0">
                  {rt.category}
                </span>
              </div>
              <span className="text-xs text-accent-blue group-hover:underline shrink-0">
                进入 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 工具使用提示: 不是"广告", 是"实战场景" */}
      <div className="text-xs text-text-muted border-t border-border pt-4 leading-relaxed">
        <strong className="text-text-secondary">使用注意:</strong>{" "}
        所有计算结果为参考, 实盘前请以 MT4/MT5 终端报价为准。计算逻辑基于行业标准公式, 不构成投资建议。
      </div>
    </div>
  );
}

// v22.0 BATCH 15 PATCH 15: UpgradeBanner 顶部小横幅
//  - 已登录有订阅: 绿色小条带 "✓ 订阅活跃" + 到期日 (让用户感知订阅价值)
//  - 已登录无订阅: 金色小横幅 "升级订阅解锁更多" + 立即开通 CTA (推动订阅转化, 不阻止工具)
//  - PM 2026-08-13 策略: 工具"已登录即可"推动注册留资, 订阅是收费模式
function UpgradeBanner({
  membership,
}: {
  membership: { plan: string; expireAt: Date } | null;
}) {
  // Case 1: 有活跃订阅 → 绿色确认条
  if (membership) {
    const planLabel =
      membership.plan === "WEEKLY"
        ? "周付"
        : membership.plan === "MONTHLY"
        ? "月付"
        : membership.plan === "ANNUAL"
        ? "年付"
        : membership.plan;
    const expireStr = new Date(membership.expireAt).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return (
      <div className="border border-green-500/30 bg-green-500/5 px-4 py-2.5 flex items-center gap-3 text-xs">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 text-green-500 shrink-0">
          <Check size={12} />
        </span>
        <span className="text-text-secondary">
          <span className="text-green-500 font-medium">{planLabel}订阅活跃</span>
          <span className="text-text-muted ml-2">到期 {expireStr}</span>
          <span className="text-text-muted ml-2 hidden sm:inline">
            · 已解锁全部工具 + EA 源码 + 投研教程
          </span>
        </span>
      </div>
    );
  }

  // Case 2: 已登录无订阅 → 金色升级横幅 (不阻止工具渲染)
  return (
    <div className="border border-accent-gold/40 bg-accent-gold/5 px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-gold/15 text-accent-gold shrink-0">
        <Sparkles size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary leading-snug">
          升级订阅, 解锁全部 6 款工具 + 严选 EA 源码 + 投研教程
        </div>
        <div className="text-xs text-text-muted mt-0.5">
          周付 ¥25 起 · 客户端计算 · 数据不上传
        </div>
      </div>
      <Link
        href="/membership"
        className="inline-flex items-center gap-1.5 px-4 py-2 btn-primary text-xs shrink-0"
      >
        立即开通
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
