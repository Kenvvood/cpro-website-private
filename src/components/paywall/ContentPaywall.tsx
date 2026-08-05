"use client";
// src/components/paywall/ContentPaywall.tsx
// task051 PAYMENT-REBUILD: L0 游客阅读截断钩子
// 视觉克制 (TV 风): 实色半透明 + 1px 边框 + 无 glow / 无 backdrop-blur 大模糊
import Link from "next/link";

interface ContentPaywallProps {
  paywallHeadings: string[];
  callbackUrl: string;
}

export function ContentPaywall({ paywallHeadings, callbackUrl }: ContentPaywallProps) {
  return (
    <aside className="relative mt-2 mb-8 rounded-md border border-border bg-bg-secondary">
      {/* 顶部淡入遮罩 (实色半透明, 非 glass) */}
      <div className="absolute -top-12 left-0 right-0 h-12 bg-bg-primary pointer-events-none" />

      <div className="p-6 md:p-8 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <h3 className="text-lg md:text-xl font-semibold mb-2">注册并解锁全文</h3>
        <p className="text-sm text-text-secondary mb-5 max-w-xl mx-auto leading-relaxed">
          注册 CProTrading 账号可阅读完整投研研报（含实盘案例、关键参数表、回测数据）。
        </p>

        {/* 截断章节清单 — 制造付费渴望 (PM D11 决策) */}
        {paywallHeadings.length > 0 && (
          <div className="mb-6 inline-flex flex-col gap-1 text-left">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2 text-center">
              本篇剩余章节
            </div>
            {paywallHeadings.map((h, i) => (
              <div key={i} className="text-sm text-text-secondary flex items-center gap-2">
                <span className="text-accent-down">▌</span>
                <span className="font-mono">{h.replace(/^##\s*/, "")}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="px-6 py-3 rounded-md bg-accent-blue text-white font-semibold hover:opacity-90 transition-opacity"
          >
            📧 立即注册
          </Link>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="px-6 py-3 rounded-md border border-border-strong text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            🔑 已有账号登录
          </Link>
        </div>

        <p className="mt-4 text-xs text-text-muted">
          按计划付费 · 3 档可选 (周付 $3.6 / 月付 $8.8 / 年付 $36.6 USDT)
        </p>
      </div>
    </aside>
  );
}