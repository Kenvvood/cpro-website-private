import { CalendarIcon } from "lucide-react";

interface ContentCardProps {
  title: string;
  description: string;
  date: string;
}

function highlightTitle(text: string) {
  const keywords = ["MT4", "MT5", "EA", "指标", "脚本", "量化", "交易", "盈利", "收益"];
  const parts = text.split(new RegExp(`(${keywords.join("|")})`, "g"));
  return parts.map((part, i) =>
    keywords.includes(part) ? (
      <span key={i} className="text-accent">{part}</span>
    ) : (
      part
    )
  );
}

export function ContentCard({ title, description, date }: ContentCardProps) {
  return (
    <div className="p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden group content-card">
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity product-card-glow" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity product-card-top-line" />

      <div className="flex items-center gap-2 text-[12px] mb-2 text-gray-500 relative z-10">
        <CalendarIcon size={14} />
        {date}
      </div>
      <h3 className="text-[16px] font-semibold mb-2 relative z-10 text-accent">{title}</h3>
      <p className="text-[13px] leading-relaxed text-gray-400 relative z-10">
        {description}
      </p>
    </div>
  );
}
