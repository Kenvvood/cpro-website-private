// TierBadge.tsx — Tier 徽标 (task065: 接入字典)
import { t } from "@/lib/i18n";

const TIER_COLOR_CLASSES = {
  典藏级: 'bg-tier-1/10 text-tier-1 border-tier-1/30',
  专业级: 'bg-tier-2/10 text-tier-2 border-tier-2/30',
  标准级: 'bg-tier-3/10 text-tier-3 border-tier-3/30',
  未分级: 'bg-text-muted/10 text-text-muted border-text-muted/30',
} as const;

export function TierBadge({ tier }: { tier?: string }) {
  const entry = t.tier(tier);
  const label = entry.short;
  const cls = (TIER_COLOR_CLASSES as Record<string, string>)[label] ?? TIER_COLOR_CLASSES['未分级'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5
      text-[10px] font-semibold border rounded ${cls}`}>
      {label}
    </span>
  );
}