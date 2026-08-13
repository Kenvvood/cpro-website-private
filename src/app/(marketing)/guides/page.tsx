// src/app/(marketing)/guides/page.tsx
// v22.0 Phase 7.24 Batch 10 PATCH: 重做 - 不做博客样式, 改实战项目风 (大卡片 + 视频缩略图块)
// PM 决策: 部署教程跟 /content 大航海时代不同, 这里是实操手册库
// v22.0 Phase 7.24 Batch 13: SEO 完整
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "部署教程 - EA / 服务器 / MTT 终端实战手册 | CProTrading",
  description: "城诺科技产品部署实战手册库, 录屏视频 + 步骤截图 + 命令清单, EA 部署 / 服务器搭建 / MTT 终端 4 大主题跟着做就能跑通。",
  path: "/guides",
  image: "/og-guides.png",
  keywords: ["部署教程", "EA 部署", "MT4", "MT5", "MQL5", "服务器", "MTT 终端", "教程", "实战手册"],
});

type Guide = {
  type: "video" | "article" | "case";
  slug: string;
  title: string;
  desc: string;
  category: string;
  difficulty: "入门" | "进阶" | "高阶";
  duration?: string;
  updatedAt: string;
  author: string;
  cover?: string; // emoji 占位
};

// 实战项目风: 主题分组, 大卡片 + 视频缩略图
const SECTIONS = [
  {
    id: "ea",
    title: "EA 部署实战",
    desc: "把 MTT 系列 EA 跑起来的所有实操步骤",
    guides: [
      {
        type: "video" as const,
        slug: "ea-deploy-step-by-step",
        title: "MT4 上一键部署 MTT EA",
        desc: "下载 → 复制到 MT4 → 挂载图表 → 启动弹窗设置 → 实盘运行, 8 分钟录屏。",
        category: "EA 部署",
        difficulty: "入门" as const,
        duration: "08:23",
        updatedAt: "2026-08-10",
        author: "CProTrading 投研",
        cover: "🎬",
      },
      {
        type: "article" as const,
        slug: "param-tuning-guide",
        title: "EA 参数调优 10 条实战法则",
        desc: "从默认参数到严选参数的 10 条实战法则, 含调优前后回测对比。",
        category: "EA 部署",
        difficulty: "高阶" as const,
        updatedAt: "2026-07-15",
        author: "CProTrading 投研",
        cover: "📋",
      },
    ],
  },
  {
    id: "server",
    title: "服务器部署实战",
    desc: "VPS / ECS / 本地 4 种部署方案对比 + 实操",
    guides: [
      {
        type: "video" as const,
        slug: "vps-setup-walkthrough",
        title: "阿里云 ECS 部署 EA 全流程",
        desc: "ECS 选型 → 系统初始化 → MT4 安装 → EA 部署 → pm2 守护, 12 分钟录屏。",
        category: "服务器部署",
        difficulty: "进阶" as const,
        duration: "12:47",
        updatedAt: "2026-08-08",
        author: "CProTrading 运维",
        cover: "🖥️",
      },
      {
        type: "article" as const,
        slug: "vps-deploy-best-practice",
        title: "VPS vs ECS vs 本地: 严选实盘部署方案",
        desc: "AWS / 阿里云 / 腾讯云 / 本地 4 种方案对比, 给出严选推荐配置 (1.6G 内存起步)。",
        category: "服务器部署",
        difficulty: "进阶" as const,
        updatedAt: "2026-08-05",
        author: "CProTrading 运维",
        cover: "🗂️",
      },
    ],
  },
  {
    id: "mtt",
    title: "MTT 终端实战",
    desc: "MTT 智能交易终端从 0 到 1 上手",
    guides: [
      {
        type: "video" as const,
        slug: "mtt-terminal-walkthrough",
        title: "MTT 终端完整操作演示",
        desc: "主界面 + 策略画布 + 多账户同步 + 回测报告 + 实盘切换, 15 分钟录屏。",
        category: "MTT 终端",
        difficulty: "入门" as const,
        duration: "15:32",
        updatedAt: "2026-07-28",
        author: "CProTrading 产品",
        cover: "🎥",
      },
      {
        type: "article" as const,
        slug: "mtt-terminal-quickstart",
        title: "MTT 终端 5 分钟快速上手",
        desc: "下载 → 绑定券商 → 选策略模板 → 启动自动交易, 5 分钟跑通。",
        category: "MTT 终端",
        difficulty: "入门" as const,
        updatedAt: "2026-07-25",
        author: "CProTrading 产品",
        cover: "⚡",
      },
      {
        type: "case" as const,
        slug: "case-terminal-blowup-recovery",
        title: "从 2 次爆仓到 30 天稳定 - MTT 终端使用记录",
        desc: "用户真实故事, 之前手动交易爆仓 2 次, 切 MTT 终端严选风控后 30 天稳定。",
        category: "MTT 终端",
        difficulty: "入门" as const,
        updatedAt: "2026-07-20",
        author: "用户 李先生",
        cover: "💬",
      },
    ],
  },
  {
    id: "risk",
    title: "风控实战",
    desc: "严选风控 3 道闸的具体数值与回测验证",
    guides: [
      {
        type: "article" as const,
        slug: "risk-control-best-practice",
        title: "严选风控 - 3 道闸配置实战",
        desc: "单笔止损 / 日回撤 / 最大持仓 3 道闸的具体数值建议, 跟 MTT 终端严选风控一致。",
        category: "风控",
        difficulty: "高阶" as const,
        updatedAt: "2026-07-10",
        author: "CProTrading 投研",
        cover: "🛡️",
      },
    ],
  },
];

