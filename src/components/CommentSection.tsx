// /components/CommentSection.tsx — 通用评论区
// v22.0 Phase 7.24 Batch 8+
// 3 角色:
//   - 游客: 只读 + 提示登录
//   - 注册: 能发评论 (前端显示, 后端敏感词过滤, 命中自动 HIDDEN)
//   - 订阅: 能发评论 + 转发按钮 + 点赞按钮
// 控评: 版主/管理员 能隐藏/显示/删除 (inline 按钮)

'use client';

import { useState, useTransition } from 'react';
import { Send, Eye, EyeOff, Trash2, Share2, MessageCircle, AlertTriangle, Lock, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;     // 客户端展示用 (无 User 表 join, 用 username 字段)
  authorRole?: string;    // USER/MODERATOR/ADMIN
  content: string;
  status: 'PUBLISHED' | 'HIDDEN' | 'DELETED';
  sensitiveWords?: string | null;
  forwardCount: number;
  likeCount?: number;     // 获赞数 (Batch 8+)
  liked?: boolean;        // 当前用户是否点过
  createdAt: string;      // ISO
  parentId?: string | null;
}

interface Props {
  targetType: 'OPEN_SOURCE_RELEASE' | 'TUTORIAL' | 'ARTICLE';
  targetId: string;
  comments: CommentItem[];
  currentUser: {
    id: string;
    name: string;
    role: 'GUEST' | 'MEMBER' | 'MODERATOR' | 'ADMIN' | 'SUBSCRIBED';
    isSubscriber?: boolean;
  } | null;
}

