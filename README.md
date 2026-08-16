# cpro-website (v22.0)

> **CProTrading 城诺科技官方产品** — 严选可商用 MQL4/MQL5 EA / 实用工具 / 投研教程 / 链上 USDT 订阅
>
> 当前状态：**生产 ECS 在线 (公网 8.163.74.235 · cprotrading.com)**
> ECS HEAD: `14d87d8` (2026-08-17) · Next.js 16 + Prisma 7 + SQLite (libsql) + NextAuth v4 + Tailwind v4

---

## 📑 目录

1. [项目介绍](#项目介绍)
2. [技术栈](#技术栈)
3. [快速启动](#快速启动)
4. [部署](#部署)
5. [架构](#架构)
6. [监控 / 备份 / 安全](#监控--备份--安全)
7. [关键约束](#关键约束)
8. [License 门禁 (PM 上传节奏)](#license-门禁)
9. [联系人](#联系人)

---

## 项目介绍

cpro-website 是 CProTrading 城诺科技的产品官网 + 商业化平台, 提供:

- **5 王牌 EA** (mtt-ace-*): PM 自家 v1, Proprietary 专有授权 + 5 份 License PDF
- **46 严选订阅** (mtt-pro/grid/trend/signal/tool/util): 首批 50 上线, 后续每批 10 增量
- **6 款实战工具**: 斐波那契 / 枢轴点 / 持仓规模 / 点值&盈亏 / 风险回报比 / 汇率换算
- **5 部署教程**: EA / 服务器 / MTT 终端 / Ubuntu / 监控告警
- **5 研报文章** (Article 表): 黄金 / 套利 / 风控 / R:R 拆解 / 央行决议
- **6 营销页 + 7 法律页 + 2 文档页** (/legal/* + /mps)

**核心架构特点**:
- 三圈层游客访问设计: 营销层 (公开) / 转化层 (强引导登录) / 隐身层 (404)
- 多角色: 游客 / 注册 / 会员 / 管理员 / 审核员
- 严选可商用授权: License 字段 + License PDF URL + 链上 USDT 结算
- 实时行情: TickerBar (12 品种) 头部粘性滚动
- 数据密集 UI: 借鉴 fxssi.com / Bloomberg / TradingView

---

## 技术栈

| 维度 | 选型 | 版本 | 备注 |
|------|------|------|------|
| 框架 | **Next.js** | 16.2.3 | App Router + Turbopack (默认) |
| UI | **React** | 19.2.4 | Server Components 优先 |
| 样式 | **Tailwind CSS v4** | 4.x | 8px 间距基准, 无 preflight |
| 组件 | **shadcn** + Base UI | 4.2.0 + 1.4.0 | headless 可访问性 |
| ORM | **Prisma** | 7.7.0 | + @prisma/adapter-libsql |
| DB | **SQLite** (libsql) | 0.17.2 | 7 表 + 1 单文件 (dev.db) |
| 鉴权 | **NextAuth** v4 | 4.24.14 | JWT + 阿里云 SMS 验证码 |
| 缓存 | **Upstash Redis** | 1.38.2 | SMS 限频 (降级 fail-open) |
| 监控 | **阿里云 ARMS** | - | @arms/js-sdk CDN (BATCH 18.3) |
| 告警 | **钉钉机器人** | - | webhook (BATCH 18.4) |
| 备份 | **阿里云 OSS** | - | cprotrading-backup 桶 (BATCH 18.1) |
| 部署 | **阿里云 ECS** | - | i-7xvi7nrr9ehkrkjd0fxf (广州) |
| 容器 | **Docker** (待启用) | - | Dockerfile 已有 (BATCH 21) |

---

## 快速启动

### 环境要求

- **Node.js** 20+ (Next.js 16 强制)
- **npm** 10+
- **Git** 2.30+

### 本地开发

```bash
# 1. 克隆
git clone https://github.com/Kenvvood/cpro-website-private.git
cd cpro-website-private

# 2. 装依赖
cd cpro-website
npm install

# 3. 初始化数据库 (Prisma SQLite)
npx prisma db push
npx prisma generate
npm run db:seed  # 可选: 跑 seed_assets.ts 灌种子

# 4. 启动 dev server
npm run dev
# → http://localhost:3000

# 5. (可选) Tailwind v4 utility 数量验证
curl -s http://localhost:3000 | grep -c 'class='
# 应在 280-420 范围内
```

### .env 配置 (本地 .env.development)

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-32-chars-min-change-in-prod"
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
# 可选: SMS 限频
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### 关键脚本

```bash
npm run dev          # Next.js 16 dev (Turbopack hot reload)
npm run build        # 生产 build (输出 .next/standalone/)
npm start            # npm start
npx next start       # 同上
npm run lint         # ESLint
npm run db:seed      # Prisma seed
npm run db:generate  # Prisma client 生成
```

---

## 部署

### ECS (Aliyun 阿里云)

**当前 ECS 实例**:
- Instance ID: `i-7xvi7nrr9ehkrkjd0fxf`
- Region: `cn-guangzhou` (广州)
- 公网 IP: `8.163.74.235` (BATCH 15 部署时已漂移, 历史 47.110.142.42 已释放)
- OS: 阿里云 Linux 3
- 部署方式: 短命令串行 (5-7 条 RunCommand) + 强重启兜底

**部署流程** (见 `G:\CodeBase\.harness\scripts\_b21b_redo.py`):

```bash
# 本地: 推送
git push origin main

# ECS: 拉取 + build + 重启 (前台 180s timeout)
cd /var/www/cpro-website
git fetch origin main && git reset --hard origin/main
npx next build          # 60-90s
ls .next/standalone/server.js
pm2 delete cpro-web 2>/dev/null
pm2 start npm --name cpro-web -- start
```

**强重启 (触发 ECS 死锁时)**:

```python
# Mavis 化强重启 - 不用等 PM 控制台, 直接 SDK
from alibabacloud_ecs20140526.client import Client as EcsClient
from alibabacloud_ecs20140526 import models as ecs_models

c = EcsClient(cfg)  # cn-guangzhou region
req = ecs_models.RebootInstanceRequest(
    instance_id='i-7xvi7nrr9ehkrkjd0fxf',
    force_stop=True,
)
c.reboot_instance(req)
# 10s 内 Running, .env.production 保留
```

### Docker (待启用)

**镜像**:
- 基础: `node:20-alpine`
- 启用 `output: "standalone"` (BATCH 21)
- 大小: ~200MB (vs 完整 build 800MB)
- 多阶段: deps → builder → runner

**Build**:
```bash
docker build -t cpro-website:latest .
docker run -p 3000:3000 \
  -v /data/cpro/dev.db:/app/prisma/dev.db \
  -v /data/cpro/.env.production:/app/.env.production:ro \
  cpro-website:latest
```

`.dockerignore` 排除 `.harness`, `.next`, `node_modules`, `prisma/dev.db`, `.env.production` 等。

---

## 架构

### 目录结构

```
cpro-website/
├── prisma/
│   ├── schema.prisma           # 17 表 (Product, User, Membership, Article, ...)
│   ├── dev.db                  # SQLite (本地+ECS 共享路径)
│   └── migrations/             # 3 迁移历史
├── public/
│   ├── products/               # 51 mtt- 缩略图 (程序化 SVG + AI 王牌)
│   ├── licenses/               # 5 王牌 PDF (PM 上传, 待)
│   ├── og-image.png            # 1200x630 品牌图
│   └── ...
├── scripts/
│   ├── backup_db.py            # OSS 备份
│   ├── restore_db.py           # OSS 还原
│   ├── health_check.sh         # /api/health + 钉钉告警
│   ├── update_license_from_master.py  # B 任务 (master.db → Product.license)
│   └── update_ace5_copyright.py # C 任务 (5 王牌 Proprietary)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # 公开营销页
│   │   │   ├── page.tsx        # /
│   │   │   ├── tools/          # /tools
│   │   │   ├── guides/         # /guides
│   │   │   ├── wealth/         # /wealth
│   │   │   ├── about/          # /about
│   │   │   └── ...
│   │   ├── (member)/           # 注册/会员 (无强制登录, 自愿)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── membership/
│   │   │   └── account/
│   │   ├── (admin)/            # 管理后台 (requireAdmin)
│   │   ├── products/           # PLP + PDP
│   │   ├── articles/           # 研报文章
│   │   ├── legal/              # 7 法律页 (privacy/terms/refund/cookies/disclaimer/mps/gpl-notice)
│   │   ├── api/                # REST API
│   │   └── layout.tsx          # 根 layout (含 Header + TickerBar)
│   ├── components/
│   │   ├── layout/             # Header / Footer / TickerBar
│   │   ├── features/           # Hero / StatsBar / ProductGrid / PricingTable
│   │   ├── tools/              # ToolIcon (6 程序化 SVG)
│   │   └── monitor/            # ARMSBrowserInit / GlobalErrorBoundary
│   ├── lib/                    # 业务逻辑
│   │   ├── prisma.ts           # Prisma client 单例
│   │   ├── auth.ts             # NextAuth options
│   │   ├── i18n/               # 字典 + 类别别名
│   │   ├── seo.ts              # buildSeoMetadata (BATCH 13)
│   │   ├── monitor.ts          # captureException / captureMessage
│   │   ├── rate-limit.ts       # 阿里云 SMS 限频
│   │   └── ...
│   └── generated/prisma/       # Prisma 客户端 (auto-gen)
├── next.config.ts              # security headers + standalone + 优化
├── tailwind.config + globals.css  # Tailwind v4 @theme
├── Dockerfile                  # BATCH 21 (200MB 镜像)
├── .dockerignore
└── package.json
```

### 关键路由 (45+ 路由)

| 路径 | 公开 | 鉴权 | 备注 |
|------|------|------|------|
| `/` | ✅ | - | 9 区块 hero + 4 数字徽章 |
| `/products` | ✅ | - | 5 列表格 + sidebar 分布 |
| `/products/[id]` | ✅ | - | PDP 重数据 + 7 列布局 |
| `/tools` | ✅ | - | 6 卡片 grid + 程序化 SVG |
| `/guides` | ✅ | - | 视频缩略图块 + 实战手册 |
| `/wealth` | ✅ | - | 2 项目并列 (量化托管 + MTT 终端) |
| `/articles` | ✅ | - | 5 研报文章 |
| `/membership` | ✅ | - | 订阅页 (登录后显示当前 plan) |
| `/dashboard` | - | ✅ | 用户中心 |
| `/admin` | - | requireAdmin | 后台 (admin 用户) |
| `/legal/*` | ✅ | - | 7 法律页 (含 mps 占位) |
| `/api/*` | - | - | 25 API 路由 (REST) |

### 数据模型 (Prisma 17 表)

核心表:
- **Product** (id cuids, tier, score, isFeatured, license, licenseFileUrl, ...) - 11,293 行 (5 王牌 + 46 严选 + 11,242 历史)
- **User** (id, phone, password, memberLevel) - 1 行 (admin)
- **Membership** (userId, plan, status, expireAt) - 链上 USDT 订阅
- **Article** (slug, title, content, views) - 5 行
- **Order** (userId, productId, amount, payMethod) - USDT 订单
- **Refund** (orderId, reason, status) - 退款
- **Review** + **ReviewReply** - 评价
- **OpenSourceRelease** + **OpenSourceTutorial** - 开源发布 + 教程
- **EAConfig** + **EAConfigModule** + **EAPosition** + **EARunSession** + **EARunLog** - EA 运行
- **DownloadRecord** - 下载历史
- **UpgradeConversion** - 升级转化
- **Comment** + **Like** - 互动
- **PromotionLog** + **ModeratorApplication** - 运营

---

## 监控 / 备份 / 安全

### 监控

- **ARMS 前端 SDK** (@arms/js-sdk CDN, BATCH 18.3): 自动捕获 PV/UV/错误/性能
  - PID: `aq43jycen0@d52c60b05627454` (NEXT_PUBLIC_ARMS_PID)
  - 路径: `src/components/monitor/ARMSBrowserInit.tsx` (layout 集成)
- **后端监控** (lib/monitor.ts): `captureException` / `captureMessage` 抽象层
- **/api/health** 端点: `pm2 / db / redis / uptime / memory` 实时状态
- **/api/monitor/client-error**: 客户端错误上报 (POST)

### 备份

- **OSS 备份** (BATCH 18.1, scripts/backup_db.py):
  - Cron: `0 3 * * * /var/www/cpro-website/scripts/backup_cron.sh`
  - 桶: `cprotrading-backup` (广州 region, 低频访问, 私有, 30 天生命周期)
  - 清理: 自动删 30 天前备份
- **健康检查 cron**:
  - Cron: `*/5 * * * * /var/www/cpro-website/scripts/health_check.sh`
  - 行为: /api/health 失败 → 钉钉 webhook 告警

### 告警

- **钉钉群**: "CPro Trading 告警群" (自定义机器人)
- **Webhook**: `https://oapi.dingtalk.com/robot/send?access_token=...`
- **安全设置**: 关键词 (`告警`/`CPro`/`ECS`) + IP 白名单 (`8.163.74.235`)
- **告警类型**: ECS 健康 5xx / 钉钉机器人故障 / 备份失败 / 监控异常

### 安全头 (next.config.ts 7 项)

```ts
headers: [
  { "Cache-Control": "no-store, no-cache, must-revalidate" },
  { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" },
  { "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..." },
  { "X-Content-Type-Options": "nosniff" },
  { "X-Frame-Options": "DENY" },
  { "Referrer-Policy": "strict-origin-when-cross-origin" },
  { "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()" },
]
```

---

## 关键约束

### ⚠️ Tailwind v4 utility 陷阱

```bash
# ❌ 错误: PowerShell + bash + grep 三层转义, 永远返 0
cat .next/static/css/*.css | grep -c -E '\.flex|\.grid'

# ✅ 正确: Python re 数
python3 -c "import re; css=open('.next/static/css/abc.css').read(); print(len(re.findall(r'\.[a-z][a-zA-Z0-9_-]+\s*\{', css)))"
# 期望 280-420
```

### ⚠️ Next.js 16 searchParams Promise

```tsx
// ❌ 错误
export default async function Page({ searchParams }: { searchParams: SearchParams }) {}

// ✅ 正确
export default async function Page({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const sp = await searchParams
}
```

### ⚠️ ECS 死锁模式 (5+ 次踩过)

- **症状**: 频繁 RunCommand + 长 build (后台 nohup) → 后续 5+ 分钟 Pending, 所有命令 Aborted
- **修复**: Mavis 化强重启 `RebootInstance(force_stop=true)`, 10s 内 Running
- **避免**: 不要 nohup 后台跑长 build, 用前台 180s timeout
- **前提**: .env.production 是 untracked, 强重启不丢

### ⚠️ ECS 公网 IP 漂移

- **历史 IP 47.110.142.42 已释放**
- **真实当前 IP 8.163.74.235** (BATCH 15 起漂移)
- **铁律**: 部署前先看阿里云控制台实例详情, 别依赖历史值
- **替代**: 阿里云 RunCommand API 走 `instance_id` 不依赖 IP

### ⚠️ Prisma db push 必跟 schema 一起做

任何 schema 改动部署必须 4 步: `git pull` → `npx prisma db push --accept-data-loss` → `npx prisma generate` → `pm2 restart`, 4 步不能漏 (c796166 之前漏过导致 dev.db 无新列)。

### ⚠️ master.db mql_files schema 真实列

`mql_files` 列: `file_id` / `internal_id` / `original_name` / `license` / ... **没有 `id` / `name` 列**！B+C 脚本 v1 用 `mql_files.id` 直接报错。v2 改用 `Product.name → master.db.original_name` 模糊匹配。

### ⚠️ mtt- 公网池 (PM 拍板 2026-08-22)

- **51 个 mtt- 商品** (5 王牌 + 46 严选) 在公网可见
- **11,242 algo-forge- 等历史占位** isActive=1 但 **不在公网页** (id startsWith 'mtt-' 过滤)
- B+C 任务范围: **mtt- 池** (不是 11,293 全表)
- 公网过滤代码: `src/app/products/page.tsx whereActive.id.startsWith('mtt-')`

---

## License 门禁

**PM 上传节奏** (2026-08-16 拍板):
- **首批 50** (含 5 王牌已先种 + 46 严选首批)
- **后续每批 10** (每周增量)
- 不做一次性上传

**5 王牌 (mtt-ace-*)**:
- license: `Proprietary` (PM 自家, 跟其他开源不同)
- licenseFileUrl: `https://www.cprotrading.com/licenses/{id}.pdf`
- 任务: `python3 scripts/update_ace5_copyright.py`

**46 严选订阅**:
- license: 从 mql-phase2 master.db 拉 (GPL-3 / Apache-2.0 / MIT / BSD / Proprietary)
- 任务: `python3 scripts/update_license_from_master.py`
- 前提: PM 上传 master.db 到 `/var/www/cpro-website/scripts/master.db`, 跑完删

**候选数 40** (5 王牌 isFeatured=1 跳过 + 6 Tier 3 跳过)

---

## 联系人

| 角色 | 负责人 | 触点 |
|------|--------|------|
| 产品经理 (PM) | Lookee | QQ 3624597882 · 微信 Lookee333 · 手机 18688198932 |
| 云端架构师 (Gemini) | MTT v2.0 体系 | (待对接) |
| 本地全栈 (Mavis) | - | 通过 `.harness/` 协同 |

---

## 部署历史 (CHANGELOG)

- **v22.0 BATCH 22 PATCH B (2026-08-17)**: SEO 6 marketing 页统一 (4 缺页补 buildSeoMetadata)
- **v22.0 BATCH 22 PATCH A (2026-08-17)**: Header nav 桌面 8 + 移动 9, /articles 入口只加在移动菜单
- **v22.0 BATCH 21 PATCH B (2026-08-17)**: 产品缩略图 40→32px (业界表格标准)
- **v22.0 BATCH 21 PATCH A (2026-08-16)**: /products 缩略图 48→40px + /tools 6 工具程序化 SVG
- **v22.0 BATCH 19 (2026-08-16)**: 3 营销页 hero 排版 + 文案统一
- **v22.0 BATCH 18.5 (2026-08-16)**: B+C License 脚本 + 5 王牌 C 任务 (5/5 license=Proprietary)
- **v22.0 BATCH 18.4 (2026-08-16)**: 钉钉 webhook 告警
- **v22.0 BATCH 18.3 (2026-08-16)**: ARMS 前端 SDK (@arms/js-sdk CDN)
- **v22.0 BATCH 18.1 (2026-08-16)**: 阿里云 OSS 备份 + 30 天生命周期
- **v22.0 BATCH 17 (2026-08-15)**: P0 polish - 6 法律页 + 备案 + 监控 + 备份 + 安全头
- **v22.0 BATCH 16 (2026-08-14)**: 11 PATCH (1-7.10) - UI polish + spacing 修复 + responsive + 缩略图

---

**Last updated**: 2026-08-17 (commit `14d87d8`) by Mavis
