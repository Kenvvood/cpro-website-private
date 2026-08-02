import { ContentCard } from "@/components/features/content-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";

const allContent = [
  {
    title: "EA参数优化技巧详解",
    description: "如何根据不同品种调整EA参数，获得更稳定的收益",
    date: "2024-04-10"
  },
  {
    title: "MT4安装EA详细教程",
    description: "一步一步教你如何在MT4上安装和运行EA",
    date: "2024-04-08"
  },
  {
    title: "指标参数调整入门",
    description: "了解常用指标参数含义及调整方法",
    date: "2024-04-05"
  },
  {
    title: "客户案例：工作室月收益30%",
    description: "某工作室使用我们的EA产品，三个月实现稳定盈利",
    date: "2024-04-08"
  },
  {
    title: "兼职交易者：稳定月收益5%",
    description: "全职工作之余，用EA实现额外收入",
    date: "2024-04-06"
  },
  {
    title: "伦敦突破策略详解",
    description: "利用伦敦开盘时段进行突破交易",
    date: "2024-04-10"
  },
  {
    title: "网格策略的风险控制",
    description: "如何设置合理的网格间距和止损",
    date: "2024-04-07"
  },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12">
          <h1 className="text-3xl font-bold mb-2">内容中心</h1>
          <p className="text-sm text-text-secondary">
            交易教程，成功案例、策略分享，帮助您更好地使用量化工具
          </p>
        </div>

        {/* Content Grid */}
        <section className="px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
            {allContent.map((item, i) => (
              <ContentCard key={i} {...item} />
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
