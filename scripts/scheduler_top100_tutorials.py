"""scheduler_top100_tutorials.py — Top 100 研报批量生成 (task-0050, Phase 6.2 Week 1)

多维均匀选品 (Tier 1/2/3 + 跨来源) + 真实 LLM (MiniMax-M3) + 断点续传 + QPS 限流 + 异常隔离

用法:
  python scheduler_top100_tutorials.py --limit 5     # 小考测试
  python scheduler_top100_tutorials.py              # 全量 Top 94 补齐 (已有 6 篇跳过)
  python scheduler_top100_tutorials.py --target 100 # 跑满 100 (含已 6 篇)
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# 加载 .env (MiniMax API Key)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=False)
        print(f"[dotenv] loaded from {env_path}")
except ImportError:
    pass

CODEBASE = Path(__file__).resolve().parents[1]
DB = CODEBASE / "prisma" / "dev.db"
FAILED_LOG = CODEBASE / "scripts" / "_failed.log"
PROGRESS_LOG = CODEBASE / "scripts" / "_progress.log"

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.minimax.chat/v1")
ANTHROPIC_BASE_URL = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
MODEL = os.environ.get("OPENAI_MODEL", "MiniMax-M3")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
QPS_DELAY = 2.0          # 秒/请求 (从 1.5s 上调, 避 429)
GLOBAL_LIMIT_PER_60S = 30  # 60s 窗口内最多 30 篇 (架构师 7/30 拍板方案 B)

# 引入抽取器 (.harness/scripts/extract_params.py)
HARNESS_SCRIPTS = CODEBASE.parent / ".harness" / "scripts"
sys.path.insert(0, str(HARNESS_SCRIPTS))
import extract_params  # type: ignore


# === 选品 SQL: 多维均匀 ===
SELECTION_SQL = """
SELECT
  r.id, r.title, r.license, r.originalSource, r.sourceFileId, r.tier
FROM OpenSourceRelease r
WHERE
  -- 排除已生成 tutorial 的 (断点续传)
  NOT EXISTS (SELECT 1 FROM OpenSourceTutorial t WHERE t.releaseId = r.id)
  -- 多维均匀: 跨来源
  AND r.originalSource IN ('github', 'algo-forge', 'gitlab', 'mql5-codebase', 'forex-strategies-extracted')
ORDER BY
  -- Tier 优先
  CASE r.tier
    WHEN 'Tier 1 (Premium/VIP)' THEN 1
    WHEN 'Tier 2 (Pro)' THEN 2
    WHEN 'Tier 3 (Basic)' THEN 3
    ELSE 4
  END,
  -- 来源均匀 (github 优先但不过度集中)
  CASE r.originalSource
    WHEN 'github' THEN 1
    WHEN 'algo-forge' THEN 2
    WHEN 'gitlab' THEN 3
    WHEN 'mql5-codebase' THEN 4
    ELSE 5
  END,
  -- 按 id 稳定排序 (避免重跑顺序变化)
  r.id
