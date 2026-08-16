"""
v22.0 PATCH 18.5 (v2 修复): 5 王牌商品 description 末尾加版权声明 + licenseFileUrl 链接

5 王牌商品 (PM 自家 v1, 走 Proprietary):
  cmssgzc340000fovgpjlmfy5b  黄金网格   Tier 1 (典藏级 VIP)
  cmssgzc5e0001fovg1rp6a68x  马丁加仓   Tier 2 (专业级 Pro)
  cmssgzc7e0002fovg8kzmj8mq  黄金套利   Tier 1 (典藏级 VIP)
  cmssgzc9r0003fovgnd7q8yqi  黄金剥头皮 Tier 2 (专业级 Pro)
  cmssgzce40004fovgb74wcdjm  黄金对冲   Tier 1 (典藏级 VIP)

注意: v2 改用 isFeatured=true 动态查 5 王牌, 不再硬编码 id 列表
       (种子 cuids 会变, isFeatured 才是稳定标识)

用法:
  python3 scripts/update_ace5_copyright.py                                  # 加版权 (URL 可空)
  python3 scripts/update_ace5_copyright.py --url-base https://...           # 自定义 License URL
  python3 scripts/update_ace5_copyright.py --rollback                       # 撤回
  python3 scripts/update_ace5_copyright.py --dry-run                        # 演练

前置:
  - schema.prisma 已含 license + licenseFileUrl 字段
  - 5 王牌 PDF (可选, --url-base 留空时 licenseFileUrl = null)
"""
import os
import sys
import sqlite3
import argparse
from pathlib import Path
from datetime import datetime

# cpro-website DB - 默认 ECS 路径, 本地测试可用环境变量覆盖
CPRO_DB = Path(os.environ.get("CPRO_DB_PATH", "/var/www/cpro-website/prisma/dev.db"))

COPYRIGHT_TEMPLATE = """

---

(c) 2026 CProTrading 城诺科技 保留所有权利
本策略为城诺科技定制开发, 仅授权购买用户使用, 禁止转售 / 反编译 / 公开分发
授权类型: Proprietary (专有授权)
License 文件: {url}
"""

COPYRIGHT_MARKER = "(c) 2026 CProTrading"


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def main():
    parser = argparse.ArgumentParser(description="5 王牌 description 加版权声明")
    parser.add_argument("--url-base", default=None,
                        help="License 文件 URL 前缀 (留空 = licenseFileUrl=null, 后续可补)")
    parser.add_argument("--rollback", action="store_true", help="撤回版权声明 (从 description 移除)")
    parser.add_argument("--dry-run", action="store_true", help="演练不 UPDATE")
    args = parser.parse_args()

    if not CPRO_DB.exists():
        log(f"[ERR] cpro-website DB 不存在: {CPRO_DB}")
        sys.exit(1)

    log(f"5 王牌模式: {'撤回' if args.rollback else '加版权'}")
    log(f"License URL 前缀: {args.url_base or '(空, 后续 PDF 补)'}")
    log(f"模式: {'演练' if args.dry_run else '正式 UPDATE'}")

    cpro = sqlite3.connect(str(CPRO_DB))

    # 动态查 5 王牌 (isFeatured=true)
    ace5 = cpro.execute(
        "SELECT id, name, tier FROM Product WHERE isFeatured = 1 ORDER BY id"
    ).fetchall()

    if not ace5:
        log("[WARN] 没有 isFeatured=true 的商品 (5 王牌)")
        log("       提示: 5 王牌在 seed_ace5.ts 注入时设 isFeatured=true")
        log("       本地 dev.db 可能没 seed, B+C 任务需在 ECS 跑 (那里有完整 11,293 商品)")
        return

    log(f"找到 5 王牌商品: {len(ace5)} 个")

    action = "撤回版权" if args.rollback else "加版权"

    for ace in ace5:
        prod_id, prod_name, tier = ace

        row = cpro.execute(
            "SELECT name, description, licenseFileUrl FROM Product WHERE id = ?",
            (prod_id,),
        ).fetchone()
        if not row:
            log(f"  [WARN] {prod_id} 不存在, 跳过")
            continue

        name, desc, old_url = row
        if not desc:
            desc = name

        if args.rollback:
            # 撤回: 移除版权声明段
            sep = f"\n\n---\n\n{COPYRIGHT_MARKER}"
            if sep in desc:
                new_desc = desc.split(sep)[0].rstrip()
            else:
                log(f"  [SKIP] {prod_name} 没版权, 跳过")
                continue
            new_url = None
        else:
            # 加版权: 移除旧版权, 加新版权 (幂等)
            sep = f"\n\n---\n\n{COPYRIGHT_MARKER}"
            if sep in desc:
                desc = desc.split(sep)[0].rstrip()

            # URL: 优先用 --url-base, 否则保持原值, 都没有则 null
            if args.url_base:
                new_url = f"{args.url_base}/{prod_id}.pdf"
            else:
                new_url = old_url  # 保持不变 (可能 PM 后补 PDF)

            # 强制 license = Proprietary
            if not args.dry_run:
                cpro.execute(
                    "UPDATE Product SET license = ? WHERE id = ?",
                    ("Proprietary", prod_id),
                )

            new_desc = desc + COPYRIGHT_TEMPLATE.format(url=new_url or "(待上传)")

        log(f"  [{action}] {prod_name:12s} ({tier})")
        log(f"    License URL: {new_url or '(空)'}")

        if not args.dry_run:
            cpro.execute(
                "UPDATE Product SET description = ?, licenseFileUrl = ? WHERE id = ?",
                (new_desc, new_url, prod_id),
            )

    if not args.dry_run:
        cpro.commit()
    cpro.close()

    log("")
    log("=== 总结 ===")
    log(f"  5 王牌 ({len(ace5)} 个) 已 {action} 完毕")

    if not args.rollback and not args.url_base:
        log("")
        log("[NOTE] licenseFileUrl 暂为 null (待 PM 上传 5 PDF 后跑 --url-base 补全):")
        log("  1. PM 上传 5 PDF 到 /var/www/cpro-website/public/licenses/")
        log("  2. 文件名: {prod_id}.pdf (例 mtt-ace-dca-gold-grid-v1.pdf)")
        log("  3. 跑: python3 scripts/update_ace5_copyright.py --url-base https://www.cprotrading.com/licenses")
        log("  4. 再次跑会更新 licenseFileUrl (不会重复加版权声明, 幂等)")


if __name__ == "__main__":
    main()
