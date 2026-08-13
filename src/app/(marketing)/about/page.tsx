// v22.0 Phase 7.24 Batch 3: /about 按 minimaxi/about 重构
// 借鉴: 大标题 + 多段文字 leading-[32px] + 极简留白 (神似非形似)
// PM 排版铁律: "不要整齐卡片" + "错落有致不呆板" → 保留密集列表 (1px 底边线), 不卡片化
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";

const VALUES = [
  {
    n: "01",
    title: "本金安全为先",
    desc: "风控体系是策略基石, 对冲机制让资金在极端行情下仍可控可查。",
  },
  {
    n: "02",
    title: "算法驱动决策",
    desc: "全流程由模型自动生成信号, 杜绝情绪化交易, 纪律性严格执行。",
  },
  {
    n: "03",
    title: "社区互助共赢",
    desc: "携手交易者一起交流心得, 共享策略成果与调优经验。",
  },
  {
    n: "04",
    title: "全程技术支持",
    desc: "提供完整的系统操作培训与持续脚本支持, 7 天响应工单。",
  },
];

const COOPERATION = [
  {
    title: "付费资源下载",
    desc: "全部 EA / 指标 / 脚本按计划付费下载, USDT 收款, 链上确认后立即生效。",
  },
  {
    title: "利润分成合作",
    desc: "我们投入核心软件和技术, 您获得净利润的 50%, 利益一致长期绑定。",
  },
  {
    title: "技术支持服务",
    desc: "一对一指导, 4 小时工单响应, 让您的量化之路畅通无阻。",
  },
];

