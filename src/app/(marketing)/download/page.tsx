"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/features/product-card";
import { Sidebar } from "@/components/layout/sidebar";
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

export default function DownloadPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    // Check auth state and fetch products
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
      const res = await fetch(`/api/downloads/${productId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "下载失败");
        return;
      }

      toast.success(data.alreadyDownloaded ? "重新下载" : "下载成功");

      // Update download count locally
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, downloadCount: p.downloadCount + 1 }
            : p
        )
      );
    } catch (error) {
      toast.error("下载失败");
    } finally {
      setDownloadingId(null);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "ea":
        return <TrendingUpIcon size={26} className="stroke-1.5 text-accent" />;
      case "indicator":
        return <ZapIcon size={26} className="stroke-1.5 text-accent" />;
      case "script":
        return <ImageIcon size={26} className="stroke-1.5 text-accent" />;
      default:
        return <TrendingUpIcon size={26} className="stroke-1.5 text-accent" />;
    }
  };

  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12">
          <h1 className="text-3xl font-bold mb-2">下载中心</h1>
          <p className="text-sm text-text-secondary">
            注册登录即可下载全部EA、指标、脚本工具
          </p>
        </div>

        {/* Auth Warning Banner */}
        {!isLoggedIn && (
          <div className="mx-20 mb-8 p-4 rounded-xl bg-[rgba(0,229,221,0.05)] border border-border-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LockIcon size={20} className="text-accent" />
                <span className="text-sm text-text-secondary">
                  登录后即可下载全部产品
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border-accent text-accent hover:bg-accent/5 transition-all"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-accent text-bg-primary transition-all"
                >
                  免费注册
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <section className="px-20 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon
                size={32}
                className="text-accent animate-spin"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  description={product.description}
                  tags={[
                    product.category === "ea"
                      ? "EA"
                      : product.category === "indicator"
                        ? "指标"
                        : "脚本",
                    product.version || "",
                  ]}
                  icon={getIcon(product.category)}
                  downloadButton={
                    <button
                      onClick={() => handleDownload(product.id)}
                      disabled={downloadingId === product.id}
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent text-xs font-medium hover:bg-accent/20 hover:border-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {downloadingId === product.id ? (
                        <>
                          <Loader2Icon size={12} className="animate-spin" />
                          处理中
                        </>
                      ) : (
                        <>
                          <DownloadIcon size={12} />
                          {isLoggedIn ? "下载" : "登录"}
                        </>
                      )}
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Download Instructions */}
        <section className="px-20 py-8 mb-12">
          <div className="max-w-4xl p-6 rounded-xl value-card">
            <h2 className="text-xl font-bold mb-4 text-accent">使用说明</h2>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>下载EA/指标文件后，打开MT4或MT5终端</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  点击&quot;文件&quot;→&quot;打开数据文件夹&quot;，将文件粘贴到对应目录
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>关闭并重新打开终端，在导航器中找到EA或指标</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  将EA拖到图表即可运行，指标直接拖入图表即可显示
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
