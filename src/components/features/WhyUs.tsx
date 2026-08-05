import { Shield, FileCheck, MessageCircle, Headphones } from "lucide-react";

// L4 v1.6: 借 TradingView 中文站 "tools and services" / "为什么选我们" 卖点区块
// 4 特性: 严选审核 / 合规再分发 / 中文友好 / 售后支持
// 静态展示, 无 DB, 强化"工作室级"专业感
const FEATURES = [
  {
    icon: Shield,
    title: "严选审核",
    body: "每个策略入库前经过编译验证 + 风险分级 + 历史回测, 拒绝黑盒与跑路 EA。",
    tint: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: FileCheck,
    title: "合规再分发",
    body: "开源协议清晰标注, GPL/MIT/BSD 分级标识, 严守原作者署名与再分发条款。",
    tint: "text-accent-gold",
    bg: "bg-accent-gold/10",
  },
  {
    icon: MessageCircle,
    title: "中文友好",
    body: "全站中文 UI, 策略说明 / 参数说明 / 风险提示全部中文撰写, 工作室内部直接用。",
    tint: "text-accent-up",
    bg: "bg-accent-up/10",
  },
  {
    icon: Headphones,
    title: "工作室级售后",
    body: "微信 / 邮箱双通道, 策略部署与参数调优问题工单回复, 订阅期内不限次数。",
    tint: "text-accent-down",
    bg: "bg-accent-down/10",
  },
];

export function WhyUs() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-1">
          为什么选 CProTrading
        </h2>
        <p className="text-xs text-text-muted">
          4 个核心理由 · 严守合规底线, 拒绝以次充好
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card-base p-5 hover:border-border-focus transition-all hover:-translate-y-0.5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${f.bg} mb-3`}>
                <Icon size={20} className={f.tint} />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {f.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
