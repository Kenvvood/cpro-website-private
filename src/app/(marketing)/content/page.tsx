// task061 2.3: 删除 2024 假文章 (硬编码过期日期违反 v14.0 文案祛 AI 味)
import { Footer } from "@/components/layout/footer";

// 内容接入真实 OpenSourceTutorial 数据 (后续 sub-commit 由 prisma 拉取)
// 当前先以"内容中心正在建设"占位, 避免公网显示假数据
const PLACEHOLDER_NOTE = "内容中心正在接入真实投研教程, 请移步教程列表查看已发布研报。";

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16 space-y-12">
        <header className="border-b border-border pb-6">
          <h1 className="h1 mb-2">内容中心</h1>
          <p className="text-sm lg:text-base text-text-secondary">
            交易教程、成功案例、策略分享, 帮助您更好地使用量化工具
          </p>
        </header>

        <section>
          <div className="card-base p-8 text-center text-text-secondary">
            <p className="text-base mb-2">{PLACEHOLDER_NOTE}</p>
            <a
              href="/tutorials"
              className="text-accent-blue hover:underline text-sm"
            >
              → 查看已发布投研教程
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}