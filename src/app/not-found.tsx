import Link from "next/link";
import { HomeIcon } from "lucide-react";

// task052 L3: not-found.tsx TV 风格 (去 bg-gradient/bg-grid)
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center px-8">
        <h1 className="text-8xl font-bold text-accent-blue mb-4 num">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">页面未找到</h2>
        <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <HomeIcon size={18} />
          返回首页
        </Link>
      </div>
    </div>
  );
}