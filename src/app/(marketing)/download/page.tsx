"use client";
// task052 L3: download/page.tsx TV 风格拉平 (移除 Sidebar + bg-gradient + value-card + ProductCard)
import * as React from "react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import {
  DownloadIcon,
  TrendingUpIcon,
  ZapIcon,
  ImageIcon,
  LockIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string | null;
  downloadCount: number;
}

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  ea: <TrendingUpIcon size={20} className="stroke-1.5 text-accent-blue" />,
  indicator: <ZapIcon size={20} className="stroke-1.5 text-accent-blue" />,
  script: <ImageIcon size={20} className="stroke-1.5 text-accent-blue" />,
};

const CATEGORY_LABEL: Record<string, string> = {
  ea: "EA",
  indicator: "指标",
  script: "脚本",
};

export default function DownloadPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [sessionRes, productsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/products"),
        ]);
        const sessionData = await sessionRes.json();
        const productsData = await productsRes.json();
        setIsLoggedIn(sessionData.loggedIn);
        setProducts(productsData.products || []);
      } catch (error) {
        console.error("初始化错误:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleDownload = async (productId: string) => {
    if (!isLoggedIn) {
      toast.error("请先登录后下载");
      return;
    }
    setDownloadingId(productId);
    try {
      const res = await fetch(`/api/downloads/${productId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "下载失败");
        return;
      }
      toast.success(data.alreadyDownloaded ? "重新下载" : "下载成功");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, downloadCount: p.downloadCount + 1 } : p
        )
      );
    } catch {
      toast.error("下载失败");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16 space-y-8">
        <header className="border-b border-border pb-6">
          <h1 className="h1 mb-2">下载中心</h1>
          <p className="text-sm lg:text-base text-text-secondary">
            付费会员可下载全部 EA、指标、脚本工具
          </p>
        </header>

        {!isLoggedIn && (
          <div className="border-y border-border py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <LockIcon size={20} className="text-accent-blue" />
              <span className="text-sm text-text-secondary">
                登录付费会员后可下载全部产品
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="btn-outline text-sm">
                登录
              </Link>
              <Link href="/membership" className="btn-primary text-sm">
                立即开通
              </Link>
            </div>
          </div>
        )}

        <section>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon size={32} className="text-accent-blue animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-8 border-y border-border">
              暂无商品 (DB 已重置, seed 数据准备中)
            </div>
          ) : (
            <div className="border-y border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                    <th className="text-left py-2 px-2 font-normal w-12">#</th>
                    <th className="text-left py-2 px-2 font-normal hidden sm:table-cell w-16">分类</th>
                    <th className="text-left py-2 px-2 font-normal">商品</th>
                    <th className="text-left py-2 px-2 font-normal hidden md:table-cell">说明</th>
                    <th className="text-right py-2 px-2 font-normal hidden sm:table-cell w-20">下载</th>
                    <th className="text-right py-2 px-2 font-normal w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                      <td className="py-2.5 px-2 text-text-muted num text-xs w-12">{String(i + 1).padStart(2, "0")}</td>
                      <td className="py-2.5 px-2 text-xs text-text-secondary hidden sm:table-cell w-16">
                        {CATEGORY_LABEL[product.category] ?? product.category}
                      </td>
                      <td className="py-2.5 px-2 text-text-primary font-medium">
                        {product.name}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-text-muted hidden md:table-cell line-clamp-1">
                        {product.description}
                      </td>
                      <td className="py-2.5 px-2 text-right text-xs text-text-muted num hidden sm:table-cell w-20">
                        {product.downloadCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right w-28">
                        <button
                          onClick={() => handleDownload(product.id)}
                          disabled={downloadingId === product.id}
                          className="text-xs btn-primary disabled:opacity-50"
                        >
                          {downloadingId === product.id ? (
                            <>
                              <Loader2Icon size={12} className="inline animate-spin mr-1" />
                              处理中
                            </>
                          ) : (
                            <>
                              <DownloadIcon size={12} className="inline mr-1" />
                              {isLoggedIn ? "下载" : "登录后下载"}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="max-w-4xl border-t border-border pt-6">
          <h2 className="h2 mb-4">使用说明</h2>
          <ol className="text-sm text-text-secondary divide-y divide-border">
            {[
              "下载 EA / 指标文件后, 打开 MT4 或 MT5 终端",
              "点击「文件」→「打开数据文件夹」, 将文件粘贴到对应目录",
              "关闭并重新打开终端, 在导航器中找到 EA 或指标",
              "将 EA 拖到图表即可运行, 指标直接拖入图表即可显示",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 py-3">
                <span className="w-6 h-6 border border-border bg-bg-tertiary text-text-primary text-xs flex items-center justify-center shrink-0 num">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}