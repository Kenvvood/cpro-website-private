import Link from "next/link";
import { ZapIcon, ArrowRightIcon } from "lucide-react";
import { BRAND } from "@/config/brand";

export function HeroSection() {
  return (
    <section className="px-20 pt-12 pb-16 relative overflow-hidden hero-section-bg">
      {/* Large background glow */}
      <div className="absolute pointer-events-none hero-glow-orb" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px hero-top-line" />

      <div className="max-w-4xl relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold mb-12 badge-glow">
          <ZapIcon size={16} />
          {BRAND.slogan.zh}
        </div>

        {/* Title */}
        <h1 className="font-bold mb-10 hero-title">
          让<span className="accent-glow-text">量化交易</span>
          <br />变得简单
        </h1>

        {/* Description */}
        <p className="text-[1.35rem] mb-12 leading-relaxed max-w-[700px] text-text-secondary">
          自主研发的智能EA、精准指标与高效脚本工具，专为外汇小白打造，助您轻松开启量化交易之路
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-12 py-5 text-lg rounded-xl transition-all btn-cta"
          >
            免费注册会员
            <ArrowRightIcon size={22} />
          </Link>
          <Link
            href="/products"
            className="px-12 py-5 text-lg font-semibold rounded-xl border transition-all btn-outline-accent"
          >
            查看全部产品
          </Link>
        </div>
      </div>
    </section>
  );
}
