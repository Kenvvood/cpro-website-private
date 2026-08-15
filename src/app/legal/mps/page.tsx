// src/app/legal/mps/page.tsx
// v22.0 PATCH 17.6: 公安联网备案 (公安部令第33号)
import Link from "next/link";

export const metadata = {
  title: "公安联网备案 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技公安联网备案信息：备案号、备案主体、网络拓扑、安全等级保护",
};

const FILING_INFO = [
  { key: "备案主体", value: "[MPS_ENTITY_TBD]" },
  { key: "备案号", value: "[MPS_FILING_NUMBER_TBD]" },
  { key: "备案类型", value: "非经营性网站" },
  { key: "服务类型", value: "互联网信息服务" },
  { key: "接入方式", value: "阿里云 ECS (cn-guangzhou)" },
  { key: "网站域名", value: "cprotrading.com / www.cprotrading.com" },
  { key: "网站名称", value: "城诺科技 - CProTrading 量化交易基础设施" },
  { key: "备案状态", value: "待 PM 完成备案后回填" },
];

const SECURITY_MEASURES = [
  { name: "HTTPS 全链路加密", desc: "Let's Encrypt SSL 证书, 强制 301 跳转" },
  { name: "CSRF 防护", desc: "NextAuth 内置 CSRF token 校验" },
  { name: "限流防刷", desc: "Upstash Redis 滑动窗口 (IP 1/min, phone 5/h)" },
  { name: "数据加密", desc: "密码 bcrypt 哈希, 敏感字段加密存储" },
  { name: "操作审计", desc: "90 天行为日志, 异常登录报警" },
  { name: "安全等级保护", desc: "等级保护三级 (建设中, 视情况后补)" },
];

export default function MpsPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">公安联网备案</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 依据《计算机信息系统国际联网安全保护管理办法》(公安部令第33号)</p>
        </header>

        {/* 重要提示 */}
        <section className="card-base p-5 border-l-4 border-l-accent-blue mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-blue">🛡️ 公安联网备案</h2>
          <p className="text-sm text-text-primary mb-2">
            CProTrading 城诺科技严格遵守《计算机信息系统国际联网安全保护管理办法》, 已向公安机关申请公安联网备案。
          </p>
          <p className="text-xs text-text-secondary">
            公安联网备案号将在 PM 完成备案流程后回填, 预计 2-3 周。
          </p>
        </section>

        {/* 1. 备案信息 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. 备案信息</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">项目</th>
                  <th className="text-left px-4 py-3 font-medium">内容</th>
                </tr>
              </thead>
              <tbody>
                {FILING_INFO.map((f) => (
                  <tr key={f.key} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{f.key}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {f.value.startsWith('[') ? (
                        <span className="text-accent-gold font-mono text-xs">{f.value}</span>
                      ) : (
                        f.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 网络拓扑 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 网络拓扑</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <pre className="font-mono text-xs bg-bg-tertiary p-4 rounded overflow-x-auto">
{`[用户浏览器]
    ↓ HTTPS (443, Let's Encrypt SSL)
[阿里云 CDN (可选, 待启用)]
    ↓
[阿里云 SLB / Nginx (ECS 广州 8.163.74.235)]
    ↓ HTTP (3000, 内网)
[Next.js 16 Application (pm2 cpro-web)]
    ↓
[Prisma 7 + SQLite (本地 dev.db, 6.5MB)]
    ↓
[Upstash Redis (限流 + 验证码)]`}
            </pre>
            <p>
              <strong className="text-text-primary">服务器位置</strong>：阿里云广州节点 (cn-guangzhou)
            </p>
            <p>
              <strong className="text-text-primary">实例 ID</strong>：i-7xvi7nrr9ehkrkjd0fxf
            </p>
            <p>
              <strong className="text-text-primary">公网 IP</strong>：8.163.74.235 (阿里云 ECS 公网 IP 弹性可漂移)
            </p>
          </div>
        </section>

        {/* 3. 安全措施 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. 信息安全措施</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">安全措施</th>
                  <th className="text-left px-4 py-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {SECURITY_MEASURES.map((s) => (
                  <tr key={s.name} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 备案流程 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 公安联网备案流程</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>依据《计算机信息系统国际联网安全保护管理办法》, 备案流程如下：</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>完成 ICP 备案 (前置条件, 工信部审核)</li>
              <li>登录全国互联网安全管理服务平台 https://beian.mps.gov.cn</li>
              <li>法人 / 负责人实名认证 (微信扫码 + 身份证)</li>
              <li>提交备案申请 (营业执照 + 法人身份证 + 网络拓扑图)</li>
              <li>公安机关审核 (5-10 工作日)</li>
              <li>现场 / 电话核验 (1-3 天)</li>
              <li>获取备案号 (京公网安备 XXXXXXX 号)</li>
              <li>备案号回填到 footer + 本页面</li>
            </ol>
            <p className="font-semibold text-text-primary">预计完成时间: 2-3 周 (从 PM 启动之日起)</p>
          </div>
        </section>

        {/* 5. 法规依据 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 法规依据</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>《计算机信息系统国际联网安全保护管理办法》(公安部令第33号)</li>
              <li>《中华人民共和国网络安全法》(2017 年 6 月 1 日起施行)</li>
              <li>《互联网信息服务管理办法》(国务院令第292号)</li>
              <li>《信息安全技术 网络安全等级保护基本要求》(GB/T 22239-2019)</li>
            </ul>
          </div>
        </section>

        {/* 6. 违规处罚 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">6. 违规处罚</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-accent-down">依据公安部令第33号, 未办理公安联网备案的处罚：</p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
              <li>罚款 1-10 万元</li>
              <li>责令关闭网站</li>
              <li>责任人拘留 5-15 天</li>
              <li>情节严重的, 追究刑事责任</li>
            </ul>
            <p className="mt-3">本平台严格遵守法规要求, 主动完成公安联网备案, 保障用户权益与平台合规运营。</p>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            备案咨询 / 违规举报：微信 <code className="font-mono">Lookee333</code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            工作时间：周一至周五 9:00-18:00（国家法定节假日除外）
          </p>
          <p className="text-xs text-text-muted mt-3">
            本页面信息将根据备案进度实时更新, 请以最新的备案状态为准。
          </p>
        </section>

        <p className="text-xs text-text-muted">
          返回 <Link href="/content" className="text-accent-blue hover:underline">大航海时代</Link>
        </p>
      </main>
    </div>
  );
}
