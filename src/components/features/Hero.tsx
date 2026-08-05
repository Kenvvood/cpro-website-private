import Link from "next/link";
import { ArrowRight, Code2, Zap, FileCheck2, TrendingUp, ShieldCheck, RotateCcw } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.9 激进档 (PM 2026-08-15 15:42 拍板):
// 借鉴 erbotapp 6 钩结构 + 零 emoji + 真实数据
// 6 钩: 源码可读 / MT4-MT5 兼容 / USDT 收银 / 编译成功率 / 公开回测 / 失败退款
const HOOKS = [
  { icon: Code2, text: "MQL4 / MQL5 源码可读" },
  { icon: TrendingUp, text: "MT4 / MT5 双平台兼容" },
  { icon: Zap, text: "USDT 周 / 月 / 年付" },
  { icon: FileCheck2, text: "编译成功率 56.8% (持续提升)" },
  { icon: ShieldCheck, text: "公开回测报告可下载" },
  { icon: RotateCcw, text: "失败可换其他 EA" },
];

export function Hero() {
  return (
    <section className="border-b border-border bg-bg-primary">
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 左: 文案 + CTA */}
          <div className="flex flex-col">
            {/* 状态徽章 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-semibold border border-border rounded-sm bg-bg-secondary w-fit">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
              <span>首批精选 · 启动中 · USDT 收银 · 3 档纯付费</span>
            </div>

            {/* 巨型标题 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-text-primary">
              让<span className="text-accent-blue">量化交易</span>
              <br />
              变得简单
            </h1>

            {/* 副标: 黄金外汇专精 */}
            <p className="text-base lg:text-lg text-text-secondary mb-8 max-w-xl leading-relaxed">
              <span className="text-text-primary font-semibold num">XAUUSD 黄金</span>
              <span> · </span>
              <span className="text-text-primary font-semibold num">EURUSD / GBPUSD</span>
              <span> 外汇主流对</span>
              <span className="block mt-2 text-text-muted text-sm">
                严选合规再分发协议 · {BRAND.slogan.zh}
              </span>
            </p>

            {/* 单 CTA (主) + 次 CTA */}
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

            {/* 6 钩子 (v1.9 借 erbotapp, v1.7 是 2 个) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 text-xs text-text-muted">
              {HOOKS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.text} className="flex items-center gap-1.5">
                    <Icon size={12} className="text-accent-blue shrink-0" />
                    <span>{h.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右: MT5 终端预览占位 */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-[4/3] card-base flex items-center justify-center">
              <div className="text-center px-6">
                <div className="text-5xl mb-3 font-bold text-text-muted num">MT5</div>
                <div className="text-sm font-semibold text-text-primary">MT5 终端预览</div>
                <div className="text-xs text-text-muted mt-1">（待 PM 提供真实截图）</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
