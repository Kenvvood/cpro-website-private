// src/app/legal/privacy/page.tsx
// v22.0 PATCH 17.1: 隐私政策 (网安法 + GDPR + 个保法)
import Link from "next/link";

export const metadata = {
  title: "隐私政策 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技隐私政策：数据收集、Cookie、第三方、用户权利、联系方式",
};

const DATA_TYPES = [
  { name: "账号信息", items: "邮箱、手机号、密码（bcrypt 加密）", purpose: "注册登录、身份验证" },
  { name: "订单信息", items: "USDT 钱包地址、订单号、交易哈希", purpose: "支付履约、退款核实" },
  { name: "行为日志", items: "IP、访问时间、UA、页面路径", purpose: "安全审计、限流防刷" },
  { name: "设备信息", items: "浏览器类型、操作系统、屏幕尺寸", purpose: "响应式适配、性能优化" },
];

const USER_RIGHTS = [
  { right: "知情权", desc: "了解平台收集哪些数据、用途、保留期" },
  { right: "访问权", desc: "通过 /account 查看 / 导出个人数据" },
  { right: "更正权", desc: "账号信息错误可联系客服修正" },
  { right: "删除权", desc: "可申请注销账号, 7 个工作日内物理删除" },
  { right: "撤回授权", desc: "撤回 Cookie / 营销邮件 / 短信推送" },
  { right: "投诉权", desc: "可向网信办 / 市场监管局投诉" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">隐私政策</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 生效日期: 2026-08-15</p>
        </header>

        {/* 顶部重要提示 */}
        <section className="card-base p-5 border-l-4 border-l-accent-blue mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-blue">📌 政策要点</h2>
          <p className="text-sm text-text-primary mb-2">
            CProTrading 城诺科技 (以下简称"我们") 严格遵守《中华人民共和国网络安全法》《中华人民共和国个人信息保护法》《GDPR》等法律法规。
          </p>
          <p className="text-xs text-text-secondary">
            本政策说明我们如何收集、使用、存储、共享和保护您的个人信息。使用本平台即视为同意本政策全部条款。
          </p>
        </section>

        {/* 1. 数据收集 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. 数据收集</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">数据类型</th>
                  <th className="text-left px-4 py-3 font-medium">具体内容</th>
                  <th className="text-left px-4 py-3 font-medium">使用目的</th>
                </tr>
              </thead>
              <tbody>
                {DATA_TYPES.map((d) => (
                  <tr key={d.name} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{d.items}</td>
                    <td className="px-4 py-3 text-text-secondary">{d.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 数据使用 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 数据使用</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>我们仅在以下场景使用您的数据：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>提供、维护、改进平台服务 (登录、下单、下载、客服)</li>
              <li>安全审计、风险控制、欺诈防范 (限流、防刷、IP 黑名单)</li>
              <li>法律法规要求的合规存档 (订单保存 ≥ 3 年)</li>
              <li>经您明示同意的其他用途 (营销推送、调研问卷)</li>
            </ul>
            <p className="font-semibold text-text-primary">我们承诺：不出售您的个人信息给第三方；不用于平台服务以外的其他商业目的。</p>
          </div>
        </section>

        {/* 3. 数据共享 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. 数据共享</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>仅在以下必要情况下共享您的数据：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-text-primary">阿里云 SMS</strong>：发送验证码（仅手机号）</li>
              <li><strong className="text-text-primary">TronGrid / BscScan</strong>：链上交易验证（仅订单相关的钱包地址 + 交易哈希）</li>
              <li><strong className="text-text-primary">公安 / 司法</strong>：法律法规要求的协查、刑事调查</li>
              <li><strong className="text-text-primary">您主动公开</strong>：评论、点赞、转发等公开内容</li>
            </ul>
          </div>
        </section>

        {/* 4. 数据存储 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 数据存储</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              <strong className="text-text-primary">存储位置</strong>：阿里云 ECS 广州节点 (cn-guangzhou)，中国境内。
            </p>
            <p>
              <strong className="text-text-primary">保留期限</strong>：
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>账号信息：注销后 7 个工作日内物理删除（法律要求保留的除外）</li>
              <li>订单记录：3 年（电商法要求）</li>
              <li>行为日志：90 天（安全审计）</li>
            </ul>
            <p>
              <strong className="text-text-primary">安全措施</strong>：HTTPS 全链路加密 · bcrypt 密码哈希 · SQLite 文件权限 600 · ECS 安全组最小化开放。
            </p>
          </div>
        </section>

        {/* 5. 用户权利 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 您的权利</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">权利</th>
                  <th className="text-left px-4 py-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {USER_RIGHTS.map((u) => (
                  <tr key={u.right} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{u.right}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Cookie */}
        <section className="mb-8">
          <h2 className="h2 mb-3">6. Cookie 使用</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>我们使用 Cookie 和类似技术，详见 <Link href="/legal/cookies" className="text-accent-blue hover:underline">Cookie 政策</Link>。</p>
            <p>您可通过浏览器设置拒绝或删除 Cookie，但这可能导致部分功能不可用。</p>
          </div>
        </section>

        {/* 7. 未成年人 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">7. 未成年人保护</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>本平台不向 18 岁以下未成年人提供服务。如发现未成年用户，我们将立即关闭账号并删除相关数据。</p>
          </div>
        </section>

        {/* 8. 政策变更 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">8. 政策变更</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>我们保留根据法律法规变化、业务调整需要修改本政策的权利。重大变更将通过站内信、邮件、短信等方式提前 7 天通知。</p>
          </div>
        </section>

        {/* 9. 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">9. 联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            隐私政策咨询 / 数据删除申请 / 投诉举报：微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            工作时间：周一至周五 9:00-18:00（国家法定节假日除外）
          </p>
          <p className="text-sm text-text-secondary mb-2">
            一般咨询：24 小时内回复 · 数据删除申请：7 个工作日内处理
          </p>
          <p className="text-xs text-text-muted mt-3">
            上述联系方式为 CProTrading 城诺科技官方唯一对外联络渠道。
          </p>
        </section>

        <p className="text-xs text-text-muted">
          返回 <Link href="/content" className="text-accent-blue hover:underline">大航海时代</Link>
        </p>
      </main>
    </div>
  );
}
