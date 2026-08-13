// src/app/(marketing)/wealth/quant-custody/page.tsx
// v22.0 Phase 7.24 Batch 10: 量化托管合伙人项目子页
// 3C 风分块, 6 大模块, 大留白克制, 数字模糊化, 专业用词
// v22.0 Phase 7.24 Batch 13: SEO 完整
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "量化托管合伙人 - 50:50 利润分成, 严选订阅服务 | CProTrading",
  description: "账户在合伙人自己名下, 出入金自主, 50:50 利润分成, USDT 自动结算。城诺科技量化托管合伙人计划, 已跑通 3 年+, 3 道风控硬约束。",
  path: "/wealth/quant-custody",
  image: "/og-quant-custody.png",
  keywords: ["量化托管", "合伙人", "50:50", "USDT 结算", "黄金套利", "MT4", "MT5"],
});

const HIGHLIGHTS = [
  {
    icon: "01",
    title: "自主选择券商",
    desc: "支持主流 MT4 / MT5 券商账户 (IC Markets / Exness / XM / Tickmill / 其他 ECN), 账户在合伙人自己名下, 不强制开新户。",
  },
  {
    icon: "02",
    title: "出入金自主",
    desc: "入金自由, 出金 T+0 到原账户, 账号掌握在合伙人手里, 任何时候可全额撤出, 严选不限门槛。",
  },
  {
    icon: "03",
    title: "只需账户 + 交易密码",
    desc: "EA 仅持有交易密码, 不可提现不可改密, 任何资金动作必须由合伙人本人操作, 资金隔离到账户级别。",
  },
  {
    icon: "04",
    title: "50:50 利润分成",
    desc: "净盈利对半分成, 月结自动打款, 每月 5 日前结算上月盈利, 公开账目可查, 0 抽水 0 暗扣。",
  },
];

const RISK = [
  { name: "单笔止损", value: "1-2%" },
  { name: "日回撤上限", value: "5%" },
  { name: "最大持仓", value: "3 单" },
  { name: "黑天鹅熔断", value: "立即清仓" },
];

const FAQ = [
  {
    q: "需要把 MT4/MT5 账户完全交给 EA 团队吗?",
    a: "不需要。EA 团队只拿到只读交易权限 (Investor Password + Trade API ReadOnly), 没有提现 / 改密权限, 资金始终在合伙人自己券商账户里。",
  },
  {
    q: "EA 跑哪几个交易对?",
    a: "默认主跑 XAUUSD (黄金) 跟黄金套利对 (XAUUSD/JPY · XAUUSD/CNH)。合伙人可申请追加 USDJPY / USDCNH 直盘对, 但需 EA 团队风控审核后接入。",
  },
  {
    q: "亏损了怎么办?",
    a: "触发单笔止损 / 日回撤上限即自动停 EA, 当日不再开新单。合伙人可随时手动关 EA, 风险敞口随时可控。",
  },
  {
    q: "分成怎么算 / 怎么结算?",
    a: "净盈利 = 账户余额 - (月初余额 + 入金) + 出金。每月 5 日前结算上月净盈利, USDT 自动打款到合伙人指定 TRC20 钱包。",
  },
  {
    q: "有锁定期吗?",
    a: "无锁定期, 任何时候可全额出金退出, 已分润金额不收回。但建议至少跑 1 个完整月份 (30 天) 让策略充分展示。",
  },
];

