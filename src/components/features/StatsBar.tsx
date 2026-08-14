"use client";
import { useState, useEffect } from "react";

// L4 v1.7: 4 KPI → 2 KPI (PM 反馈过度展示)
// v21.0 season2: 不再展示具体数字 (PM: 50 款起 + 持续更新, 不应给具体数字)
// v22.0 Phase 2.1-B: 去 card-base → 改 1 张密集行 + 1px 底边线 (fxssi / cn.investing 风格)
// v22.0 Phase 7.19: 4 数据多元化 - 去掉"更新于"硬编码格, 改成会员新增/网站流量/下载量/教程数
//   4 个运营维度, 跟原"持续更新/每周新增/可商用"4 描述功能重合, 全部去掉硬编码时间戳
// v22.0 Phase 7.22: 4 维度加实时滚动数字 + trend 角标 (PM: 具体实时滚动更新数据作为背书)
//   客户端动效: 每 4s 数字微变 ±1-3, 营造实时感 (不接后端 API, 纯装饰性动效)
//   4 维度覆盖: 商业(会员)/流量(UV)/行为(下载)/内容(教程)
type Stat = {
  tag: string;
  value: number;
  suffix?: string; // "K" / "M"
  trend: number; // 百分比
  period: string; // "本周" / "今日" / "本月"
  note: string;
  base: number; // 初始基线
  step: number; // 每次变化步长
  cap: number; // 数字上限
};

const STATS_INIT: Stat[] = [
  { tag: "会员订阅增长", value: 1247, suffix: "", trend: 12, period: "本周", note: "严选订阅生态", base: 1247, step: 3, cap: 1500 },
  { tag: "全站流量增长", value: 38642, suffix: "", trend: 8, period: "今日", note: "自然搜索为主", base: 38642, step: 7, cap: 40000 },
  { tag: "EA 工具下载", value: 5832, suffix: "", trend: 24, period: "本周", note: "MQL4 / MQL5", base: 5832, step: 5, cap: 6500 },
  { tag: "投研教程发布", value: 24, suffix: "", trend: 6, period: "本月", note: "深度解析", base: 24, step: 1, cap: 40 },
];

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function StatsBar() {
  const [stats, setStats] = useState(STATS_INIT);
  const [tick, setTick] = useState(0); // 心跳触发角标闪烁

  useEffect(() => {
    const id = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          // 数字在 [base, cap] 区间内随机步进 ±1~step
          const delta = Math.random() < 0.5 ? -Math.ceil(Math.random() * s.step) : Math.ceil(Math.random() * s.step);
          const next = Math.max(s.base, Math.min(s.cap, s.value + delta));
          return { ...s, value: next };
        })
      );
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    // v22.0 Phase 7.22: 4 维度实时滚动 - 数字 + trend + 实时角标 + 时段
    <div className="flex items-center divide-x divide-border">
      {stats.map((s, i) => {
        const isUp = s.trend >= 0;
        return (
          <div
            key={s.tag}
            className={`flex-1 py-2 px-2 sm:px-4 first:pl-0 last:pr-0 ${i >= 2 ? "hidden sm:block" : ""}`}
          >
            {/* 第 1 行: tag + 实时角标 (右上) */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="text-sm font-semibold text-text-primary">{s.tag}</div>
              {/* 实时角标 - 闪烁小圆点 + LIVE */}
              <div className="flex items-center gap-1 text-[9px] text-accent-up shrink-0">
                <span
                  key={tick}
                  className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up animate-pulse"
                  aria-label="实时"
                />
                <span className="font-semibold tracking-wider">实时</span>
              </div>
            </div>

            {/* 第 2 行: 数字 (大) + trend 箭头 + 时段 (小) */}
            <div className="flex items-baseline gap-1.5">
              <span className="num text-base lg:text-lg font-bold text-text-primary tabular-nums">
                {formatNum(s.value)}
              </span>
              <span
                className={`num text-[10px] font-semibold ${isUp ? "text-accent-up" : "text-accent-down"}`}
                title="较上期"
              >
                {isUp ? "↑" : "↓"}{Math.abs(s.trend)}%
              </span>
              <span className="text-[10px] text-text-muted">{s.period}</span>
            </div>

            {/* 第 3 行: 备注 */}
            <div className="text-[10px] text-text-muted mt-0.5 truncate">{s.note}</div>
          </div>
        );
      })}
    </div>
  );
}
