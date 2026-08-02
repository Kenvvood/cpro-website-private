import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-20 relative cta-section-bg">
      <div className="max-w-lg">
        <h2 className="text-3xl font-bold mb-4 cta-title-text">
          准备好开始了吗？
        </h2>
        <p className="text-[17px] leading-relaxed mb-8 text-text-secondary">
          注册会员，免费下载全部MT4/MT5量化工具，还有专业教程和成功案例参考
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-lg transition-all cta-btn"
        >
          立即注册
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </section>
  );
}
