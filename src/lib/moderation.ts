// /lib/moderation.ts — 控评工具 (v22.0 Phase 7.24 Batch 8+)
// 角色: USER (普通) < MODERATOR (版主) < ADMIN (管理员)
// 控评: 版主/管理员能改 status (PUBLISHED/HIDDEN/DELETED) + 隐藏评论
//
// PM 决策 (2026-08-11): 版主 = 管理员 大部分权限, 任命/申请分离
//   - 版主 MODERATOR: 控评 + 任命 MODERATOR
//   - 管理员 ADMIN: 上面 + 任命 ADMIN + 系统设置
//   - 版主申请: 仅活跃订阅即可 (无硬门槛)
//   - 管理员申请: 3 选 1 门槛 (文章 5 / 评论 30 / 获赞 50)

import type { UserRole } from '@/generated/prisma/enums';

export type ModerationRole = UserRole | 'GUEST';

/**
 * 角色权限层级
 *  - GUEST: 0 (无任何权限)
 *  - MEMBER/CREATOR: 10 (普通用户)
 *  - MODERATOR: 50 (版主)
 *  - ADMIN: 99 (管理员)
 */
export function roleLevel(role: ModerationRole | undefined | null): number {
  if (!role) return 0;
  switch (role) {
    case 'GUEST': return 0;
    case 'MEMBER':
    case 'CREATOR': return 10;
    case 'MODERATOR': return 50;
    case 'ADMIN': return 99;
    default: return 0;
  }
}

/** 是否能看 HIDDEN 评论 (普通用户看不见, 版主/管理员能看) */
export function canViewHidden(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 50;
}

/** 是否能改评论状态 (控评: 隐藏/显示/删除) */
export function canModerate(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 50;
}

/** 是否能硬删除评论 (只有 ADMIN, 软删 canModerate 已包含) */
export function canDelete(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 99;
}

/** 是否能任命 MODERATOR (版主 + 管理员) */
export function canPromoteModerator(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 50;
}

/** 是否能任命 ADMIN (仅管理员) */
export function canPromoteAdmin(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 99;
}

/** 是否能审批版主申请 (版主 + 管理员) */
export function canReviewApplication(role: ModerationRole | undefined | null): boolean {
  return roleLevel(role) >= 50;
}

/**
 * 任命规则:
 *   - 任命者必须 roleLevel >= 50
 *   - 任命者只能任命 <= 自己 roleLevel 的目标角色
 *   - 不能任命自己
 *   - 版主不能任命 ADMIN (只能版主可任命版主)
 *   - 管理员可任命版主/管理员
 */
export function canPromoteTo(
  operatorRole: ModerationRole | undefined | null,
  operatorId: string,
  targetUserId: string,
  targetRole: 'MODERATOR' | 'ADMIN'
): { allowed: boolean; reason: string } {
  if (!operatorId || !targetUserId) {
    return { allowed: false, reason: '用户信息缺失' };
  }
  if (operatorId === targetUserId) {
    return { allowed: false, reason: '不能任命自己' };
  }
  const opLevel = roleLevel(operatorRole);
  if (opLevel < 50) {
    return { allowed: false, reason: '需要版主或管理员权限' };
  }
  if (targetRole === 'MODERATOR') {
    // 任命版主: 版主及以上
    if (opLevel < 50) return { allowed: false, reason: '需要版主或管理员权限' };
    return { allowed: true, reason: '可任命' };
  }
  if (targetRole === 'ADMIN') {
    // 任命管理员: 仅管理员
    if (opLevel < 99) return { allowed: false, reason: '只有管理员能任命管理员' };
    return { allowed: true, reason: '可任命' };
  }
  return { allowed: false, reason: '未知目标角色' };
}

