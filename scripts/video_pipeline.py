"""video_pipeline.py — 视频教程 PoC (task-0051, Phase 6.2 Week 2)

3 步流水线 (PM 拍板: 1 篇 PoC, 暂存本地):
  Step 1: render_tutorial  (Playwright 截图 /tutorials/[slug])
  Step 2: tts_voiceover    (edge-tts 中文配音, 免费)
  Step 3: merge_video      (imageio-ffmpeg 合成画面+音频)
输出: cpro-website/videos/<slug>.mp4

成本: 0 token (复用 OpenSourceTutorial.content) + 0 资金 (edge-tts/ffmpeg 全免费)
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import sqlite3
import subprocess
import sys
import time
from pathlib import Path

CODEBASE = Path(__file__).resolve().parents[1]
DB = CODEBASE / "prisma" / "dev.db"
VIDEOS_DIR = CODEBASE / "videos"
FRAMES_DIR = CODEBASE / "videos" / "_frames"
FFMPEG = None  # 动态加载

# === 选 1 篇作为 PoC (默认取第一篇已发布) ===
def pick_poc(limit: int = 1) -> list[dict]:
    db = sqlite3.connect(str(DB))
    rows = db.execute("""
        SELECT t.id, t.slug, r.title, t.marketRegime, t.riskLevel, t.content
        FROM OpenSourceTutorial t
        JOIN OpenSourceRelease r ON t.releaseId = r.id
        WHERE t.status='PUBLISHED'
        ORDER BY t.viewCount DESC, t.publishedAt DESC
        LIMIT ?
    """, (limit,)).fetchall()
    out = []
    for r in rows:
        out.append({"id": r[0], "slug": r[1], "title": r[2], "regime": r[3], "risk": r[4], "content": r[5]})
    return out


# === Step 1: 抽取文本 + 简化 (用于 TTS, 去掉 markdown 语法) ===
def extract_narration(content: str, max_chars: int = 1500) -> str:
    """从 Markdown 研报抽取适合 TTS 的纯文本 (前 max_chars 字)"""
    # 去 markdown 语法
    text = content
    # 去标题符号
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # 去表格分隔
    text = re.sub(r"^\|.*\|.*$", lambda m: " ".join(c.strip() for c in m.group().split("|") if c.strip() and "---" not in c), text, flags=re.MULTILINE)
    # 去链接
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    # 去强调符号
    text = re.sub(r"\*+", "", text)
    text = re.sub(r"`+", "", text)
    # 多余空行
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()[:max_chars]


# === Step 2: TTS 配音 (edge-tts) ===
async def tts_voiceover(text: str, out_mp3: Path) -> bool:
    import edge_tts
    VOICE = "zh-CN-XiaoxiaoNeural"  # 中文女声 (微软 Edge 免费)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(out_mp3))
    return out_mp3.exists() and out_mp3.stat().st_size > 0


# === Step 3: Playwright 渲染截图 ===
def render_screenshots(slug: str, out_dir: Path, port: int = 3300) -> list[Path]:
    """用 Playwright 渲染教程页 (静态 HTML + Python http.server)

    不依赖 Next.js dev/start server (太脆弱, 容易 404).
    改用方案: 渲染时生成临时静态 HTML, Python http.server 跑起来.
    """
    import http.server
    import socketserver
    import threading
    from playwright.sync_api import sync_playwright

    # 1. 读 DB 生成静态 HTML (title 在 OpenSourceRelease)
    db = sqlite3.connect(str(DB))
    row = db.execute("""
        SELECT r.title, t.content, t.marketRegime, t.riskLevel, t.maxDrawdownPct, t.author
        FROM OpenSourceTutorial t
        JOIN OpenSourceRelease r ON t.releaseId = r.id
        WHERE t.slug=?
    """, (slug,)).fetchone()
    db.close()
    if not row:
        raise ValueError(f"slug {slug} 不在 DB 中")
    title, content, regime, risk, mdd, author = row

    # 2. 写静态 HTML (复用 _styles from cpro-website globals.css)
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>{title} - CProTrading 投研</title>
<style>
body {{ font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  max-width: 800px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #ededed; line-height: 1.7; }}
h1 {{ font-size: 28px; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; color: #D4AF37; }}
h2 {{ font-size: 22px; margin-top: 32px; color: #D4AF37; border-left: 4px solid #D4AF37; padding-left: 12px; }}
h3 {{ font-size: 18px; margin-top: 24px; color: #ededed; }}
p {{ margin: 12px 0; line-height: 1.8; }}
table {{ border-collapse: collapse; width: 100%; margin: 16px 0; }}
th, td {{ border: 1px solid #333; padding: 8px 12px; text-align: left; }}
th {{ background: #1a1a1a; color: #D4AF37; }}
.badge {{ display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 13px; margin-right: 8px; }}
.badge-regime {{ background: #1a3a5e; color: #7ec0ff; }}
.badge-risk-low {{ background: #1a4a1a; color: #7fff7f; }}
.badge-risk-mid {{ background: #4a4a1a; color: #ffff7f; }}
.badge-risk-high {{ background: #4a1a1a; color: #ff7f7f; }}
.badge-mdd {{ background: #4a1a4a; color: #ff7fff; }}
.author {{ color: #888; font-size: 13px; margin-bottom: 16px; }}
.risk-block {{ background: #2a0a0a; border: 2px solid #ff4444; padding: 16px; margin: 16px 0; border-radius: 8px; }}
hr {{ border: 0; border-top: 1px solid #333; margin: 24px 0; }}
code {{ background: #1a1a1a; padding: 2px 6px; border-radius: 3px; font-family: monospace; }}
</style>
</head>
<body>
<div class="author">作者: <strong>{author}</strong> · 发布于 CProTrading 投研研报</div>
<div style="margin-bottom: 16px;">
  <span class="badge badge-regime">{regime}</span>
  <span class="badge badge-risk-{'low' if risk=='低' else 'mid' if risk=='中' else 'high'}">{risk}风险</span>
  {f'<span class="badge badge-mdd">最大回撤 {mdd}%</span>' if mdd else ''}
</div>
<div>{content}</div>
</body>
</html>"""
    html_path = out_dir / f"{slug}.html"
    html_path.parent.mkdir(parents=True, exist_ok=True)
    html_path.write_text(html, encoding="utf-8")
    print(f"  [render] 静态 HTML 已写 ({len(html)} bytes)")

    # 3. 启动 Python http.server
    handler_cls = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(*a, directory=str(out_dir), **kw)
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler_cls)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    print(f"  [render] http.server 启动 (port {port})")
    time.sleep(1)

    # 4. Playwright 截图
    out_dir.mkdir(parents=True, exist_ok=True)
    frames = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            url = f"http://127.0.0.1:{port}/{slug}.html"
            print(f"  [render] 打开 {url}")
            page.goto(url, wait_until="load", timeout=15000)
            time.sleep(1)
            # 顶部
            f0 = out_dir / f"{slug}_00.png"
            page.screenshot(path=str(f0))
            frames.append(f0)
            # 滚动截图
            for i in range(1, 9):
                page.evaluate(f"window.scrollTo(0, {i * 600})")
                time.sleep(0.5)
                fi = out_dir / f"{slug}_{i:02d}.png"
                page.screenshot(path=str(fi))
                frames.append(fi)
            browser.close()
    finally:
        httpd.shutdown()
    print(f"  [render] 截图完成: {len(frames)} 帧")
    return frames


