import Link from "next/link";

// L4 v1.10: 编译状态区块 (PM 决策 2026-08-05: 不暴露产品数量, 改"持续完善"状态描述)
// - 脉冲点 + 文案 "MT4 / MT5 策略持续完善中"
// - 副文 "每周新增优质黄金策略 · 已有策略通过编译验证，确保可正常运行"
// - 右侧 "查看更新日志" 链接
// - 不出现任何数字 (产品数 / 成功率 / 已编译 / 待编译 等)
export function CompileStatus() {
  return (
    <div className="card-base p-4 lg:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-3">
        {/* 脉冲点图标 */}
        <div
          className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0"
          aria-hidden
        >
          <span className="block w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-semibold text-text-primary">
            MT4 / MT5 策略持续完善中
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            每周新增优质黄金策略 · 已有策略通过编译验证，确保可正常运行
          </div>
        </div>
      </div>
      <Link
        href="/changelog"
        className="text-xs text-accent-gold font-medium hover:underline shrink-0"
      >
        查看更新日志 →
      </Link>
    </div>
  );
}
