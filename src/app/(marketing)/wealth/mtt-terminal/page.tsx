// src/app/(marketing)/wealth/mtt-terminal/page.tsx
// v22.0 Phase 7.24 Batch 10: MTT 智能交易终端子页
// 苹果产品页分块 (内容分块 + 大留白 + 数字具象化 + 解决顾虑), 8 块结构
// v22.0 Phase 7.24 Batch 12: 移动端 4 块非核心内容用 <details> 折叠 (解决顾虑 / 未来上线 / 用户证言 / CTA)
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";

const PAGE_TITLE = "MTT 智能交易终端 - 零代码搭建交易系统 | CProTrading";
const PAGE_DESC = "城诺科技皇牌核心项目, 让 5 年爆仓 3 次的交易者 3 步找回信心。零代码拖拽, 多账户同步, 智能风控 3 道闸。";

// 移动端默认折叠 4 个非核心 section, 桌面端展开
const FOLDABLE_SECTIONS_COUNT = 4;

const USERS = [
  {
    icon: "🎯",
    title: "想试外汇黄金的主观交易老手",
    desc: "会看 K 线, 知道支撑阻力, 但手动交易受情绪影响大, 一亏损就上头, 想转量化但不会写代码。MTT 让你用熟悉的指标搭建自动化策略, 24h 不受情绪影响。",
  },
  {
    icon: "🌱",
    title: "纯小白 / 从未接触过交易",
    desc: "听说过外汇黄金能赚钱, 但不知道从哪开始。MTT 提供 200+ 严选指标 + 50+ 入门策略模板, 跟着教程 5 分钟搭出第一套系统, 不需要懂 MQL4 / MQL5。",
  },
  {
    icon: "💪",
    title: "爆仓过想重新开始的半桶水",
    desc: "之前自己写过 EA 或跟过单, 爆过 1-2 次仓, 想重新开始但又怕再爆。MTT 严选风控 3 道闸 (回撤 / 仓位 / 滑点), 每笔交易前客户端实时校验, 爆仓概率降到 1% 以下。",
  },
];

const FEATURES = [
  {
    tag: "零代码",
    title: "拖拽即用, 5 分钟搭出第一套策略",
    desc: "把指标 / 信号 / 风控模块从左侧拖到画布, 连线成策略。无需写一行 MQL4 / MQL5, 所见即所得, 跑不顺随时改。",
    icon: "🧩",
  },
  {
    tag: "200+ 指标",
    title: "内置 200+ 技术指标, 支持自定义公式",
    desc: "MA / RSI / MACD / Bollinger / KDJ / ATR / 自定义公式, 全部参数化可调, 每个指标都有中文 tooltip 解释, 不查文档也能用。",
    icon: "📊",
  },
  {
    tag: "多账户",
    title: "1 个终端管 N 个 MT4/MT5 账户",
    desc: "同时监控 5-10 个账户的实时仓位 / 余额 / 净值, 策略同步执行, 1 套策略跑所有账户, 不再切来切去。",
    icon: "🔗",
  },
  {
    tag: "智能风控",
    title: "回撤 / 仓位 / 滑点 3 道闸, 客户端实时校验",
    desc: "开仓前自动校验: 单笔风险不超过账户 1-2%, 当前回撤不超过 5%, 滑点不超过设定值。任何一条不满足, 直接拦截不开仓。",
    icon: "🛡️",
  },
  {
    tag: "实时信号",
    title: "信号推送微信 + Telegram 双通道",
    desc: "策略触发开仓 / 平仓时, 自动推送通知到微信服务号 + Telegram Bot, 7x24 不漏单, 移动端随时查看策略运行状态。",
    icon: "📲",
  },
  {
    tag: "1 键回测",
    title: "历史数据回测 + 实盘无缝切换",
    desc: "用过去 3-5 年真实 K 线回测, 看最大回撤 / 胜率 / R:R 指标, 满意后一键切到实盘, 同一套策略无缝迁移。",
    icon: "🔄",
  },
];

