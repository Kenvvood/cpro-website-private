// task052 L3: content/page.tsx TV 风格拉平 (移除 Sidebar + bg-gradient + bg-grid + ambient-glow + ContentCard)
import { Footer } from "@/components/layout/footer";

const articles = [
  { title: "EA 参数优化技巧详解", description: "如何根据不同品种调整 EA 参数, 获得更稳定的收益", date: "2024-04-10" },
  { title: "MT4 安装 EA 详细教程", description: "一步一步教你如何在 MT4 上安装和运行 EA", date: "2024-04-08" },
  { title: "指标参数调整入门", description: "了解常用指标参数含义及调整方法", date: "2024-04-05" },
  { title: "客户案例: 工作室月收益 30%", description: "某工作室使用我们的 EA 产品, 三个月实现稳定盈利", date: "2024-04-08" },
  { title: "兼职交易者: 稳定月收益 5%", description: "全职工作之余, 用 EA 实现额外收入", date: "2024-04-06" },
  { title: "伦敦突破策略详解", description: "利用伦敦开盘时段进行突破交易", date: "2024-04-10" },
  { title: "网格策略的风险控制", description: "如何设置合理的网格间距和止损", date: "2024-04-07" },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-text-primary">内容中心</h1>
          <p className="text-sm lg:text-base text-text-secondary">
            交易教程、成功案例、策略分享, 帮助您更好地使用量化工具
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a, i) => (
              <article key={i} className="card-base p-5 hover:border-border-focus transition-colors">
                <h3 className="text-base font-semibold mb-2 text-text-primary">{a.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-3">
                  {a.description}
                </p>
                <time className="text-xs text-text-muted">{a.date}</time>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}