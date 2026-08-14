// postcss.config.mjs — Tailwind v4 + Next.js 16 集成
// 2026-08-15: 加 postcss config 强制 Tailwind v4 处理 globals.css
// 之前 build 出来 CSS 只有 font + 变量, 没 utility class (Tailwind v4 没扫到 source)
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
