// src/app/(marketing)/wealth/page.tsx
// v22.0 Phase 7.24 Batch 10: 生财有道主页
// 2 项目并列 (量化托管合伙人 + MTT 终端), 苹果产品页分块, 大留白克制
// v22.0 Phase 7.24 Batch 10 v7: 只改 Hero 区排版 (Q&A 对话风), 其他位置完全保留
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "生财有道 - 量化托管合伙人 + MTT 智能交易终端 | CProTrading",
  description: "城诺科技两大核心收益项目: 量化托管合伙人 + MTT 智能交易终端。已跑通 3 年+, 50:50 利润分成, 严选订阅服务。",
  path: "/wealth",
  image: "/og-wealth.png",
  keywords: ["量化托管", "MTT 终端", "合伙人", "50:50 分成", "黄金套利"],
});

const PROJECTS = [
  {
    href: "/wealth/quant-custody",
    badge: "稳定运行 3年+",
    badgeCls: "border-accent-gold/40 bg-accent-gold/5 text-accent-gold",
    name: "外汇黄金量化托管",
    sub: "Quantitative Custody Partnership",
    pitch: "账户在您手里, 利润对半分成。3年+ 实盘跑通, 严格风控, 日化 1%+。",
    metrics: [
      { label: "实盘跑通", value: "3年+" },
      { label: "日化", value: "1%+" },
      { label: "利润分成", value: "50:50" },
      { label: "出金", value: "T+0" },
    ],
    highlights: [
      "自主选择券商, 不绑死",
      "出入金自由, 账号在合伙人手里",
      "只需 MT4/MT5 账户 + 交易密码",
      "EA 只持有交易权限, 不可提现不可改密",
    ],
    cta: "申请成为合伙人",
  },
  {
    href: "/wealth/mtt-terminal",
    badge: "皇牌核心",
    badgeCls: "border-accent-blue/40 bg-accent-blue/5 text-accent-blue",
    name: "MTT 智能交易终端",
    sub: "MTT Smart Trading Terminal",
    pitch: "让 5 年爆仓 3 次的交易者, 3 步找回信心。零代码, 多账户同步, 智能风控 3 道闸。",
    metrics: [
      { label: "目标用户", value: "3 类" },
      { label: "技术指标", value: "200+" },
      { label: "风控层级", value: "3 道" },
      { label: "实盘回测", value: "1 键" },
    ],
    highlights: [
      "零代码拖拽式策略搭建",
      "多账户同步, 1 终端管 N 个 MT4/MT5",
      "实时信号推送 (微信 + Telegram)",
      "智能风控: 回撤 / 仓位 / 滑点 3 道闸",
    ],
    cta: "了解 MTT 终端",
  },
];

const FAQ = [
  {
    q: "两个项目可以同时参加吗?",
    a: "可以。合伙人可以一边托管账户跑量化, 一边用 MTT 终端手动 / 半自动交易。两套系统独立, 互不干扰。",
  },
  {
    q: "需要多少启动资金?",
    a: "量化托管项目起步门槛建议 1,000 USDT (券商账户), MTT 终端订阅月付即可使用, 严选不限门槛。",
  },
  {
    q: "风险如何控制?",
    a: "量化托管项目设置严格风控参数 (单笔止损 1-2%, 日回撤上限 5%), 触发即停。MTT 终端自带回撤 / 仓位 / 滑点 3 道闸, 全部在客户端实时计算。",
  },
  {
    q: "出金 / 退出会不会卡?",
    a: "量化托管项目 T+0 出金到合伙人原账户, 随时退出; MTT 终端订阅可随时取消, 剩余天数按 USDT 等值退还链上钱包。",
  },
];

