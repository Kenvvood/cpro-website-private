"""import_x_pool.py — Phase 2: X 池入库 (task-0037)

读 master.db.mql_files WHERE quality_grade IN ('X','C'),
转换 + 批量 INSERT 到 cpro-website dev.db 的 OpenSourceRelease 表。

铁律 #283 (默认拒绝) — X grade 默认不出 paid 区
铁律 #284 (不透明主键代理) — sourceFileId 存 D:\CodeBase\... 全路径, 读时经 path_resolver 解析
铁律 #285 (商品溯源无真空) — sourceFileId 必填非空

用法:
  python scripts/import_x_pool.py --dry-run     # 只统计
  python scripts/import_x_pool.py                # 实际入库
  python scripts/import_x_pool.py --limit 100    # 限量导入 (测试用)
"""
from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

CODEBASE_ROOT = Path(__file__).resolve().parents[1]
MASTER_DB = CODEBASE_ROOT.parent / "mql5-phase2" / "output" / "db" / "master.db"
DEV_DB = CODEBASE_ROOT / "prisma" / "dev.db"

LICENSE_MAP = {
    "GPL-3": "GPL_3",
    "GPL-2": "GPL_2",
    "Apache-2.0": "APACHE_2_0",
    "MIT": "MIT",
    "BSD-3": "BSD_3",
    "Unlicense": "UNLICENSE",
    "LGPL": "LGPL",
    "MPL-2.0": "MPL_2_0",
    "Proprietary": "PROPRIETARY",
    "No-License": "NO_LICENSE",
    "Unknown": "UNKNOWN",
}


def normalize_license(lic: str | None) -> str:
    """master.db license → OpenSourceLicense enum"""
    if not lic:
        return "UNKNOWN"
    return LICENSE_MAP.get(lic, "UNKNOWN")


def make_title(file_path: str) -> str:
    """D:\CodeBase\source-collection\raw\<src>\<item>\<rest> → 显示标题"""
    # 用 \\ 切
    parts = file_path.replace("/", "\\").split("\\")
    # 取倒数 3 段: src/item/filename
    if len(parts) >= 3:
        return f"[{parts[-3]}] {parts[-2]}/{parts[-1]}"
    return parts[-1] if parts else file_path


def make_description(file_path: str, license: str, original_source: str) -> str:
    """生成商品描述"""
    return (
        f"原始来源: {original_source}\n"
        f"协议: {license}\n"
        f"声明: 保留原作者版权, 仅做合规再分发 + 表达层汉化包装\n"
        f"原文件路径: {file_path}"
    )


