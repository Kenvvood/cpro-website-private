"""test_minimax_connection.py — 测试 MiniMax API 连通性

不读取/回显 Key 本身, 只检测 env 是否设置 + 1 次最小 API 调用验证
"""
import json
import os
import sys
from pathlib import Path

# 自动加载 cpro-website/.env (Next.js 标准做法)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=False)
        print(f"[dotenv] loaded from {env_path}")
except ImportError:
    print("[warn] python-dotenv not installed, using system env only")

import urllib.request
import urllib.error

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.minimax.chat/v1")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "MiniMax-Text-01")

print("=" * 60)
print("MiniMax API 连通性测试 (task-0046 验证)")
print("=" * 60)
print(f"OPENAI_API_KEY: {'已配置 (长度 ' + str(len(OPENAI_API_KEY)) + ')' if OPENAI_API_KEY else '❌ 未配置'}")
print(f"OPENAI_BASE_URL: {OPENAI_BASE_URL}")
print(f"OPENAI_MODEL: {OPENAI_MODEL}")
print()

if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY 未配置 — 请在 .env 设置")
    sys.exit(1)

# 1 次最小 API 调用 (1 token 输出, 验证连通)
url = OPENAI_BASE_URL.rstrip("/") + "/chat/completions"
body = json.dumps({
    "model": OPENAI_MODEL,
    "messages": [{"role": "user", "content": "ping"}],
    "max_tokens": 5,
    "temperature": 0,
}).encode("utf-8")
req = urllib.request.Request(url, data=body, method="POST")
req.add_header("Content-Type", "application/json")
# 使用真 Key 发送请求, 仅 print 时 MASK 显示
req.add_header("Authorization", f"Bearer {OPENAI_API_KEY}")

print(f"POST {url}")
print(f"Authorization: Bearer [MASKED] (实际 Key 发送, 不显示)")
print(f"Body: {body.decode()}")
print()

try:
    with urllib.request.urlopen(req, timeout=20) as r:
        resp = json.loads(r.read())
        reply = resp["choices"][0]["message"]["content"]
        model_used = resp.get("model", OPENAI_MODEL)
        tokens = resp.get("usage", {})
        print("✅ 连接成功")
        print(f"  响应 reply: {reply!r}")
        print(f"  实际 model: {model_used}")
        print(f"  tokens: {tokens}")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP {e.code}: {e.reason}")
    try:
        err_body = e.read().decode()
        print(f"  body: {err_body[:500]}")
    except: pass
    sys.exit(1)
except Exception as e:
    print(f"❌ 异常: {type(e).__name__}: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("✅ MiniMax API 可用. 立即跑 Top 10 重生成...")
print("=" * 60)