"""


def select_candidates(dev: sqlite3.Connection, limit: int) -> list[dict]:
    """从 DB 选 N 个候选 (已过滤已生成)"""
    rows = dev.execute(SELECTION_SQL).fetchall()
    if limit:
        rows = rows[:limit]
    out = []
    for r_id, title, lic, src, sfi, tier in rows:
        out.append({
            "id": r_id,
            "title": title,
            "license": lic or "未明确",
            "originalSource": src,
            "sourceFileId": sfi,
            "tier": tier or "Tier 3 (Basic)",
        })
    return out


def fetch_mql_content(sourceFileId: str) -> tuple[list[dict], str | None]:
    """从 sourceFileId 读取源文件, 抽取 input 参数 + 协议头"""
    # 解析路径: D:\CodeBase\source-collection\raw\<src>\<rest>
    norm = sourceFileId.replace("\\", "/")
    marker = "source-collection/raw/"
    idx = norm.find(marker)
    if idx < 0:
        return [], None
    tail = norm[idx + len(marker):]
    src, _, rest = tail.partition("/")
    if not rest:
        return [], None
    # 物理路径 (假设当前在 cpro-website 目录)
    candidates = [
        Path(f"../source-collection/raw/{src}/{rest}"),
        Path(f"source-collection/raw/{src}/{rest}"),
    ]
    for p in candidates:
        if p.exists():
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")[:3000]
                params = extract_params.extract_input_params(content)
                lic = extract_params.extract_license_header(content)
                return params, lic
            except Exception:
                return [], None
    return [], None


def call_llm(payload: dict, messages: list[dict]) -> str | None:
    """调 LLM (优先 Anthropic, 其次 OpenAI 兼容).
    含 3 次重试 + 指数退避.
    自动剥除 thinking 块 (MiniMax-M3 默认输出 <think>...</think>).
    """
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            if ANTHROPIC_API_KEY:
                # Anthropic API (官方)
                url = ANTHROPIC_BASE_URL.rstrip("/") + "/v1/messages"
                body = json.dumps({
                    "model": ANTHROPIC_MODEL,
                    "max_tokens": 2500,
                    "temperature": 0.6,
                    "messages": messages,
                }).encode("utf-8")
                req = urllib.request.Request(url, data=body, method="POST")
                req.add_header("Content-Type", "application/json")
                req.add_header("x-api-key", ANTHROPIC_API_KEY)
                req.add_header("anthropic-version", "2023-06-01")
            else:
                # OpenAI 兼容 (MiniMax 等)
                url = BASE_URL.rstrip("/") + "/chat/completions"
                body = json.dumps({
                    "model": MODEL,
                    "messages": messages,
                    "max_tokens": 2500,
                    "temperature": 0.6,
                }).encode("utf-8")
                req = urllib.request.Request(url, data=body, method="POST")
                req.add_header("Content-Type", "application/json")
                req.add_header("Authorization", f"Bearer {OPENAI_API_KEY}")
            with urllib.request.urlopen(req, timeout=60) as r:
                resp = json.loads(r.read())
                # Anthropic response shape: {content: [{text: "..."}]}
                if "content" in resp and isinstance(resp["content"], list):
                    return resp["content"][0].get("text", "")
                # OpenAI response shape: {choices: [{message: {content: "..."}}]}
                return resp["choices"][0]["message"]["content"]
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError, json.JSONDecodeError) as e:
            wait = 2 ** attempt  # 2, 4, 8 秒
            print(f"  [LLM ERR attempt {attempt}/{max_retries}] {type(e).__name__}: {str(e)[:60]} | retry in {wait}s")
            if attempt < max_retries:
                time.sleep(wait)
    return None


def strip_thinking(content: str) -> str:
    """剥除 LLM thinking 块 (MiniMax-M3 默认输出 <think>...</think>)
    强健: 处理嵌套 + 未闭合 (max_tokens 截断时无 </think>) + 多次匹配
    """
    import re
    # 1. 闭合的 thinking 块 (嵌套, 多次剥)
    for _ in range(10):
        prev = content
        content = re.sub(r"<think>.*?</think>\s*", "", content, flags=re.DOTALL)
        if prev == content:
            break
    # 2. 未闭合的 thinking 块 (max_tokens 截断, 残留 <think> 在头部)
    #    模式: 内容以 <think> 开头, 但没有结束标签. 剥到第一个 \n\n 之前的 thinking
    m = re.match(r"^\s*<think>(.*?)(?=\n\n|\Z)", content, flags=re.DOTALL)
    if m:
        # 看看后面的内容是否包含中文 (真研报), 是则剥 thinking
        rest = content[m.end():]
        if re.search(r"[一-鿿]", rest):
            content = rest.strip()
    # 3. 偶尔 LLM 在正文里又出现 <think> (递归剥)
    for _ in range(5):
        prev = content
        content = re.sub(r"<think>[^<]*?$", "", content, flags=re.DOTALL)
        if prev == content:
            break
    return content.strip()


def build_prompt(ca: dict, mql_params: list[dict], lic_header: str | None) -> str:
    lic = lic_header or ca["license"]
    params_table = "\n".join([
        f"| {p.get('cnLabel', p['name'])} ({p['enAlias']}, -) | {p.get('default','-')} | {p.get('desc','-')[:50]} |"
        for p in mql_params[:8]
    ]) or "| (源文件无 input 参数) | - | - |"

    # 修复 Bug 1+2:
    #   - 把硬约束从 ❌/✅ 列表改成自然语言 (避免 LLM 当内容复读)
    #   - 加 system message "不要 thinking" 指令 (避免 LLM 输出 "Let me analyze" 思考)
    return [
        {
            "role": "system",
            "content": (
                "你是 CProTrading 城诺科技投研团队的量化策略编辑。"
                "**直接输出教程正文**, 不要任何前言/思考/分析/自我介绍。"
                "不要写 'Let me analyze' / 'I will write' / 'The user wants me' 这类内部推理。"
                "不要列硬约束清单。直接进入 5 大模块正文。"
            ),
        },
        {
            "role": "user",
            "content": f"""撰写一篇约 500 字的中文教程, 包含 5 大模块:

