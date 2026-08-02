"""test_minimax_real.py — 真实 LLM 调用验证 (检查响应内容)"""
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

# 用官方 /models 返回的真实模型名
MODEL = "MiniMax-M3"

print(f"Key 长度: {len(API_KEY)}, Base URL: {BASE_URL}, Model: {MODEL}")

url = BASE_URL.rstrip("/") + "/chat/completions"
body = json.dumps({
    "model": MODEL,
    "messages": [{"role": "user", "content": "回复一个字: OK"}],
    "max_tokens": 10,
    "temperature": 0,
}).encode()
req = urllib.request.Request(url, data=body, method="POST")
req.add_header("Content-Type", "application/json")
req.add_header("Authorization", f"Bearer {API_KEY}")

try:
    with urllib.request.urlopen(req, timeout=20) as r:
        raw = r.read()
        resp = json.loads(raw)
        print(f"HTTP {r.status}")
        print(f"full response: {json.dumps(resp, ensure_ascii=False)[:500]}")
        if "choices" in resp:
            reply = resp["choices"][0]["message"]["content"]
            print(f"✅ 实际回复: {reply!r}")
        elif "error" in resp:
            print(f"❌ error: {resp['error']}")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.reason}")
    try:
        print(f"body: {e.read().decode()[:500]}")
    except: pass
except Exception as e:
    print(f"异常: {type(e).__name__}: {e}")