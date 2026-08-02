import Link from "next/link";
import { BRAND } from "@/config/brand";

export function Footer() {
  return (
    <footer className="py-10 px-20 flex justify-between items-center text-sm border-t footer">
      <span>© {BRAND.copyright.year} {BRAND.copyright.entity}</span>
      <div className="flex gap-6">
        <Link href={BRAND.legal.privacyPolicy} className="hover:opacity-80 transition-opacity">隐私政策</Link>
        <Link href={BRAND.legal.termsOfService} className="hover:opacity-80 transition-opacity">服务条款</Link>
        <Link href="#" className="hover:opacity-80 transition-opacity">联系我们</Link>
      </div>
    </footer>
  );
}