const TYPE_BADGE: Record<"video" | "article" | "case", { label: string; cls: string }> = {
  video: { label: "录屏", cls: "border-accent-gold/40 text-accent-gold bg-accent-gold/5" },
  article: { label: "手册", cls: "border-accent-blue/30 text-accent-blue" },
  case: { label: "实战", cls: "border-accent-up/30 text-accent-up bg-accent-up/5" },
};

const TOTAL_GUIDES = SECTIONS.reduce((s, sec) => s + sec.guides.length, 0);
const TOTAL_VIDEOS = SECTIONS.reduce(
  (s, sec) => s + sec.guides.filter((g) => g.type === "video").length,
  0
);
const TOTAL_CASES = SECTIONS.reduce(
  (s, sec) => s + sec.guides.filter((g) => g.type === "case").length,
  0
);

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        {/* 1. Hero (顶部留白克制) */}
        {/* BATCH 15 PATCH 4: 移动 pt-2 (紧跟 TickerBar 30), 桌面 pt-12 lg:pt-16 保持 */}
        {/* v22.0 BATCH 15 PATCH 9: PATCH 4 lg:pt-16 在 8px 基准下 = 128px 略大 → 改成 lg:pt-14 (112px) 跟 PATCH 7 一致 */}
        <section className="pt-2 sm:pt-12 lg:pt-14 pb-8 max-w-5xl">
          <div className="text-xs text-text-muted mb-3 tracking-widest uppercase">
            部署教程
          </div>
          <h1 className="h1-lg mb-3">
            跟着做,<br />
            <span className="text-accent-blue">就能跑通</span>。
          </h1>
          <p className="text-base lg:text-lg text-text-secondary leading-[28px] max-w-3xl">
            录屏 + 步骤截图 + 命令清单, 实战项目风的实操手册库。
            不用自己摸索, 跟着做就能把 MTT 系列 EA 跟终端跑起来。
          </p>
        </section>

        {/* 2. 统计 (简洁) */}
        <section className="py-6 border-y border-border">
          <div className="flex items-center gap-4 lg:gap-8 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary num">{TOTAL_GUIDES}</span>
              <span className="text-xs text-text-muted">个实操手册</span>
            </div>
            <div className="text-xs text-text-muted">|</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-accent-gold num">{TOTAL_VIDEOS}</span>
              <span className="text-xs text-text-muted">段录屏</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-accent-up num">{TOTAL_CASES}</span>
              <span className="text-xs text-text-muted">个实战</span>
            </div>
            <div className="text-xs text-text-muted ml-auto">持续更新中</div>
          </div>
        </section>

        {/* 3. 主题分组 + 大卡片 (实战项目风) */}
        {SECTIONS.map((section, sIdx) => (
          <section
            key={section.id}
            className={`py-8 lg:py-12 ${sIdx > 0 ? "border-t border-border" : ""}`}
          >
            {/* 主题头部 */}
            <div className="mb-6 lg:mb-8 flex items-baseline gap-3 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-accent-blue num font-mono">
                {String(sIdx + 1).padStart(2, "0")}
              </span>
              <h2 className="text-xl lg:text-2xl font-bold text-text-primary">
                {section.title}
              </h2>
              <span className="text-xs text-text-muted">— {section.desc}</span>
            </div>

            {/* 卡片 grid (2 栏, 视频类型 1.5 栏视觉突出) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {section.guides.map((g) => {
                const badge = TYPE_BADGE[g.type];
                const isVideo = g.type === "video";
                return (
                  <Link
                    key={g.slug}
                    href={`#${g.slug}`}
                    className="group block border border-border bg-bg-card hover:border-accent-blue transition-colors"
                  >
                    {/* 缩略图块 (录屏类型用更大区域 + ▶ 角标, 手册用浅色背景 + emoji) */}
                    <div
                      className={`relative aspect-[16/9] flex items-center justify-center overflow-hidden ${
                        isVideo ? "bg-bg-tertiary" : "bg-bg-secondary"
                      }`}
                    >
                      {isVideo ? (
                        <>
                          <div className="text-6xl text-text-muted opacity-30 group-hover:opacity-50 transition-opacity">
                            {g.cover}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-2xl text-text-primary shadow-lg group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs num font-mono">
                            {g.duration}
                          </div>
                        </>
                      ) : (
                        <div className="text-7xl text-text-muted opacity-50 group-hover:opacity-70 transition-opacity">
                          {g.cover}
                        </div>
                      )}
                      {/* 类型徽章 */}
                      <div className="absolute top-2 left-2">
                        <span className={`inline-block px-2 py-0.5 border text-[10px] ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* 卡片内容 */}
                    <div className="p-4 lg:p-5">
                      <h3 className="text-base lg:text-lg font-semibold text-text-primary leading-snug mb-2 group-hover:text-accent-blue transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-[24px] mb-3 line-clamp-2">
                        {g.desc}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted pt-3 border-t border-border">
                        <span>{g.difficulty}</span>
                        <span>·</span>
                        <span>{g.author}</span>
                        <span>·</span>
                        <span className="num">{g.updatedAt}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* 4. 录屏视频模块占位 (未来实装) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="text-xs text-text-muted mb-2 tracking-widest uppercase">
            录屏视频库
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-8">
            录屏实操, 边看边做
          </h2>
          <div className="border border-border bg-bg-secondary aspect-[21/9] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl text-text-muted mb-3">▶</div>
              <div className="text-base text-text-muted">录屏视频库占位</div>
              <div className="text-xs text-text-muted mt-1">
                未来实装: 嵌入 B 站 / 自托管 mp4
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            * 录屏视频库将支持 B 站嵌入 + 自托管 mp4, PM 录制完成后挂入。
          </p>
        </section>

        {/* 5. 提交教程 (CTA) */}
        <section className="py-10 lg:py-14 border-t border-border">
          <div className="border border-border bg-bg-card p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">
                  想投稿实操手册 / 实战案例?
                </h2>
                <p className="text-sm text-text-secondary leading-[24px] max-w-2xl">
                  合伙人 / 高级会员可投稿录屏视频 + 实操手册, 经审核后收录并署名。
                  优质投稿可获得会员天数奖励。
                </p>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <Link href="/articles/new" className="btn-primary text-sm whitespace-nowrap">
                  立即投稿
                </Link>
                <div className="text-xs text-text-muted">
                  或联系 <span className="font-mono text-text-primary">{BRAND.contact.officialWechat}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