const CONCERNS = [
  {
    q: "我完全不懂代码, 真的能用?",
    a: "可以。MTT 用拖拽式搭建, 跟搭积木一样, 不需要任何编程基础。200+ 指标都已经封装好, 你只需要选 + 连线 + 调参数。",
  },
  {
    q: "跑实盘会爆仓吗?",
    a: "MTT 内置严选风控 3 道闸 (回撤 / 仓位 / 滑点), 客户端实时校验, 不满足不开仓。1年+ 实盘下来, 我们没收到 1 例严格风控下爆仓的案例。",
  },
  {
    q: "跟直接买 EA 有什么区别?",
    a: "买 EA 是用别人的策略, 你不掌握逻辑, 一旦 EA 失效你完全无能为力。MTT 让你自己搭建策略, 每一个参数你都能看懂能改, 策略失效你能自己迭代。",
  },
  {
    q: "策略会不会被公开?",
    a: "不会。所有策略文件本地保存, 不上传云端。MTT 团队看不到你的策略细节, 你拥有完全自主权。",
  },
];

const PRICING = [
  {
    name: "体验版",
    price: "0",
    period: "7 天",
    desc: "完整功能试用 7 天, 跑 1 套策略 + 1 个 MT4/MT5 账户",
    cta: "立即试用",
    href: "/membership",
    highlight: false,
  },
  {
    name: "月度版",
    price: "严选定价",
    period: "按月订阅",
    desc: "完整功能 + 无限策略 + 多账户同步 + 微信/Telegram 信号推送",
    cta: "立即开通",
    href: "/membership",
    highlight: true,
  },
  {
    name: "年度版",
    price: "严选折扣",
    period: "按年订阅",
    desc: "完整功能 + 终身质保维护 + 优先工单 + 新功能早鸟",
    cta: "立即开通",
    href: "/membership",
    highlight: false,
  },
];

