"""
v22.0 PATCH 18.5 (v2 修复): 从 mql-phase2 master.db 拉 License → UPDATE cpro-website Product

修复历史 (v2 - 2026-08-16 22:50):
  - master.db.mql_files **没有 id 列**, 实际是 file_id/internal_id/original_name/source_path
  - cpro-website Product.id 是 cuid (如 cmssgzc34...), 不能跟 master.db 直接 id 匹配
  - **改用 name 模糊匹配**: Product.name (中文) → 翻译/提取关键词 → master.db.original_name LIKE
  - 5 王牌用 isFeatured=true 标识, 走 C 任务 (Proprietary), B 任务跳过

用法:
  python3 scripts/update_license_from_master.py
  python3 scripts/update_license_from_master.py --dry-run    # 演练不 UPDATE

前置:
  1. PM 上传 mql-phase2/output/db/master.db 到 /var/www/cpro-website/scripts/master.db
  2. ECS .env.production 已有 DATABASE_URL="file:./prisma/dev.db"
  3. schema.prisma 已含 license + licenseFileUrl 字段 (npx prisma db push 已应用)

输出:
  - 46 严选非王牌商品 (Tier 1/2 排除 5 王牌) 全部加 License 字段
  - description 末尾自动追加 "License: XXX" 行 (不覆盖原 description)
  - 5 王牌 (isFeatured=true) 跳过, 由 update_ace5_copyright.py 单独处理
"""
import os
import re
import sys
import sqlite3
import argparse
from pathlib import Path
from datetime import datetime

# cpro-website DB (Product 表) - 默认 ECS 路径, 本地测试可用环境变量覆盖
CPRO_DB = Path(os.environ.get("CPRO_DB_PATH", "/var/www/cpro-website/prisma/dev.db"))
# mql-phase2 master.db (PM 上传, 临时文件, 跑完删)
MASTER_DB = Path(os.environ.get("MASTER_DB_PATH", "/var/www/cpro-website/scripts/master.db"))


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


# 5 王牌中文名 → 英文关键词列表 (用于 master.db.original_name 模糊匹配)
# 5 王牌是 PM 自家 v1 EA, 不在 master.db 里, B 任务会直接跳过它们
# 这些关键词只用于其他 46 严选商品 (非 5 王牌的 Tier 1/2)
NAME_KEYWORDS_RULES = [
    # (regex pattern on product name, [keywords for master.db original_name match])
    (r"马丁|加仓|倍投|martingale", ["martingail", "martingale", "gridmartingale"]),
    (r"网格|grid", ["grid", "gridea"]),
    (r"套利|arbitrage", ["arbitrage", "arb_"]),
    (r"剥头皮|scalp", ["scalp", "scalper"]),
    (r"对冲|hedg|warrior", ["hedg", "warrior", "hedge"]),
    (r"趋势|trend", ["trend", "trendline"]),
    (r"突破|breakout", ["breakout", "break"]),
    (r"反转|reversal", ["revers", "turnaround"]),
    (r"波段|swing", ["swing", "wave"]),
    (r"震荡|oscillat", ["oscillat", "range"]),
    (r"均线|ma|ema|sma", ["ma_", "ema", "sma", "crossover"]),
    (r"rsi|随机|stoch|kdj", ["rsi", "stoch", "kdj"]),
    (r"macd", ["macd"]),
    (r"布林|boll|bollinger", ["boll", "bollinger"]),
    (r"黄金|xau|gold", ["xau", "gold", "xauusd"]),
    (r"欧元|eur", ["eur", "eurusd"]),
    (r"美元|usd|dxy", ["usd", "dxy"]),
    (r"原油|oil|usoil|wti", ["oil", "wti", "usoil", "crude"]),
    (r"比特币|btc|bitcoin", ["btc", "bitcoin"]),
]


def extract_keywords(product_name: str) -> list:
    """从中文商品名提取 master.db 搜索关键词"""
    keywords = []
    name_lower = product_name.lower()
    for pattern, kws in NAME_KEYWORDS_RULES:
        if re.search(pattern, product_name, re.IGNORECASE):
            keywords.extend(kws)
    # 去重保持顺序
    seen = set()
    return [k for k in keywords if not (k in seen or seen.add(k))]


def find_license_in_master(master_cur, product_name: str) -> tuple:
    """
    在 master.db.mql_files 表里找 product_name 对应商品的 license

    Returns: (license_value, matched_original_name) or (None, None)
    """
    keywords = extract_keywords(product_name)
    if not keywords:
        return (None, None)

    # 尝试每个关键词, 按精确度优先 (长的先)
    for kw in sorted(keywords, key=len, reverse=True):
        rows = master_cur.execute(
            "SELECT license, original_name FROM mql_files WHERE LOWER(original_name) LIKE ? AND license IS NOT NULL AND license != 'No-License' AND license != 'Unknown' ORDER BY stars DESC LIMIT 1",
            (f"%{kw.lower()}%",),
        ).fetchone()
        if rows:
            return (rows[0], rows[1])

    return (None, None)