const PRODUCT_SYSTEM = [
  {
    title: "智能 EA 交易系统",
    items: ["趋势追踪 EA — 全自动判断趋势方向", "网格马丁 EA — 经典网格加仓策略", "新闻事件 EA — 自动识别重要新闻窗口"],
  },
  {
    title: "量化指标工具",
    items: ["多空信号指标 — 精准把握市场转折", "RSI 超买超卖指标 — 经典 RSI 优化版", "批量平仓脚本 — 一键平掉全部持仓"],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero: 大标题 + 副标 + 留白 (借鉴 minimaxi/about 极简大留白) */}
        {/* BATCH 15 PATCH 4: 移动 pt-2 (紧跟 TickerBar 30), 桌面 pt-20 lg:pt-32 保持 (PM 满意) */}
        {/* v22.0 BATCH 15 PATCH 9: PATCH 4 pt-20 lg:pt-32 在 8px 基准下 = 160/256px 过大
            → 改成 pt-12 lg:pt-14 (96/112px, 跟 Header 108 紧贴) */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-16 lg:pb-24 max-w-5xl">
          <div className="text-xs text-text-muted mb-6 tracking-widest uppercase">关于我们</div>
          <h1 className="h1-xl mb-8">
            把量化交易,
            <br />
            做得<span className="text-accent-blue">简单</span>、<span className="text-accent-blue">稳定</span>、<span className="text-accent-blue">可读</span>。
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary leading-[32px] max-w-3xl">
            {BRAND.entity} 是一家专注于外汇量化交易工具研发的科技公司, 由资深外汇交易员与专业程序开发工程师共同组成。
            我们相信, 量化交易不应该是专业机构的专利, 通过可读源码、严选订阅、链上 USDT 结算,
            让普通交易者也能搭起自己的量化基础设施。
          </p>
        </section>

        {/* 2. 故事: 3 段 text-prose, leading-[32px] 极简留白 (借鉴 minimaxi/about 多段正文) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">我们的故事</h2>
            <div className="text-base lg:text-lg text-text-secondary leading-[32px] space-y-6 max-w-3xl">
              <p>
                2020 年, 一群在外汇市场摸爬滚打多年的交易员决定做一件事: 把自己多年验证有效的策略、工具、工作流,
                全部用 MQL4 / MQL5 写出来, 源码可读、参数可调、风险可控。
                从 1 个 EA 文件、1 个微信群开始, 到现在每周更新、订阅制服务、链上结算。
              </p>
              <p>
                我们不做黑盒、也不卖承诺。每个 EA 源码可读, 每条策略有可回测的历史数据,
                每周有公开的运营周报, 每个订阅可终身质保维护。
                严选不是一句口号, 是我们对每一行代码、每一个产品、每一次支持的基本要求。
              </p>
              <p>
                现在, 我们的订阅者遍布 5 个时区, 从个人交易者到小型私募都在用同一套工具。
                他们问得最多的问题是: "下次更新什么时候" — 这就是我们继续做的最好答案。
              </p>
            </div>
          </div>
        </section>

        {/* 3. 核心价值: 4 行密集列表, 1px 底边线, 错落有致 (保留 Phase 6.1 表格风格, 不卡片化) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">核心价值</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {VALUES.map((v, i) => (
                  <div
                    key={i}
                    className={`group grid grid-cols-[60px_1fr_2fr] items-baseline gap-4 lg:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2`}
                  >
                    <span className="text-sm text-text-muted num font-mono">{v.n}</span>
                    <span className="text-base lg:text-lg font-semibold text-text-primary leading-[28px]">
                      {v.title}
                    </span>
                    <span className="text-sm lg:text-base text-text-secondary leading-[28px]">
                      {v.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 合作模式: 3 合作, 错落 1px 底边线 */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">合作模式</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {COOPERATION.map((c, i) => (
                  <div
                    key={i}
                    className="group grid grid-cols-[60px_1fr] items-baseline gap-4 lg:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
                  >
                    <span className="text-sm text-accent-blue num font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-base lg:text-lg font-semibold text-text-primary leading-[28px] mb-1">
                        {c.title}
                      </div>
                      <div className="text-sm lg:text-base text-text-secondary leading-[28px]">
                        {c.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. 产品体系: 2 分类, 列表 (保留 Phase 6.1 密集表格风格) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">产品体系</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                {PRODUCT_SYSTEM.map((p, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 md:gap-8 py-6 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors px-2 -mx-2"
                  >
                    <div className="text-base lg:text-lg font-semibold text-accent-blue leading-[28px]">
                      {p.title}
                    </div>
                    <ul className="space-y-2">
                      {p.items.map((item, j) => (
                        <li
                          key={j}
                          className="text-sm lg:text-base text-text-secondary leading-[28px] flex items-start gap-2"
                        >
                          <span className="text-text-muted shrink-0 mt-2 inline-block w-1 h-1 rounded-full bg-text-muted" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. 联系我们: 具体化 (QQ/微信/手机/邮箱) + 风险提示 (PM 排版铁律: 错落有致) */}
        <section className="py-12 lg:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16">
            <h2 className="text-sm text-text-muted tracking-widest uppercase">联系我们</h2>
            <div className="max-w-4xl">
              <div className="border-y border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="py-6 border-b md:border-b-0 md:border-r border-border px-2 -mx-2">
                    <div className="text-xs text-text-muted tracking-widest uppercase mb-2">官方微信</div>
                    <div className="text-base lg:text-lg text-text-primary font-mono">
                      {BRAND.contact.officialWechat}
                    </div>
                    <div className="text-xs text-text-muted mt-1">扫码添加, 备注来意</div>
                  </div>
                  <div className="py-6 px-2 -mx-2">
                    <div className="text-xs text-text-muted tracking-widest uppercase mb-2">QQ</div>
                    <div className="text-base lg:text-lg text-text-primary font-mono">
                      {BRAND.contact.qq}
                    </div>
                    <div className="text-xs text-text-muted mt-1">工作日 9:00 - 18:00</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
                  <div className="py-6 border-b md:border-b-0 md:border-r border-border px-2 -mx-2">
                    <div className="text-xs text-text-muted tracking-widest uppercase mb-2">手机</div>
                    <div className="text-base lg:text-lg text-text-primary font-mono">
                      {BRAND.contact.phone}
                    </div>
                    <div className="text-xs text-text-muted mt-1">仅限商务合作</div>
                  </div>
                  <div className="py-6 px-2 -mx-2">
                    <div className="text-xs text-text-muted tracking-widest uppercase mb-2">飞书</div>
                    <div className="text-base lg:text-lg text-text-primary font-mono">
                      {BRAND.contact.feishu}
                    </div>
                    <div className="text-xs text-text-muted mt-1">团队协同 / B 端合作</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-[24px] mt-6 max-w-2xl">
                风险提示: 量化交易存在固有风险, 过往业绩不代表未来表现。请根据自身风险承受能力理性投资,
                严选订阅不构成任何投资建议。市场有风险, 决策需谨慎。
              </p>
            </div>
          </div>
        </section>

        {/* 7. CTA: 留白底部 */}
        <section className="py-16 lg:py-24 border-t border-border text-center">
          <p className="text-sm text-text-muted tracking-widest uppercase mb-4">想深入了解?</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-6">
            从 {BRAND.name.zh} 开始, 搭起你的量化基础设施
          </h3>
          <a
            href="/membership"
            className="inline-flex items-center gap-2 btn-primary text-base px-6 py-3"
          >
            查看订阅方案 →
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