export function CommentSection({ targetType, targetId, comments, currentUser }: Props) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canPost = !!(currentUser && (currentUser.role === 'MEMBER' || currentUser.role === 'SUBSCRIBED' || currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN'));
  const canModerate = !!(currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN'));
  const canViewHidden = canModerate;
  const canForward = !!(currentUser?.isSubscriber || currentUser?.role === 'MODERATOR' || currentUser?.role === 'ADMIN');
  // 点赞: 订阅会员 + 版主/管理员
  const canLike = canForward;

  const visibleComments = comments.filter(c => {
    if (c.status === 'DELETED') return canModerate;  // 仅版主可见
    if (c.status === 'HIDDEN') return canViewHidden;
    return true;
  });

  // 树形结构 (顶级 + 回复)
  const topComments = visibleComments.filter(c => !c.parentId);
  const repliesByParent = new Map<string, CommentItem[]>();
  for (const c of visibleComments) {
    if (c.parentId) {
      const arr = repliesByParent.get(c.parentId) || [];
      arr.push(c);
      repliesByParent.set(c.parentId, arr);
    }
  }

  async function handlePost() {
    if (!content.trim() || !canPost) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType, targetId, content: content.trim(),
            parentId: replyTo,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '发表失败');
          return;
        }
        if (data.hidden) {
          setError('已提交, 等待版主审核');
        }
        setContent('');
        setReplyTo(null);
        router.refresh();
      } catch (e: any) {
        setError('网络错误, 请重试');
      }
    });
  }

  async function handleModerate(id: string, action: 'hide' | 'show' | 'delete') {
    if (!canModerate) return;
    if (action === 'delete' && currentUser?.role !== 'ADMIN') {
      if (!confirm('删除不可恢复, 确定?')) return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/comments/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    });
  }

  async function handleLike(id: string) {
    if (!canLike) return;
    startTransition(async () => {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'COMMENT', targetId: id }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-accent-purple" />
        <h2 className="text-base font-semibold text-text-primary">
          评论区
        </h2>
        <span className="text-xs text-text-muted num">
          {topComments.length} 条
        </span>
      </div>

      {/* 评论输入区 */}
      {currentUser?.role === 'GUEST' || !currentUser ? (
        <div className="mb-6 p-4 border border-dashed border-border bg-bg-secondary/50 rounded text-center text-xs text-text-muted">
          <Lock className="w-3.5 h-3.5 inline mr-1" />
          登录后可参与评论 ·
          <a href="/login" className="text-accent-purple ml-1 hover:underline">立即登录</a>
        </div>
      ) : canPost ? (
        <div className="mb-6 p-4 border border-border bg-bg-secondary rounded">
          {replyTo && (
            <div className="text-[10px] text-text-muted mb-2 flex items-center gap-2">
              回复评论
              <button onClick={() => setReplyTo(null)} className="text-accent-purple hover:underline">
                取消
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            placeholder="说点什么... (不支持联系方式, 命中将自动隐藏)"
            rows={3}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted
              border border-border rounded p-3 focus:border-accent-purple focus:outline-none resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-[10px] text-text-muted">
              <AlertTriangle className="w-3 h-3 inline mr-0.5" />
              禁止微信/QQ/手机号/邮箱/链接 等联系方式, 命中自动隐藏
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted num">{content.length}/2000</span>
              <button
                onClick={handlePost}
                disabled={pending || !content.trim()}
                className="px-3 py-1.5 rounded text-xs font-medium
                  bg-accent-purple text-white hover:bg-accent-purple/90
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  flex items-center gap-1">
                <Send className="w-3 h-3" />
                {pending ? '发表中' : '发表'}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-2 text-xs text-warning">{error}</div>
          )}
        </div>
      ) : null}

      {/* 评论列表 */}
      {topComments.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-muted border border-dashed border-border rounded">
          暂无评论, 来抢沙发
        </div>
      ) : (
        <ul className="space-y-4">
          {topComments.map(c => (
            <CommentRow
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) || []}
              currentUser={currentUser}
              canModerate={canModerate}
              canForward={canForward}
              canViewHidden={canViewHidden}
              canLike={canLike}
              onReply={(id) => setReplyTo(id)}
              onModerate={handleModerate}
              onLike={handleLike}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentRow({
  comment: c, replies, currentUser, canModerate, canForward, canViewHidden, canLike,
  onReply, onModerate, onLike,
}: {
  comment: CommentItem;
  replies: CommentItem[];
  currentUser: Props['currentUser'];
  canModerate: boolean;
  canForward: boolean;
  canViewHidden: boolean;
  canLike: boolean;
  onReply: (id: string) => void;
  onModerate: (id: string, action: 'hide' | 'show' | 'delete') => void;
  onLike: (id: string) => void;
}) {
  const isMine = currentUser?.id === c.authorId;
  const isHidden = c.status === 'HIDDEN';
  const isDeleted = c.status === 'DELETED';
  // 兼容纯文本 / JSON 数组 (v22.0 b9 p12 兼容: 实际是 JSON 字符串数组)
  const hasSensitive = (() => {
    if (!c.sensitiveWords) return false;
    try {
      const parsed = JSON.parse(c.sensitiveWords);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  })();
  const likeCount = c.likeCount ?? 0;
  const liked = !!c.liked;

  return (
    <li className={`p-3 border border-border rounded ${isHidden ? 'bg-warning/5 border-warning/30' : ''} ${isDeleted ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-2">
        {/* 头像占位 */}
        <div className="w-7 h-7 rounded-full bg-accent-purple/20 text-accent-purple
          flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {c.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {/* 头部: 作者 + 角色 + 时间 + 控评 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{c.authorName}</span>
            {c.authorRole === 'MODERATOR' && (
              <span className="text-[10px] text-accent-purple border border-accent-purple/30 px-1.5 py-0.5 rounded-full">版主</span>
            )}
            {c.authorRole === 'ADMIN' && (
              <span className="text-[10px] text-accent-gold border border-accent-gold/30 px-1.5 py-0.5 rounded-full">管理员</span>
            )}
            <span className="text-[10px] text-text-muted num">
              {new Date(c.createdAt).toLocaleString('zh-CN', { hour12: false })}
            </span>
            {isHidden && (
              <span className="text-[10px] text-warning border border-warning/30 px-1.5 py-0.5 rounded-full">
                {hasSensitive ? '命中敏感词, 待审核' : '已隐藏'}
              </span>
            )}
            {isDeleted && (
              <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded-full">已删除</span>
            )}
          </div>

          {/* 内容 */}
          {!isDeleted && (
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
              {c.content}
            </p>
          )}

          {/* 操作行 */}
          {!isDeleted && (
            <div className="mt-2 flex items-center gap-3 text-[10px]">
              {!isHidden && currentUser && currentUser.role !== 'GUEST' && (
                <button
                  onClick={() => onReply(c.id)}
                  className="text-text-muted hover:text-accent-purple transition-colors"
                >
                  回复
                </button>
              )}
              {/* 点赞按钮 (订阅会员/版主/管理员) */}
              {canLike && !isHidden && !isMine && (
                <button
                  onClick={() => onLike(c.id)}
                  className={`flex items-center gap-0.5 transition-colors ${
                    liked ? 'text-accent-purple' : 'text-text-muted hover:text-accent-purple'
                  }`}
                >
                  <ThumbsUp className={`w-2.5 h-2.5 ${liked ? 'fill-current' : ''}`} />
                  {likeCount > 0 ? likeCount : '赞'}
                </button>
              )}
              {canForward && !isHidden && (
                <button
                  onClick={async () => {
                    if (confirm('电子转发此评论给站内会员?')) {
                      await fetch(`/api/comments/${c.id}/forward`, { method: 'POST' });
                      alert('已转发');
                    }
                  }}
                  className="text-text-muted hover:text-accent-blue transition-colors flex items-center gap-0.5"
                >
                  <Share2 className="w-2.5 h-2.5" /> 转发{c.forwardCount > 0 ? ` ${c.forwardCount}` : ''}
                </button>
              )}
              {canModerate && (
                <span className="ml-auto flex items-center gap-2">
                  {!isHidden ? (
                    <button
                      onClick={() => onModerate(c.id, 'hide')}
                      className="text-warning hover:underline flex items-center gap-0.5"
                    >
                      <EyeOff className="w-2.5 h-2.5" /> 隐藏
                    </button>
                  ) : (
                    <button
                      onClick={() => onModerate(c.id, 'show')}
                      className="text-accent-up hover:underline flex items-center gap-0.5"
                    >
                      <Eye className="w-2.5 h-2.5" /> 显示
                    </button>
                  )}
                  <button
                    onClick={() => onModerate(c.id, 'delete')}
                    className="text-danger hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> 删除
                  </button>
                </span>
              )}
            </div>
          )}

          {/* 回复列表 */}
          {replies.length > 0 && (
            <ul className="mt-3 pl-3 border-l-2 border-border space-y-3">
              {replies.map(r => (
                <CommentRow
                  key={r.id}
                  comment={r}
                  replies={[]}
                  currentUser={currentUser}
                  canModerate={canModerate}
                  canForward={canForward}
                  canViewHidden={canViewHidden}
                  canLike={canLike}
                  onReply={onReply}
                  onModerate={onModerate}
                  onLike={onLike}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
