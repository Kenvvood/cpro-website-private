// src/app/legal/cookies/page.tsx
// v22.0 PATCH 17.4: Cookie 政策 (网安法 + GDPR)
import Link from "next/link";

export const metadata = {
  title: "Cookie 政策 - CProTrading 城诺科技",
  description: "CProTrading 城诺科技 Cookie 政策：必要 Cookie、分析 Cookie、第三方 Cookie、用户选择",
};

const COOKIE_TYPES = [
  {
    name: "必要 Cookie",
    desc: "保障平台基础功能 (登录态、CSRF 防护、购物车)",
    required: true,
    examples: "next-auth.session-token · __csrf · cart-id",
  },
  {
    name: "偏好 Cookie",
    desc: "记忆用户偏好 (语言、主题、字体大小)",
    required: false,
    examples: "lang · theme · font-size",
  },
  {
    name: "分析 Cookie",
    desc: "统计访问量、页面停留、用户行为, 用于性能优化",
    required: false,
    examples: "_ga (Google Analytics) · _gid · baidu_stat",
  },
  {
    name: "营销 Cookie",
    desc: "个性化推荐、广告投放、跨站追踪",
    required: false,
    examples: "facebook_pixel · _fbp · baidu_clb",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="h1 mb-2">Cookie 政策</h1>
          <p className="text-xs text-text-muted">最后更新: 2026-08-15 · 生效日期: 2026-08-15</p>
        </header>

        {/* 重要提示 */}
        <section className="card-base p-5 border-l-4 border-l-accent-blue mb-8">
          <h2 className="h2 mt-0 mb-3 text-accent-blue">🍪 什么是 Cookie</h2>
          <p className="text-sm text-text-primary mb-2">
            Cookie 是浏览器在您访问网站时存储在您设备上的小型文本文件。
            我们使用 Cookie 保障平台基础功能、记住您的偏好、分析访问数据。
          </p>
          <p className="text-xs text-text-secondary">
            本政策说明我们使用哪些 Cookie、为什么使用、如何选择。详见 <Link href="/legal/privacy" className="text-accent-blue hover:underline">隐私政策</Link>。
          </p>
        </section>

        {/* 1. Cookie 分类 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">1. Cookie 分类</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">类型</th>
                  <th className="text-left px-4 py-3 font-medium">用途</th>
                  <th className="text-left px-4 py-3 font-medium">是否必需</th>
                  <th className="text-left px-4 py-3 font-medium">示例</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TYPES.map((c) => (
                  <tr key={c.name} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.desc}</td>
                    <td className="px-4 py-3">
                      {c.required ? (
                        <span className="inline-flex items-center px-2 py-1 bg-accent-up/10 text-accent-up text-[10px] font-semibold rounded">
                          必需
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-text-muted/10 text-text-muted text-[10px] font-semibold rounded">
                          可选
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs font-mono">{c.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 第三方 Cookie */}
        <section className="mb-8">
          <h2 className="h2 mb-3">2. 第三方 Cookie</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>部分 Cookie 由第三方服务设置，用于以下目的：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-text-primary">NextAuth</strong>：会话管理 (登录态、OAuth token)</li>
              <li><strong className="text-text-primary">sonner</strong>：UI 通知 (toast 状态)</li>
              <li><strong className="text-text-primary">阿里云</strong>：ECS 健康检查、CDN 加速</li>
            </ul>
            <p>我们承诺：未经您明示同意，不使用第三方营销 Cookie。</p>
          </div>
        </section>

        {/* 3. Cookie 保留期 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">3. Cookie 保留期</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-text-primary">会话 Cookie</strong>：浏览器关闭后自动删除（登录态、CSRF）</li>
              <li><strong className="text-text-primary">短期 Cookie</strong>：7-30 天（偏好、分析）</li>
              <li><strong className="text-text-primary">长期 Cookie</strong>：1 年（"记住我"登录、个性化推荐）</li>
            </ul>
          </div>
        </section>

        {/* 4. 用户选择 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">4. 您的选择</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed space-y-3">
            <p>您可通过以下方式管理 Cookie：</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong className="text-text-primary">浏览器设置</strong>：禁用 / 删除 Cookie (设置 → 隐私 → Cookie)
              </li>
              <li>
                <strong className="text-text-primary">退出登录</strong>：清除会话 Cookie, 退出账号
              </li>
              <li>
                <strong className="text-text-primary">隐私偏好中心</strong>：未来版本将提供可视化偏好中心 (Coming Soon)
              </li>
            </ul>
            <p className="font-semibold text-accent-down mt-3">
              ⚠️ 注意：禁用必要 Cookie 将导致登录、支付等核心功能不可用。
            </p>
          </div>
        </section>

        {/* 5. 政策更新 */}
        <section className="mb-8">
          <h2 className="h2 mb-3">5. 政策更新</h2>
          <div className="card-base p-5 text-sm text-text-secondary leading-relaxed">
            <p>我们保留根据法律法规、技术升级需要修改本政策的权利。重大变更将通过站内信、邮件等方式提前 7 天通知。</p>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="card-base p-5 mb-8">
          <h2 className="h2 mt-0 mb-3">联系方式</h2>
          <p className="text-sm text-text-secondary mb-2">
            Cookie 咨询：微信 <code className="font-mono">Lookee333</code>
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
