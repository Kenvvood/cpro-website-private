/**
 * Tag.tsx — 标签 (深色)
 */
export function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5
      text-[10px] font-medium
      bg-bg-tertiary text-text-secondary border border-border rounded">
      {label}
    </span>
  );
}