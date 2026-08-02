import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { BRAND } from "@/config/brand";

const inter = Inter({ subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BRAND.name.zh} - ${BRAND.slogan.zh}`,
  description: BRAND.slogan.en,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* Global fixed badge - outside all components */}
        <div className="fixed top-6 left-6 z-[5000] pointer-events-none">
          <div className="inline-flex items-center justify-center glossy-badge text-[15px] font-bold px-5 py-2 rounded-xl tracking-wide pointer-events-auto">
            {BRAND.name.short}
          </div>
        </div>

        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
