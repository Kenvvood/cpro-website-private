"""test_minimax_models.py — 探测 MiniMax coding plan 真实可用模型"""
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path, override=False)

API_KEY = os.environ.get("OPENAI_API_KEY", "")
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.minimax.chat/v1")

# 候选模型 (从 MiniMax 文档常见命名)
CANDIDATE_MODELS = [
    "MiniMax-Text-01",
    "MiniMax-M3",
    "MiniMax-Code",
    "MiniMax-Text-02",
    "abab6.5s-chat",
    "abab6.5-chat",
    "MiniMax-Text-01-240628",
]

if not API_KEY:
    print("❌ OPENAI_API_KEY 未配置")
    sys.exit(1)

print("=" * 70)
print("MiniMax 模型探测 (task-0046 验证)")
print("=" * 70)
print(f"Key 长度: {len(API_KEY)}")
print(f"Base URL: {BASE_URL}")
print()

# 也先尝试 /models 列表端点
print("--- 尝试 1: GET /models ---")
try:
    req = urllib.request.Request(BASE_URL.rstrip("/") + "/models")
    req.add_header("Authorization", f"Bearer {API_KEY}")
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
        models = data.get("data", [])
        print(f"✅ /models 返回 {len(models)} 个模型")
        for m in models[:20]:
            mid = m.get("id", "?")
            print(f"  - {mid}")
except urllib.error.HTTPError as e:
    print(f"❌ /models HTTP {e.code}: {e.reason}")
    try:
        print(f"  body: {e.read().decode()[:300]}")
    except: pass
except Exception as e:
    print(f"❌ /models 异常: {type(e).__name__}: {e}")
print()

# 然后逐个测试候选模型
print("--- 尝试 2: POST /chat/completions 候选模型 ---")
for model in CANDIDATE_MODELS:
    url = BASE_URL.rstrip("/") + "/chat/completions"
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 3,
        "temperature": 0,
    }).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {API_KEY}")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.loads(r.read())
            print(f"  ✅ {model:<30} OK")
    except urllib.error.HTTPError as e:
        try:
            err_body = json.loads(e.read().decode())
            err_msg = err_body.get("error", {}).get("message", str(e))
        except: err_msg = str(e)
        print(f"  ❌ {model:<30} HTTP {e.code}: {err_msg[:60]}")
    except Exception as e:
        print(f"  ❌ {model:<30} {type(e).__name__}: {str(e)[:50]}")