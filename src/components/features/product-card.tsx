import { ImageIcon } from "lucide-react";

interface ProductCardProps {
  name: string;
  description: string;
  tags: string[];
  icon?: React.ReactNode;
  downloadButton?: React.ReactNode;
}

export function ProductCard({ name, description, tags, icon, downloadButton }: ProductCardProps) {
  return (
    <div className="p-6 rounded-xl border transition-all relative overflow-hidden group product-card">
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity product-card-glow" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity product-card-top-line" />

      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-shadow relative z-10 product-card-icon">
        {icon || <ImageIcon size={24} className="stroke-1.5 text-accent" />}
      </div>

      <h3 className="text-[16px] font-semibold mb-2 relative z-10 text-gray-100">{name}</h3>
      <p className="text-[13px] leading-relaxed mb-4 relative z-10 text-gray-400">
        {description}
      </p>

      <div className="flex gap-2 relative z-10">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium border border-[#00EFD1]/30 text-[#00EFD1] bg-[#00EFD1]/10">
            {tag}
          </span>
        ))}
      </div>

      {downloadButton && (
        <div className="absolute bottom-4 right-4 z-10">
          {downloadButton}
        </div>
      )}
    </div>
  );
}
