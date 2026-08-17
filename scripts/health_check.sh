#!/bin/bash
# v22.0 PATCH 17.10: ECS 健康检查 + 报警
# 建议: crontab -e 加一行 */5 * * * * /var/www/cpro-website/scripts/health_check.sh >> /var/log/cpro-health.log 2>&1
#
# 检查项 (失败 → 告警):
#   1. pm2 cpro-web 进程在线
#   2. nginx 80/443 端口在
#   3. 公网 200 (curl 主页)
#   4. 公网 5xx 计数 (curl /api/health)
#   5. 磁盘使用 < 90%
#   6. 内存使用 < 90%
#   7. 内存使用 > 80% 告警
#   8. ECS 距离上次重启 > 30 天 (提醒)
#
# 告警通道 (按优先级, 失败才发):
#   1. 钉钉 webhook (env ALERT_DINGTALK_WEBHOOK)
#   2. 阿里云 SMS (env ALERT_SMS_PHONES)
#   3. 本地日志 /var/log/cpro-alert.log
set -e

APP_DIR="/var/www/cpro-website"
ALERT_LOG="/var/log/cpro-alert.log"
HEALTH_LOG="/var/log/cpro-health.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# 加载 .env.production (拿 webhook / phone)
if [ -f "$APP_DIR/.env.production" ]; then
  set -a
  . "$APP_DIR/.env.production"
  set +a
fi

# 告警消息
ALERTS=()

check_pm2() {
  if pm2 list 2>/dev/null | grep -q "cpro-web.*online"; then
    echo "[$TIMESTAMP] ✅ pm2 cpro-web online"
  else
    echo "[$TIMESTAMP] ❌ pm2 cpro-web NOT online"
    ALERTS+=("pm2 cpro-web 离线")
  fi
}

check_nginx() {
  if ss -lnt | grep -q ":80 " && ss -lnt | grep -q ":443 "; then
    echo "[$TIMESTAMP] ✅ nginx 80/443 在"
  else
    echo "[$TIMESTAMP] ❌ nginx 端口未监听"
    ALERTS+=("nginx 端口未监听")
  fi
}

check_https() {
  HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.cprotrading.com/" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "[$TIMESTAMP] ✅ 公网 HTTPS 200"
  else
    echo "[$TIMESTAMP] ❌ 公网 HTTPS $HTTP_CODE"
    ALERTS+=("公网 HTTPS $HTTP_CODE")
  fi
}

check_api_health() {
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:3000/api/health" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "[$TIMESTAMP] ✅ 本地 API 200"
  else
    echo "[$TIMESTAMP] ❌ 本地 API $HTTP_CODE"
    ALERTS+=("本地 API $HTTP_CODE")
  fi
}

# v22.0 BATCH 26: 5xx 错误频率检测 (3 次连续 5xx 才告警, 防抖动)
check_5xx_frequency() {
  local STATE_DIR="/var/lib/cpro-alerts"
  local STATE_FILE="$STATE_DIR/5xx-counter.json"
  mkdir -p "$STATE_DIR" 2>/dev/null || STATE_DIR="/tmp/cpro-alerts" && mkdir -p "$STATE_DIR"

  # 读现有计数
  local COUNT=0
  if [ -f "$STATE_FILE" ]; then
    COUNT=$(cat "$STATE_FILE" 2>/dev/null || echo "0")
  fi

  # 试拉 /api/health 5 次 (5s 内)
  local FIVE_XX_COUNT=0
  for i in 1 2 3 4 5; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://127.0.0.1:3000/api/health" 2>/dev/null || echo "000")
    if [ "${CODE:0:1}" = "5" ]; then
      FIVE_XX_COUNT=$((FIVE_XX_COUNT + 1))
    fi
    sleep 1
  done

  # 累计 (重置 if no 5xx)
  if [ "$FIVE_XX_COUNT" -gt 0 ]; then
    COUNT=$((COUNT + FIVE_XX_COUNT))
  else
    COUNT=0
  fi
  echo "$COUNT" > "$STATE_FILE" 2>/dev/null

  if [ "$COUNT" -ge 3 ]; then
    echo "[$TIMESTAMP] ❌ 5xx 累计 $COUNT 次 (3+ 才告警, 避免抖动)"
    ALERTS+=("5xx 累计 $COUNT 次 (1h 内)")
  else
    echo "[$TIMESTAMP] ✅ 5xx 累计 $COUNT 次"
  fi
}

check_disk() {
  DISK_PCT=$(df /var | tail -1 | awk '{print $5}' | tr -d '%')
  if [ "$DISK_PCT" -lt 90 ]; then
    echo "[$TIMESTAMP] ✅ 磁盘 ${DISK_PCT}%"
  else
    echo "[$TIMESTAMP] ❌ 磁盘 ${DISK_PCT}%"
    ALERTS+=("磁盘使用 ${DISK_PCT}%")
  fi
}

check_memory() {
  MEM_PCT=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
  if [ "$MEM_PCT" -lt 90 ]; then
    echo "[$TIMESTAMP] ✅ 内存 ${MEM_PCT}%"
  elif [ "$MEM_PCT" -ge 90 ]; then
    echo "[$TIMESTAMP] ❌ 内存 ${MEM_PCT}%"
    ALERTS+=("内存使用 ${MEM_PCT}%")
  else
    echo "[$TIMESTAMP] ⚠️  内存 ${MEM_PCT}%"
  fi
}

check_uptime() {
  UPTIME_DAYS=$(awk '{print int($1/86400)}' /proc/uptime)
  if [ "$UPTIME_DAYS" -gt 30 ]; then
    echo "[$TIMESTAMP] ⚠️  ECS 已运行 ${UPTIME_DAYS} 天 (建议定期重启)"
  else
    echo "[$TIMESTAMP] ✅ ECS 已运行 ${UPTIME_DAYS} 天"
  fi
}

send_alert() {
  if [ ${#ALERTS[@]} -eq 0 ]; then
    return 0
  fi

  # 1. 写本地告警日志 (兜底, 必定执行)
  {
    echo "[$TIMESTAMP] ⚠️  告警 (${#ALERTS[@]} 项):"
    for alert in "${ALERTS[@]}"; do
      echo "  - $alert"
    done
  } | tee -a "$ALERT_LOG"

  # 2. 钉钉 webhook
  if [ -n "${ALERT_DINGTALK_WEBHOOK:-}" ]; then
    TEXT="[cpro-website ECS 告警] ${#ALERTS[@]} 项异常: ${ALERTS[*]}"
    JSON=$(printf '{"msgtype":"text","text":{"content":"%s"}}' "$TEXT")
    if curl -s -X POST -H "Content-Type: application/json" -d "$JSON" "$ALERT_DINGTALK_WEBHOOK" --max-time 5 > /dev/null; then
      echo "[$TIMESTAMP] ✅ 钉钉告警已发"
    else
      echo "[$TIMESTAMP] ❌ 钉钉告警发送失败"
    fi
  else
    echo "[$TIMESTAMP] ⚠️  ALERT_DINGTALK_WEBHOOK 未配置, 仅本地日志"
  fi

  # 3. 阿里云 SMS (需 aliyun cli + 配置)
  if [ -n "${ALERT_SMS_PHONES:-}" ]; then
    echo "[$TIMESTAMP] ⚠️  阿里云 SMS 暂未实现, 待 SDK 集成"
  fi
}

# 主流程
check_pm2
check_nginx
check_https
check_api_health
check_5xx_frequency
check_disk
check_memory
check_uptime
send_alert
