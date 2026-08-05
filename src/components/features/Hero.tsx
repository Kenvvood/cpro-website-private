import Link from "next/link";
import { BRAND } from "@/config/brand";

// task052 L2 C13: Hero 双栏 (TV 风 · 祛 AI 味)
// 左: 文案 + 双 CTA; 右: 真实产品截图占位
export function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[400px] lg:min-h-[480px] py-8 lg:py-12">
      {/* 左: 文案 (8 列) */}
      <div className="flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-semibold border border-border rounded-sm bg-bg-secondary text-text-secondary">
          <span>●</span>
          <span>19,328 EA · 2,042 开源版 · 100 研报 · USDT 收银</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-6 text-text-primary">
          让<span className="text-accent-blue">量化交易</span>
          <br />
          变得简单
        </h1>

        <p className="text-base lg:text-lg text-text-secondary mb-8 max-w-xl leading-relaxed">
          已审核 212 个可商用 EA · 8,534 个开源版合规再分发。
          严选合规再分发协议，为量化工作室而生。
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/membership" className="btn-primary text-center">
            立即开通会员
          </Link>
          <Link href="/products" className="btn-outline text-center">
            查看 19,328 个 EA
          </Link>
        </div>

        <p className="text-xs text-text-muted mt-6">
          {BRAND.slogan.zh} · {BRAND.entity}
        </p>
      </div>

      {/* 右: 产品截图占位 (4 列) */}
      <div className="flex items-center justify-center">
        <div className="w-full aspect-video bg-bg-secondary border border-border rounded-md flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-3">📊</div>
            <div className="text-sm text-text-muted">MT5 终端截图占位</div>
            <div className="text-xs text-text-muted mt-1">（待 PM 提供真实截图）</div>
          </div>
        </div>
      </div>
    </section>
  );
}