"""redistribution_injector.py — Phase 3: 合规注入 (task-0037)

读 OpenSourceRelease.sourceFileId → 物理路径
注入: 1) 双署名 #property copyright  2) OnInit 启动弹窗  3) 中文 input 参数面板 (铁律 #286)
不动算法层. 产出写到 cpro_patched_redistribute/ 隔离目录.
"""
from __future__ import annotations

import argparse
import re
import sqlite3
import sys
from pathlib import Path

CODEBASE_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = CODEBASE_ROOT.parent
DEV_DB = CODEBASE_ROOT / "prisma" / "dev.db"
OUTPUT_DIR = CODEBASE_ROOT / "cpro_patched_redistribute"
SOURCE_DIR = PROJECT_ROOT / "source-collection" / "raw"

# 铁律 #286 标准 input 模板 (PM 7/30 拍板)
INPUT_STANDARDS = {
    "MA": "均线周期 (MA Period)",
    "FastMA": "快线周期 (Fast MA Period)",
    "SlowMA": "慢线周期 (Slow MA Period)",
    "BaseLot": "基础手数 (Base Lot Size)",
    "Lots": "交易手数 (Lots)",
    "Volume": "交易量 (Volume)",
    "StopLoss": "止损微点数 (Stop Loss, Points)",
    "TakeProfit": "止盈微点数 (Take Profit, Points)",
    "TrailingStop": "追踪止损微点数 (Trailing Stop, Points)",
    "Magic": "魔术号 (Magic Number)",
    "RSIPeriod": "RSI 周期 (RSI Period)",
    "MACDFast": "MACD 快线周期 (MACD Fast Period)",
    "MACDSlow": "MACD 慢线周期 (MACD Slow Period)",
    "MACDSignal": "MACD 信号线周期 (MACD Signal Period)",
    "ATRPeriod": "ATR 周期 (ATR Period)",
    "StartHour": "起始小时 (Start Hour)",
    "EndHour": "结束小时 (End Hour)",
    "RiskPercent": "风险百分比 (Risk Percent, %)",
}


def resolve_physical_path(stored_path: str) -> Path | None:
    """D:\\CodeBase\\source-collection\\raw\\<src>\\<rest> → 物理路径"""
    norm = stored_path.replace("\\", "/").replace("//", "/")
    marker = "source-collection/raw/"
    idx = norm.find(marker)
    if idx < 0:
        return None
    tail = norm[idx + len(marker):]
    src, _, rest = tail.partition("/")
    if not src or not rest:
        return None
    return SOURCE_DIR / src / rest


def detect_init_function(content: str, is_mql5: bool):
    """返回 (match_text, end_pos) 或 None"""
    if is_mql5:
        patterns = [
            "int OnInit() {",
            "void OnInit() {",
        ]
    else:
        patterns = [
            "int init() {",
            "void init() {",
        ]
    for pat in patterns:
        idx = content.find(pat)
        if idx >= 0:
            return (pat, idx + len(pat))
    return None


def chinese_input_annotate(content: str):
    """input/sinput/extern 后面加中文注释. 返回 (new_content, n_changes)."""
    line_pattern = re.compile(
        r"^(input|sinput|extern)\s+([\w<>\[\],\s]+?)\s+(\w+)\s*(=\s*[^;]+?)?\s*;\s*(//\s*(.*?))?\s*$",
        re.MULTILINE,
    )
    changes = 0

    def replace(m: re.Match) -> str:
        nonlocal changes
        kind = m.group(1)
        type_ = m.group(2).strip()
        name = m.group(3)
        default = (m.group(4) or "").strip()
        existing_comment = (m.group(6) or "").strip()
        has_cjk = any("\u4e00" <= c <= "\u9fff" for c in existing_comment)
        if has_cjk:
            return m.group(0)
        # 找标准模板
        new_comment = None
        for token, std in INPUT_STANDARDS.items():
            if token in name:
                new_comment = std
                break
        if new_comment is None:
            readable = name.replace("_", " ").replace("Inp", "").replace("Param", "")
            new_comment = readable if readable else name
            new_comment = f"{new_comment} ({name})"
        changes += 1
        return f"{kind} {type_} {name} {default}; // {new_comment}"

    new_content = line_pattern.sub(replace, content)
    return new_content, changes


def inject_to_file(src: Path, dst: Path, original_source: str, item_id: str, license_label: str):
    """单文件注入"""
    if not src.exists():
        return (False, f"源不存在: {src}")
    try:
        content = src.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return (False, f"读失败: {e}")

    is_mql5 = src.suffix.lower() == ".mq5"
    is_mq4 = src.suffix.lower() == ".mq4"
    is_mqh = src.suffix.lower() == ".mqh"
    new_content = content

    # 1) 三署名 (PM 7/30 拍板: 中性技术口吻, 不强调整理/原作/研发)
    #    原作者保留 (GPL §5a / Apache §4a / MIT 强制) + CProTrading 中性露出
    #    联系方式: WeChat Lookee333 (PM 拍板, 风险已书面告知)
    brand_signature = (
        '#property copyright "' + item_id + ' / CProTrading 城诺科技"\n'
        '#property link      "https://cprotrading.com"\n'
        '#property version   "1.00"'
    )
    new_content = re.sub(
        r'#property\s+copyright\s+"[^"]*"',
        brand_signature,
        new_content,
        count=1,
    )

    # 2) OnInit 弹窗 (仅 .mq4/.mq5) — PM 拍板的金融免责话术
    if is_mql5 or is_mq4:
        init_info = detect_init_function(new_content, is_mql5)
        if init_info:
            _, pos = init_info
            popup_msg = (
                "【CProTrading 城诺科技】严选量化指标\n"
                "⚠️ 免责声明：本程序仅供技术交流与数据回测，不构成任何投资建议。"
                "市场有风险，实盘交易盈亏自负，CProTrading 平台不承担任何直接或间接的资金损失责任。"
                " 联系方式：微信 Lookee333"
            )
            popup_code = (
                "\n   // CProTrading 城诺科技 注入\n"
                "   Alert(\"" + popup_msg + "\");\n"
            )
            new_content = new_content[:pos] + popup_code + new_content[pos:]

    # 3) 中文 input
    new_content, n_changes = chinese_input_annotate(new_content)

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(new_content, encoding="utf-8")
    return (True, f"OK (input 标准化 {n_changes} 处)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    dev = sqlite3.connect(str(DEV_DB))
    sql = "select id, sourceFileId, license, originalSource, originalAuthor from OpenSourceRelease"
    if args.limit:
        sql += f" limit {args.limit}"
    rows = dev.execute(sql).fetchall()
    dev.close()
    print(f"[扫描] OpenSourceRelease = {len(rows):,}")

    success = 0
    fail = 0
    for release_id, file_id, license_enum, original_source, item_id in rows:
        src = resolve_physical_path(file_id)
        if src is None:
            fail += 1
            continue
        dst = OUTPUT_DIR / src.relative_to(SOURCE_DIR)
        if args.dry_run:
            dst = None  # 不写
        ok, msg = inject_to_file(
            src, dst if dst else src,
            original_source=original_source,
            item_id=item_id,
            license_label=license_enum,
        )
        if ok:
            success += 1
            print(f"  OK {src.name}: {msg}")
        else:
            fail += 1
            print(f"  FAIL {src.name}: {msg}")

    print(f"\n=== 统计 ===")
    print(f"  成功: {success:,}")
    print(f"  失败: {fail:,}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())