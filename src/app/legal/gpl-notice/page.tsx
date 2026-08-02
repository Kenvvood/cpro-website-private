// src/app/legal/gpl-notice/page.tsx
// 金融免责 + 开源合规声明 (task-0040, PM 7/30 拍板)
import Link from "next/link";

export const metadata = {
  title: "免责声明 - CProTrading 城诺科技",
};

export default function GplNoticePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 prose dark:prose-invert">
      <h1>免责声明与开源合规声明</h1>
      <p className="text-sm text-muted-foreground">最后更新: 2026-07-30</p>

      {/* === 金融免责（最高优先级） === */}
      <section className="mt-6 p-4 rounded border-2 border-red-500/40 bg-red-500/5">
        <h2 className="text-red-700 dark:text-red-400 mt-0">⚠️ 量化交易高风险警示</h2>
        <p className="font-semibold">
          CProTrading 提供的所有策略与指标源文件仅作编程学习与历史数据回测用途。
          实盘市场环境复杂多变，任何使用本站工具导致的交易亏损，均由用户自行承担。
        </p>
        <p className="text-sm mt-2">
          本平台不对任何直接或间接的资金损失承担责任。请在充分回测、模拟盘验证后，再考虑实盘部署。
        </p>
      </section>

      {/* === 开源合规再分发（次重要） === */}
      <section className="mt-8">
        <h2>开源合规再分发说明</h2>
        <p>
          本平台开源专区收录的资源，其原始版权归原作者所有。
          CProTrading 依据开源协议（如 GPL-3、Apache-2.0、MIT、BSD 等）进行合规再分发，并附加技术中性的署名标识。
        </p>
        <p>
          已下载者可按原始协议条款自由再分发，须保留原作者版权声明与协议副本。
          本平台不对第三方资源的准确性、完整性或可用性做任何担保。
        </p>
      </section>

      {/* === 协议风险提示 === */}
      <section className="mt-8">
        <h2>协议风险提示</h2>
        <table className="text-xs">
          <thead><tr><th>协议</th><th>使用约束</th><th>本平台处置</th></tr></thead>
          <tbody>
            <tr><td>GPL-3 / GPL-2</td><td>强 copyleft</td><td>仅合规再分发，不并入自有商业 EA</td></tr>
            <tr><td>Apache-2.0 / MIT / BSD</td><td>宽松</td><td>合规再分发 + 可商用</td></tr>
            <tr><td>LGPL</td><td>动态链接宽松</td><td>动态链接场景合规</td></tr>
            <tr><td>MPL-2.0</td><td>文件级 copyleft</td><td>文件级合规</td></tr>
            <tr><td>No-License / Unknown</td><td>不可商用集成</td><td>仅供合规再分发</td></tr>
            <tr><td>Proprietary</td><td>专有</td><td>需原作者明确授权</td></tr>
          </tbody>
        </table>
      </section>

      {/* === 联系方式 === */}
      <section className="mt-8 p-4 rounded border border-border bg-muted/30">
        <h2 className="mt-0">联系方式</h2>
        <p className="text-sm">
          品宣与商务合作：微信 <code>Lookee333</code>
          <br />
          法律与原创维权：微信 <code>Lookee333</code>（留言 24 小时内响应）
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          上述联系方式为 CProTrading 城诺科技官方唯一对外联络渠道。
        </p>
      </section>

      <hr />
      <p className="text-xs text-muted-foreground">
        {"返回"}{" "}
        <Link href="/open-source" className="underline">
          开源专区
        </Link>
      </p>
    </div>
  );
}