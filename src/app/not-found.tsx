import Link from "next/link";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 text-center px-8">
        <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-100">页面未找到</h2>
        <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg bg-accent text-bg-primary transition-all hover:opacity-90"
        >
          <HomeIcon size={18} />
          返回首页
        </Link>
      </div>
    </div>
  );
}