def import_x_pool(limit: int | None = None, dry_run: bool = False) -> int:
    if not MASTER_DB.exists():
        print(f"master.db 不存在: {MASTER_DB}", file=sys.stderr)
        return 2
    if not DEV_DB.exists():
        print(f"dev.db 不存在: {DEV_DB}", file=sys.stderr)
        return 2

    master = sqlite3.connect(str(MASTER_DB))
    dev = sqlite3.connect(str(DEV_DB))

    # 1) 从 master.db 拉 X/C grade 文件
    # 用 (source, item_id, file_id 前缀) 去重, 因为同一仓库多文件 → 一条 release 即可
    sql = """
        select
            file_id,
            original_name,
            license,
            source_type,
            source_url,
            storage_path,
            file_size
        from mql_files
        where quality_grade in ('X', 'C')
        order by source_type, file_id
    """
    if limit:
        sql += f" limit {limit}"
    rows = master.execute(sql).fetchall()
    print(f"[扫描] master.db mql_files (X/C grade) = {len(rows):,}")

    # 2) 转换: 按 source + item_id 分组, 一条 release 对应一组文件
    # 但 X 池里有 10,403 个文件, 一一对应 release 会爆, 按 source 分组成 N 条
    by_source: dict[str, list] = {}
    for file_id, orig_name, lic, src_type, src_url, storage_path, file_size in rows:
        # 从 file_id 拆 source + item_id (兼容正反斜杠)
        norm = file_id.replace("\\", "/").replace("//", "/")
        marker = "source-collection/raw/"
        idx = norm.find(marker)
        if idx < 0:
            src = src_type or "unknown"
            item = orig_name or file_id
        else:
            tail = norm[idx + len(marker):]
            src, _, rest = tail.partition("/")
            if not rest:
                src = src_type or "unknown"
                item = orig_name or file_id
            else:
                # 裸 MQ vs item 目录
                if "/" not in rest and rest.lower().endswith((".mq4", ".mq5", ".mqh")):
                    item = rest.rsplit(".", 1)[0]
                else:
                    item = rest.split("/", 1)[0]
        key = (src, item)
        by_source.setdefault(key, []).append({
            "file_id": file_id,
            "orig_name": orig_name,
            "license": lic,
            "src_type": src_type,
            "src_url": src_url,
            "file_size": file_size,
        })

    print(f"[分组] 按 source/item 去重后 = {len(by_source):,} 条 release")

    # 3) 转换 + 准备 INSERT
    now = datetime.now(timezone.utc).isoformat()
    inserts = []
    for (src, item), files in by_source.items():
        # 取第一条 license 作为主 license
        lic = next((f["license"] for f in files if f["license"]), None)
        lic_enum = normalize_license(lic)
        # 代表性 file_id (取第一条)
        representative_file_id = files[0]["file_id"]
        # title + description
        title = f"{src} :: {item}"
        desc = make_description(representative_file_id, lic or "Unknown", src)
        inserts.append((
            representative_file_id,   # sourceFileId (D:\CodeBase\... 全路径)
            lic_enum,                  # license
            item,                      # originalAuthor (用 item_id 当 author 占位)
            src,                       # originalSource
            title,                     # title
            desc,                      # description
            representative_file_id,    # fileUrl (暂时同 sourceFileId, Phase 3 注入后再改)
            representative_file_id,    # originalFileUrl
            "Tier 3 (Basic)",          # tier (保守)
            "MONTHLY_16",              # requiredPlan (默认付费会员门控)
            0,                         # isFeatured
            0,                         # downloadCount
            0,                         # viewCount
            now,                       # publishedAt
            now,                       # createdAt
            now,                       # updatedAt
        ))

    if dry_run:
        print(f"[DRY-RUN] 待 INSERT {len(inserts):,} 行")
        for r in inserts[:3]:
            print("  sample:", r[:6])
        return 0

    # 4) 批量 INSERT
    try:
        cur = dev.executemany("""
            INSERT INTO OpenSourceRelease
                (id, sourceFileId, license, originalAuthor, originalSource,
                 title, description, fileUrl, originalFileUrl, tier,
                 requiredPlan, isFeatured, downloadCount, viewCount,
                 publishedAt, createdAt, updatedAt)
            VALUES (
                lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' ||
                lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' ||
                lower(hex(randomblob(6))),
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        """, [(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9],
              s[10], s[11], s[12], s[13], s[14], s[15]) for s in inserts])
        dev.commit()
        print(f"[入库] COMMIT OK, {cur.rowcount:,} 行")
    except sqlite3.Error as e:
        dev.rollback()
        print(f"[失败] ROLLBACK: {e}", file=sys.stderr)
        return 1
    finally:
        master.close()
        dev.close()

    # 5) 校验
    dev = sqlite3.connect(str(DEV_DB))
    n = dev.execute("select count(*) from OpenSourceRelease").fetchone()[0]
    print(f"[校验] OpenSourceRelease 行数 = {n:,}")
    by_lic = dev.execute("""
        select license, count(*) from OpenSourceRelease group by 1 order by 2 desc
    """).fetchall()
    print(f"[分布] by license:")
    for lic, cnt in by_lic:
        print(f"  {lic:<14} {cnt:>5,}")
    dev.close()
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()
    sys.exit(import_x_pool(limit=args.limit, dry_run=args.dry_run))