/**
 * 资源下载权限 (3 角色 3 资源级别)
 *
 * 资源级别 (按 schema 字段):
 *  - OPEN: isFree=true, 任何人都能下 (含游客)
 *  - MEMBER: isFree=false, requiredPlan=undefined or WEEKLY (注册会员能下, 月/年度也可)
 *  - EXCLUSIVE: isFree=false, requiredPlan=MONTHLY+/YEARLY/LIFETIME (只有高级订阅能下)
 *
 * 用户状态:
 *  - GUEST: 未登录
 *  - MEMBER: 注册会员 (无活跃订阅 或 WEEKLY 周卡)
 *  - SUBSCRIBED: 活跃订阅 (>= MONTHLY 月度/年度/终身)
 */
export type ResourceLevel = 'OPEN' | 'MEMBER' | 'EXCLUSIVE';

export function detectResourceLevel(item: { isFree: boolean; requiredPlan: string }): ResourceLevel {
  if (item.isFree) return 'OPEN';
  // requiredPlan: WEEKLY = 注册会员, MONTHLY/YEARLY/LIFETIME = 必须订阅
  if (item.requiredPlan === 'WEEKLY') return 'MEMBER';
  return 'EXCLUSIVE';
}

export type UserSubscription = 'GUEST' | 'MEMBER' | 'SUBSCRIBED';

export function detectUserSubscription(userPlan: string | undefined | null): UserSubscription {
  if (!userPlan) return 'GUEST';
  // WEEKLY = 注册会员级, MONTHLY+ = 订阅
  if (userPlan === 'WEEKLY') return 'MEMBER';
  return 'SUBSCRIBED';
}

/**
 * 能否下载
 * @returns { can: boolean, reason: string } reason 给 UI 显示
 */
export function canDownload(
  resource: { isFree: boolean; requiredPlan: string },
  userPlan: string | undefined | null
): { can: boolean; reason: string; cta: string } {
  const level = detectResourceLevel(resource);
  const sub = detectUserSubscription(userPlan);

  if (level === 'OPEN') {
    // 开放: 任何人都能下, 游客要登录
    if (sub === 'GUEST') {
      return { can: false, reason: '游客请先登录后免费下载', cta: '登录后下载' };
    }
    return { can: true, reason: '开放资源, 注册会员可免费下载', cta: '免费下载' };
  }

  if (level === 'MEMBER') {
    if (sub === 'GUEST') {
      return { can: false, reason: '请先登录, 注册即可免费下载', cta: '登录后下载' };
    }
    if (sub === 'MEMBER') {
      return { can: true, reason: '会员级资源, 注册可下载', cta: '立即下载' };
    }
    return { can: true, reason: '订阅可享专属资源', cta: '立即下载' };
  }

  // EXCLUSIVE
  if (sub === 'GUEST') {
    return { can: false, reason: '专享资源, 请先登录并订阅', cta: '登录后订阅' };
  }
  if (sub === 'MEMBER') {
    return { can: false, reason: '专享资源, 需月度或更高订阅', cta: '升级月度订阅' };
  }
  return { can: true, reason: '订阅已开通, 专享资源', cta: '立即下载' };
}

// =====================================================================
// 版主/管理员申请门槛配置 (PM 2026-08-11 v3 终态决策)
// 关键变化:
//   - 不分子板块, 统一管
//   - 版主: 2 名, 高门槛 5 选 1
//   - 管理员: 4 名, 低门槛 3 选 1
// =====================================================================

/**
 * 版主申请门槛: 高门槛 5 选 1 (OR)
 * - PM 决策: 版主是最高权限, 必须经验丰富
 * - 必须活跃订阅 + 5 选 1 达标
 */
export const MODERATOR_APPLICATION_THRESHOLDS = {
  name: '版主',
  requireActiveSubscription: true,
  articleCount: 20,    // 发布文章 >= 20
  commentCount: 100,   // 评论数 >= 100
  likeCount: 200,      // 获赞 >= 200
  originalCount: 5,    // 原创贡献 (源码/教程) >= 5
  adminDays: 90,       // 管理员经验 >= 90 天
};

