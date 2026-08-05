"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { QrCodeIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type RegisterStep = "form" | "verified";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("form");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const handleSendCode = async () => {
    if (!formData.phone) {
      toast.error("请输入手机号");
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.error("手机号格式不正确");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/sms/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, type: "register" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "发送失败");
        return;
      }

      toast.success("验证码已发送");
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error("发送失败，请重试");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.code) {
      toast.error("请输入验证码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sms/code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, code: formData.code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "验证失败");
        return;
      }

      setStep("verified");
      toast.success("手机号验证成功");
    } catch (error) {
      toast.error("验证失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== "verified") {
      toast.error("请先完成手机号验证");
      return;
    }

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      toast.error("请填写完整信息");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("两次密码输入不一致");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("密码至少6位");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "注册失败");
        return;
      }

      toast.success("注册成功");
      router.push("/login");
    } catch (error) {
      toast.error("注册失败，请重试");
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
            专业 MT4/MT5 量化解决方案
          </p>
        </div>

        <div className="card-base p-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-text-primary">注册账号</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-2 block text-text-secondary">
                用户名
              </label>
              <Input
                type="text"
                placeholder="请设置用户名"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-sm font-medium mb-2 block text-text-secondary">
                手机号
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="flex-1"
                  disabled={step === "verified"}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0}
                  className="px-4 py-2 text-sm rounded-lg border transition-all whitespace-nowrap border-border-accent text-accent hover:bg-accent/5 disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : sendingCode ? "发送中..." : "获取验证码"}
                </button>
              </div>
            </div>

            {/* SMS Code - Only show if not verified */}
            {step !== "verified" && (
              <div>
                <label className="text-sm font-medium mb-2 block text-text-secondary">
                  验证码
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={loading || !formData.code}
                    className="px-4 py-2 text-sm rounded-lg bg-accent text-bg-primary font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Loader2Icon size={16} className="animate-spin" /> : "验证"}
                  </button>
                </div>
              </div>
            )}

            {/* Verified Badge */}
            {step === "verified" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                <CheckCircleIcon size={18} className="text-accent" />
                <span className="text-sm text-accent">手机号已验证</span>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="ml-auto text-xs text-text-muted hover:text-text-primary"
                >
                  重新验证
                </button>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-2 block text-text-secondary">
                设置密码
              </label>
              <Input
                type="password"
                placeholder="请设置密码（至少6位）"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium mb-2 block text-text-secondary">
                确认密码
              </label>
              <Input
                type="password"
                placeholder="请确认密码"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || step !== "verified"}
              className="w-full btn-primary text-base mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2Icon size={18} className="animate-spin" />
                  注册中...
                </>
              ) : (
                "注册"
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-text-muted">
            已有账号？{" "}
            <Link href="/login" className="font-medium text-accent">
              立即登录
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6 text-text-muted">
          注册即表示同意{" "}
          <a href="#" className="text-accent">服务条款</a> 和{" "}
          <a href="#" className="text-accent">隐私政策</a>
        </p>
      </div>
    </div>
  );
}