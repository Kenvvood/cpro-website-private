/**
 * MainContent.tsx — PDP 左侧 5 大区块 (白皮书质感)
 * 1. 一句话定位 (Blockquote)
 * 2. 产品亮点 (List + CheckCircle2)
 * 3. 算法核心 (等宽字体)
 * 4. 实战应用 (段落)
 * 5. 风控机制 (Alert)
 */
import { CheckCircle2, Cpu, Target, AlertTriangle } from 'lucide-react';
import { Tag } from './Tag';

interface Props {
  product: {
    positioning: string;
    productHighlights?: string;
    algorithmicCore?: string;
    practicalApplication?: string;
    riskControl?: string;
    capabilityTags?: string[];
  };
}

export function MainContent({ product }: Props) {
  // 解析 productHighlights 为列表 (按句号/句末符号分割)
  const highlights = (product.productHighlights ?? '')
    .split(/[。.!?！？]/).map(s => s.trim()).filter(s => s.length > 5);

  return (
    <div className="space-y-8">
      {/* 1. 一句话定位 (Blockquote 强调色竖线) */}
      <section>
        <blockquote className="border-l-4 border-accent bg-accent/5
          pl-6 py-4 italic text-text-primary text-lg">
          "{product.positioning}"
        </blockquote>
      </section>

      {/* 2. 产品亮点 (List + CheckCircle2) */}
      {highlights.length > 0 && (
        <section>
          <SectionHeader icon={Target} title="产品亮点" />
          <ul className="space-y-2.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-text-primary">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. 算法核心 (等宽字体代码块) */}
      {product.algorithmicCore && (
        <section>
          <SectionHeader icon={Cpu} title="算法核心" />
          <pre className="font-mono text-sm bg-bg-tertiary border border-border
            rounded p-4 overflow-x-auto whitespace-pre-wrap text-text-secondary">
            {product.algorithmicCore}
          </pre>
        </section>
      )}

      {/* 4. 实战应用 (段落) */}
      {product.practicalApplication && (
        <section>
          <SectionHeader icon={Target} title="实战应用" />
          <p className="text-text-secondary leading-relaxed">
            {product.practicalApplication}
          </p>
        </section>
      )}

      {/* 5. 风控机制 (Alert) */}
      {product.riskControl && (
        <section>
          <SectionHeader icon={AlertTriangle} title="风控机制" />
          <div className="border border-warning/30 bg-warning/5 rounded p-4
            text-text-primary">
            <p className="leading-relaxed">{product.riskControl}</p>
          </div>
        </section>
      )}

      {/* Tags (底部) */}
      {product.capabilityTags && product.capabilityTags.length > 0 && (
        <section className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {product.capabilityTags.map(t => <Tag key={t} label={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-accent" />
      {title}
    </h2>
  );
}