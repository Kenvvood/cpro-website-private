// src/app/legal/refund/page.tsx
// v22.0 PATCH 17.3: 退款政策 (7 天无理由 + 链上退款)
import Link from "next/link";

export const metadata = {
  title: "退款政策 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技退款政策：7 天无理由退款、退款流程、退款范围、争议处理",
};

const REFUND_RULES = [
  { scenario: "7 天内未使用", desc: "购买后 7 天内, 未下载、未使用订阅 → 全额退款" },
  { scenario: "7 天内已下载", desc: "购买后 7 天内, 已下载资源 → 扣除 20% 资源占用费, 退 80%" },
  { scenario: "7 天后", desc: "超过 7 天 → 不可退款 (订阅服务按比例不可退)" },
  { scenario: "工具故障", desc: "工具经核实存在技术故障且无法修复 → 全额退款" },
  { scenario: "服务未提供", desc: "因平台原因未提供约定的服务 → 全额退款" },
];

const REFUND_EXCLUDE = [
  "已下载并确认无误的 EA / 指标资源 (超过 24 小时)",
  "已使用订阅权益 (下载 ≥ 3 个资源, 或订阅时长过半)",
  "数字资源已被复制、转售、传播给第三方",
  "因用户自身原因 (网络环境、MT4/MT5 配置不当) 无法使用",
  "用户违反服务条款导致账号被封禁",
  "链上 USDT 退款因钱包地址错误、Gas 不足导致的失败",
];

const REFUND_FLOW = [
  { step: "1", title: "提交申请", desc: "/dashboard/refunds 提交退款申请, 填写订单号、退款原因" },
  { step: "2", title: "客服审核", desc: "客服 1-3 个工作日内审核, 核实订单状态、资源使用情况" },
  { step: "3", title: "链上退款", desc: "审核通过后, 通过原支付通道 (USDT TRC20/BEP20) 全额/部分退款" },
  { step: "4", title: "到账确认", desc: "链上交易 1-60 分钟到账 (视网络拥堵情况), 客服协助核实" },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">退款政策</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 生效日期: 2026-08-15</p>
        </header>

        {/* 政策要点 */}
        <section className="card-base p-5 border-l-4 border-l-accent-up mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-up">✅ 7 天无理由退款</h2>
          <p className="text-sm text-text-primary font-semibold mb-2">
            CProTrading 城诺科技承诺：购买后 7 天内, 符合条件即可申请退款。
          </p>
          <p className="text-xs text-text-secondary">
            本政策符合《中华人民共和国消费者权益保护法》《网络购买商品七日无理由退货暂行办法》等法规要求。
          </p>
        </section>

        {/* 1. 退款规则 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. 退款规则</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">场景</th>
                  <th className="text-left px-4 py-3 font-medium">退款额度</th>
                </tr>
              </thead>
              <tbody>
                {REFUND_RULES.map((r) => (
                  <tr key={r.scenario} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{r.scenario}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 退款流程 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 退款流程</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REFUND_FLOW.map((s) => (
              <div key={s.step} className="card-base p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-up/10 text-accent-up flex items-center justify-center text-lg font-bold shrink-0">
                    {s.step}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-text-primary mb-1">{s.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 不予退款 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. 不予退款情形</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p className="mb-3">以下情形不予退款：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {REFUND_EXCLUDE.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. 退款方式 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 退款方式</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              <strong className="text-text-primary">退款通道</strong>：原支付通道 USDT 链上转账 (TRC20 / BEP20)。
            </p>
            <p>
              <strong className="text-text-primary">到账时间</strong>：审核通过后 1-3 个工作日内发起链上转账, 视网络拥堵 1-60 分钟到账。
            </p>
            <p>
              <strong className="text-text-primary">手续费</strong>：链上 Gas 费由平台承担, 不从退款额中扣除。
            </p>
            <p>
              <strong className="text-text-primary">退款币种</strong>：USDT (按退款申请时链上汇率折算)。
            </p>
          </div>
        </section>

        {/* 5. 争议处理 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 争议处理</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>如对退款结果有异议：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>通过微信 <code className="font-mono">Lookee333</code> 联系客服, 提供订单号、退款申请号</li>
              <li>客服 3 个工作日内复核, 给出最终结论</li>
              <li>对复核结果仍不满意的, 可向消费者协会 / 市场监管局投诉</li>
            </ul>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            退款咨询 / 投诉处理：微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            工作时间：周一至周五 9:00-18:00（国家法定节假日除外）
          </p>
          <p className="text-sm text-text-secondary">
            提交入口：<Link href="/dashboard/refunds" className="text-accent-blue hover:underline">/dashboard/refunds</Link>（需登录）
          </p>
        </section>

        <p className="text-xs text-text-muted">
          返回 <Link href="/content" className="text-accent-blue hover:underline">大航海时代</Link>
        </p>
      </main>
    </div>
  );
}
