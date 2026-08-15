#!/bin/bash
# v22.0 PATCH 17.7: DB 自动备份 cron 包装脚本
# 建议: crontab -e 加一行 0 3 * * * /var/www/cpro-website/scripts/backup_cron.sh >> /var/log/cpro-backup.log 2>&1
set -e

# ECS 上的 cpro-website 路径
APP_DIR="/var/www/cpro-website"
BACKUP_LOG="/var/log/cpro-backup.log"

# cd 到 app 根 (确保 .env.production 被 Next.js 加载)
cd "$APP_DIR" || { echo "❌ cd $APP_DIR 失败"; exit 1; }

# 加载 .env.production (cron 环境无 env)
if [ -f "$APP_DIR/.env.production" ]; then
  set -a
  . "$APP_DIR/.env.production"
  set +a
fi

# 调 Python 备份
python3 "$APP_DIR/scripts/backup_db.py" 2>&1

# 备份完成记录
echo "--- backup cron end: $(date) ---" >> "$BACKUP_LOG" 2>/dev/null || true
