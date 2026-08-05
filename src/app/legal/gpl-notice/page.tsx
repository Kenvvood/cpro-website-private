// src/app/legal/gpl-notice/page.tsx
// task052 L4: TV 风拉平 (max-w-7xl + card-base + accent-* 语义色)
import Link from "next/link";

export const metadata = {
  title: "免责声明 - CProTrading 城诺科技",
};

const LICENSE_RISKS = [
  { name: "GPL-3 / GPL-2", constraint: "强 copyleft", treatment: "仅合规再分发，不并入自有商业 EA" },
  { name: "Apache-2.0 / MIT / BSD", constraint: "宽松", treatment: "合规再分发 + 可商用" },
  { name: "LGPL", constraint: "动态链接宽松", treatment: "动态链接场景合规" },
  { name: "MPL-2.0", constraint: "文件级 copyleft", treatment: "文件级合规" },
  { name: "No-License / Unknown", constraint: "不可商用集成", treatment: "仅供合规再分发" },
  { name: "Proprietary", constraint: "专有", treatment: "需原作者明确授权" },
];

export default function GplNoticePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text-primary">免责声明与开源合规声明</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-07-30</p>
        </header>

        {/* 金融免责（最高优先级） */}
        <section className="card-base p-5 border-l-4 border-l-accent-down mb-8">
          <h2 className="text-lg font-semibold mt-0 mb-3 text-accent-down">⚠️ 量化交易高风险警示</h2>
          <p className="text-sm text-text-primary font-semibold mb-2">
            CProTrading 提供的所有策略与指标源文件仅作编程学习与历史数据回测用途。
            实盘市场环境复杂多变，任何使用本站工具导致的交易亏损均由用户自行承担。
          </p>
          <p className="text-xs text-text-secondary">
            本平台不对任何直接或间接的资金损失承担责任。请在充分回测、模拟盘验证后，再考虑实盘部署。
          </p>
        </section>

        {/* 开源合规再分发 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-text-primary">开源合规再分发说明</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              本平台开源专区收录的资源，其原始版权归原作者所有。
              CProTrading 依据开源协议（如 GPL-3、Apache-2.0、MIT、BSD 等）进行合规再分发，并附加技术中性的署名标识。
            </p>
            <p>
              已下载者可按原始协议条款自由再分发，须保留原作者版权声明与协议副本。
              本平台不对第三方资源的准确性、完整性或可用性做任何担保。
            </p>
          </div>
        </section>

        {/* 协议风险提示 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-text-primary">协议风险提示</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">协议</th>
                  <th className="text-left px-4 py-3 font-medium">使用约束</th>
                  <th className="text-left px-4 py-3 font-medium">本平台处置</th>
                </tr>
              </thead>
              <tbody>
                {LICENSE_RISKS.map((r) => (
                  <tr key={r.name} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.constraint}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.treatment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="text-lg font-semibold mt-0 mb-3 text-text-primary">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            品宣与商务合作: 微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            法律与原创维权: 微信 <code className="font-mono">Lookee333</code>（留言 24 小时内响应）
          </p>
          <p className="text-xs text-text-muted mt-3">
            上述联系方式为 CProTrading 城诺科技官方唯一对外联络渠道。
          </p>
        </section>

        <p className="text-xs text-text-muted">
          返回 <Link href="/open-source" className="text-accent-blue hover:underline">开源专区</Link>
        </p>
      </main>
    </div>
  );
}