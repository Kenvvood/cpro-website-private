"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { QrCodeIcon, UserIcon, Loader2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "qrcode";

type LoginMode = "qrcode" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrcodeUrl, setQrcodeUrl] = useState<string>("");
  const [qrcodeLoading, setQrcodeLoading] = useState(false);
  const router = useRouter();

  // 获取微信登录二维码
  useEffect(() => {
    if (mode !== "qrcode") return;

    async function fetchQrcode() {
      setQrcodeLoading(true);
      try {
        const res = await fetch("/api/wechat/qrcode");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "获取二维码失败");
        }

        // 生成二维码图片
        const qrDataUrl = await QRCode.toDataURL(data.url, {
          width: 160,
          margin: 2,
          color: {
            dark: "#171717",
            light: "#ffffff",
          },
        });

        setQrcodeUrl(qrDataUrl);
      } catch (error) {
        console.error("获取微信二维码失败:", error);
        toast.error("获取二维码失败，请稍后重试");
      } finally {
        setQrcodeLoading(false);
      }
    }

    fetchQrcode();
  }, [mode]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("请输入用户名和密码");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("用户名或密码错误");
      } else {
        toast.success("登录成功");
        router.push("/account");
        router.refresh();
      }
    } catch (error) {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-accent-blue">CPro</span>Trading
          </h1>
          <p className="text-sm text-text-secondary">
            专业MT4/MT5量化解决方案
          </p>
        </div>

        <div className="card-base p-8">
          {/* Login Mode Tabs */}
          <div className="flex mb-6 border border-border p-1">
            <button
              type="button"
              onClick={() => setMode("qrcode")}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "qrcode"
                  ? "bg-accent-blue text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <QrCodeIcon size={16} />
              微信登录
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "password"
                  ? "bg-accent-blue text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <UserIcon size={16} />
              账号登录
            </button>
          </div>

          {/* QR Code Login */}
          {mode === "qrcode" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-3 block text-text-secondary">
                  微信扫码登录
                </label>
                <div className="flex flex-col items-center p-6 rounded-xl bg-[rgba(0,229,221,0.03)] border border-border">
                  <div className="w-40 h-40 mb-4 flex items-center justify-center rounded-xl bg-bg-card overflow-hidden">
                    {qrcodeLoading ? (
                      <Loader2Icon size={64} className="text-text-muted animate-spin" />
                    ) : qrcodeUrl ? (
                      <img src={qrcodeUrl} alt="微信扫码登录" className="w-full h-full object-contain" />
                    ) : (
                      <QrCodeIcon size={64} className="text-text-muted opacity-50" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted text-center">
                    打开微信扫一扫<br />快速登录
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password Login */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-text-secondary">
                  用户名 / 手机号
                </label>
                <Input
                  type="text"
                  placeholder="请输入用户名或手机号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-text-secondary">
                  密码
                </label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded auth-checkbox" />
                  <span className="text-text-muted">记住我</span>
                </label>
                <a href="#" className="font-medium text-accent">
                  忘记密码？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2Icon size={18} className="animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6 text-text-muted">
            还没有账号？{" "}
            <Link href="/register" className="font-medium text-accent">
              立即注册
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6 text-text-muted">
          登录即表示同意{" "}
          <a href="#" className="text-accent">服务条款</a> 和{" "}
          <a href="#" className="text-accent">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
