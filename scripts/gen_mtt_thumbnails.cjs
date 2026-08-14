// 程序化生成 46 个 mtt-* 产品缩略图 (SVG 模板 + sharp 转 JPG)
// 7 个模板: pro / signal / grid / tool / trend / util / scalp
// 每张 240x240, 加产品名 + tier 徽章 + 评分

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PRODUCTS = JSON.parse(Buffer.from(fs.readFileSync('C:\\Users\\CProTrading\\AppData\\Local\\Temp\\mtt_products.json.b64', 'ascii'), 'base64').toString('utf-8'));

const TIER_COLOR = {
  'Tier 1 (典藏级 VIP)': { bg: '#d4a259', text: '#1a1f2e', label: 'T1' },
  'Tier 1 (Premium/VIP)': { bg: '#d4a259', text: '#1a1f2e', label: 'T1' },
  'Tier 2 (专业级 Pro)': { bg: '#5eb3ce', text: '#1a1f2e', label: 'T2' },
  'Tier 2 (Pro)': { bg: '#5eb3ce', text: '#1a1f2e', label: 'T2' },
  'Tier 3 (Basic)': { bg: '#9ca3af', text: '#1a1f2e', label: 'T3' },
  'N/A': { bg: '#6b7280', text: '#1a1f2e', label: 'N' },
};

// 7 个 SVG 模板
function svgHeader() {
  return `<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1a1f2e"/>
        <stop offset="100%" stop-color="#0f1320"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#bg)"/>
  `;
}

function tierBadge(tier, score) {
  const c = TIER_COLOR[tier] || TIER_COLOR['N/A'];
  return `
    <rect x="8" y="8" width="36" height="22" rx="4" fill="${c.bg}"/>
    <text x="26" y="23" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${c.text}" text-anchor="middle">${c.label}</text>
    <text x="232" y="22" font-family="Arial, sans-serif" font-size="11" fill="#d4a259" text-anchor="end">★ ${(score/4).toFixed(1)}</text>
  `;
}

function bottomText(name, categoryZh) {
  // 取产品名前 14 字
  const short = name.length > 14 ? name.slice(0, 14) + '…' : name;
  return `
    <rect x="0" y="180" width="240" height="60" fill="#0a0e18" opacity="0.6"/>
    <text x="12" y="202" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f4c460">${escapeXml(short)}</text>
    <text x="12" y="222" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">${escapeXml(categoryZh)}</text>
  `;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 模板 1: Pro (神经网络)
function templatePro(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(120, 100)">
      <line x1="-50" y1="-30" x2="0" y2="0" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <line x1="-50" y1="0" x2="0" y2="0" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <line x1="-50" y1="30" x2="0" y2="0" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <line x1="0" y1="0" x2="50" y2="-30" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <line x1="0" y1="0" x2="50" y2="0" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <line x1="0" y1="0" x2="50" y2="30" stroke="#5eb3ce" stroke-width="1.5" opacity="0.6"/>
      <circle cx="-50" cy="-30" r="8" fill="#d4a259"/>
      <circle cx="-50" cy="0" r="8" fill="#d4a259"/>
      <circle cx="-50" cy="30" r="8" fill="#d4a259"/>
      <circle cx="0" cy="0" r="10" fill="#f4c460"/>
      <circle cx="50" cy="-30" r="8" fill="#5eb3ce"/>
      <circle cx="50" cy="0" r="8" fill="#5eb3ce"/>
      <circle cx="50" cy="30" r="8" fill="#5eb3ce"/>
    </g>
    <text x="120" y="60" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#d4a259" text-anchor="middle">AI</text>
  ` + bottomText(name, '智能 EA · 神经网络') + `</svg>`;
}

// 模板 2: Signal (波形)
function templateSignal(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(0, 0)">
      <path d="M 20 110 Q 40 60, 60 110 T 100 110 T 140 110 T 180 110 T 220 110" stroke="#5eb3ce" stroke-width="2.5" fill="none"/>
      <path d="M 20 130 Q 40 100, 60 130 T 100 130 T 140 130 T 180 130 T 220 130" stroke="#d4a259" stroke-width="1.5" fill="none" opacity="0.6"/>
      <circle cx="100" cy="80" r="6" fill="#f4c460"/>
      <line x1="100" y1="80" x2="100" y2="160" stroke="#f4c460" stroke-width="1" stroke-dasharray="3,2"/>
    </g>
    <text x="120" y="50" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#5eb3ce" text-anchor="middle">SIGNAL</text>
  ` + bottomText(name, '技术指标 · 信号') + `</svg>`;
}

// 模板 3: Grid (网格)
function templateGrid(name, tier, score) {
  let rects = '';
  const colors = ['#1a1f2e', '#d4a259', '#1a1f2e', '#5eb3ce', '#1a1f2e', '#d4a259', '#1a1f2e'];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const x = 50 + i * 28;
      const y = 30 + j * 24;
      const filled = (i + j) % 3 === 0;
      rects += `<rect x="${x}" y="${y}" width="24" height="20" fill="${filled ? colors[(i+j)%colors.length] : '#1a1f2e'}" stroke="#d4a259" stroke-width="0.5" opacity="${filled ? 1 : 0.3}"/>`;
    }
  }
  return svgHeader() + tierBadge(tier, score) + `
    ${rects}
  ` + bottomText(name, '网格 EA · 自动化') + `</svg>`;
}