# === Step 4: ffmpeg 合成 ===
def merge_video(frames: list[Path], audio: Path, out_mp4: Path, fps: float = 0.5) -> bool:
    """用 imageio-ffmpeg 合成 截图 (每帧 2s) + 音频"""
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    if not frames:
        print("  [merge] 无帧, 跳过")
        return False
    # 帧列表文件 (concat demuxer)
    list_file = out_mp4.parent / f"{out_mp4.stem}_frames.txt"
    with list_file.open("w", encoding="utf-8") as f:
        for fr in frames:
            # ffmpeg concat 需要 file 'path'
            f.write(f"file '{fr.resolve().as_posix()}'\n")
            f.write(f"duration 2\n")
        # 最后一帧要再写一次 (ffmpeg concat 要求)
        f.write(f"file '{frames[-1].resolve().as_posix()}'\n")

    # 合成命令
    cmd = [
        ffmpeg_exe, "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
    ]
    if audio.exists() and audio.stat().st_size > 0:
        cmd += ["-i", str(audio)]
    cmd += [
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-vf", "scale=1280:720",
        "-r", str(fps),
    ]
    if audio.exists() and audio.stat().st_size > 0:
        cmd += ["-c:a", "aac", "-b:a", "128k", "-shortest"]
    cmd += [str(out_mp4)]

    print(f"  [merge] ffmpeg 命令: {' '.join(cmd[-6:])}...")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if r.returncode != 0:
        print(f"  [merge] ffmpeg ERR: {r.stderr[-500:]}")
        return False
    list_file.unlink(missing_ok=True)
    print(f"  [merge] 视频完成: {out_mp4.name} ({out_mp4.stat().st_size // 1024} KB)")
    return True


# === 主调度 ===
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=1, help="生成视频数量 (默认 1 篇 PoC)")
    args = ap.parse_args()

    print("=" * 70)
    print(f"视频教程 PoC (task-0051) — 生成 {args.limit} 篇")
    print(f"输出目录: {VIDEOS_DIR}")
    print("=" * 70)

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    tutorials = pick_poc(args.limit)
    if not tutorials:
        print("❌ 没有可用的 tutorial")
        return
    print(f"选中 {len(tutorials)} 篇:")
    for t in tutorials:
        print(f"  - {t['slug']}: {t['title'][:50]}")

    for t in tutorials:
        slug = t["slug"]
        print(f"\n=== {slug} ===")
        out_mp4 = VIDEOS_DIR / f"{slug}.mp4"
        audio_mp3 = VIDEOS_DIR / f"{slug}_audio.mp3"
        frames_dir = VIDEOS_DIR / f"_frames_{slug}"
        # 1. 渲染截图
        frames = render_screenshots(slug, frames_dir)
        if not frames:
            print(f"  ❌ 渲染失败, 跳过 {slug}")
            continue
        # 2. TTS 配音
        narration = extract_narration(t["content"])
        print(f"  [tts] 文本长度 {len(narration)} 字, 配音中...")
        ok = asyncio.run(tts_voiceover(narration, audio_mp3))
        print(f"  [tts] {'✅' if ok else '❌'} {audio_mp3.name} ({audio_mp3.stat().st_size // 1024 if ok else 0} KB)")
        # 3. 合成
        merge_video(frames, audio_mp3, out_mp4)
        # 清理帧
        shutil.rmtree(frames_dir, ignore_errors=True)

    print(f"\n=== 战果 ===")
    print(f"输出目录: {VIDEOS_DIR}")
    for f in VIDEOS_DIR.glob("*.mp4"):
        print(f"  {f.name}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()