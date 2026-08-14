/**
 * seed_articles.ts — Seed 5 篇 Article demo (v22.0 Phase 7.24 Batch 12)
 *
 * PM 反馈 2026-08-12: /articles 列表页空, seed 一些 demo 数据
 * 主题 (PURE 纯文章):
 *   1. MQL5 EA 仓位管理实战
 *   2. 黄金套利对 4 小时窗口规律
 *   3. R:R 1:3 期望值数学拆解
 *   4. XAUUSD 3300 关口多空博弈
 *   5. ECS + Prisma 7 部署踩坑
 *
 * 用法: npx tsx prisma/seed_articles.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

const ARTICLES = [
  {
    slug: 'mql5-ea-position-management',
    title: 'MQL5 EA 仓位管理实战: 1% 风险 + 10 点止损 = 0.5 手 XAUUSD',
    summary: '从凯利公式到实战仓位管理, 拆解 XAUUSD 1 手 = 100 oz 合约的盈亏模型, 用 3 个真实案例讲清楚单笔风险与总仓上限。',
    content: `# MQL5 EA 仓位管理实战

## 为什么 1% 是黄金分界线

在量化交易里, 仓位管理是**唯一**不需要预测行情也能控制回撤的工具。常见的几条经验线:

- **0.5%**: 极保守, 适合回撤 < 5% 的策略
- **1%**: 主流实战选择, 100 次连亏 0.5% × 100 = 50% 回撤 (实际上不会 100 连亏, 期望值 < 100)
- **2%**: 激进, 适合高胜率策略
- **5%**: 赌博, 不推荐

## XAUUSD 1 手 = 100 oz, 1 点 = $100/手

很多新手误以为 0.1 手是"10 oz", 实际上:

- 1 标准手 = 100 oz
- 1 点 (1 pip) = $0.1 / oz = **$10/手**
- 0.5 手 30 点移动 = 0.5 × 30 × 10 = **$150 盈亏**

## 实战案例: 1000 USDT 账户, 1% 风险, 20 点止损

\`\`\`
风险金额 = 1000 × 1% = $10
止损距离 = 20 点 = $2/oz
仓位手数 = 10 / (20 × 10) = 0.05 手
实际 oz = 0.05 × 100 = 5 oz
\`\`\`

5 oz 黄金 = 5 × 当前价 (3300) = **$16,500 仓位价值**, 杠杆 16.5 倍。

## 总结

仓位管理不是"算出来多少手就多少手", 而是**单笔风险 ≤ 账户 1% + 总仓 ≤ 5%** 的硬约束。在 MQL5 EA 代码里用 \`PositionsTotal()\` 跟 \`AccountInfoDouble(ACCOUNT_EQUITY)\` 实时校验, 不要靠"经验"。

下一篇: 黄金套利对 4 小时窗口规律。`,
  },
  {
    slug: 'gold-4h-window-pattern',
    title: '黄金套利对 4 小时窗口规律: 近 6 次央行决议统计',
    summary: 'XAUUSD/JPY 在日本央行决议前后 4 小时窗口的统计规律, 3 类入场机会胜率拆解, 适合统计套利策略参考。',
    content: `# 黄金套利对 4 小时窗口规律

## 数据来源

近 6 次日本央行 (BOJ) 利率决议前后 4 小时窗口, XAUUSD/JPY 走势统计 (2026 年):

| 决议日 | 决议前 4h | 决议后 4h | 净方向 |
|--------|----------|----------|--------|
| 01-24  | +0.8%    | -1.2%     | 跌     |
| 03-19  | -0.3%    | +1.5%     | 涨     |
| 04-28  | +0.2%    | +0.4%     | 涨     |
| 06-13  | -0.6%    | -0.1%     | 跌     |
| 07-31  | +0.5%    | -0.8%     | 跌     |
| 08-XX  | ...      | ...       | ...    |

## 3 类入场机会

### 1. 决议前 30 分钟, 跟随市场预期
胜率约 45%, 不建议大仓。

### 2. 决议后 5-30 分钟, 反向突破
胜率约 60%, 适合小仓快进快出。

### 3. 决议后 2-4 小时, 顺势跟进
胜率约 55%, 适合大仓, 止损清晰。

## 套利对策略

XAUUSD/JPY = 黄金价格 / 日元汇率。两者都是"避险资产"对"低息资产", 走势相关性高但**不是 1**。

当 BOJ 加息, 日元升值, XAUUSD/JPY 短期下跌; 但同时避险情绪推高 USD, 间接拉低 USDJPY, 进一步推高 XAUUSD/JPY。**两个力相互拉扯, 形成 4 小时窗口的统计套利空间**。

## 实战注意

- 滑点成本高 (4 小时窗口波动大)
- 流动性中等, 不适合 0.1 手以下
- 止损必须硬编码, 不能"等反弹"

下一篇: R:R 1:3 期望值数学拆解。`,
  },
  {
    slug: 'rr-13-expectation',
    title: 'R:R 1:3 期望值数学拆解: 50% 胜率长期仍盈利的底层逻辑',
    summary: '用数学期望值公式 E = p × W - (1-p) × L 拆解 R:R 1:3 策略, 为什么 50% 胜率也能长期盈利, 实战中 R:R 怎么严格执行。',
    content: `# R:R 1:3 期望值数学拆解

## 期望值公式

\`\`\`
E = p × W - (1-p) × L
\`\`\`

其中:
- p = 胜率
- W = 平均盈利 (风险单位 R 的倍数)
- L = 平均亏损 (固定 1R)

设 R:R = 3, 即 W = 3R, L = 1R:

\`\`\`
E = p × 3 - (1-p) × 1 = 4p - 1
\`\`\`

**E > 0** 当且仅当 **p > 0.25** (25% 胜率就长期盈利!)

## 实战胜率分布

| 胜率 | R:R 1:3 期望值 | 100 单净收益 |
|------|---------------|-------------|
| 30%  | +0.2R         | +20R        |
| 40%  | +0.6R         | +60R        |
| 50%  | +1.0R         | +100R       |
| 60%  | +1.4R         | +140R       |

## 关键陷阱: R:R 是 "R" 不是 "点"

实战中**不要用"点数"衡量 R:R**, 而要用**风险金额**:

- 风险 R = 入场价到止损价的距离 × 仓位手数
- 盈利 W = 出场价到入场价的距离 × 仓位手数
- R:R = W / R

例: 0.5 手 XAUUSD, 止损 20 点 ($100), 目标 60 点 ($300), R:R = 3 ✅

## 严格执行 R:R 的方法

1. **入场前就设好止损 + 止盈**, 不要"等等看"
2. **止损不能移** (除非已盈利 1R, 可以移到盈亏平衡)
3. **止盈不能提前撤** (除非出现反向信号)
4. **复盘 R:R 实际 vs 计划**, 长期下来才知道真实胜率

下一篇: XAUUSD 3300 关口多空博弈。`,
  },
  {
    slug: 'xauusd-3300-battle',
    title: 'XAUUSD 3300 关口的多空博弈: 50% 斐波那契回撤的实战用法',
    summary: '上周 XAUUSD 在 3300 上方 3 次测试未破, 详解 38.2% / 50% / 61.8% 三档关键位的实战意义, 配合 MACD 背离判断反转。',
    content: `# XAUUSD 3300 关口的多空博弈

## 背景

3300 美元/oz 是 2026 年黄金的关键心理关口, 上方套牢盘密集, 下方 3 月回调支撑位, 形成多空激烈博弈区。

## 斐波那契三档

从 4 月最低 3000 到 5 月最高 3500 计算:

- **38.2%** = 3182 (回撤支撑, 弱)
- **50.0%** = 3250 (回撤支撑, 强)
- **61.8%** = 3318 (回撤支撑, 极强)

## 实战 3 次测试

| 日期 | 触及位 | 结果 |
|------|-------|------|
| 07-12 | 3305  | 反弹 +120 点 |
| 07-25 | 3298  | 反弹 +85 点 |
| 08-08 | 3302  | 假突破后 -150 点 |

## MACD 背离

8-08 那次假突破, 日线 MACD 顶背离:
- 价格新高 (3302)
- MACD 柱子没新高 (反而低)

**这就是经典的"价量背离"反转信号**, R:R 1:2 做空可以抓到 300+ 点。

## 实战入场

1. 价格触及 3300 ± 10
2. 1h K 线出现 pin bar / 吞没形态
3. MACD 顶/底背离确认
4. 止损放 50 之外, 目标 50% 回调位 (3250) 或更低

下一篇: ECS + Prisma 7 部署踩坑。`,
  },
  {
    slug: 'ecs-prisma-deploy-pitfalls',
    title: 'ECS + Prisma 7 + Turbopack 部署 7 大坑: cpro-website 实战记录',
    summary: '阿里云 ECS 1.6G 内存, Prisma 7 无 index.js, Turbopack build 兼容, cloud assistant 退出后 nohup 被 kill, 7 个真实踩坑案例。',
    content: `# ECS + Prisma 7 + Turbopack 部署 7 大坑

## 坑 1: Prisma 7 无 index.js

**症状**: \`import { PrismaClient } from '@prisma/client'\` 报 "Cannot find module"
**根因**: Prisma 7 改成 prisma-client provider, 生成的 client 在 \`src/generated/prisma/\`
**解决**: 显式 \`import { PrismaClient } from '../src/generated/prisma/client'\`

## 坑 2: ECS 1.6G 内存 build OOM

**症状**: \`npm run build\` 报 JavaScript heap out of memory
**根因**: webpack 内存占用 2-3G
**解决**: 用 \`--turbo\` (Turbopack) build, 内存降到 800M

## 坑 3: Turbopack 变量名冲突

**症状**: 编译通过但 runtime 报 \`a.regime is not a function\`
**根因**: Turbopack minifier 把 i18n 的 \`t\` 跟局部变量 \`t\` 混淆
**解决**: 局部变量改名 (\`tutorial\`), i18n import 用唯一别名

## 坑 4: cloud assistant 退出后进程被 kill

**症状**: pm2 start 后过几小时进程消失
**根因**: 阿里云云助手是临时 shell, 退出后所有 nohup 子进程都被 SIGTERM
**解决**: 不用 cloud assistant 长期跑进程, 用 ECS 控制台 terminal 或 systemd

## 坑 5: 路径含 () 触发 subshell

**症状**: \`base64 -d > 'src/app/(marketing)/page.tsx'\` 报 unmatch \`(\`
**根因**: bash 把 \`(marketing)\` 当 subshell
**解决**: 单引号包整个路径

## 坑 6: 链式命令 cwd 陷阱

**症状**: \`cd APP_DIR && git add a b c\` 里 git add 部分 cwd=/root
**根因**: 阿里云 run_shell 默认 cwd=/root
**解决**: 所有命令用绝对路径, 每条独立传 working_dir

## 坑 7: 新目录必须先 mkdir

**症状**: \`base64 -d > 'src/app/api/quotes/route.ts'\` 报 Directory nonexistent
**根因**: 阿里云不会自动创建父目录
**解决**: 部署脚本必含 \`mkdir -p 'path' && base64 -d > 'path/file'\`

---

这是 cpro-website v22.0 部署的实战总结, 全部踩过一遍。`,
  },
];

async function main() {
  console.log('[seed_articles] starting, count:', ARTICLES.length);

  // 找 admin user 作为 author (seed_admin.ts 已经种过)
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' },
    select: { id: true, username: true },
  });
  if (!admin) {
    console.error('[seed_articles] FAILED: admin user not found, run seed_admin.ts first');
    process.exit(1);
  }
  console.log('[seed_articles] author:', admin);

  for (const a of ARTICLES) {
    // upsert by slug
    const existing = await prisma.article.findUnique({
      where: { slug: a.slug },
      select: { id: true },
    });

    if (existing) {
      const updated = await prisma.article.update({
        where: { id: existing.id },
        data: {
          title: a.title,
          summary: a.summary,
          content: a.content,
          type: 'PURE',
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        select: { id: true, slug: true, title: true },
      });
      console.log('[seed_articles] updated:', updated.slug);
    } else {
      const created = await prisma.article.create({
        data: {
          slug: a.slug,
          title: a.title,
          summary: a.summary,
          content: a.content,
          type: 'PURE',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 2000) + 500,
          authorId: admin.id,
        },
        select: { id: true, slug: true, title: true },
      });
      console.log('[seed_articles] created:', created.slug);
    }
  }

  // verify
  const count = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  console.log('[seed_articles] final published count:', count);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[seed_articles] FAILED:', err);
  prisma.$disconnect();
  process.exit(1);
});
