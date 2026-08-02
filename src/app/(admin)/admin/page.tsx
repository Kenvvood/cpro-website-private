"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  DownloadIcon,
  FileTextIcon,
  SendIcon,
  TrendingUpIcon,
  BarChart3Icon,
  SearchIcon,
  Loader2Icon,
} from "lucide-react";

interface User {
  id: string;
  phone: string;
  wechat: string;
  createdAt: string;
  downloadCount: number;
}

interface Product {
  id: string;
  name: string;
  downloadCount: number;
}

interface Stats {
  totalUsers: number;
  thisMonthUsers: number;
  totalDownloads: number;
  products: Product[];
}

type AdminTab = "users" | "products" | "messages";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (usersData.success) setUsers(usersData.users);
      } catch (error) {
        console.error("获取数据错误:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function searchUsers() {
      try {
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        console.error("搜索用户错误:", error);
      }
    }

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const filteredUsers = users;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ambient-glow">
        <Loader2Icon size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10">
        {/* Admin Header */}
        <div className="px-20 py-8 border-b border-border">
          <h1 className="text-3xl font-bold mb-2">管理后台</h1>
          <p className="text-sm text-text-secondary">
            管理用户、产品推广和消息推送
          </p>
        </div>

        {/* Stats Overview */}
        <div className="px-20 py-8">
          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 rounded-xl value-card">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <UsersIcon size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {stats?.totalUsers ?? 0}
                  </p>
                  <p className="text-xs text-text-muted">注册用户</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl value-card">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <TrendingUpIcon size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {stats?.thisMonthUsers ?? 0}
                  </p>
                  <p className="text-xs text-text-muted">本月新增</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl value-card">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <DownloadIcon size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {stats?.totalDownloads ?? 0}
                  </p>
                  <p className="text-xs text-text-muted">总下载量</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl value-card">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <BarChart3Icon size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {stats?.products?.length ?? 0}
                  </p>
                  <p className="text-xs text-text-muted">产品数量</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-20">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === "users"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon size={18} />
                用户管理
              </div>
              {activeTab === "users" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === "products"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <DownloadIcon size={18} />
                产品统计
              </div>
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === "messages"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <SendIcon size={18} />
                消息推送
              </div>
              {activeTab === "messages" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-20 py-8">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <SearchIcon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    placeholder="搜索手机号或微信..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-xl value-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        手机号
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        微信
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        注册时间
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        下载数
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-0 hover:bg-bg-card/50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-100">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-100">
                          {user.wechat}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {user.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent">
                            {user.downloadCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-accent hover:underline">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {stats.products.map((item) => (
                  <div key={item.id} className="p-6 rounded-xl value-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-100">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-accent">
                        {item.downloadCount}
                      </span>
                    </div>
                    <div className="h-2 bg-bg-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min((item.downloadCount / 200) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      下载量
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="max-w-2xl space-y-6">
              <div className="p-6 rounded-xl value-card">
                <h3 className="text-lg font-bold mb-4 text-gray-100">
                  发送消息
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">
                      消息类型
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border text-sm text-text-primary focus:outline-none focus:border-accent">
                      <option>全部用户</option>
                      <option>VIP用户</option>
                      <option>新注册用户(7天内)</option>
                      <option>已下载用户</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">
                      消息标题
                    </label>
                    <input
                      type="text"
                      placeholder="输入消息标题"
                      className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">
                      消息内容
                    </label>
                    <textarea
                      rows={4}
                      placeholder="输入消息内容..."
                      className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <button className="w-full py-3 text-sm font-bold rounded-lg bg-accent text-bg-primary transition-all hover:opacity-90 flex items-center justify-center gap-2">
                    <SendIcon size={16} />
                    发送消息
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}