// 模板 4: Tool (计算器/工具)
function templateTool(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(75, 30)">
      <rect x="0" y="0" width="90" height="120" rx="6" fill="#1a1f2e" stroke="#d4a259" stroke-width="2"/>
      <rect x="8" y="8" width="74" height="28" fill="#0a0e18" stroke="#5eb3ce" stroke-width="1"/>
      <text x="78" y="28" font-family="monospace" font-size="14" fill="#5eb3ce" text-anchor="end">123.45</text>
      <g>
        <rect x="8" y="44" width="18" height="14" fill="#d4a259"/>
        <rect x="30" y="44" width="18" height="14" fill="#2a3142"/>
        <rect x="52" y="44" width="18" height="14" fill="#2a3142"/>
        <rect x="8" y="62" width="18" height="14" fill="#2a3142"/>
        <rect x="30" y="62" width="18" height="14" fill="#2a3142"/>
        <rect x="52" y="62" width="18" height="14" fill="#2a3142"/>
        <rect x="8" y="80" width="18" height="14" fill="#2a3142"/>
        <rect x="30" y="80" width="18" height="14" fill="#2a3142"/>
        <rect x="52" y="80" width="18" height="14" fill="#5eb3ce"/>
        <rect x="8" y="98" width="40" height="14" fill="#d4a259"/>
        <rect x="52" y="98" width="18" height="14" fill="#2a3142"/>
      </g>
    </g>
  ` + bottomText(name, '工具脚本 · 计算') + `</svg>`;
}

// 模板 5: Trend (趋势线)
function templateTrend(name, tier, score) {
  // K 线 + 趋势线
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(20, 50)">
      <line x1="0" y1="100" x2="200" y2="100" stroke="#3a4152" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="0" y1="60" x2="200" y2="60" stroke="#3a4152" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="0" y1="20" x2="200" y2="20" stroke="#3a4152" stroke-width="0.5" stroke-dasharray="2,2"/>
      <!-- K 线 -->
      <g>
        <line x1="10" y1="80" x2="10" y2="40" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="6" y="50" width="8" height="20" fill="#5eb3ce"/>
        <line x1="30" y1="90" x2="30" y2="50" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="26" y="60" width="8" height="20" fill="#5eb3ce"/>
        <line x1="50" y1="70" x2="50" y2="30" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="46" y="40" width="8" height="20" fill="#5eb3ce"/>
        <line x1="70" y1="80" x2="70" y2="40" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="66" y="50" width="8" height="20" fill="#5eb3ce"/>
        <line x1="90" y1="60" x2="90" y2="20" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="86" y="30" width="8" height="20" fill="#5eb3ce"/>
        <line x1="110" y1="50" x2="110" y2="10" stroke="#5eb3ce" stroke-width="1"/>
        <rect x="106" y="20" width="8" height="20" fill="#5eb3ce"/>
      </g>
      <!-- 趋势线 -->
      <line x1="10" y1="90" x2="120" y2="20" stroke="#d4a259" stroke-width="2"/>
      <text x="120" y="50" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#d4a259" text-anchor="middle">↗</text>
    </g>
  ` + bottomText(name, '趋势 EA · 跟随') + `</svg>`;
}