export default function MTTTerminalPage() {
  // 移动端默认折叠, 桌面端默认展开 (useEffect 检测 resize)
  const [detailsOpen, setDetailsOpen] = useState(true);
  useEffect(() => {
    const onResize = () => {
      // lg = 1024px, < lg 折叠
      setDetailsOpen(window.innerWidth >= 1024);
    };
    onResize(); // 初始
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 静态 title (client component 不能用 export const metadata) */}
      <title>{PAGE_TITLE}</title>
      <meta name="description" content={PAGE_DESC} />
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero (3C 风: 大字 + 数字具象化 "3 步找回信心") */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-10 max-w-5xl">
          <div className="flex items-baseline gap-3 mb-3 flex-wrap">
            <span className="text-xs text-text-muted tracking-widest uppercase">
              生财有道 · 02
            </span>
            <span className="text-xs text-text-muted">/</span>
            <Link href="/wealth" className="text-xs text-accent-blue hover:underline">
              ← 返回生财有道
            </Link>
          </div>
          <h1 className="h1-xl mb-4">
            让 5 年爆仓 3 次的交易者,<br />
            <span className="text-accent-blue">3 步</span>找回信心。
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary leading-[32px] max-w-3xl mb-6">
            MTT 智能交易终端, 城诺科技皇牌核心项目。零代码拖拽式搭建交易系统,
            多账户同步, 智能风控 3 道闸, 让 3 类"卡在门外"的用户都能上手。
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/membership" className="btn-primary text-sm">
              立即试用 7 天
            </Link>
            <Link href="#features" className="btn-outline text-sm">
              了解产品亮点
            </Link>
          </div>
        </section>

        {/* 2. 3 类目标用户 (3 卡片, 错落排布: 中间偏移) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">为谁而做</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            3 类用户, 同一个 MTT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {USERS.map((u, i) => (
              <div
                key={u.title}
                className={`border border-border bg-bg-card p-5 lg:p-6 ${
                  i === 1 ? "md:mt-6" : ""
                }`}
              >
                <div className="text-3xl mb-3">{u.icon}</div>
                <h3 className="text-base lg:text-lg font-semibold text-text-primary leading-snug mb-2">
                  {u.title}
                </h3>
                <p className="text-sm text-text-secondary leading-[24px]">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 6 大产品亮点 (3C 风分块, 2 栏 grid, 苹果产品页大留白) */}
        <section id="features" className="py-12 lg:py-20 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">产品亮点</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
            6 个, 让交易者不再卡在门外
          </h2>
          <p className="text-base text-text-secondary leading-[28px] max-w-3xl mb-8 lg:mb-10">
            每个亮点对应一个真实用户痛点, 不是"功能列表"是"问题解决方案"。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="border border-border bg-bg-card p-6 lg:p-8"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="text-[10px] uppercase tracking-wider text-accent-blue mb-2 font-mono">
                  {f.tag}
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-text-primary leading-snug mb-3">
                  {f.title}
                </h3>
                <p className="text-sm lg:text-base text-text-secondary leading-[26px]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 沉浸式产品截图 (占位: 灰图) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">产品视觉</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
            看一下 MTT 跑起来的样子
          </h2>
          <p className="text-base text-text-secondary leading-[28px] max-w-3xl mb-8 lg:mb-10">
            主界面 + 策略画布 + 多账户同步面板 + 回测报告 (占位, 待补真实截图)。
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-text-muted mb-2">🖥️</div>
                <div className="text-sm text-text-muted">主界面截图</div>
                <div className="text-xs text-text-muted mt-1">待补真实截图</div>
              </div>
            </div>
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-text-muted mb-2">🧩</div>
                <div className="text-sm text-text-muted">策略画布</div>
                <div className="text-xs text-text-muted mt-1">待补真实截图</div>
              </div>
            </div>
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-text-muted mb-2">📊</div>
                <div className="text-sm text-text-muted">多账户同步面板</div>
                <div className="text-xs text-text-muted mt-1">待补真实截图</div>
              </div>
            </div>
            <div className="border border-border bg-bg-secondary aspect-[16/10] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-text-muted mb-2">📈</div>
                <div className="text-sm text-text-muted">回测报告</div>
                <div className="text-xs text-text-muted mt-1">待补真实截图</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-9. 4 个非核心 section (用户证言 / 未来上线 / 解决顾虑 / CTA) 包在 <details> 移动端折叠 */}
        <details open={detailsOpen} className="group">
          <summary className="block lg:hidden cursor-pointer py-4 px-4 border-y border-border bg-bg-secondary text-text-primary text-sm font-medium flex items-center justify-between hover:bg-bg-tertiary transition-colors sticky top-16 z-10 -mx-4 sm:-mx-6 lg:mx-0">
            <span>展开 {FOLDABLE_SECTIONS_COUNT} 块延伸内容 (用户证言 / 未来上线 / 解决顾虑 / CTA)</span>
            <span className="text-accent-blue text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>

        {/* 5. 真实用户故事 (占位, 3 段) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">用户证言</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
            30 天, 从爆仓到稳定
          </h2>
          <p className="text-base text-text-secondary leading-[28px] max-w-3xl mb-8 lg:mb-10">
            3 位真实用户的 30 天使用轨迹 (占位, 等 PM 补真实案例 + 截图)。
          </p>
          <div className="border-y border-border">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[60px_1fr] items-baseline gap-4 lg:gap-8 py-8 border-b border-border last:border-0"
              >
                <span className="text-2xl lg:text-3xl text-accent-blue num font-mono font-bold leading-none">
                  0{i}
                </span>
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                    真实用户 · 待补
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-text-primary leading-snug mb-2">
                    用户 {i} · 30 天使用轨迹
                  </h3>
                  <p className="text-sm lg:text-base text-text-secondary leading-[26px]">
                    起点: 之前爆仓 2 次, 想放弃交易。30 天后: 跑通 1 套自动策略, 月化稳定, 重拾信心。
                    (占位文字, 等 PM 补真实用户案例 + 截图)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 未来功能: 实时交易直播 (占位) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">未来上线</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
            实时交易画面直播 <span className="text-base text-text-muted font-normal">(即将上线)</span>
          </h2>
          <p className="text-base text-text-secondary leading-[28px] max-w-3xl mb-8 lg:mb-10">
            MTT 终端展示账户实盘画面 7x24 不限时直播, 会员可随时查看我们跑的真实交易信号。
            (占位, 等 MT4/MT5 Investor 账号接入后实装)
          </p>
          <div className="border border-border bg-bg-secondary aspect-[21/9] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl text-text-muted mb-3">🎥</div>
              <div className="text-base text-text-muted">实时交易直播占位</div>
              <div className="text-xs text-text-muted mt-1">即将上线, 7x24 不限时</div>
            </div>
          </div>
        </section>

        {/* 7. 解决顾虑 (FAQ 风格, 苹果产品页 "解决用户潜在顾虑" 原则) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">
              在你下单前<br />我们先回答 4 个顾虑
            </h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {CONCERNS.map((f, i) => (
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

        {/* 8. 价格 / 订阅 (3 卡片但错落, 数字模糊化) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">订阅</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
            3 档订阅, 严选定价
          </h2>
          <p className="text-base text-text-secondary leading-[28px] max-w-3xl mb-8 lg:mb-10">
            严选服务不限门槛, 月付 / 年付 / 团队批量授权, 详情见 <Link href="/membership" className="text-accent-blue hover:underline">会员订阅</Link>。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {PRICING.map((p, i) => (
              <div
                key={p.name}
                className={`border p-6 lg:p-7 ${
                  p.highlight
                    ? "border-accent-blue bg-bg-card"
                    : "border-border bg-bg-card"
                } ${i === 1 ? "md:mt-4" : ""}`}
              >
                {p.highlight && (
                  <div className="text-[10px] uppercase tracking-wider text-accent-blue font-mono mb-2">
                    推荐
                  </div>
                )}
                <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-1">
                  {p.name}
                </h3>
                <div className="text-3xl font-bold text-text-primary num leading-tight mb-1">
                  {p.price}
                </div>
                <div className="text-xs text-text-muted mb-4">{p.period}</div>
                <p className="text-sm text-text-secondary leading-[24px] mb-5">
                  {p.desc}
                </p>
                <Link
                  href={p.href}
                  className={`block text-center text-sm py-2 px-4 transition-colors ${
                    p.highlight
                      ? "btn-primary"
                      : "border border-border hover:border-accent-blue hover:text-accent-blue"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            * 严选服务不限门槛, 严选定价不承诺具体数字, 详询商务。
          </p>
        </section>

        {/* 9. CTA + 联系 */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="border border-border bg-bg-card p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">
                  立即试用 MTT 终端
                </h2>
                <p className="text-sm text-text-secondary leading-[24px] max-w-2xl">
                  7 天完整功能试用, 跑 1 套策略 + 1 个 MT4/MT5 账户, 不满意不续费。
                  商务合作 / 团队批量授权请联系 <span className="font-mono text-text-primary">{BRAND.contact.officialWechat}</span>。
                </p>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <Link href="/membership" className="btn-primary text-sm whitespace-nowrap">
                  立即试用
                </Link>
                <div className="text-xs text-text-muted">
                  或联系商务 <span className="font-mono text-text-primary">{BRAND.contact.officialWechat}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        </details>
        {/* 10. 风险 + 联系 */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="max-w-4xl text-sm text-text-muted leading-[24px] space-y-3">
            <p>
              <strong className="text-text-secondary">风险提示:</strong>{" "}
              量化交易存在固有风险, 过往业绩不代表未来表现。MTT 严选风控可降低爆仓概率, 但不保证盈利。
            </p>
            <p>
              <strong className="text-text-secondary">合规备案:</strong>{" "}
              MTT 终端为客户端软件, 不涉及代客理财, 资金始终在用户自己的券商账户。详情见 <Link href="/legal/terms" className="text-accent-blue hover:underline">《用户协议》</Link>。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
