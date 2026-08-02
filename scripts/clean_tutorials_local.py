"""clean_tutorials_local.py — 本地清理已生成的 184 条教程 (task-0053)

PM 决策: 资源有限, 不再调用 LLM 重跑. 在本地剥 thinking + meta-rule 块,
对每个 releaseId 仅保留最新 (publishedAt 最大) 一条, 删除重复.

完全 0 token, 0 LLM 调用, 纯 string ops + DB UPDATE.
"""
import re
import sqlite3
from pathlib import Path

DB = Path("prisma/dev.db")


def strip_thinking_and_meta(content: str) -> str:
    """剥除:
    1. <think>...</think> 块 (可能嵌套)
    2. 未闭合 <think> 块 (max_tokens 截断, max 1 个, 跳到首个 \n\n 后)
    3. 元评论提示 (Let me write / I will / I need to 等) 至首个中文段落
    4. meta-rule 残留块 (❌/✅ 列表但保留合规声明行)
    """
    if not content:
        return content

    # 1. 闭合的 thinking 块 (嵌套, 多次剥)
    for _ in range(10):
        prev = content
        content = re.sub(r"<think>.*?</think>\s*", "", content, flags=re.DOTALL)
        if prev == content:
            break

    # 2. 未闭合的 thinking 块 (max_tokens 截断, 残留 <think> 头部)
    #    模式: 开头 <think> (无结束) , 中文出现在后面 → 跳到首个 \n\n 中文段
    m = re.match(r"^\s*<think>(.*?)(?=\n\n\s*[一-鿿])", content, flags=re.DOTALL)
    if m:
        rest = content[m.end():]
        if re.search(r"[一-鿿]", rest):
            content = rest

    # 3. 元评论提示 (LLM 思考泄漏但无 <think> 包裹)
    #    模式: "Let me write..." / "I need to..." / "I will create..." 等英文, 跳到首个中文段
    meta_starters = [
        r"Let me write[^.]*\.\s*",
        r"Let me create[^.]*\.\s*",
        r"Let me analyze[^.]*\.\s*",
        r"I need to write[^.]*\.\s*",
        r"I will write[^.]*\.\s*",
        r"I will create[^.]*\.\s*",
        r"I will follow[^.]*\.\s*",
        r"I'll create[^.]*\.\s*",
        r"The user wants[^.]*\.\s*",
        r"Based on the given[^.]*\.\s*",
    ]
    # 找首个中文字符位置
    first_cn = re.search(r"[一-鿿]", content)
    if first_cn:
        prefix = content[: first_cn.start()]
        for ptn in meta_starters:
            prefix = re.sub(ptn, "", prefix, flags=re.IGNORECASE | re.DOTALL)
        content = prefix + content[first_cn.start():]

    # 4. meta-rule 残留块 (查找 ❌/✅ prompt 约束列表)
    #    模式: 连续 3+ 行含 ❌ 或 ✅ (硬约束列表特征)
    lines = content.split("\n")
    cleaned_lines = []
    skip_meta_rule = False
    for line in lines:
        stripped = line.strip()
        # 触发跳过: 出现 "Hard constraints" / "硬约束" / "Constraints:" 等 meta-rule 头
        if re.search(r"^(#\s*)?(Hard\s+constraints|硬约束|Constraints?:\s*$)", stripped, re.IGNORECASE):
            skip_meta_rule = True
            continue
        if skip_meta_rule:
            # 跳过整段, 直到遇到 ## 标题 (真教程段开始) 或 空行+列表
            if re.match(r"^##\s+", stripped) or re.match(r"^#\s+[^#]", stripped):
                skip_meta_rule = False
                cleaned_lines.append(line)
            continue
        # 检测行: "❌ No ..." / "✅ Must ..." / "✅ X: ..." 视为硬约束行, 跳过
        if re.match(r"^[❌✅]\s+", stripped) and any(kw in stripped for kw in ["No ", "Must ", "License:", "Author:", "Dual signature", "Contact", "complies with", "are met"]):
            continue
        cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()


def main():
    db = sqlite3.connect(str(DB))
    rows = db.execute("""
        SELECT id, releaseId, slug, content, publishedAt
        FROM OpenSourceTutorial
        ORDER BY publishedAt DESC
    """).fetchall()

    print(f"=== 本地清理 (task-0053) ===")
    print(f"原始: {len(rows)} 条\n")

    # Phase 1: dedup - 每个 releaseId 保留最新 (publishedAt 最大的) 一条
    seen_release = set()
    dedup_keep = []
    dedup_drop = []
    for r_id, release_id, slug, content, published_at in rows:
        if release_id in seen_release:
            dedup_drop.append(r_id)
        else:
            seen_release.add(release_id)
            dedup_keep.append((r_id, release_id, slug, content, published_at))

    print(f"[dedup] 保留: {len(dedup_keep)} | 删: {len(dedup_drop)}")
    if dedup_drop:
        placeholders = ",".join("?" * len(dedup_drop))
        db.execute(f"DELETE FROM OpenSourceTutorial WHERE id IN ({placeholders})", dedup_drop)
        db.commit()

    # Phase 2: strip thinking + meta-rule (对所有保留的)
    cleaned_count = 0
    for r_id, release_id, slug, content, published_at in dedup_keep:
        if not content:
            continue
        new_content = strip_thinking_and_meta(content)
        if new_content != content:
            db.execute("UPDATE OpenSourceTutorial SET content=? WHERE id=?", (new_content, r_id))
            cleaned_count += 1

    db.commit()
    db.close()

    print(f"[clean] 文本剥 thinking/meta: {cleaned_count} 条")
    print(f"\n=== 战果 ===")
    print(f"原始: {len(rows)}")
    print(f"dedup 后: {len(dedup_keep)}")
    print(f"文本清洗: {cleaned_count} 条内容已更新")


if __name__ == "__main__":
    main()