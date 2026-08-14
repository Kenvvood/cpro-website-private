// /lib/sensitive.ts — 敏感词检测 (v22.0 Phase 7.24 Batch 8)
// 防止友商评论区发布联系方式截流 (微信/QQ/手机/邮箱/URL 等)
// 服务端检测: 命中后 status=HIDDEN + sensitiveWords JSON 记录命中标签
// 客户端只显示 "等待审核" 占位, 不暴露具体命中词

const PATTERNS: { tag: string; re: RegExp }[] = [
  // 手机号 (中国大陆 11 位 1[3-9]开头)
  { tag: 'phone', re: /1[3-9]\d{9}/ },
  // QQ 号 (5-11 位纯数字, 配合 "QQ"/"扣扣" 关键词)
  { tag: 'qq', re: /(?:qq|扣扣|企鹅)[\s:：]*[\d]{5,11}/i },
  // 微信号 (6-20 位字母数字下划线减号, 配合 "微信"/"wx"/"v信" 关键词)
  { tag: 'wechat', re: /(?:微\s?信|wx|v\s?x|wechat)[\s:：]*[a-zA-Z0-9_-]{6,20}/i },
  // 邮箱
  { tag: 'email', re: /[\w.+-]+@[\w-]+\.[\w.-]+/ },
  // URL (http/https/www)
  { tag: 'url', re: /(?:https?:\/\/|www\.)[\w.-]+/i },
  // Telegram (t.me/...)
  { tag: 'telegram', re: /t\.me\/[\w_-]+/i },
  // 短信号码
  { tag: 'shortcode', re: /\b\d{5,6}\b(?=.*短信)/ },
];

export interface SensitiveHit {
  tag: string;
  match: string;
}

/// 检测文本中的敏感词, 返回命中列表
export function detectSensitive(text: string): SensitiveHit[] {
  const hits: SensitiveHit[] = [];
  for (const p of PATTERNS) {
    const m = text.match(p.re);
    if (m) hits.push({ tag: p.tag, match: m[0] });
  }
  return hits;
}

/// 检测是否含敏感词
export function hasSensitive(text: string): boolean {
  return detectSensitive(text).length > 0;
}

/// 简短标签 (UI 用, 不显示具体内容)
export function sensitiveLabel(tags: string[] | null | undefined): string {
  if (!tags || tags.length === 0) return '';
  const tagMap: Record<string, string> = {
    phone: '手机号', qq: 'QQ', wechat: '微信', email: '邮箱',
    url: '链接', telegram: 'Telegram', shortcode: '短信号码',
  };
  const labels = tags.map(t => tagMap[t] || t);
  return labels.join(' / ');
}
