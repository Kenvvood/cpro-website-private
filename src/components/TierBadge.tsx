/**
 * TierBadge.tsx — Tier 徽标 (深色主题)
 */
const TIER_STYLES = {
  'Tier 1 (Premium/VIP)': 'bg-tier-1/10 text-tier-1 border-tier-1/30',
  'Tier 2 (Pro)': 'bg-tier-2/10 text-tier-2 border-tier-2/30',
  'Tier 3 (Basic)': 'bg-tier-3/10 text-tier-3 border-tier-3/30',
  'N/A': 'bg-text-muted/10 text-text-muted border-text-muted/30',
} as const;

const TIER_SHORT = {
  'Tier 1 (Premium/VIP)': 'Tier 1',
  'Tier 2 (Pro)': 'Tier 2',
  'Tier 3 (Basic)': 'Tier 3',
  'N/A': 'N/A',
} as const;

export function TierBadge({ tier }: { tier?: string }) {
  const cls = TIER_STYLES[tier as keyof typeof TIER_STYLES] ?? TIER_STYLES['N/A'];
  const label = TIER_SHORT[tier as keyof typeof TIER_SHORT] ?? 'N/A';
  return (
    <span className={`inline-flex items-center px-2 py-0.5
      text-[10px] font-semibold uppercase tracking-wider
      border rounded ${cls}`}>
      {label}
    </span>
  );
}