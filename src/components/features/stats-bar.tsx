const stats = [
  { number: '10K+', label: '注册用户' },
  { number: '50+', label: '量化工具' },
  { number: '99.9%', label: '运行稳定性' },
  { number: '24/7', label: '技术支持' },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-4 stats-bar-grid">
      {stats.map((stat, i) => (
        <div key={i} className="px-8 py-12 text-center relative stats-cell">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 stats-top-line" />
          <div className="font-bold mb-2 stat-number">
            {stat.number}
          </div>
          <div className="text-sm font-medium stat-label">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
