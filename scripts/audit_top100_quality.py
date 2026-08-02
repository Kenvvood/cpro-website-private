"""audit_top100_quality.py — Top 100 研报质量审查 (task-0052)

检测 LLM 元评论垃圾 + 列出需重生成/下架的 tutorial
"""
import json
import re
import sqlite3
from pathlib import Path

DB = Path("prisma/dev.db")

# 元评论关键词 (LLM 复读 prompt 的特征)
META_PHRASES = [
    "Let me write",
    "I need to write",
    "I will write",
    "I will follow",
    "Let me follow",
    "Based on the given information",
    "the user wants me",
    "I need to analyze",
    "I will create a",
    "I'll follow the",
    "let me write",
    "I'll create",
    "I should provide",
]

# Meta-rule 复制 (LLM 把 prompt 内的 ❌/✅ 列表直接当输出)
META_RULE_MARKERS = [
    "❌ No internal",
    "❌ No claim",
    "✅ Must emphasize",
    "✅ License:",
    "✅ Contact:",
    "✅ Author:",
    "✅ Dual signature:",
    "Original author + CProTrading 城诺科技 (整理分发)",
    "微信 Lookee333",
    "complies with hard constraints",
    "hard constraints are met",
]


def audit_tutorial(row: dict) -> dict:
    """返回 quality flags"""
    content = row.get("content") or ""
    issues = []
    score = 100

    # 1. 检测元评论 (LLM 复读 prompt)
    meta_hits = [p for p in META_PHRASES if p in content]
    if meta_hits:
        issues.append(f"meta-commentary: {meta_hits[:3]}")
        score -= 50

    # 2. 检测 meta-rule 复制 (prompt 内的 ❌/✅ 列表被当输出)
    rule_hits = [m for m in META_RULE_MARKERS if m in content]
    if rule_hits:
        issues.append(f"meta-rule-copied: {rule_hits[:3]}")
        score -= 40

    # 3. 长度异常 (< 500 字 = 几乎肯定内容不够)
    if len(content) < 500:
        issues.append(f"too-short: {len(content)} chars")
        score -= 30

    # 4. 没有中文内容 (LLM 偶尔输出英文)
    cn_chars = sum(1 for c in content if "一" <= c <= "鿿")
    if cn_chars < 100:
        issues.append(f"not-chinese: {cn_chars} CJK chars")
        score -= 30

    # 5. 包含完整 5 大模块 (市场定位/策略核心/参数表/风险提示/合规)
    modules_found = sum(1 for kw in ["市场定位", "策略核心", "参数表", "风险提示", "合规"] if kw in content)
    if modules_found < 4:
        issues.append(f"missing-modules: {modules_found}/5")
        score -= 20

    return {
        "score": max(0, score),
        "issues": issues,
        "status": "PASS" if score >= 70 else "FAIL",
    }


def main():
    db = sqlite3.connect(str(DB))
    rows = db.execute("""
        SELECT t.id, t.slug, r.title, t.marketRegime, t.riskLevel, t.content, t.status
        FROM OpenSourceTutorial t
        JOIN OpenSourceRelease r ON t.releaseId = r.id
        ORDER BY t.publishedAt ASC
    """).fetchall()
    db.close()

    print(f"=== Top 100 教程质量审查 ({len(rows)} 篇) ===\n")
    pass_count = 0
    fail_list = []
    for r_id, slug, title, regime, risk, content, status in rows:
        audit = audit_tutorial({
            "content": content,
        })
        if audit["status"] == "PASS":
            pass_count += 1
        else:
            fail_list.append({
                "id": r_id,
                "slug": slug,
                "title": title[:50],
                "regime": regime,
                "risk": risk,
                "content_len": len(content or ""),
                "issues": audit["issues"],
                "score": audit["score"],
            })
    print(f"PASS: {pass_count} / {len(rows)}")
    print(f"FAIL: {len(fail_list)} / {len(rows)}\n")
    print("=== 失败清单 (按 score 升序) ===")
    fail_list.sort(key=lambda x: x["score"])
    for i, f in enumerate(fail_list[:20], 1):
        print(f"  {i:>2}. [{f['score']:>3}] {f['title']}")
        print(f"       slug: {f['slug']}")
        print(f"       content_len: {f['content_len']}")
        print(f"       issues: {f['issues'][:2]}")
        print()
    if len(fail_list) > 20:
        print(f"  ... 还有 {len(fail_list) - 20} 篇 FAIL")

    # 保存 FAIL 列表供后续重生成
    with open("scripts/_audit_fail.json", "w", encoding="utf-8") as f:
        json.dump(fail_list, f, ensure_ascii=False, indent=2)
    print(f"\n失败列表已存: scripts/_audit_fail.json ({len(fail_list)} 条)")


if __name__ == "__main__":
    main()