def main():
    parser = argparse.ArgumentParser(description="从 master.db 拉 License → UPDATE cpro-website Product")
    parser.add_argument("--dry-run", action="store_true", help="演练模式, 不 UPDATE")
    args = parser.parse_args()

    # 1. 检查 DB 存在
    if not CPRO_DB.exists():
        log(f"[ERR] cpro-website DB 不存在: {CPRO_DB}")
        log(f"  提示: 本地测试可设 CPRO_DB_PATH=G:\\CodeBase\\cpro-website\\prisma\\dev.db")
        sys.exit(1)
    if not MASTER_DB.exists():
        log(f"[ERR] master.db 不存在: {MASTER_DB}")
        log(f"  需 PM 上传: G:\\CodeBase\\mql5-phase2\\output\\db\\master.db")
        log(f"  到 ECS: /var/www/cpro-website/scripts/master.db")
        log(f"  本地测试可设 MASTER_DB_PATH=G:\\CodeBase\\mql5-phase2\\output\\db\\master.db")
        sys.exit(1)

    log(f"cpro DB: {CPRO_DB}")
    log(f"master DB: {MASTER_DB}")
    log(f"模式: {'演练' if args.dry_run else '正式 UPDATE'}")

    # 2. 打开 2 个 DB
    cpro = sqlite3.connect(str(CPRO_DB))
    master = sqlite3.connect(str(MASTER_DB))

    # 3. master.db 表 schema 自检
    log("")
    log("=== master.db 自检 ===")
    cols = [d[0] for d in master.execute("SELECT * FROM mql_files LIMIT 1").description]
    log(f"  mql_files 列: {cols[:5]}... ({len(cols)} 列)")
    if "license" not in cols or "original_name" not in cols:
        log(f"[ERR] master.db mql_files 缺关键列 (license/original_name), 实际列: {cols}")
        sys.exit(1)

    # 4. master.db license 分布
    log("")
    log("=== master.db mql_files license 分布 (前 10) ===")
    rows = master.execute(
        "SELECT license, COUNT(*) FROM mql_files WHERE license IS NOT NULL GROUP BY license ORDER BY COUNT(*) DESC LIMIT 10"
    ).fetchall()
    for r in rows:
        log(f"  {r[0]}: {r[1]}")

    # 5. 候选商品: Tier 1 + Tier 2 排除 5 王牌 (isFeatured=true)
    log("")
    log("=== 候选商品: Tier 1/2 (排除 5 王牌 isFeatured) ===")
    high_value = cpro.execute(
        "SELECT id, name, description, isFeatured FROM Product "
        "WHERE (tier LIKE 'Tier 1%' OR tier LIKE 'Tier 2%') "
        "AND (isFeatured = 0 OR isFeatured IS NULL) "
        "ORDER BY tier, id"
    ).fetchall()
    log(f"  候选商品数: {len(high_value)}")

    if len(high_value) == 0:
        log("[WARN] 没有候选商品 (本地 dev.db 可能只有 5 王牌, B 任务需在 ECS 跑)")
        log("       ECS 候选: 5 王牌 + Tier 1 658 + Tier 2 3,998 = 4,656 高价值商品")
        log("       5 王牌 isFeatured=true, 由 C 任务处理, B 任务匹配其他 ~4,651 商品")

    # 6. 逐个匹配 + UPDATE
    log("")
    log("=== 开始匹配 (Product.name → master.db.original_name 模糊) ===")
    updated = 0
    skipped_no_match = 0
    skipped_already = 0
    matched_samples = []

    for prod in high_value:
        prod_id, prod_name, prod_desc, is_featured = prod

        # 已 license 跳过
        cur_license = cpro.execute("SELECT license FROM Product WHERE id = ?", (prod_id,)).fetchone()
        if cur_license and cur_license[0]:
            skipped_already += 1
            continue

        # 5 王牌防御性跳过
        if is_featured:
            continue

        license_val, matched_name = find_license_in_master(master, prod_name)
        if not license_val:
            skipped_no_match += 1
            continue

        # 1) UPDATE Product.license
        if not args.dry_run:
            cpro.execute("UPDATE Product SET license = ? WHERE id = ?", (license_val, prod_id))

        # 2) description 末尾追加 License 行 (幂等)
        marker = f"\n\nLicense: {license_val}\n来源: mql-phase2 master.db"
        new_desc = (prod_desc or "") + marker
        if marker in (prod_desc or ""):
            skipped_already += 1
        else:
            if not args.dry_run:
                cpro.execute("UPDATE Product SET description = ? WHERE id = ?", (new_desc, prod_id))

        updated += 1
        if len(matched_samples) < 10:
            matched_samples.append((prod_id, prod_name, license_val, matched_name))

    if not args.dry_run:
        cpro.commit()
    cpro.close()
    master.close()

    log("")
    log("=== 匹配样本 (前 10) ===")
    for s in matched_samples:
        log(f"  {s[0][:25]:25s} | {s[1][:20]:20s} | → {s[2]:12s} (matched: {s[3]})")

    log("")
    log("=== 总结 ===")
    log(f"  候选商品: {len(high_value)}")
    log(f"  更新成功: {updated}")
    log(f"  跳过 (无匹配): {skipped_no_match}")
    log(f"  跳过 (已有 license): {skipped_already}")
    log(f"  模式: {'演练 (没改 DB)' if args.dry_run else '正式 UPDATE'}")

    if not args.dry_run:
        log("")
        log("[DONE] 跑完请立即删 master.db (含 mql-phase2 完整数据, 防泄漏):")
        log(f"   rm {MASTER_DB}")


if __name__ == "__main__":
    main()
