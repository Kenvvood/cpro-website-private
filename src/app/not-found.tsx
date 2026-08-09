"use client";
import Link from "next/link";
import { HomeIcon, ArrowLeft } from "lucide-react";

// task052 L3: not-found.tsx TV 风格 (去 bg-gradient/bg-grid)
// v21.0 season2: 增加"返回上一页"按钮 + 友好文案
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center px-8">
        <h1 className="text-8xl font-bold text-accent-blue mb-4 num">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">页面未找到</h2>
        <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。可以返回首页，或检查链接是否正确。
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <HomeIcon size={18} />
            返回首页
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}