export default function WealthPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero (Q&A 对话风排版 - v7) */}
        {/* BATCH 15 PATCH 4: 移动 pt-2 (紧跟 TickerBar 30), 桌面 pt-10 lg:pt-14 保持 */}
        {/* v22.0 BATCH 15 PATCH 9: PATCH 4 pt-10 在 8px 基准下 = 80px 略小 → 改成 pt-12 (96px) 跟 PATCH 7 一致 */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-10 lg:pb-14 max-w-5xl">
          <div className="text-xs text-text-muted mb-3 tracking-widest uppercase">生财有道</div>

          {/* Q */}
          <div className="mb-4 lg:mb-6">
            <div className="text-base lg:text-lg text-text-muted mb-2">Q.</div>
            <h1 className="h1-lg">
              想靠交易赚钱, 又不想 24h 盯盘?
            </h1>
          </div>

          {/* A */}
          <div className="border-l-2 border-accent-blue pl-5 lg:pl-7">
            <div className="text-base lg:text-lg text-accent-blue mb-3 font-semibold">A.</div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold leading-[1.4] tracking-tight text-text-primary mb-3">
              那就 <span className="text-accent-blue">1 个公司 2 套</span>。
              <br />
              <span className="text-text-secondary font-normal text-base lg:text-lg">1 个我们替你跑, 1 个你自己跑。</span>
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              量化托管 3 年+ 跑通 · MTT 终端 1 年+ 验证 · 50:50 分成 · 0 代码 3 道风控。
            </p>
          </div>
        </section>

        {/* 2. 双项目并列 (60% + 40% 错落, 不是 1:1 对称卡片) - 保持 v6 完整结构 */}
        <section className="py-8 lg:py-10 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8">
            {PROJECTS.map((p, idx) => (
              <Link
                key={p.href}
                href={p.href}
                className={`group block border border-border bg-bg-card hover:border-accent-blue transition-colors ${
                  idx === 1 ? "lg:mt-6" : ""
                }`}
              >
                {/* 卡片头部: badge + 名称 + sub */}
                <div className="p-6 lg:p-7 border-b border-border">
                  <div className={`inline-block px-2 py-0.5 border text-[10px] uppercase tracking-wider mb-3 ${p.badgeCls}`}>
                    {p.badge}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-1 group-hover:text-accent-blue transition-colors">
                    {p.name}
                  </h2>
                  <div className="text-xs text-text-muted font-mono mb-3">{p.sub}</div>
                  <p className="text-sm text-text-secondary leading-[24px]">{p.pitch}</p>
                </div>
                {/* 4 块数据指标 (1px 底边线密集列表) */}
                <div className="grid grid-cols-4 border-b border-border">
                  {p.metrics.map((m, i) => (
                    <div
                      key={i}
                      className={`px-3 py-3 ${
                        i < 3 ? "border-r border-border" : ""
                      }`}
                    >
                      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                        {m.label}
                      </div>
                      <div className="text-lg font-bold text-text-primary num leading-tight">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
                {/* 4 条亮点 (1px 底边线密集列表) */}
                <div className="border-b border-border">
                  {p.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-3 px-6 py-2.5 border-b border-border last:border-0 text-sm"
                    >
                      <span className="text-[10px] text-accent-blue num font-mono w-4 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-text-secondary leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
                {/* CTA */}
                <div className="px-6 py-4 text-sm font-medium text-accent-blue group-hover:underline">
                  {p.cta} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 为什么这两条路径 (3 块并列) - 保持 v6 完整结构 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">为什么是这两条</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            两条路径, 同一个底层
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {[
              {
                title: "严选可商用 EA",
                desc: "量化托管项目跑的 EA, 全部收录在 /content 大航海时代开放源码, 3年+ 实盘业绩。",
              },
              {
                title: "MTT 终端 = 工具化",
                desc: "MTT 终端把这些 EA 背后的策略逻辑做成拖拽组件, 用户不写代码也能搭建自己的交易系统。",
              },
              {
                title: "严选 + 商业授权贴牌",
                desc: "所有 EA 经过授权合规 + 中文 input 注释 + 双重署名, 工作室 / 团队可商用, 终身质保维护。",
              },
            ].map((b, i) => (
              <div
                key={i}
                className={`p-5 lg:p-6 ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-border" : ""
                }`}
              >
                <div className="text-[10px] text-accent-blue num font-mono mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2 leading-snug">
                  {b.title}
                </h3>
                <p className="text-sm text-text-secondary leading-[24px]">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ (1px 底边线密集列表) - 保持 v6 完整结构 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">常见问题</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {FAQ.map((f, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[60px_1fr] items-baseline gap-4 lg:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
                  >
                    <span className="text-sm text-accent-blue num font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-base lg:text-lg font-semibold text-text-primary leading-[28px] mb-2">
                        {f.q}
                      </div>
                      <div className="text-sm lg:text-base text-text-secondary leading-[28px]">
                        {f.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. 风险 + 联系 - 保持 v6 完整结构 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="max-w-4xl text-sm text-text-muted leading-[24px] space-y-3">
            <p>
              <strong className="text-text-secondary">风险提示:</strong>{" "}
              量化交易存在固有风险, 过往业绩不代表未来表现。本栏目展示的 3年+ 实盘数据基于特定市场环境, 不保证未来收益。
            </p>
            <p>
              <strong className="text-text-secondary">商务合作:</strong>{" "}
              团队合伙人 / MTT 终端批量授权 / 白标合作请联系{" "}
              <span className="text-text-primary font-mono">{BRAND.contact.officialWechat}</span> 或{" "}
              <span className="text-text-primary font-mono">{BRAND.contact.qq}</span>。
            </p>
            <p>
              <strong className="text-text-secondary">合规备案:</strong>{" "}
              所有 EA 已取得原作者书面授权, 详情见 <Link href="/legal/gpl-notice" className="text-accent-blue hover:underline">《开源合规声明》</Link>。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