export default function QuantCustodyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero (顶部留白克制) */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-8 max-w-5xl">
          <div className="flex items-baseline gap-3 mb-3 flex-wrap">
            <span className="text-xs text-text-muted tracking-widest uppercase">
              生财有道 · 01
            </span>
            <span className="text-xs text-text-muted">/</span>
            <Link href="/wealth" className="text-xs text-accent-blue hover:underline">
              ← 返回生财有道
            </Link>
          </div>
          <h1 className="h1-lg mb-3">
            外汇黄金量化托管<br />
            <span className="text-accent-blue">合伙人计划</span>
          </h1>
          <p className="text-base lg:text-lg text-text-secondary leading-[28px] max-w-3xl mb-6">
            账户在您手里, 利润对半分成。已跑通 3 年+, 严格风控, 日化 1%+。
            城诺科技把严选可商用 EA 跑在合伙人自己的券商账户上, 您只负责看分润。
          </p>
          {/* 4 大核心数据徽章 */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "稳定运行", value: "3年+" },
              { label: "日化收益", value: "1%+" },
              { label: "利润分成", value: "50:50" },
              { label: "出金", value: "T+0" },
            ].map((m, i) => (
              <div key={i} className="px-4 py-2.5 border border-border bg-bg-card">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                  {m.label}
                </div>
                <div className="text-2xl font-bold text-text-primary num leading-none">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 4 大产品亮点 (3C 风分块, 1px 底边线) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">产品亮点</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            4 个为什么选我们
          </h2>
          <div className="border-y border-border">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.icon}
                className="grid grid-cols-[60px_200px_1fr] items-baseline gap-4 lg:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
              >
                <span className="text-sm text-accent-blue num font-mono">{h.icon}</span>
                <span className="text-base lg:text-lg font-semibold text-text-primary leading-[28px]">
                  {h.title}
                </span>
                <span className="text-sm lg:text-base text-text-secondary leading-[28px]">
                  {h.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 运营数据 (占位: 灰图) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">运营数据</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            3年+ 业绩曲线 (占位, 待补真实截图)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl text-text-muted mb-2">📈</div>
                <div className="text-sm text-text-muted">月化业绩柱状图</div>
                <div className="text-xs text-text-muted mt-1">待补真实数据</div>
              </div>
            </div>
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl text-text-muted mb-2">📊</div>
                <div className="text-sm text-text-muted">日化收益分布</div>
                <div className="text-xs text-text-muted mt-1">待补真实数据</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            * 真实业绩展示需脱敏处理 (隐藏账户号 / 余额), 占位等 PM 补图后替换。
          </p>
        </section>

        {/* 4. 合伙人背书 (横向滚动 4-6 张占位图) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">合伙人背书</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            真实合伙人分润到账 (占位)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border border-border bg-bg-secondary aspect-[3/4] flex items-center justify-center"
              >
                <div className="text-center px-2">
                  <div className="text-2xl text-text-muted mb-1">📷</div>
                  <div className="text-[10px] text-text-muted">
                    合伙人 {String(i).padStart(2, "0")}
                    <br />
                    MT4/MT5 收益截图
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            * 真实收益截图需脱敏 (隐藏账户号 / 余额精确值), 严格遵守国家金融广告合规要求, 占位等 PM 补图后替换。
          </p>
        </section>

        {/* 5. 风控参数 (2 栏 grid, 4 块密集) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">风控参数</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            严选风控, 4 道闸
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {RISK.map((r, i) => (
              <div
                key={r.name}
                className={`p-5 ${
                  i < 2 ? "border-b lg:border-b-0" : ""
                } ${
                  i % 2 === 0 ? "border-r lg:border-r border-border" : "lg:border-r-0"
                } ${i < 2 ? "border-border" : ""} ${i === 1 ? "lg:border-r" : ""}`}
              >
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  {r.name}
                </div>
                <div className="text-xl lg:text-2xl font-bold text-accent-up num leading-tight">
                  {r.value}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-muted mt-4 leading-relaxed max-w-3xl">
            触发任意一条风控阈值, EA 立即停止开新单, 已持仓单按策略平仓。
            严选不限门槛, 但风控等级建议起步用保守参数 (1% 单笔 / 3% 日回撤), 跑顺后逐步放开。
          </p>
        </section>

        {/* 6. CTA + 申请 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="border border-border bg-bg-card p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">
                  申请成为合伙人
                </h2>
                <p className="text-sm text-text-secondary leading-[24px] max-w-2xl">
                  提交您的 MT4/MT5 券商信息 + 历史账户截图, 团队 1 个工作日内审核回复。
                  起步建议 1,000 USDT 账户跑 1 个月, 验证实盘业绩后再加仓。
                </p>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <Link href="/dashboard/apply" className="btn-primary text-sm whitespace-nowrap">
                  立即申请
                </Link>
                <div className="text-xs text-text-muted">
                  或联系商务 <span className="font-mono text-text-primary">{BRAND.contact.officialWechat}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
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

        {/* 8. 风险 + 联系 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="max-w-4xl text-sm text-text-muted leading-[24px] space-y-3">
            <p>
              <strong className="text-text-secondary">风险提示:</strong>{" "}
              量化交易存在固有风险, 过往业绩不代表未来表现。本项目 3年+ 实盘数据基于特定市场环境, 不保证未来盈利。
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
