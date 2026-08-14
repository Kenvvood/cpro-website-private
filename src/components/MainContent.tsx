/**
 * MainContent.tsx — PDP 左侧主区 (适配 mtt- 字段, 借鉴 fxssi 密集数据 + 横向 list 风)
 * 1. 一句话定位 (Blockquote 蓝紫竖线)
 * 2. 产品描述 (description 段落)
 * 3. 能力 4 维度 (capabilityTags 拆解 Strategy/Pair/TF/Risk)
 * 4. 适用场景 (从 tags 衍生)
 * 5. 规格表 (Tier/Category/RequiredPlan/Download/Score)
 */
import { CheckCircle2, Layers, Cpu, Target, AlertTriangle } from 'lucide-react';
import { Tag } from './Tag';

interface Props {
  product: {
    positioning: string | null;
    description?: string;
    category: string;
    tier?: string | null;
    requiredPlan?: string;
    downloadCount?: number;
    score?: number;
    capabilityTags?: string[];
  };
}

// 解析 capabilityTags ["Strategy: Trend", "Pair: Major", "TF: D1", "Risk: Medium"] → { Strategy, Pair, TF, Risk }
function parseCapabilityMap(tags: string[] | undefined) {
  const map: Record<string, string> = {};
  if (!tags) return map;
  for (const t of tags) {
    const idx = t.indexOf(':');
    if (idx > 0) {
      const key = t.slice(0, idx).trim();
      const val = t.slice(idx + 1).trim();
      map[key] = val;
    } else {
      map[t.trim()] = '';
    }
  }
  return map;
}

// 从 tags 推断适用场景
function inferScenarios(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  const map = parseCapabilityMap(tags);
  const scenarios: string[] = [];
  const strat = (map['Strategy'] || '').toLowerCase();
  const pair = (map['Pair'] || '').toLowerCase();
  const tf = (map['TF'] || '').toLowerCase();
  const risk = (map['Risk'] || '').toLowerCase();
  if (strat.includes('trend')) scenarios.push('趋势市', '中长线持仓');
  if (strat.includes('scalp')) scenarios.push('短线快进快出', '点差敏感品种');
  if (strat.includes('mean') || strat.includes('rev')) scenarios.push('震荡市', '区间回归');
  if (strat.includes('break')) scenarios.push('突破行情', '关键位');
  if (strat.includes('grid')) scenarios.push('震荡网格', '资金管理严格');
  if (strat.includes('news')) scenarios.push('数据行情', 'NFP/CPI/FOMC');
  if (strat.includes('ai') || strat.includes('ml')) scenarios.push('AI 辅助决策');
  if (strat.includes('arbitrage') || strat.includes('arb')) scenarios.push('跨品种套利');
  if (strat.includes('orderflow')) scenarios.push('跟随机构持仓');
  if (pair.includes('major')) scenarios.push('欧美/镑美/美日等主要货币对');
  if (pair.includes('xau')) scenarios.push('黄金');
  if (pair.includes('index')) scenarios.push('指数');
  if (pair.includes('cross')) scenarios.push('交叉盘');
  if (pair.includes('multi') || pair.includes('all')) scenarios.push('多品种组合');
  if (tf.includes('m1') || tf.includes('m5')) scenarios.push('分钟级快周期');
  if (tf.includes('h1') || tf.includes('h4')) scenarios.push('小时级中周期');
  if (tf.includes('d1')) scenarios.push('日线级长周期');
  if (risk.includes('low')) scenarios.push('低风险偏好');
  if (risk.includes('high')) scenarios.push('高收益高风险');
  // 去重保 4-5 条
  return Array.from(new Set(scenarios)).slice(0, 5);
}

export function MainContent({ product }: Props) {
  const tags = product.capabilityTags ?? [];
  const capMap = parseCapabilityMap(tags);
  const scenarios = inferScenarios(tags);
  const hasCapabilityData = Object.keys(capMap).length > 0;

  return (
    <div className="space-y-8">
      {/* 1. 一句话定位 (Blockquote 强调色竖线) */}
      <section>
        <blockquote className="border-l-4 border-accent-purple bg-accent-purple/5
          pl-6 py-4 italic text-text-primary text-lg">
          "{product.positioning ?? '—'}"
        </blockquote>
      </section>

      {/* 2. 产品描述 */}
      {product.description && (
        <section>
          <SectionHeader icon={Layers} title="产品描述" />
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {product.description}
          </p>
        </section>
      )}

      {/* 3. 能力 4 维度 (蓝紫卡片 grid) */}
      {hasCapabilityData && (
        <section>
          <SectionHeader icon={Cpu} title="核心能力" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(capMap).map(([k, v]) => (
              <div key={k} className="border border-border bg-bg-secondary p-4 rounded-md">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">
                  {k}
                </div>
                <div className="text-sm font-semibold text-accent-purple">{v || '—'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. 适用场景 (从 tags 衍生, ul + CheckCircle2) */}
      {scenarios.length > 0 && (
        <section>
          <SectionHeader icon={Target} title="适用场景" />
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {scenarios.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-text-primary text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent-up flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. 规格表 (1px 底边线密集表) */}
      <section>
        <SectionHeader icon={AlertTriangle} title="规格参数" />
        <div className="border border-border divide-y divide-border">
          <SpecRow label="商品级别" value={product.tier || 'N/A'} accent />
          <SpecRow label="商品分类" value={product.category} />
          <SpecRow label="所需计划" value={product.requiredPlan || 'FREE'} />
          <SpecRow label="评分" value={((product.score ?? 0) / 20 * 5).toFixed(1) + ' / 5.0'} num />
          <SpecRow label="下载次数" value={(product.downloadCount ?? 0).toLocaleString()} num />
          {tags.length > 0 && (
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2">
              <div className="text-sm text-text-muted">能力标签</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SpecRow({ label, value, accent, num }: { label: string; value: string; accent?: boolean; num?: boolean }) {
  return (
    <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 hover:bg-bg-secondary/40">
      <div className="text-sm text-text-muted">{label}</div>
      <div className={`text-sm ${accent ? 'text-accent-purple font-semibold' : 'text-text-primary'} ${num ? 'num' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-accent-purple" />
      {title}
    </h2>
  );
}
