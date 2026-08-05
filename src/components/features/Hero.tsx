import Link from "next/link";
import { ArrowRight, Code2, Layers } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.10: 黄金聚焦 (PM 决策 2026-08-05: 聚焦 XAUUSD 黄金 + 跨品种对冲套利)
// 左: 文案 (XAUUSD 主标 + 跨品种对冲副标 + 3 标签 + 2 CTA + 2 钩子)
// 右: XAUUSD 策略示例卡 (AveragingBySignal Pro · 净值曲线 + 4 指标)
//   净值曲线为示意 SVG, 真实回测数据上线后接入
// 删 v1.8.2 占位 "MT5 终端预览" emoji 大色块 (PM 反馈偏 AI 化)
export function Hero() {
  return (
    <section className="border-b border-border bg-bg-primary">
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 左: 文案 + CTA */}
          <div className="flex flex-col">
            {/* 状态徽章: XAUUSD 黄金聚焦 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-semibold border border-accent-gold/40 rounded-sm bg-accent-gold/5 w-fit">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-accent-gold">聚焦 XAUUSD 黄金 · 跨品种对冲套利</span>
            </div>

            {/* 巨型标题 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight mb-6 text-text-primary">
              把每一份
              <span className="text-accent-gold"> XAUUSD 黄金策略 </span>
              的真实回测
              <br />
              摊到你面前
            </h1>

            {/* 副标 */}
            <p className="text-sm lg:text-base text-text-secondary mb-6 max-w-xl leading-relaxed">
              严选 MQL 策略，以{" "}
              <span className="text-text-primary font-semibold">XAUUSD 黄金</span>{" "}
              为主标，覆盖欧美、镑美、美日等黄金货币对，以及{" "}
              <span className="text-text-primary font-semibold">金银比、黄金美元反向、黄金三角</span>{" "}
              等跨品种对冲产品。
              <br />
              <span className="block mt-2 text-text-muted text-xs">
                每款附夏普、回撤、胜率、回测净值曲线 · 严守合规再分发协议
              </span>
            </p>

            {/* 3 标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 text-xs rounded-sm border border-accent-gold/30 bg-accent-gold/5 text-accent-gold font-medium">
                XAUUSD 黄金专精
              </span>
              <span className="inline-flex items-center px-3 py-1 text-xs rounded-sm border border-accent-gold/30 bg-accent-gold/5 text-accent-gold font-medium">
                跨品种对冲套利
              </span>
              <span className="inline-flex items-center px-3 py-1 text-xs rounded-sm border border-accent-blue/30 bg-accent-blue/5 text-accent-blue font-medium">
                支持 MT4 / MT5
              </span>
            </div>

            {/* 2 CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/products"
                className="btn-primary inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5"
              >
                浏览黄金策略
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/hedge"
                className="btn-outline inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5"
              >
                <Layers size={16} />
                查看对冲套利
              </Link>
            </div>

            {/* 2 钩子 */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Code2 size={12} className="text-accent-blue" />
                <span>MQL4 / MQL5 源码可读</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-gold">·</span>
                <span>USDT 周 / 月 / 年付</span>
              </div>
            </div>
          </div>

          {/* 右: XAUUSD 策略示例卡 (AveragingBySignal Pro) */}
          <div className="card-base p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-accent-gold/10 text-accent-gold uppercase tracking-wider">
                XAUUSD · 均值回归
              </span>
              <span className="text-[10px] text-text-muted">示例策略</span>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-1">
              AveragingBySignal Pro
            </h3>
            <p className="text-xs text-text-muted mb-4 num">
              黄金 M15 · 2018-2024 回测 · 加仓策略
            </p>

            {/* 净值曲线示意 SVG (后续接真实回测) */}
            <svg
              className="w-full h-24 mb-4"
              viewBox="0 0 300 100"
              preserveAspectRatio="none"
              aria-label="净值曲线示意"
            >
              <defs>
                <linearGradient id="hero-curve" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#D4AF37" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,82 L25,78 L50,72 L75,65 L100,60 L125,52 L150,45 L175,38 L200,30 L225,25 L250,18 L275,12 L300,5"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.8"
              />
              <path
                d="M0,82 L25,78 L50,72 L75,65 L100,60 L125,52 L150,45 L175,38 L200,30 L225,25 L250,18 L275,12 L300,5 L300,100 L0,100 Z"
                fill="url(#hero-curve)"
              />
            </svg>

            {/* 4 指标 */}
            <div className="grid grid-cols-4 gap-3 py-3 border-t border-b border-border">
              <div>
                <div className="text-[10px] text-text-muted mb-0.5">年化</div>
                <div className="text-base font-bold num text-accent-up">+38.2%</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted mb-0.5">夏普</div>
                <div className="text-base font-bold num text-text-primary">1.84</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted mb-0.5">回撤</div>
                <div className="text-base font-bold num text-text-primary">12.0%</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted mb-0.5">胜率</div>
                <div className="text-base font-bold num text-text-primary">62%</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 text-xs text-text-secondary">
              <span className="text-accent-gold font-medium">本周热门 · 黄金主标</span>
              <Link
                href="/products"
                className="text-accent-gold font-medium hover:underline"
              >
                查看详情 →
              </Link>
            </div>
          </div>
        </div>

        {/* 底部小字 (slogan) */}
        <p className="mt-8 text-[11px] text-text-muted text-center">
          {BRAND.slogan.zh}
        </p>
      </div>
    </section>
  );
}