// 模板 6: Util (库/代码)
function templateUtil(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(50, 30)">
      <rect x="0" y="0" width="140" height="120" rx="6" fill="#0a0e18" stroke="#5eb3ce" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="3" fill="#d4a259"/>
      <circle cx="20" cy="10" r="3" fill="#d4a259"/>
      <circle cx="30" cy="10" r="3" fill="#d4a259"/>
      <g font-family="monospace" font-size="9" fill="#9ca3af">
        <text x="10" y="35">import { Utils } from</text>
        <text x="10" y="48"><tspan fill="#5eb3ce">"cpro/lib"</tspan></text>
        <text x="10" y="68">function <tspan fill="#d4a259">trade</tspan>() {</text>
        <text x="20" y="82">  <tspan fill="#5eb3ce">if</tspan> (check) {</text>
        <text x="30" y="94">    send();</text>
        <text x="20" y="106">  }</text>
        <text x="10" y="118">}</text>
      </g>
    </g>
  ` + bottomText(name, '工具库 · 模块化') + `</svg>`;
}

// 模板 7: Scalp (鸟/快)
function templateScalp(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <g transform="translate(120, 100)">
      <!-- 抽象鸟形 + 闪电 -->
      <path d="M -50 0 L 0 -30 L 20 -10 L 50 -25 L 30 0 L 50 10 L 20 25 L 0 5 L -50 0 Z" fill="#d4a259" opacity="0.9"/>
      <path d="M -20 -10 L 10 5 L 0 20 L 15 35" stroke="#5eb3ce" stroke-width="2.5" fill="none"/>
      <text x="0" y="-50" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#d4a259" text-anchor="middle">⚡</text>
    </g>
  ` + bottomText(name, '高频 · 短周期') + `</svg>`;
}

// 默认模板
function templateDefault(name, tier, score) {
  return svgHeader() + tierBadge(tier, score) + `
    <circle cx="120" cy="100" r="50" fill="#d4a259" opacity="0.3"/>
    <circle cx="120" cy="100" r="30" fill="#d4a259" opacity="0.7"/>
    <text x="120" y="106" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1a1f2e" text-anchor="middle">MTT</text>
  ` + bottomText(name, 'CProTrading 严选') + `</svg>`;
}

function getTemplate(id) {
  if (id.startsWith('mtt-ace-')) return 'ace';
  if (id.startsWith('mtt-pro-')) return templatePro;
  if (id.startsWith('mtt-signal-')) return templateSignal;
  if (id.startsWith('mtt-grid-')) return templateGrid;
  if (id.startsWith('mtt-tool-')) return templateTool;
  if (id.startsWith('mtt-trend-')) return templateTrend;
  if (id.startsWith('mtt-util-')) return templateUtil;
  if (id.startsWith('mtt-scalp-')) return templateScalp;
  return templateDefault;
}

async function main() {
  const outDir = 'G:\\CodeBase\\cpro-website\\public\\products';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const p of PRODUCTS) {
    // 5 王牌用已有图
    if (p.id.startsWith('mtt-ace-')) {
      const existingMap = {
        'mtt-ace-dca-gold-grid-v1': 'gold-grid.jpg',
        'mtt-ace-martingail-v1': 'gold-martingale.jpg',
        'mtt-ace-gold-arbitrage-v1': 'gold-arbitrage.jpg',
        'mtt-ace-xau-scalper-v1': 'gold-scalper.jpg',
        'mtt-ace-gold-warrior-v1': 'gold-hedge.jpg',
      };
      const fname = existingMap[p.id];
      if (fname && fs.existsSync(path.join(outDir, fname))) {
        count++;
        continue;
      }
    }

    const tmpl = getTemplate(p.id);
    const svg = tmpl(p.name, p.tier, p.score);
    const out = path.join(outDir, p.id + '.jpg');
    await sharp(Buffer.from(svg)).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    count++;
    if (count % 10 === 0) console.log(`generated ${count}/${PRODUCTS.length}`);
  }
  console.log(`Done. ${count} thumbnails in ${outDir}`);
}

main().catch(e => { console.error(e); process.exit(1); });