/**
 * 管理员申请门槛: 低门槛 3 选 1 (OR)
 * - PM 决策: 管理员门槛可低, 由版主直接任命也 OK
 * - 必须活跃订阅 + 3 选 1 达标
 */
export const ADMIN_APPLICATION_THRESHOLDS = {
  name: '管理员',
  requireActiveSubscription: true,
  articleCount: 3,     // 发布文章 >= 3
  commentCount: 15,    // 评论数 >= 15
  likeCount: 30,       // 获赞 >= 30
};

/**
 * 角色上限 (PM v3 终态: 不分板块, 全局上限)
 * - 版主: 2 名
 * - 管理员: 4 名
 */
export const ROLE_LIMITS = {
  MODERATOR: 2,    // 全局上限 2 名
  ADMIN: 4,        // 全局上限 4 名
} as const;

export interface UserStats {
  articleCount: number;
  commentCount: number;
  likeCount: number;
  originalCount?: number;  // 原创贡献 (源码/教程)
  adminDays?: number;      // 管理员经验天数
}

export interface ApplicationEligibility {
  applyingFor: 'MODERATOR' | 'ADMIN';
  canApply: boolean;
  requireSubscription: boolean;
  hasActiveSubscription: boolean;
  // 门槛进度
  thresholds?: {
    article: { current: number; required: number; met: boolean };
    comment: { current: number; required: number; met: boolean };
    like: { current: number; required: number; met: boolean };
    original?: { current: number; required: number; met: boolean };
    adminDays?: { current: number; required: number; met: boolean };
    anyMet: boolean;
    requiredCount: number;  // 满足几条
  };
  reason: string;
}

/**
 * 检查申请资格
 * @param applyingFor 'MODERATOR' (高门槛 5 选 1) | 'ADMIN' (低门槛 3 选 1)
 */
