"""
v22.0 PATCH 17.7: SQLite 数据库自动备份 + 阿里云 OSS 上传

用法:
  python scripts/backup_db.py                  # 备份 + 上传 OSS
  python scripts/backup_db.py --no-upload      # 只本地备份
  python scripts/backup_db.py --retention 7    # 保留本地 7 天 (默认 7)

环境变量 (.env.production):
  BACKUP_OSS_ACCESS_KEY_ID
  BACKUP_OSS_ACCESS_KEY_SECRET
  BACKUP_OSS_ENDPOINT (默认 oss-cn-guangzhou.aliyuncs.com)
  BACKUP_OSS_BUCKET (默认 cprotrading-backup)
  BACKUP_LOCAL_DIR (默认 /var/backups/cpro-website)
"""
import os
import sys
import shutil
import gzip
import argparse
import subprocess
import re
from pathlib import Path
from datetime import datetime, timedelta

# 数据库路径 (相对 cpro-website 根)
ROOT = Path(__file__).parent.parent
DB_PATH = ROOT / "prisma" / "dev.db"
BACKUP_DIR = Path(os.environ.get("BACKUP_LOCAL_DIR", "/var/backups/cpro-website"))


def _load_env_file(path: Path):
    """轻量 .env 加载 (避免 dotenv 依赖, 手动解析 KEY=VALUE, 引号 + 注释)"""
    if not path.exists():
        return
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        # 去引号
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        # 已有 env 不覆盖 (e.g. shell export)
        os.environ.setdefault(key, val)


# 启动时自动加载 .env.production (避免 PM 手动 set -a)
_load_env_file(ROOT / ".env.production")


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def check_oss_env() -> dict:
    """检查 OSS 必需环境变量, 返回 dict"""
    required = ["BACKUP_OSS_ACCESS_KEY_ID", "BACKUP_OSS_ACCESS_KEY_SECRET"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        log(f"⚠️  OSS env 缺失: {', '.join(missing)} → 仅本地备份")
        return {}
    return {
        "access_id": os.environ["BACKUP_OSS_ACCESS_KEY_ID"],
        "access_secret": os.environ["BACKUP_OSS_ACCESS_KEY_SECRET"],
        "endpoint": os.environ.get("BACKUP_OSS_ENDPOINT", "oss-cn-guangzhou.aliyuncs.com"),
        "bucket": os.environ.get("BACKUP_OSS_BUCKET", "cprotrading-backup"),
    }


def upload_to_oss(local_gz: Path, oss_key: str, cfg: dict) -> bool:
    """上传 .gz 到阿里云 OSS, 失败返回 False"""
    if not cfg:
        return False
    try:
        import oss2
    except ImportError:
        log("⚠️  oss2 未安装, 跳过 OSS 上传 (pip install oss2)")
        return False
    try:
        auth = oss2.Auth(cfg["access_id"], cfg["access_secret"])
        bucket = oss2.Bucket(auth, cfg["endpoint"], cfg["bucket"])
        result = bucket.put_object_from_file(oss_key, str(local_gz))
        if result.status == 200:
            log(f"✅ OSS 上传成功: oss://{cfg['bucket']}/{oss_key}")
            return True
        log(f"❌ OSS 上传失败: HTTP {result.status}")
        return False
    except Exception as e:
        log(f"❌ OSS 上传异常: {e}")
        return False


def cleanup_local(retention_days: int):
    """清理 N 天前的本地备份"""
    if not BACKUP_DIR.exists():
        return
    cutoff = datetime.now() - timedelta(days=retention_days)
    removed = 0
    for f in BACKUP_DIR.glob("dev_*.db.gz"):
        if f.stat().st_mtime < cutoff.timestamp():
            f.unlink()
            removed += 1
    if removed:
        log(f"🗑️  本地清理: 删除 {removed} 个超过 {retention_days} 天的备份")


def cleanup_oss(retention_days: int, cfg: dict):
    """清理 OSS 上 N 天前的备份"""
    if not cfg:
        return
    try:
        import oss2
    except ImportError:
        return
    try:
        auth = oss2.Auth(cfg["access_id"], cfg["access_secret"])
        bucket = oss2.Bucket(auth, cfg["endpoint"], cfg["bucket"])
        cutoff = datetime.now() - timedelta(days=retention_days)
        removed = 0
        for obj in oss2.ObjectIterator(bucket, prefix="db/"):
            # 兼容 oss2 不同版本: last_modified 可能是 int (Unix ts) / float / datetime
            lm = obj.last_modified
            if isinstance(lm, (int, float)):
                lm = datetime.fromtimestamp(lm)
            if lm < cutoff:
                bucket.delete_object(obj.key)
                removed += 1
        if removed:
            log(f"🗑️  OSS 清理: 删除 {removed} 个超过 {retention_days} 天的备份")
    except Exception as e:
        log(f"⚠️  OSS 清理失败: {e}")


def main():
    parser = argparse.ArgumentParser(description="cpro-website SQLite 自动备份")
    parser.add_argument("--no-upload", action="store_true", help="跳过 OSS 上传")
    parser.add_argument("--retention", type=int, default=7, help="本地保留天数 (默认 7)")
    parser.add_argument("--oss-retention", type=int, default=30, help="OSS 保留天数 (默认 30)")
    args = parser.parse_args()

    # 1. 检查 DB 存在
    if not DB_PATH.exists():
        log(f"❌ 数据库不存在: {DB_PATH}")
        sys.exit(1)

    # 2. 准备备份目录
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    # 3. 备份文件名
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    local_name = f"dev_{ts}.db"
    local_path = BACKUP_DIR / local_name
    gz_path = BACKUP_DIR / f"{local_name}.gz"

    # 4. 用 sqlite3 .backup 备份 (热备份, 不锁库)
    try:
        subprocess.run(
            ["sqlite3", str(DB_PATH), f".backup '{local_path}'"],
            check=True,
            capture_output=True,
        )
    except FileNotFoundError:
        log("⚠️  sqlite3 CLI 不存在, 改用 Python sqlite3 备份")
        import sqlite3
        src = sqlite3.connect(str(DB_PATH))
        dst = sqlite3.connect(str(local_path))
        with dst:
            src.backup(dst)
        dst.close()
        src.close()
    except subprocess.CalledProcessError as e:
        log(f"❌ sqlite3 backup 失败: {e.stderr.decode()}")
        sys.exit(1)

    log(f"✅ 本地备份: {local_path} ({local_path.stat().st_size} bytes)")

    # 5. 压缩
    with open(local_path, "rb") as f_in:
        with gzip.open(gz_path, "wb", compresslevel=6) as f_out:
            shutil.copyfileobj(f_in, f_out)
    local_path.unlink()
    log(f"✅ 压缩: {gz_path} ({gz_path.stat().st_size} bytes)")

    # 6. 上传 OSS
    if not args.no_upload:
        cfg = check_oss_env()
        if cfg:
            oss_key = f"db/{gz_path.name}"
            upload_to_oss(gz_path, oss_key, cfg)

    # 7. 清理
    cleanup_local(args.retention)
    if not args.no_upload:
        cfg = check_oss_env()
        cleanup_oss(args.oss_retention, cfg)

    log("🎉 备份完成")


if __name__ == "__main__":
    main()
