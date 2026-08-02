"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/features/cta-section";
import {
  UserIcon,
  PhoneIcon,
  QrCodeIcon,
  DownloadIcon,
  CrownIcon,
  CheckCircleIcon,
  ClockIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  phone: string;
  wechatOpenid: string | null;
  memberLevel: string;
}

interface DownloadRecord {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string | null;
    fileUrl: string;
  };
  downloadedAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "downloads">("profile");

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.loggedIn) {
          setLoading(false);
          return;
        }

        setUser(sessionData.user);

        // Fetch downloads
        const downloadsRes = await fetch(
          `/api/users/${sessionData.user.id}/downloads`
        );
        const downloadsData = await downloadsRes.json();

        if (downloadsData.downloads) {
          setDownloads(downloadsData.downloads);
        }
      } catch (error) {
        console.error("获取数据错误:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleReDownload = async (productId: string) => {
    try {
      const res = await fetch(`/api/downloads/${productId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "下载失败");
        return;
      }

      toast.success("下载成功");
    } catch (error) {
      toast.error("下载失败");
    }
  };

  // Not logged in state
  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
        <div className="fixed inset-0 bg-grid pointer-events-none" />

        <div className="relative z-10 text-center px-8 max-w-md">
          <div className="p-8 rounded-2xl border auth-form-card">
            <UserIcon size={48} className="text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4 text-gray-100">登录后查看</h2>
            <p className="text-sm text-text-secondary mb-6">
              登录后即可查看个人信息、下载记录和会员权益
            </p>
            <Link
              href="/login"
              className="block w-full py-3 text-base font-bold rounded-lg bg-accent text-bg-primary text-center"
            >
              立即登录
            </Link>
            <p className="text-center text-sm mt-4 text-text-muted">
              还没有账号？{" "}
              <Link href="/register" className="text-accent">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <Loader2Icon size={32} className="text-accent animate-spin relative z-10" />
      </div>
    );
  }

  // Logged in state
  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">个人中心</h1>
            <p className="text-sm text-text-secondary">
              管理您的账号信息和会员权益
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CrownIcon size={20} className="text-accent" />
            <span className="text-sm font-bold text-accent">
              {user?.memberLevel}
            </span>
          </div>
        </div>

        {/* Profile Section */}
        <section className="px-20 py-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "profile"
                  ? "bg-accent text-bg-primary"
                  : "text-text-secondary hover:text-text-primary bg-bg-card"
              }`}
            >
              个人信息
            </button>
            <button
              onClick={() => setActiveTab("downloads")}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "downloads"
                  ? "bg-accent text-bg-primary"
                  : "text-text-secondary hover:text-text-primary bg-bg-card"
              }`}
            >
              <DownloadIcon size={16} />
              下载记录
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && user && (
            <div className="max-w-2xl space-y-6">
              {/* User Card */}
              <div className="p-6 rounded-xl value-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserIcon size={32} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">
                      {user.username}
                    </h3>
                    <p className="text-sm text-text-muted">VIP会员</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-card">
                    <div className="flex items-center gap-3">
                      <PhoneIcon size={20} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">手机号</span>
                    </div>
                    <span className="text-sm text-gray-100">{user.phone}</span>
                  </div>

                  {/* WeChat */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-card">
                    <div className="flex items-center gap-3">
                      <QrCodeIcon size={20} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">微信绑定</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.wechatOpenid ? (
                        <>
                          <CheckCircleIcon size={16} className="text-accent" />
                          <span className="text-sm text-accent">已绑定</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-text-muted">未绑定</span>
                          <button className="text-sm text-accent hover:underline">
                            立即绑定
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Member Level */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-card">
                    <div className="flex items-center gap-3">
                      <CrownIcon size={20} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">会员等级</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent text-bg-primary">
                      {user.memberLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="p-6 rounded-xl value-card">
                <h3 className="text-lg font-bold mb-4 text-gray-100">
                  会员权益
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-bg-card text-center">
                    <CheckCircleIcon
                      size={24}
                      className="text-accent mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-100 font-medium">
                      全部EA下载
                    </p>
                    <p className="text-xs text-text-muted">6款智能交易EA</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-card text-center">
                    <CheckCircleIcon
                      size={24}
                      className="text-accent mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-100 font-medium">
                      全部指标
                    </p>
                    <p className="text-xs text-text-muted">3款精准指标</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-card text-center">
                    <CheckCircleIcon
                      size={24}
                      className="text-accent mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-100 font-medium">
                      全部脚本
                    </p>
                    <p className="text-xs text-text-muted">高效批量工具</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-card text-center">
                    <CheckCircleIcon
                      size={24}
                      className="text-accent mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-100 font-medium">
                      技术支持
                    </p>
                    <p className="text-xs text-text-muted">微信专属客服</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Downloads Tab */}
          {activeTab === "downloads" && (
            <div className="max-w-2xl">
              <div className="p-6 rounded-xl value-card">
                <h3 className="text-lg font-bold mb-4 text-gray-100">
                  下载记录
                </h3>
                {downloads.length > 0 ? (
                  <div className="space-y-3">
                    {downloads.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <DownloadIcon
                            size={20}
                            className="text-accent"
                          />
                          <div>
                            <p className="text-sm text-gray-100">
                              {record.product.name}
                            </p>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <ClockIcon size={12} />
                              {new Date(
                                record.downloadedAt
                              ).toLocaleDateString("zh-CN")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleReDownload(record.product.id)
                          }
                          className="text-sm text-accent hover:underline"
                        >
                          重新下载
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DownloadIcon
                      size={40}
                      className="text-text-muted mx-auto mb-3 opacity-50"
                    />
                    <p className="text-sm text-text-muted mb-4">
                      暂无下载记录
                    </p>
                    <Link
                      href="/download"
                      className="text-sm text-accent hover:underline"
                    >
                      去下载
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