export function checkApplicationEligibility(
  applyingFor: 'MODERATOR' | 'ADMIN',
  stats: UserStats,
  hasActiveSubscription: boolean
): ApplicationEligibility {
  if (applyingFor === 'MODERATOR') {
    // 版主: 5 选 1 高门槛
    const t = MODERATOR_APPLICATION_THRESHOLDS;
    const article = { current: stats.articleCount, required: t.articleCount, met: stats.articleCount >= t.articleCount };
    const comment = { current: stats.commentCount, required: t.commentCount, met: stats.commentCount >= t.commentCount };
    const like = { current: stats.likeCount, required: t.likeCount, met: stats.likeCount >= t.likeCount };
    const original = { current: stats.originalCount ?? 0, required: t.originalCount, met: (stats.originalCount ?? 0) >= t.originalCount };
    const adminDays = { current: stats.adminDays ?? 0, required: t.adminDays, met: (stats.adminDays ?? 0) >= t.adminDays };
    const metItems = [article, comment, like, original, adminDays].filter(x => x.met).length;
    const anyMet = metItems >= 1;

    let reason = '';
    let canApply = false;
    if (!hasActiveSubscription) {
      reason = '版主申请需月度或更高订阅';
    } else if (!anyMet) {
      const missing: string[] = [];
      if (!article.met) missing.push(`文章 ${stats.articleCount}/${t.articleCount}`);
      if (!comment.met) missing.push(`评论 ${stats.commentCount}/${t.commentCount}`);
      if (!like.met) missing.push(`获赞 ${stats.likeCount}/${t.likeCount}`);
      if (!original.met) missing.push(`原创 ${stats.originalCount ?? 0}/${t.originalCount}`);
      if (!adminDays.met) missing.push(`管理员经验 ${stats.adminDays ?? 0}/${t.adminDays}天`);
      reason = `版主申请需 5 选 1 达标: ${missing.join(' · ')}`;
    } else {
      canApply = true;
      const met: string[] = [];
      if (article.met) met.push('文章');
      if (comment.met) met.push('评论');
      if (like.met) met.push('获赞');
      if (original.met) met.push('原创');
      if (adminDays.met) met.push('管理经验');
      reason = `已达成 ${met.join(' + ')}, 可申请版主 (${metItems}/5)`;
    }

    return {
      applyingFor: 'MODERATOR',
      canApply,
      requireSubscription: true,
      hasActiveSubscription,
      thresholds: { article, comment, like, original, adminDays, anyMet, requiredCount: 1 },
      reason,
    };
  }

  // 管理员: 3 选 1 低门槛
  const t = ADMIN_APPLICATION_THRESHOLDS;
  const article = { current: stats.articleCount, required: t.articleCount, met: stats.articleCount >= t.articleCount };
  const comment = { current: stats.commentCount, required: t.commentCount, met: stats.commentCount >= t.commentCount };
  const like = { current: stats.likeCount, required: t.likeCount, met: stats.likeCount >= t.likeCount };
  const anyMet = article.met || comment.met || like.met;

  let reason = '';
  let canApply = false;
  if (!hasActiveSubscription) {
    reason = '管理员申请需月度或更高订阅';
  } else if (!anyMet) {
    const missing: string[] = [];
    if (!article.met) missing.push(`文章 ${stats.articleCount}/${t.articleCount}`);
    if (!comment.met) missing.push(`评论 ${stats.commentCount}/${t.commentCount}`);
    if (!like.met) missing.push(`获赞 ${stats.likeCount}/${t.likeCount}`);
    reason = `管理员申请需 3 选 1 达标: ${missing.join(' · ')}`;
  } else {
    canApply = true;
    const met: string[] = [];
    if (article.met) met.push('文章');
    if (comment.met) met.push('评论');
    if (like.met) met.push('获赞');
    reason = `已达成 ${met.join(' + ')}, 可申请管理员`;
  }

  return {
    applyingFor: 'ADMIN',
    canApply,
    requireSubscription: true,
    hasActiveSubscription,
    thresholds: { article, comment, like, anyMet, requiredCount: 1 },
    reason,
  };
}

/**
 * 门槛说明文案 (UI 显示用)
 */
export function getApplicationGuide(applyingFor: 'MODERATOR' | 'ADMIN'): string {
  if (applyingFor === 'MODERATOR') {
    const t = MODERATOR_APPLICATION_THRESHOLDS;
    return `版主申请 (高门槛 5 选 1): 月度订阅 + (文章 ≥ ${t.articleCount} / 评论 ≥ ${t.commentCount} / 获赞 ≥ ${t.likeCount} / 原创 ≥ ${t.originalCount} / 管理经验 ≥ ${t.adminDays}天)。版主全局上限 2 名。`;
  }
  const t = ADMIN_APPLICATION_THRESHOLDS;
  return `管理员申请 (低门槛 3 选 1): 月度订阅 + (文章 ≥ ${t.articleCount} / 评论 ≥ ${t.commentCount} / 获赞 ≥ ${t.likeCount})。管理员全局上限 4 名, 可版主直接任命。`;
}

/**
 * 检查角色上限
 * @param role 'MODERATOR' (上限 2) | 'ADMIN' (上限 4)
 * @param currentCount 当前数量 (调用方传入, 避免循环查询)
 */
export function checkRoleLimit(
  role: 'MODERATOR' | 'ADMIN',
  currentCount: number
): { allowed: boolean; reason: string; limit: number; current: number } {
  const limit = role === 'MODERATOR' ? ROLE_LIMITS.MODERATOR : ROLE_LIMITS.ADMIN;
  const name = role === 'MODERATOR' ? '版主' : '管理员';
  return {
    allowed: currentCount < limit,
    reason: currentCount >= limit
      ? `${name}全局上限 ${limit} 名, 已满`
      : `${name}还可任命 (${currentCount}/${limit})`,
    limit,
    current: currentCount,
  };
}