1. 市场定位 (60~80字): 适用行情、推荐品种、推荐时段
2. 策略核心 (50~60字): 一句话算法逻辑
3. 关键参数表: 中文名 (English Alias, 单位?) | 默认值 | 说明
4. 风险提示 (3~5 条): 实盘前必测项、最大回撤假设、资金管理建议
5. 合规声明: 协议、双署名 (原作者 + CProTrading 城诺科技)、金融免责声明 (实盘盈亏自负, 联系方式微信 Lookee333)

EA 信息:
- 名称: {ca['title']}
- 来源: {ca['originalSource']}
- 协议: {lic} (合规再分发)
- Tier: {ca['tier']}
- input 参数: {params_table}

写作约束 (不要在文中显式提及, 直接遵守):
- 不出现内部研发代号或工程版本号
- 不声称 CProTrading 拥有代码版权, 必须双署名
- 强调实盘交易盈亏自负
- 联系方式: 微信 Lookee333
""",
        },
    ]


def insert_tutorial(dev: sqlite3.Connection, ca: dict, content: str) -> str:
    """INSERT 1 条 tutorial. 成功返回 id"""
    base_slug = ca["title"].lower().replace(" ", "-").replace("/", "-")[:60] or ca["id"][:8]
    base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
    # 加 releaseId 前 4 位确保唯一 (修复 6 个 slug 冲突)
    slug = f"{base_slug[:50]}-{ca['id'][:4]}" if base_slug else ca["id"][:8]
    tut_id = f"tut-{ca['id'][:8]}"
    # 风险等级根据 tier 推断
    risk = "中"
    if "Tier 1" in ca["tier"]: risk = "低"
    elif "Tier 3" in ca["tier"]: risk = "高"
    now = datetime.now(timezone.utc).isoformat()
    cur = dev.execute("""
        INSERT INTO OpenSourceTutorial
        (id, releaseId, slug, marketRegime, symbols, timeframe, riskLevel,
         maxDrawdownPct, riskWarnings, keyParameters, strategyLogic, content,
         productCta, author, status, publishedAt, viewCount, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (
        tut_id, ca["id"], slug,
        "趋势/震荡", "[\"XAUUSD\",\"EURUSD\"]", "H1",
        risk, 35.0, "[\"实盘前必做至少 1 年历史回测\", \"建议单笔风险 ≤ 账户 2%\"]",
        "[]", f"{ca['tier']} 类策略", content,
        None, "CProTrading 投研团队", "PUBLISHED", now, now, now
    ))
    return tut_id


def log_failed(release_id: str, reason: str):
    with FAILED_LOG.open("a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat()}\t{release_id}\t{reason}\n")


