import { ProductCard } from "@/components/features/product-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { TrendingUpIcon, ZapIcon, ImageIcon } from "lucide-react";

const allProducts = [
  {
    name: "趋势追踪EA",
    description: "智能判断趋势方向，全自动执行交易，24小时不间断",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "多空信号指标",
    description: "精准多空信号提示，实时把握市场转折点",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "批量平仓脚本",
    description: "一键平掉全部持仓，支持多账号同时操作",
    tags: ["MT4", "MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "网格马丁EA",
    description: "经典网格加仓策略，支持自定义间距和倍数",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "RSI超买超卖指标",
    description: "经典RSI指标优化版，精准把握市场转折",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "新闻事件EA",
    description: "自动识别重要新闻事件，智能风控自动平仓",
    tags: ["MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5 text-accent" />
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header - removed border-b */}
        <div className="px-20 py-12">
          <h1 className="text-3xl font-bold mb-2">产品中心</h1>
          <p className="text-sm text-text-secondary">
            浏览全部MT4/MT5量化工具，注册后即可免费下载
          </p>
        </div>

        {/* Products Grid */}
        <section className="px-20 py-12">
          <div className="grid grid-cols-3 gap-5">
            {allProducts.map((product, i) => (
              <ProductCard key={i} {...product} />
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
