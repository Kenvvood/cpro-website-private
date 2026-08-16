// v22.0 BATCH 21 (2026-08-16 23:50): /tools 6 工具的程序化 SVG 缩略图
//  - 替换原大数字 emoji (TOOL_ICON: "𝟐𝟑.𝟔" / "𝐑/𝐒" / "𝟎.𝟎𝟐" / "$𝟏" / "𝟏:𝟑" / "𝟗")
//  - PM 反馈: 分布生成, 不要过于 AI 风格, 清晰度高
//  - 风格: 几何/数据图 (类似 fxssi 工具图), 程序化路径, 无 AI art
//  - 16:9 比例 (跟 aspect-[16/9] 一致), viewBox 160x90
//  - 颜色: 品牌配色 (accent-blue/gold/up/down + text-muted)
import * as React from "react";

const STROKE = "currentColor";
const FONT = "font-mono";

interface ToolIconProps {
  slug: string;
  className?: string;
}

export function ToolIcon({ slug, className }: ToolIconProps) {
  return (
    <svg
      viewBox="0 0 160 90"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${slug} icon`}
    >
      {slug === "fibonacci" && <FibonacciIcon />}
      {slug === "pivot-point" && <PivotPointIcon />}
      {slug === "position-size" && <PositionSizeIcon />}
      {slug === "pip-value" && <PipValueIcon />}
      {slug === "risk-reward" && <RiskRewardIcon />}
      {slug === "forex-calculator" && <ForexCalculatorIcon />}
    </svg>
  );
}

// 1. 斐波那契: 黄金螺旋 + 5 横向回调线
function FibonacciIcon() {
  return (
    <g className="text-accent-blue">
      {/* 5 横向回调线 (0.236 / 0.382 / 0.5 / 0.618 / 0.786) */}
      {[
        { y: 18, label: "23.6" },
        { y: 30, label: "38.2" },
        { y: 45, label: "50" },
        { y: 60, label: "61.8" },
        { y: 72, label: "78.6" },
      ].map((l) => (
        <g key={l.label}>
          <line
            x1="6"
            y1={l.y}
            x2="120"
            y2={l.y}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />
          <text x="124" y={l.y + 2.5} fontSize="6" fill="currentColor" opacity="0.7" className={FONT}>
            {l.label}
          </text>
        </g>
      ))}
      {/* 黄金螺旋: 用 5 个四分之一圆弧拼成 */}
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.9">
        {/* 起点 6,72 向上 27 → 33,72 → 33,45 → 60,45 → 60,72 → 87,72 → 87,18 → 33,18 ... */}
        <path d="M 6 72 A 13.5 13.5 0 0 0 19.5 58.5 A 13.5 13.5 0 0 0 33 45 A 13.5 13.5 0 0 1 46.5 58.5 A 13.5 13.5 0 0 1 60 72 A 13.5 13.5 0 0 0 73.5 58.5 A 13.5 13.5 0 0 0 60 45 A 27 27 0 0 0 33 72 A 27 27 0 0 1 6 45 A 40.5 40.5 0 0 1 46.5 4.5" />
      </g>
      {/* 起点 + 终点圆点 */}
      <circle cx="6" cy="72" r="1.2" fill="currentColor" />
      <circle cx="46.5" cy="4.5" r="1.2" fill="currentColor" />
    </g>
  );
}

// 2. 枢轴点: 中心点 + 3 R + 3 S 水平线
function PivotPointIcon() {
  return (
    <g>
      {/* 网格背景 (淡) */}
      <g stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5">
        <line x1="0" y1="15" x2="160" y2="15" />
        <line x1="0" y1="75" x2="160" y2="75" />
      </g>
      {/* 3 R 线 (上, accent-up 绿) */}
      {[
        { y: 18, label: "R3" },
        { y: 27, label: "R2" },
        { y: 36, label: "R1" },
      ].map((l) => (
        <g key={l.label}>
          <line x1="20" y1={l.y} x2="100" y2={l.y} stroke="#4ade80" strokeOpacity="0.6" strokeWidth="0.6" />
          <text x="103" y={l.y + 2} fontSize="5.5" fill="#4ade80" className={FONT}>
            {l.label}
          </text>
        </g>
      ))}
      {/* 中心 PP 线 (蓝) */}
      <line x1="20" y1="45" x2="100" y2="45" stroke="#6c9cfc" strokeWidth="1" />
      <text x="103" y="47" fontSize="6" fill="#6c9cfc" className={FONT} fontWeight="bold">
        PP
      </text>
      {/* 3 S 线 (下, accent-down 红) */}
      {[
        { y: 54, label: "S1" },
        { y: 63, label: "S2" },
        { y: 72, label: "S3" },
      ].map((l) => (
        <g key={l.label}>
          <line x1="20" y1={l.y} x2="100" y2={l.y} stroke="#f87171" strokeOpacity="0.6" strokeWidth="0.6" />
          <text x="103" y={l.y + 2} fontSize="5.5" fill="#f87171" className={FONT}>
            {l.label}
          </text>
        </g>
      ))}
      {/* K 线示意 (蜡烛) */}
      <g>
        <line x1="65" y1="20" x2="65" y2="70" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.4" />
        <rect x="62" y="38" width="6" height="14" fill="#4ade80" fillOpacity="0.5" stroke="#4ade80" strokeWidth="0.4" />
      </g>
      <text x="6" y="86" fontSize="5" fill="currentColor" opacity="0.5" className={FONT}>
        Pivot
      </text>
    </g>
  );
}

// 3. 持仓规模: 圆环 + 内部填充 20% + 中心数字
function PositionSizeIcon() {
  return (
    <g>
      {/* 外圈 (full ring) */}
      <circle cx="80" cy="45" r="30" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="6" />
      {/* 内填充弧 (20% = 72°, 从 12 点位置开始) */}
      <path
        d="M 80 15 A 30 30 0 0 1 102.13 60.39"
        fill="none"
        stroke="#6c9cfc"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* 中心数字 0.02 */}
      <text x="80" y="48" textAnchor="middle" fontSize="16" fill="currentColor" className={FONT} fontWeight="bold">
        0.02
      </text>
      <text x="80" y="60" textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.6" className={FONT}>
        lots
      </text>
      {/* 副标 1% / 100U */}
      <text x="6" y="86" fontSize="5" fill="currentColor" opacity="0.5" className={FONT}>
        Risk 1% / 100U
      </text>
    </g>
  );
}

// 4. 点值 & 盈亏: 阶梯柱状图 (上升趋势)
function PipValueIcon() {
  const bars = [
    { x: 14, h: 12, y: 60 },
    { x: 30, h: 20, y: 52 },
    { x: 46, h: 16, y: 56 },
    { x: 62, h: 28, y: 44 },
    { x: 78, h: 24, y: 48 },
    { x: 94, h: 36, y: 36 },
    { x: 110, h: 44, y: 28 },
  ];
  return (
    <g>
      {/* 基线 */}
      <line x1="6" y1="76" x2="124" y2="76" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
      {/* 7 阶梯柱 (上升) */}
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width="10"
          height={b.h}
          fill="#4ade80"
          fillOpacity={0.4 + i * 0.08}
          stroke="#4ade80"
          strokeWidth="0.4"
        />
      ))}
      {/* 趋势线 (虚线) */}
      <line
        x1="19"
        y1="66"
        x2="115"
        y2="34"
        stroke="#f4c842"
        strokeWidth="0.8"
        strokeDasharray="2,1.5"
      />
      <text x="6" y="86" fontSize="5" fill="currentColor" opacity="0.5" className={FONT}>
        Pip Value · P/L
      </text>
    </g>
  );
}

// 5. 风险回报比: 对比柱 (1:3, 左浅右深)
function RiskRewardIcon() {
  return (
    <g>
      {/* 基线 */}
      <line x1="6" y1="76" x2="140" y2="76" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
      {/* 1 单位柱 (左, 浅红 = 风险) */}
      <rect x="30" y="46" width="20" height="30" fill="#f87171" fillOpacity="0.35" stroke="#f87171" strokeWidth="0.5" />
      <text x="40" y="42" textAnchor="middle" fontSize="6" fill="#f87171" className={FONT} fontWeight="bold">
        1
      </text>
      {/* 3 单位柱 (右, 深绿 = 回报) */}
      <rect x="80" y="16" width="40" height="60" fill="#4ade80" fillOpacity="0.5" stroke="#4ade80" strokeWidth="0.5" />
      <text x="100" y="12" textAnchor="middle" fontSize="7" fill="#4ade80" className={FONT} fontWeight="bold">
        3
      </text>
      {/* 比例标签 1:3 */}
      <text x="80" y="86" textAnchor="middle" fontSize="7" fill="currentColor" className={FONT} fontWeight="bold">
        R:R = 1:3
      </text>
    </g>
  );
}

// 6. 汇率换算: 双圆相交 (Venn)
function ForexCalculatorIcon() {
  return (
    <g>
      {/* 左圆 USD */}
      <circle cx="55" cy="45" r="28" fill="#6c9cfc" fillOpacity="0.18" stroke="#6c9cfc" strokeWidth="1" />
      {/* 右圆 CNY */}
      <circle cx="105" cy="45" r="28" fill="#f4c842" fillOpacity="0.18" stroke="#f4c842" strokeWidth="1" />
      {/* USD 标签 */}
      <text x="42" y="48" textAnchor="middle" fontSize="10" fill="#6c9cfc" className={FONT} fontWeight="bold">
        $
      </text>
      <text x="42" y="56" textAnchor="middle" fontSize="5" fill="#6c9cfc" className={FONT}>
        USD
      </text>
      {/* CNY 标签 */}
      <text x="118" y="48" textAnchor="middle" fontSize="10" fill="#f4c842" className={FONT} fontWeight="bold">
        ¥
      </text>
      <text x="118" y="56" textAnchor="middle" fontSize="5" fill="#f4c842" className={FONT}>
        CNY
      </text>
      {/* 相交区域汇率 */}
      <text x="80" y="46" textAnchor="middle" fontSize="9" fill="currentColor" className={FONT} fontWeight="bold">
        7.2
      </text>
      <text x="80" y="54" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.6" className={FONT}>
        rate
      </text>
    </g>
  );
}
