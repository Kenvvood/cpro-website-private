/**
 * ProductGridSkeleton.tsx — 加载骨架屏
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-secondary border border-border rounded-lg p-5
          animate-pulse">
          <div className="aspect-video bg-bg-tertiary rounded mb-4" />
          <div className="h-3 bg-bg-tertiary rounded w-1/3 mb-2" />
          <div className="h-4 bg-bg-tertiary rounded w-full mb-2" />
          <div className="h-4 bg-bg-tertiary rounded w-2/3 mb-4" />
          <div className="h-3 bg-bg-tertiary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}