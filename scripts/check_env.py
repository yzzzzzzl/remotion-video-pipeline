# -*- coding: utf-8 -*-
"""环境体检：只读检查，不改动任何环境。

用法:
    python scripts/check_env.py
    python scripts/check_env.py --remotion-dir "F:/AI相关/龙人/skill/remotion-codex-10s"

退出码: 0 = 必需依赖齐全; 1 = 有缺失
"""
import argparse
import importlib.metadata as md
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

OK, BAD, WARN = "[OK]  ", "[MISS]", "[WARN]"

# 常见安装位置兜底（Windows）
FFMPEG_CANDIDATES = [
    r"F:\ffmpeg\bin\ffmpeg.exe",
    r"C:\ffmpeg\bin\ffmpeg.exe",
    r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
]
CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]
REMOTION_CANDIDATES = [
    r"F:\AI相关\龙人\skill\remotion-codex-10s",
]

PY_PKGS = [
    ("edge-tts", "edge-tts", False, "TTS 配音路线"),
    ("faster-whisper", "faster-whisper", False, "真人录音对轴路线"),
    ("av", "av", False, "faster-whisper 的音视频解码依赖（必须 15.x）"),
]


def run(cmd):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        return (p.stdout or "") + (p.stderr or ""), p.returncode
    except Exception as e:  # noqa: BLE001
        return str(e), 1


def first_existing(paths):
    for p in paths:
        if Path(p).exists():
            return p
    return None


def check_node():
    exe = shutil.which("node")
    if not exe:
        # WorkBuddy 自带 node 兜底
        base = Path.home() / ".workbuddy" / "binaries" / "node" / "versions"
        if base.exists():
            for d in sorted(base.iterdir(), reverse=True):
                cand = d / "node.exe"
                if cand.exists():
                    exe = str(cand)
                    break
    if not exe:
        return False, "未找到 node", "winget install OpenJS.NodeJS.LTS"
    out, _ = run([exe, "--version"])
    m = re.search(r"v(\d+)\.", out)
    ver = m.group(1) if m else "?"
    if ver.isdigit() and int(ver) < 18:
        return False, f"node {out.strip()} 版本过低（需 >=18）", "升级 Node.js 到 18+（推荐 22+）"
    note = "自带全局 WebSocket，CDP 抓流无需 ws 包" if ver.isdigit() and int(ver) >= 22 else "需额外 npm i ws 供 capture_douyin.js 使用"
    return True, f"node {out.strip()}（{note}）", ""


def check_ffmpeg():
    exe = shutil.which("ffmpeg") or first_existing(FFMPEG_CANDIDATES)
    if not exe:
        return False, "未找到 ffmpeg", "winget install Gyan.FFmpeg，或解压到 F:\\ffmpeg\\bin\\"
    out, _ = run([exe, "-version"])
    line = out.splitlines()[0] if out else "ffmpeg"
    in_path = "（不在 PATH，脚本会用全路径兜底）" if not shutil.which("ffmpeg") else ""
    return True, f"{line[:60]}{in_path}", ""


def check_python():
    v = sys.version_info
    ok = v >= (3, 9)
    return ok, f"Python {v.major}.{v.minor}.{v.micro}（{sys.executable}）", "安装 Python 3.10+" if not ok else ""


def check_pkg(dist, mod, required, why):
    try:
        ver = md.version(dist)
    except md.PackageNotFoundError:
        try:
            __import__(mod)
            return True, f"{dist} 已导入（版本未知）", ""
        except Exception:  # noqa: BLE001
            return False, f"未安装（{why}）", f'python -m pip install "{dist}"'
    # av 版本红线
    if dist == "av":
        major = ver.split(".")[0]
        if major.isdigit() and int(major) != 15:
            return False, f"av {ver} 版本不兼容 faster-whisper（需 15.x）", 'python -m pip install "av==15.1.0"'
    return True, f"{dist} {ver}", ""


def check_chrome():
    exe = shutil.which("chrome") or first_existing(CHROME_CANDIDATES)
    if not exe:
        return False, "未找到 Chrome/Edge（CDP 抓流与渲染需要）", "安装 Chrome，或确认 Edge 路径"
    return True, f"{Path(exe).name} @ {Path(exe).parent}", ""


def check_remotion(remotion_dir):
    cands = ([remotion_dir] if remotion_dir else []) + REMOTION_CANDIDATES
    for p in cands:
        nm = Path(p) / "node_modules" / "remotion" / "package.json"
        if nm.exists():
            try:
                ver = json.loads(nm.read_text(encoding="utf-8")).get("version", "?")
            except Exception:  # noqa: BLE001
                ver = "?"
            return True, f"remotion {ver} @ {p}", ""
    return False, "未找到可复用的 Remotion 工程（node_modules/remotion）", "指定 --remotion-dir，或先在目标工程 npm install remotion @remotion/cli"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--remotion-dir", default="", help="已有 Remotion 工程路径（复用其 node_modules）")
    ap.add_argument("--mode", choices=["tts", "whisper", "both"], default="both",
                    help="G1 之前用 both 全查；G1 用户选完配音方式后，用 tts / whisper 复检对应路线")
    args = ap.parse_args()

    rows = []          # (ok, text, fix)
    rows.append(check_python())
    rows.append(check_node())
    rows.append(check_ffmpeg())
    rows.append(check_chrome())
    rows.append(check_remotion(args.remotion_dir))

    pkg_rows = []
    for dist, mod, required, why in PY_PKGS:
        if args.mode == "tts" and dist in ("faster-whisper", "av"):
            continue
        if args.mode == "whisper" and dist == "edge-tts":
            continue
        pkg_rows.append(check_pkg(dist, mod, required, why))
    rows.extend(pkg_rows)

    print("=" * 78)
    print("remotion-video-pipeline 环境体检（只读）")
    print("=" * 78)
    fixes = []
    for ok, text, fix in rows:
        print(f"{OK if ok else BAD} {text}")
        if not ok and fix:
            fixes.append(fix)

    hard_fail = [r for r in rows if not r[0]]
    print("-" * 78)
    if not hard_fail:
        print("全部就绪，可以进入阶段 1：有参考片走拆解（01），只给主题走推导（11-topic-only.md）。")
        return 0

    print(f"共 {len(hard_fail)} 项待处理，安装命令：")
    for i, f in enumerate(dict.fromkeys(fixes), 1):
        print(f"  {i}) {f}")
    print("\n说明：Python 包按 G1 选定的配音路线装其一即可 —— AI 配音只需 edge-tts；真人录音对轴需 faster-whisper + av==15.1.0。")
    print("      G1 之前用默认 both 全查；某条路线缺包不算阻塞，用户选完再装对应那组（见 references/09-interaction-gates.md）。")
    print("详细依赖矩阵见 references/00-dependencies.md")
    return 1


if __name__ == "__main__":
    sys.exit(main())
