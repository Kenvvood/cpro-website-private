"""
v22.0 PATCH 17.7: SQLite 数据库恢复 (从本地或 OSS 下载)

用法:
  python scripts/restore_db.py backups/dev_20260815_030000.db.gz
  python scripts/restore_db.py --from-oss dev_20260815_030000.db.gz
  python scripts/restore_db.py --list           # 列出所有可用备份
  python scripts/restore_db.py --list-oss       # 列出 OSS 备份

⚠️ 警告: 恢复会覆盖当前 dev.db, 自动备份当前库到 dev_pre_restore_<ts>.db
"""
import os
import sys
import shutil
import gzip
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
DB_PATH = ROOT / "prisma" / "dev.db"
BACKUP_DIR = Path(os.environ.get("BACKUP_LOCAL_DIR", "/var/backups/cpro-website"))


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def list_local():
    """列出本地备份"""
    if not BACKUP_DIR.exists():
        log("❌ 本地备份目录不存在")
        return
    files = sorted(BACKUP_DIR.glob("dev_*.db.gz"), key=lambda f: f.stat().st_mtime, reverse=True)
    if not files:
        log("❌ 本地无备份")
        return
    log(f"📦 本地备份 (新→旧):")
    for f in files:
        size = f.stat().st_size
        mtime = datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
        print(f"  {f.name}  {size:>10} bytes  {mtime}")


def list_oss(cfg: dict):
    """列出 OSS 备份"""
    try:
        import oss2
    except ImportError:
        log("❌ oss2 未安装 (pip install oss2)")
        return
    try:
        auth = oss2.Auth(cfg["access_id"], cfg["access_secret"])
        bucket = oss2.Bucket(auth, cfg["endpoint"], cfg["bucket"])
        log(f"☁️  OSS 备份 (oss://{cfg['bucket']}/db/):")
        objs = sorted(
            [o for o in oss2.ObjectIterator(bucket, prefix="db/")],
            key=lambda o: o.last_modified,
            reverse=True,
        )
        for o in objs:
            size = o.size
            mtime = o.last_modified.strftime("%Y-%m-%d %H:%M:%S")
            print(f"  {o.key.replace('db/', '')}  {size:>10} bytes  {mtime}")
    except Exception as e:
        log(f"❌ OSS 列表失败: {e}")


def download_from_oss(filename: str, cfg: dict) -> Path | None:
    """从 OSS 下载备份到本地"""
    try:
        import oss2
    except ImportError:
        log("❌ oss2 未安装")
        return None
    try:
        auth = oss2.Auth(cfg["access_id"], cfg["access_secret"])
        bucket = oss2.Bucket(auth, cfg["endpoint"], cfg["bucket"])
        local_gz = BACKUP_DIR / filename
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        bucket.get_object_to_file(f"db/{filename}", str(local_gz))
        log(f"✅ OSS 下载: {local_gz}")
        return local_gz
    except Exception as e:
        log(f"❌ OSS 下载失败: {e}")
        return None


def backup_current():
    """恢复前先备份当前库"""
    if not DB_PATH.exists():
        return
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    safety = ROOT / "prisma" / f"dev_pre_restore_{ts}.db"
    shutil.copy2(DB_PATH, safety)
    log(f"🛡️  当前库已备份: {safety}")


def restore_from_gz(gz_path: Path):
    """从 .gz 恢复覆盖 dev.db"""
    if not gz_path.exists():
        log(f"❌ 备份文件不存在: {gz_path}")
        sys.exit(1)

    backup_current()

    # 解压
    db_tmp = ROOT / "prisma" / f"dev_restore_tmp.db"
    with gzip.open(gz_path, "rb") as f_in:
        with open(db_tmp, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)

    # 替换
    shutil.move(str(db_tmp), str(DB_PATH))
    log(f"✅ 已恢复: {gz_path.name} → {DB_PATH}")
    log("⚠️  请重启 pm2 加载新库: pm2 restart cpro-web")


def main():
    parser = argparse.ArgumentParser(description="cpro-website SQLite 恢复")
    parser.add_argument("file", nargs="?", help="备份文件名 (本地 BACKUP_DIR 下 或 绝对路径)")
    parser.add_argument("--from-oss", metavar="FILE", help="从 OSS 下载指定备份")
    parser.add_argument("--list", action="store_true", help="列出本地备份")
    parser.add_argument("--list-oss", action="store_true", help="列出 OSS 备份")
    args = parser.parse_args()

    if args.list:
        list_local()
        return
    if args.list_oss:
        required = ["BACKUP_OSS_ACCESS_KEY_ID", "BACKUP_OSS_ACCESS_KEY_SECRET"]
        if not all(os.environ.get(k) for k in required):
            log("❌ OSS env 未配置")
            sys.exit(1)
        cfg = {
            "access_id": os.environ["BACKUP_OSS_ACCESS_KEY_ID"],
            "access_secret": os.environ["BACKUP_OSS_ACCESS_KEY_SECRET"],
            "endpoint": os.environ.get("BACKUP_OSS_ENDPOINT", "oss-cn-guangzhou.aliyuncs.com"),
            "bucket": os.environ.get("BACKUP_OSS_BUCKET", "cprotrading-backup"),
        }
        list_oss(cfg)
        return

    gz_path = None
    if args.from_oss:
        required = ["BACKUP_OSS_ACCESS_KEY_ID", "BACKUP_OSS_ACCESS_KEY_SECRET"]
        if not all(os.environ.get(k) for k in required):
            log("❌ OSS env 未配置")
            sys.exit(1)
        cfg = {
            "access_id": os.environ["BACKUP_OSS_ACCESS_KEY_ID"],
            "access_secret": os.environ["BACKUP_OSS_ACCESS_KEY_SECRET"],
            "endpoint": os.environ.get("BACKUP_OSS_ENDPOINT", "oss-cn-guangzhou.aliyuncs.com"),
            "bucket": os.environ.get("BACKUP_OSS_BUCKET", "cprotrading-backup"),
        }
        gz_path = download_from_oss(args.from_oss, cfg)
        if not gz_path:
            sys.exit(1)
    elif args.file:
        # 本地路径
        p = Path(args.file)
        if not p.is_absolute():
            p = BACKUP_DIR / p
        gz_path = p
    else:
        log("❌ 请指定备份文件或 --from-oss <name> 或 --list")
        sys.exit(1)

    if not gz_path or not gz_path.exists():
        log(f"❌ 备份文件不存在: {gz_path}")
        sys.exit(1)

    # 二次确认
    log(f"⚠️  即将恢复: {gz_path.name} → {DB_PATH}")
    log(f"⚠️  当前库会备份到 prisma/dev_pre_restore_<ts>.db")
    resp = input("确认恢复? 输入 yes 继续: ")
    if resp.strip().lower() != "yes":
        log("已取消")
        sys.exit(0)

    restore_from_gz(gz_path)


if __name__ == "__main__":
    main()
