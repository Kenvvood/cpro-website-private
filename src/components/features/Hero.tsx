import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Code2, Zap } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.6: 借 TradingView 中文站 hero 巨型布局
// - 左: 大字标题 + 副标 + 双 CTA + 4 个钩子小图标
// - 右: MT5 终端截图占位 + 浮卡 (XAUUSD 实时模拟回测)
// - 整段: 渐变背景 (径向蓝光 + 金色辉光 + 底色)
// - 删 stale "查看 19,328 个 EA" (v1.5 编译产物 sed 改过, 源码未改)
export function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 左: 文案 + CTA */}
          <div className="flex flex-col">
            {/* 状态徽章 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-semibold border border-border rounded-sm bg-bg-secondary/80 backdrop-blur-sm w-fit">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up animate-pulse" />
              <span>首批精选 · 启动中 · USDT 收银 · 3 档纯付费</span>
            </div>

            {/* 巨型标题 (TV 风 clamp 字号) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-text-primary">
              让<span className="text-accent-blue">量化交易</span>
              <br />
              变得简单
            </h1>

            {/* 副标 */}
            <p className="text-base lg:text-lg text-text-secondary mb-8 max-w-xl leading-relaxed">
              {BRAND.slogan.zh}。
              <span className="block mt-2 text-text-muted text-sm">
                严选合规再分发协议 · 外汇 / 黄金 / 加密 / 能源 — 多市场覆盖
              </span>
            </p>

            {/* 双 CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/membership"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base px-6 py-3"
              >
                立即开通会员
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="btn-outline inline-flex items-center justify-center gap-2 text-base px-6 py-3"
              >
                <Code2 size={18} />
                浏览可商用策略
              </Link>
            </div>

            {/* 4 个钩子小点 (TV 风格 "为什么选我们" 钩子) */}
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              <div className="flex items-start gap-2 text-xs text-text-secondary">
                <Shield size={14} className="text-accent-blue mt-0.5 shrink-0" />
                <span>严选审核 · 合规再分发</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-secondary">
                <TrendingUp size={14} className="text-accent-up mt-0.5 shrink-0" />
                <span>12 个交易品种覆盖</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-secondary">
                <Code2 size={14} className="text-accent-blue mt-0.5 shrink-0" />
                <span>MQL4 / MQL5 源码可读</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-secondary">
                <Zap size={14} className="text-accent-gold mt-0.5 shrink-0" />
                <span>USDT 周/月/年付</span>
              </div>
            </div>
          </div>

          {/* 右: MT5 终端预览占位 + 浮卡 (TV 风格 "图表预览") */}
          <div className="relative">
            {/* 主图表占位卡片 */}
            <div className="card-base aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              {/* 模拟 K 线背景 (装饰用 SVG, 不假装实时) */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30"
                viewBox="0 0 400 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="candle-up" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#26a69a" />
                    <stop offset="100%" stopColor="#26a69a" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="candle-down" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef5350" />
                    <stop offset="100%" stopColor="#ef5350" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* 模拟 K 线 (装饰, 非真实数据) */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const x = 20 + i * 18;
                  const isUp = i % 3 !== 0;
                  const high = 60 + Math.sin(i * 0.7) * 40 + (isUp ? -20 : 20);
                  const low = high + (isUp ? 30 : 50);
                  const open = high + 10;
                  const close = low - 5;
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={high}
                        x2={x}
                        y2={low}
                        stroke={isUp ? "#26a69a" : "#ef5350"}
                        strokeWidth="1"
                      />
                      <rect
                        x={x - 5}
                        y={open}
                        width="10"
                        height={Math.abs(close - open)}
                        fill={isUp ? "url(#candle-up)" : "url(#candle-down)"}
                        stroke={isUp ? "#26a69a" : "#ef5350"}
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
                {/* 模拟均线 */}
                <path
                  d="M 0 150 Q 100 120, 200 140 T 400 130"
                  fill="none"
                  stroke="#2962FF"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </svg>

              {/* 占位说明 */}
              <div className="relative z-10 text-center">
                <div className="text-5xl mb-2">📊</div>
                <div className="text-sm font-semibold text-text-primary">MT5 终端预览</div>
                <div className="text-xs text-text-muted mt-1">（待 PM 提供真实截图）</div>
              </div>
            </div>

            {/* 浮卡 1: 品种实时模拟回测 (左上) */}
            <div className="absolute -top-3 -left-3 lg:top-4 lg:-left-6 card-base p-3 shadow-2xl backdrop-blur-md bg-bg-secondary/90 max-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-text-primary num">XAUUSD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-accent-up/20 text-accent-up font-semibold">
                  +2.34%
                </span>
              </div>
              <div className="text-xs text-text-muted">回测 30 天 · Sharpe 1.82</div>
              <div className="text-[10px] text-text-muted mt-1">示例数据 · 非实盘</div>
            </div>

            {/* 浮卡 2: 策略统计 (右下) */}
            <div className="absolute -bottom-3 -right-3 lg:bottom-4 lg:-right-6 card-base p-3 shadow-2xl backdrop-blur-md bg-bg-secondary/90">
              <div className="text-[10px] text-text-muted mb-1">可商用策略</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold num text-accent-blue">严选</span>
              </div>
              <div className="text-[10px] text-text-muted mt-1">每周新增 · 审核后发布</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
