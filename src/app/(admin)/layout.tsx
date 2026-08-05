// src/app/(admin)/layout.tsx — 管理员隐身守卫 (Phase 7 task-0048)
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  // 架构师决策: 404 隐身模式 (不像 401 暴露路由存在)
  if (!admin) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-[1440px] px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-lg">
              CProTrading <span className="text-xs text-muted-foreground font-normal">Admin</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="hover:text-primary">总览</Link>
              <Link href="/dashboard/conversions" className="hover:text-primary">转化漏斗</Link>
            </nav>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-mono">{admin.username}</span>
            <span className="mx-2">·</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">ADMIN</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-8">{children}</main>
    </div>
  );
}