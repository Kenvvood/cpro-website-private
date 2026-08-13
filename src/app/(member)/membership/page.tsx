// src/app/(member)/membership/page.tsx
// v22.0 Phase 7.24 Batch 4: /membership 按 token-plan 重构
// 借鉴: minimaxi/token-plan 极简 + 月/年付切换 + 严选服务
// PM 排版铁律: "不要整齐卡片" → 改 1px 底边线密集列表, 错落有致
// PM 文案铁律: "不告诉用户不能免费" + "严选订阅" + 数字模糊化
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembershipPlans } from "@/components/checkout/MembershipPlans";
import { BRAND } from "@/config/brand";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

const INCLUDED = [
  { title: "严选可商用 EA", desc: "源码可读, MQL4 / MQL5 双版本, 持续收录与更新" },
  { title: "实战指标 + 脚本", desc: "多空信号、RSI 优化、批量平仓等高频工具, 即装即用" },
  { title: "投研教程 6 章", desc: "从部署、调参、回测到策略迭代, 配套源码讲解" },
  { title: "社区 VIP 群", desc: "技术交流 + 策略讨论 + 公开周报 + 早鸟新功能" },
  { title: "工单 4h 响应", desc: "部署异常 / 参数调优 / BUG 反馈, 严选技术保障" },
  { title: "策略调优答疑", desc: "订阅期间不限次提问, 严选服务不限门槛" },
];

const FAQ = [
  { q: "订阅之后多久生效?", a: "USDT 链上 1 个区块确认后立即开通, 通常 1-3 分钟" },
  { q: "可以中途退订吗?", a: "30 天内可申请, 按「时间档 (5 档) × 下载档 (4 档)」双重阶梯, 取较低退款比例, 详见 /dashboard/refunds" },
  { q: "订阅期间能换档吗?", a: "可以, 补差价升级档位, 降档自动顺延到期日" },
  { q: "工作室 / 团队订阅有优惠吗?", a: "有, 5 人以上团队联系商务获取定制方案" },
];

export default async function MembershipPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const currentMembership = userId
    ? await prisma.membership.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { expireAt: "desc" },
      })
    : null;

  const isActive = !!currentMembership;

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero */}
        {/* BATCH 15 PATCH 4: 移动 pt-2 (紧跟 TickerBar 30), 桌面 pt-20 lg:pt-28 保持 (PM 满意) */}
        {/* v22.0 BATCH 15 PATCH 9: PATCH 4 pt-20 lg:pt-28 在 8px 基准下 = 160/224px 过大
            → 改成 pt-12 lg:pt-14 (96/112px, 跟 Header 108 紧贴) */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-12 max-w-5xl">
          <div className="text-xs text-text-muted mb-6 tracking-widest uppercase">会员订阅</div>
          <h1 className="h1-xl mb-6">
            严选订阅,
            <br />
            <span className="text-accent-blue">终身质保</span>维护。
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary leading-[32px] max-w-3xl mb-8">
            一份订阅, 解锁持续收录的合规开源再分发资源。
            链上 USDT 结算, 严选服务不限门槛, 用多久算多久, 不用随时退。
          </p>
          {isActive && currentMembership && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-md border border-accent-up/30 bg-accent-up/5">
                <span className="text-accent-up text-sm">●</span>
                <div className="text-sm">
                  <span className="text-text-primary font-medium">当前会员生效中</span>
                  <span className="text-text-muted ml-2">
                    套餐 {currentMembership.plan} · 到期 {new Date(currentMembership.expireAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
              {/* 退款入口 (Batch 14B) */}
              <Link
                href="/dashboard/refunds"
                className="text-xs px-3 py-1.5 rounded-md border border-accent-down/30 bg-accent-down/5 text-accent-down hover:bg-accent-down/10 transition"
              >
                申请退款 →
              </Link>
            </div>
          )}
        </section>

        {/* 2. 套餐列表 (MembershipPlans: 月/年付 tab + 3 套餐密集列表) */}
        <section className="py-8 lg:py-12 border-t border-border">
          <MembershipPlans loggedIn={!!userId} />
        </section>

        {/* 3. 严选服务包含: 6 项 1px 底边线密集列表 */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">订阅包含</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {INCLUDED.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[60px_200px_1fr] items-baseline gap-4 lg:gap-8 py-5 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
                  >
                    <span className="text-sm text-text-muted num font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-base lg:text-lg font-semibold text-text-primary leading-[28px]">{item.title}</span>
                    <span className="text-sm lg:text-base text-text-secondary leading-[28px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 邀请奖励 */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">邀请奖励</h2>
            <div className="max-w-4xl">
              <div className="border border-border rounded-lg p-6 lg:p-8 bg-bg-secondary">
                <div className="flex items-start gap-6 flex-col sm:flex-row">
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-semibold text-text-primary leading-tight mb-3">
                      邀好友, 你和 TA 各得奖励
                    </h3>
                    <p className="text-sm text-text-secondary leading-[24px]">
                      分享你的专属链接, 好友通过链接订阅后, 你和 TA 同时获得免费天数奖励。
                      邀请人数无上限, 奖励自动累加到下次订阅。
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl lg:text-4xl font-bold text-accent-blue font-mono leading-tight">+1</div>
                    <div className="text-xs text-text-muted mt-1">每邀请 1 位 / 天数奖励</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-text-muted leading-[24px]">
                    奖励细则: 奖励以自然日为单位, 与套餐时长叠加, 终身质保期内退订则奖励收回。
                    工作室 / 团队批量邀请请联系商务获取定制方案。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FAQ: 4 问 1px 底边线密集列表 */}
        <section id="faq" className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">常见问题</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {FAQ.map((f, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[60px_1fr] items-baseline gap-4 lg:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
                  >
                    <span className="text-sm text-accent-blue num font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-base lg:text-lg font-semibold text-text-primary leading-[28px] mb-2">{f.q}</div>
                      <div className="text-sm lg:text-base text-text-secondary leading-[28px]">{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. 风险提示 + 备案 + 联系 */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="max-w-4xl text-sm text-text-muted leading-[24px] space-y-3">
            <p>
              <strong className="text-text-secondary">风险提示:</strong>{" "}
              量化交易存在固有风险, 过往业绩不代表未来表现。本平台资源仅供技术交流与回测用途, 不构成任何投资建议。
            </p>
            <p>
              <strong className="text-text-secondary">订阅协议:</strong>{" "}
              订阅即视为同意 <Link href="/legal/terms" className="text-accent-blue hover:underline">《用户协议》</Link> 与{" "}
              <Link href="/legal/privacy" className="text-accent-blue hover:underline">《隐私政策》</Link>。
            </p>
            <p>
              <strong className="text-text-secondary">商务合作:</strong>{" "}
              团队订阅 / API 接入 / 白标合作请联系{" "}
              <span className="text-text-primary font-mono">{BRAND.contact.officialWechat}</span> 或{" "}
              <span className="text-text-primary font-mono">{BRAND.contact.qq}</span>。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
