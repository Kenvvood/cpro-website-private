import Link from "next/link";
import { ArrowLeft, Mail, GitBranch, FileText, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/footer";

// L4 v1.9 激进档: 创作者申请页
// 雏形: 提交邮箱 → 邮件外发, 不接 DB, 简化版上线
// PM 决策: 立刻加, 邮件外发

export default function CreatorApplyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12">
        {/* 顶部导航 */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-blue"
          >
            <ArrowLeft size={14} />
            返回首页
          </Link>
        </div>

        {/* Hero 区块 */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-semibold border border-border rounded-sm bg-bg-secondary w-fit">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold" />
            <span>创作者中心 · 申请入驻</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 leading-tight">
            您有优质 EA？<br />
            让我们帮您找到<span className="text-accent-blue">真正感兴趣的用户</span>。
          </h1>
          <p className="text-base text-text-secondary max-w-3xl leading-relaxed">
            申请项目需提供可验证观摩账户、EA 文件及完整策略资料。通过审核后，平台协助您发起联合采购或单独销售，按约定获得项目收益。
          </p>
        </section>

        {/* 申请流程 4 步 */}
        <section>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-6">
            入驻流程
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { n: "01", t: "提交资料", d: "邮箱提交观摩账户、EA 文件、策略说明" },
              { n: "02", t: "平台审核", d: "3 个工作日内完成观摩账户与策略验证" },
              { n: "03", t: "签署协议", d: "在线签署创作者合作协议，明确收益分成" },
              { n: "04", t: "上线销售", d: "产品上线产品中心 / 众筹板块，开始获客" },
            ].map((s) => (
              <div key={s.n} className="card-base p-5">
                <div className="text-3xl font-bold num text-accent-blue/40 mb-3">
                  {s.n}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {s.t}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 申请要求 */}
        <section>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-4">
            申请要求
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-base p-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-accent-blue/10 mb-3">
                <FileText size={18} className="text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                可验证观摩账户
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                提供经纪商、服务器、账户类型、观摩账号与密码，平台核验实盘表现不少于 3 个月。
              </p>
            </div>
            <div className="card-base p-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-accent-gold/10 mb-3">
                <GitBranch size={18} className="text-accent-gold" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                EA 文件 + 策略说明
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                提供 MQL4 / MQL5 源码或编译产物，附完整策略说明文档（信号逻辑、风控、参数）。
              </p>
            </div>
            <div className="card-base p-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-accent-up/10 mb-3">
                <CheckCircle2 size={18} className="text-accent-up" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                回测报告
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                提供 MT4 / MT5 策略测试报告，含夏普比率、最大回撤、胜率、盈亏比等关键指标。
              </p>
            </div>
          </div>
        </section>

        {/* 申请 CTA */}
        <section className="card-base p-8 text-center">
          <Mail size={32} className="text-accent-blue mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-3">
            准备好入驻？
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-2xl mx-auto">
            发送申请邮件至 <span className="text-accent-blue font-semibold num">creator@cprotrading.com</span>，附上观摩账户、EA 文件、策略说明与回测报告。
          </p>
          <a
            href="mailto:creator@cprotrading.com?subject=创作者入驻申请&body=您好，我想申请成为 CProTrading 创作者，附件包含：%0A1. 观摩账户信息%0A2. EA 文件%0A3. 策略说明%0A4. 回测报告"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Mail size={16} />
            立即申请
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
