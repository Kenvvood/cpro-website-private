// src/app/legal/disclaimer/page.tsx
// v22.0 PATCH 17.5: 免责声明 (全平台统一金融免责)
import Link from "next/link";

export const metadata = {
  title: "免责声明 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技免责声明：金融风险、技术资源、第三方服务、法律责任限制",
};

const DISCLAIMER_SCOPES = [
  {
    name: "金融交易风险",
    desc: "金融市场存在高风险, 历史业绩不代表未来表现, 实盘交易盈亏均由用户自行承担",
    coverage: "所有 EA / 指标 / 教程 / 研报",
  },
  {
    name: "技术资源用途",
    desc: "本平台资源仅供编程学习、历史数据回测、技术交流用途, 不构成投资建议",
    coverage: "所有源码、文档、教程、案例",
  },
  {
    name: "第三方服务",
    desc: "MT4/MT5 平台、TronGrid/BscScan API、阿里云 SMS 等第三方服务的稳定性、安全性由其各自负责",
    coverage: "支付通道、短信、链上验证",
  },
  {
    name: "AI 生成内容",
    desc: "AI 生成的研报、教程、文案可能存在错误或过时信息, 用户应自行核实后再做决策",
    coverage: "AI 辅助生成的教程、研报、答疑",
  },
];

const LIABILITY_LIMITS = [
  "因网络中断、系统故障、不可抗力导致的服务不可用",
  "因用户操作失误、未充分回测、未做风险评估导致的交易亏损",
  "因第三方支付渠道 (USDT 链上) 故障导致的交易延迟或失败",
  "因黑客攻击、病毒入侵、密码泄露导致的安全事件",
  "因法律法规变更导致的业务调整",
  "因开源协议 (GPL-3 / Apache-2.0 / MIT) 引起的版权争议",
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">免责声明</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 生效日期: 2026-08-15</p>
        </header>

        {/* 最高优先级警示 */}
        <section className="card-base p-5 border-l-4 border-l-accent-down mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-down">⚠️ 量化交易高风险警示</h2>
          <p className="text-sm text-text-primary font-semibold mb-2">
            CProTrading 城诺科技 (以下简称"本平台") 提供的所有策略、指标、教程、研报、EA 工具仅作编程学习与历史数据回测用途。
          </p>
          <p className="text-xs text-text-secondary">
            实盘市场环境复杂多变, 任何使用本站工具导致的交易亏损均由用户自行承担。
            本平台不对任何直接或间接的资金损失承担责任。
          </p>
        </section>

        {/* 1. 免责声明范围 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. 免责声明范围</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">范畴</th>
                  <th className="text-left px-4 py-3 font-medium">说明</th>
                  <th className="text-left px-4 py-3 font-medium">覆盖范围</th>
                </tr>
              </thead>
              <tbody>
                {DISCLAIMER_SCOPES.map((d) => (
                  <tr key={d.name} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{d.desc}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{d.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 投资风险提示 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 投资风险提示</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              <strong className="text-text-primary">外汇 / 黄金 / 数字货币 交易存在高风险</strong>，包括但不限于：
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>市场波动风险：价格剧烈波动可能导致重大亏损</li>
              <li>杠杆风险：高杠杆放大亏损, 可能超过初始投入</li>
              <li>流动性风险：极端行情下可能无法平仓</li>
              <li>技术风险：网络延迟、断电、平台故障可能造成损失</li>
              <li>政策风险：监管政策变化可能影响交易</li>
            </ul>
            <p className="font-semibold text-accent-down mt-3">
              请在充分了解风险、模拟盘验证、风险承受范围内进行实盘交易。
            </p>
          </div>
        </section>

        {/* 3. 责任限制 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. 责任限制</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p className="mb-3">在任何情况下，本平台不对以下情况承担责任：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {LIABILITY_LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-3">
              本平台对用户承担的最高责任, 不超过用户在争议事件发生前 12 个月内实际支付给本平台的服务费用。
            </p>
          </div>
        </section>

        {/* 4. 信息准确性 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 信息准确性</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>本平台致力于提供准确、完整、及时的信息，但不对以下情况作保证：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>教程、研报的准确性和时效性</li>
              <li>EA / 指标的回测数据与实盘表现的一致性</li>
              <li>第三方链接、API 数据、政策法规的真实性</li>
            </ul>
            <p>用户应自行核实后再做决策。</p>
          </div>
        </section>

        {/* 5. 第三方资源 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 第三方资源</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>本平台部分资源来源于 GitHub、algo-forge 等开源渠道, 知识产权归原作者所有。本平台依据开源协议合规再分发, 不对原作者资源的准确性、完整性、可用性承担责任。详见 <Link href="/legal/gpl-notice" className="text-accent-blue hover:underline">GPL 声明</Link>。</p>
          </div>
        </section>

        {/* 6. 法律适用 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">6. 法律适用</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>本免责声明适用中华人民共和国大陆地区法律。因使用本平台资源产生的争议, 由双方友好协商解决; 协商不成的, 任一方可向本平台所在地 (广州市) 有管辖权的人民法院提起诉讼。</p>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            免责声明咨询：微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary">
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
