"use client";
// task052 L3: account/page.tsx TV 风格拉平 (移除 Sidebar + bg-gradient + bg-grid + value-card + CTASection)
import { Footer } from "@/components/layout/footer";
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
  product: { id: string; name: string; description: string; category: string; version: string | null; fileUrl: string };
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
        if (!sessionData.loggedIn) { setLoading(false); return; }
        setUser(sessionData.user);
        const downloadsRes = await fetch(`/api/users/${sessionData.user.id}/downloads`);
        const downloadsData = await downloadsRes.json();
        if (downloadsData.downloads) setDownloads(downloadsData.downloads);
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
      const res = await fetch(`/api/downloads/${productId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "下载失败"); return; }
      toast.success("下载成功");
    } catch { toast.error("下载失败"); }
  };

  if (!loading && !user) {
    return (
      // v22.0 Phase 7.24 BATCH 15 PATCH 7: pt-12 sm:pt-14 (8px 基准, 96/112px)
      <div className="min-h-screen bg-bg-primary pt-12 sm:pt-14 pb-12">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6">
          <div className="card-base p-8 text-center">
            <UserIcon size={48} className="text-accent-blue mx-auto mb-4" />
            <h2 className="h2 mb-3">登录后查看</h2>
            <p className="text-sm text-text-secondary mb-6">
              登录后即可查看个人信息、下载记录和会员权益
            </p>
            <Link href="/login" className="block btn-primary text-center">立即登录</Link>
            <p className="text-center text-sm mt-4 text-text-muted">
              还没有账号？<Link href="/register" className="text-accent-blue hover:underline">立即注册</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2Icon size={32} className="text-accent-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="h1 mb-2">个人中心</h1>
            <p className="text-sm text-text-secondary">管理您的账号信息和会员权益</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CrownIcon size={18} className="text-accent-gold" />
            <span className="font-semibold text-accent-gold">{user?.memberLevel}</span>
          </div>
        </header>

        <div className="flex gap-2">
          {[
            { key: "profile" as const, label: "个人信息", icon: null },
            { key: "downloads" as const, label: "下载记录", icon: <DownloadIcon size={14} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${
                activeTab === t.key ? "bg-accent-blue text-white" : "border border-border text-text-secondary hover:border-border-focus"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && user && (
          <div className="space-y-6">
            <div className="card-base p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 border border-border bg-bg-tertiary flex items-center justify-center">
                  <UserIcon size={28} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="h3">{user.username}</h3>
                  <p className="text-xs text-text-muted">付费会员</p>
                </div>
              </div>
              <div className="space-y-2">
                <InfoRow icon={<PhoneIcon size={18} />} label="手机号" value={user.phone} />
                <InfoRow
                  icon={<QrCodeIcon size={18} />}
                  label="微信绑定"
                  value={user.wechatOpenid ? <span className="text-accent-up flex items-center gap-1"><CheckCircleIcon size={14} /> 已绑定</span> : "未绑定"}
                />
                <InfoRow icon={<CrownIcon size={18} />} label="会员等级" value={<span className="px-2 py-0.5 bg-accent-gold text-bg-primary text-xs font-semibold">{user.memberLevel}</span>} />
              </div>
            </div>

            <div className="card-base p-6">
              <h3 className="h3 mb-4">会员权益</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: "全部 EA 下载", desc: "智能交易系统" },
                  { title: "全部指标", desc: "精准信号工具" },
                  { title: "全部脚本", desc: "高效批量操作" },
                  { title: "技术支持", desc: "微信专属客服" },
                ].map((b, i) => (
                  <div key={i} className="card-base p-4 text-center">
                    <CheckCircleIcon size={20} className="text-accent-up mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary">{b.title}</p>
                    <p className="text-xs text-text-muted mt-1">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "downloads" && (
          <div className="card-base p-6">
            <h3 className="h3 mb-4">下载记录</h3>
            {downloads.length > 0 ? (
              <div className="space-y-2">
                {downloads.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-border rounded-sm">
                    <div className="flex items-center gap-3">
                      <DownloadIcon size={18} className="text-accent-blue" />
                      <div>
                        <p className="text-sm text-text-primary">{record.product.name}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <ClockIcon size={12} />
                          {new Date(record.downloadedAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleReDownload(record.product.id)} className="text-sm text-accent-blue hover:underline">
                      重新下载
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DownloadIcon size={40} className="text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-text-muted mb-4">暂无下载记录</p>
                <Link href="/download" className="text-sm text-accent-blue hover:underline">去下载</Link>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-sm">
      <div className="flex items-center gap-3 text-text-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}