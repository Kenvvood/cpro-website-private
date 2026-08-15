// src/app/legal/terms/page.tsx
// v22.0 PATCH 17.2: 服务条款 (用户协议)
import Link from "next/link";

export const metadata = {
  title: "服务条款 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技服务条款：账号使用、付费订阅、知识产权、争议解决",
};

const ACCOUNT_RULES = [
  { rule: "一人一号", desc: "每个用户仅可注册一个账号，多账号行为视为违规" },
  { rule: "真实信息", desc: "注册信息须真实有效，虚假信息将被封禁" },
  { rule: "密码安全", desc: "用户自行负责密码保管，丢失需通过手机验证重置" },
  { rule: "禁止转让", desc: "账号、订阅、下载权限不可转让、出借、出售" },
  { rule: "禁止滥用", desc: "禁止爬虫、批量下载、绕过限流等行为" },
];

const PROHIBITED = [
  "发布违反国家法律法规的内容",
  "发布涉及政治、宗教、色情、暴力的内容",
  "利用平台从事洗钱、传销、诈骗等违法活动",
  "恶意刷单、刷量、刷评论，干扰平台正常运营",
  "未经授权将平台资源用于商业转售",
  "通过技术手段绕过付费墙、限流、验证码等安全机制",
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">服务条款</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 生效日期: 2026-08-15</p>
        </header>

        {/* 重要提示 */}
        <section className="card-base p-5 border-l-4 border-l-accent-gold mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-gold">📜 用户协议</h2>
          <p className="text-sm text-text-primary font-semibold mb-2">
            欢迎使用 CProTrading 城诺科技 (以下简称"本平台")。
            请仔细阅读本服务条款，注册或使用本平台即视为您同意接受本条款全部约束。
          </p>
          <p className="text-xs text-text-secondary">
            如您不同意本条款任何内容，请立即停止使用本平台并注销账号。
          </p>
        </section>

        {/* 1. 服务说明 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. 服务说明</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>CProTrading 城诺科技是一家量化交易工具销售与服务平台，提供：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>MT4 / MT5 量化交易 EA (Expert Advisor) 工具销售</li>
              <li>开源 EA / 指标 / 脚本 的合规再分发</li>
              <li>量化交易教程、研报、实战案例</li>
              <li>会员订阅服务 (按周 / 按月 / 按年)</li>
              <li>USDT (TRC20 / BEP20) 支付与退款</li>
            </ul>
            <p className="font-semibold text-text-primary">本平台不对用户盈亏负责，所有工具仅供技术交流与回测用途。</p>
          </div>
        </section>

        {/* 2. 账号使用规则 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 账号使用规则</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">规则</th>
                  <th className="text-left px-4 py-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_RULES.map((r) => (
                  <tr key={r.rule} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{r.rule}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 订阅与付费 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. 订阅与付费</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              <strong className="text-text-primary">订阅档位</strong>：周订阅 (WEEKLY) / 月订阅 (MONTHLY) / 年订阅 (ANNUAL)，详见 <Link href="/membership" className="text-accent-blue hover:underline">会员订阅页</Link>。
            </p>
            <p>
              <strong className="text-text-primary">支付方式</strong>：USDT (TRC20 / BEP20)，按实时汇率换算。
            </p>
            <p>
              <strong className="text-text-primary">订阅生效</strong>：链上交易确认后立即生效，到期自动失效。
            </p>
            <p>
              <strong className="text-text-primary">退款政策</strong>：详见 <Link href="/legal/refund" className="text-accent-blue hover:underline">退款政策</Link>。
            </p>
          </div>
        </section>

        {/* 4. 禁止行为 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 禁止行为</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p className="mb-3">您承诺不得从事以下行为：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {PROHIBITED.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="font-semibold text-accent-down mt-3">一经发现，本平台有权立即封禁账号并保留追究法律责任的权利。</p>
          </div>
        </section>

        {/* 5. 知识产权 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 知识产权</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>本平台的 UI 设计、品牌标识、文案内容、原创教程等知识产权归 CProTrading 城诺科技所有。</p>
            <p>开源 EA / 指标 / 脚本 的知识产权归原作者所有，本平台依据开源协议 (GPL-3 / Apache-2.0 / MIT / BSD 等) 进行合规再分发，详见 <Link href="/legal/gpl-notice" className="text-accent-blue hover:underline">GPL 声明</Link>。</p>
            <p>未经授权不得复制、修改、传播、销售本平台任何资源。</p>
          </div>
        </section>

        {/* 6. 免责声明 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">6. 免责声明</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>本平台资源仅供技术交流与回测用途。金融市场存在高风险，使用本平台任何工具进行的实盘交易，盈亏均由用户自行承担。</p>
            <p className="mt-2">本平台不对以下情况承担责任：</p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-1">
              <li>因网络中断、系统故障、不可抗力导致的服务中断</li>
              <li>因用户操作失误、未充分回测导致的交易亏损</li>
              <li>第三方支付渠道 (USDT 链上) 故障导致的交易延迟</li>
              <li>黑客攻击、病毒入侵等安全事件</li>
            </ul>
            <p className="mt-2">详见 <Link href="/legal/disclaimer" className="text-accent-blue hover:underline">免责声明</Link>。</p>
          </div>
        </section>

        {/* 7. 条款变更 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">7. 条款变更与终止</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>我们保留根据法律法规、业务调整需要修改本条款的权利。重大变更将通过站内信、邮件、短信等方式提前 7 天通知。</p>
            <p>如您违反本条款任何规定，我们有权立即终止您的账号、订阅、下载权限，且不退还已支付费用。</p>
          </div>
        </section>

        {/* 8. 争议解决 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">8. 法律适用与争议解决</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>本条款适用中华人民共和国大陆地区法律。因本条款或本平台服务产生的争议，双方应友好协商解决；协商不成的，任一方可向 CProTrading 城诺科技所在地 (广州市) 有管辖权的人民法院提起诉讼。</p>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            条款咨询 / 违规举报：微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            工作时间：周一至周五 9:00-18:00（国家法定节假日除外）
          </p>
        </section>

        <p className="text-xs text-text-muted">
          返回 <Link href="/content" className="text-accent-blue hover:underline">大航海时代</Link>
        </p>
      </main>
    </div>
  );
}