def log_progress(msg: str):
    ts = datetime.now().isoformat()
    line = f"{ts}\t{msg}"
    with PROGRESS_LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="限制生成数量 (测试用)")
    ap.add_argument("--target", type=int, default=100, help="目标总数 (含已有)")
    ap.add_argument("--no-llm", action="store_true", help="Mock 模式 (不调 LLM, 仅写元数据)")
    ap.add_argument("--force", action="store_true", help="覆盖已存在的 tutorial")
    args = ap.parse_args()

    mode = "MOCK" if args.no_llm or (not OPENAI_API_KEY and not ANTHROPIC_API_KEY) else (
        f"REAL LLM (Anthropic {ANTHROPIC_MODEL})" if ANTHROPIC_API_KEY else f"REAL LLM (OpenAI-compat {MODEL})"
    )
    print(f"=== Top {args.target} 教程批量生成 (task-0050) ===")
    print(f"模式: {mode}")
    print(f"QPS 限流: {QPS_DELAY}s/请求")
    print(f"失败日志: {FAILED_LOG.name}")
    print(f"进度日志: {PROGRESS_LOG.name}")
    print()

    if not DB.exists():
        print(f"❌ DB 不存在: {DB}")
        sys.exit(1)

    dev = sqlite3.connect(str(DB))
    # 如果是 LLM 重跑, 先清空 (PM 拍板: 改用其他 LLM, 重跑)
    if (OPENAI_API_KEY or ANTHROPIC_API_KEY) and not args.no_llm:
        existing_count = dev.execute("SELECT count(*) FROM OpenSourceTutorial").fetchone()[0]
        if existing_count > 0:
            print(f"[清空] LLM 重跑模式, 清空现有 {existing_count} 条旧教程")
            dev.execute("DELETE FROM OpenSourceTutorial")
            dev.commit()
    existing = dev.execute("SELECT count(*) FROM OpenSourceTutorial").fetchone()[0]
    print(f"当前已生成: {existing} 篇")
    need = max(0, args.target - existing)
    print(f"目标: {args.target} 篇, 需补: {need} 篇")
    if args.limit:
        need = min(need, args.limit)
        print(f"--limit 限制: 实际跑 {need} 篇")
    print()

    candidates = select_candidates(dev, need)
    print(f"选中 {len(candidates)} 个候选 (跨来源均匀)")
    src_dist: dict = {}
    for c in candidates:
        src_dist[c["originalSource"]] = src_dist.get(c["originalSource"], 0) + 1
    print(f"  来源分布: {src_dist}")
    print()

    success = 0
    failed = 0
    skipped = 0
    start_time = time.time()
    for i, ca in enumerate(candidates, 1):
        rel_id = ca["id"]
        # 1. 抽取源文件参数
        mql_params, lic_header = fetch_mql_content(ca["sourceFileId"])
        n_params = len(mql_params)
        print(f"[{i:>2}/{len(candidates)}] {ca['title'][:40]:<40} | src={ca['originalSource']:<10} | params={n_params}", end="")

        # 2. 调 LLM (或 Mock)
        content: str | None = None
        if args.no_llm or (not OPENAI_API_KEY and not ANTHROPIC_API_KEY):
            content = f"# {ca['title']} — 研报 (MOCK 占位)\n\n_待 LLM 接入_"
        else:
            prompt_messages = build_prompt(ca, mql_params, lic_header)
            content = call_llm({"ea": ca['title']}, prompt_messages)
            # 剥除 thinking 块 (MiniMax-M3 默认输出 <think>...</think>, Claude 无)
            if content:
                content = strip_thinking(content)

        # 3. 失败处理
        if not content or len(content) < 100:
            failed += 1
            log_failed(rel_id, f"content 为空或太短 (len={len(content or '')})")
            print(f" ❌ content 空")
            continue

        # 4. 写入 DB
        try:
            tut_id = insert_tutorial(dev, ca, content)
            dev.commit()
            success += 1
            elapsed = time.time() - start_time
            log_progress(f"OK {tut_id} | {ca['title'][:30]} | elapsed={elapsed:.0f}s")
            print(f" ✅ {tut_id} | {len(content)} chars | {elapsed:.0f}s")
        except sqlite3.Error as e:
            failed += 1
            log_failed(rel_id, f"DB ERR: {e}")
            print(f" ❌ DB: {e}")
            continue

        # 5. QPS 限流 (2s) + 60s 窗口限流
        if not args.no_llm and OPENAI_API_KEY and i < len(candidates):
            # 全局 60s 限流: 每 30 篇 sleep 60s
            if i % GLOBAL_LIMIT_PER_60S == 0 and i > 0:
                print(f"  [限流] 已完成 {i} 篇, 暂停 60s 避免 MiniMax 触发 429")
                time.sleep(60)
            else:
                time.sleep(QPS_DELAY)

    dev.close()
    elapsed = time.time() - start_time

    print()
    print("=" * 60)
    print(f"=== 战果 ===")
    print(f"成功: {success} 篇")
    print(f"失败: {failed} 篇 (详见 {FAILED_LOG.name})")
    print(f"跳过 (已存在): {skipped} 篇")
    print(f"总耗时: {elapsed:.0f}s ({elapsed/max(success,1):.1f}s/篇)")
    print(f"新累计: {existing + success} / {args.target}")


if __name__ == "__main__":
    main()