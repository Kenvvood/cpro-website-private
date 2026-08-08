// postcss.config.mjs — Vercel 云端打包机需要明确指定 Tailwind v4 插件
// (task072 抢修: 之前 build PASS 是因为本地 next 自动检测,
//  Vercel 打包机更严格, 必须显式配置文件才识别 tailwindcss 指令)
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;