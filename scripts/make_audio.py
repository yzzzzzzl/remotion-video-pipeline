# -*- coding: utf-8 -*-
"""TTS route: per-line edge-tts -> measure -> concat -> timeline.json (zero-drift).

Usage:
  python make_audio.py --root <remotion-project> [--voice zh-CN-YunxiNeural] [--rate +12%]

Requires: python -m pip install edge-tts
Source data: <root>/data/scenes.json  (see references/02-script-and-lines.md)
Output: <root>/public/voiceover.mp3 + <root>/data/timeline.json + audio_check.json
"""
import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

FFPROBE = "ffprobe"   # adjust to F:/ffmpeg/bin/ffprobe.exe if not on PATH
FFMPEG = "ffmpeg"

LEAD_IN = 0.4     # silence before first line
PAD_LINE = 0.35   # gap between lines
PAD_CHAPTER = 0.9 # gap at chapter switch
TAIL = 1.6        # silence after last line


def ffprobe_duration(path) -> float:
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True)
    return float(out.stdout.strip())


async def tts_line(idx, text, voice, rate, audio_dir, sem):
    out = audio_dir / f"line_{idx:03d}.mp3"
    if out.exists() and out.stat().st_size > 0:
        return idx, out
    for attempt in range(3):
        try:
            async with sem:
                tts = edge_tts.Communicate(text, voice, rate=rate)
                await tts.save(str(out))
            return idx, out
        except Exception as e:
            print(f"line {idx} attempt {attempt+1} failed: {e}", flush=True)
            await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError(f"line {idx} failed after retries")


async def run(root: Path, voice: str, rate: str):
    audio_dir = root / "public" / "audio_segments"
    audio_dir.mkdir(parents=True, exist_ok=True)

    scenes = json.loads((root / "data" / "scenes.json").read_text(encoding="utf-8"))
    lines = scenes["lines"]
    fps = scenes["fps"]

    sem = asyncio.Semaphore(5)
    tasks = [tts_line(i, ln["t"], voice, rate, audio_dir, sem) for i, ln in enumerate(lines)]
    results = await asyncio.gather(*tasks)
    by_idx = {i: p for i, p in results}

    # ---- timeline ----
    t = LEAD_IN
    timeline_lines = []
    prev_ch = None
    for i, ln in enumerate(lines):
        dur = ffprobe_duration(by_idx[i])
        if prev_ch is not None:
            t += PAD_CHAPTER if ln["c"] != prev_ch else PAD_LINE
        prev_ch = ln["c"]
        start = t
        t += dur
        timeline_lines.append({
            "idx": i, "text": ln["t"], "chapter": ln["c"],
            "start": round(start, 3), "duration": round(dur, 3),
            "startFrame": int(round(start * fps)),
            "durationFrames": int(round(dur * fps)),
        })

    total = t + TAIL
    chapters = []
    for ch in scenes["chapters"]:
        ch_lines = [l for l in timeline_lines if l["chapter"] == ch["id"]]
        if not ch_lines:
            continue
        chapters.append({
            "id": ch["id"], "title": ch["title"], "tag": ch["tag"],
            "start": ch_lines[0]["start"],
            "end": ch_lines[-1]["start"] + ch_lines[-1]["duration"],
            "startFrame": ch_lines[0]["startFrame"],
            "endFrame": int(round((ch_lines[-1]["start"] + ch_lines[-1]["duration"]) * fps)),
        })

    timeline = {
        "fps": fps, "width": scenes["width"], "height": scenes["height"],
        "totalDuration": round(total, 3),
        "durationInFrames": int(round(total * fps)),
        "chapters": chapters, "lines": timeline_lines,
    }
    (root / "data" / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total duration: {total:.1f}s = {total/60:.1f} min, frames: {timeline['durationInFrames']}")

    # ---- concat audio (relative names + cwd = audio_dir, see gotchas) ----
    sil_lead = audio_dir / "sil_lead.mp3"
    sil_line = audio_dir / "sil_line.mp3"
    sil_ch = audio_dir / "sil_ch.mp3"
    for f, d in [(sil_lead, LEAD_IN), (sil_line, PAD_LINE), (sil_ch, PAD_CHAPTER)]:
        if not f.exists():
            subprocess.run([FFMPEG, "-y", "-f", "lavfi", "-i",
                            "anullsrc=r=24000:cl=mono", "-t", str(d), "-b:a", "48k",
                            str(f)], capture_output=True)
    tail_sil = audio_dir / "sil_tail.mp3"
    if not tail_sil.exists():
        subprocess.run([FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(TAIL), "-b:a", "48k", str(tail_sil)], capture_output=True)

    lst = audio_dir / "concat_list.txt"
    with open(lst, "w", encoding="utf-8") as f:
        f.write(f"file '{sil_lead.name}'\n")
        prev = None
        for i, ln in enumerate(lines):
            if prev is not None:
                f.write(f"file '{sil_ch.name if ln['c'] != prev else sil_line.name}'\n")
            prev = ln["c"]
            f.write(f"file 'line_{i:03d}.mp3'\n")
        f.write(f"file '{tail_sil.name}'\n")

    out_full = root / "public" / "voiceover.mp3"
    r = subprocess.run([FFMPEG, "-y", "-f", "concat", "-safe", "0",
                        "-i", "concat_list.txt", "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
                        str(out_full)], capture_output=True, text=True, cwd=str(audio_dir))
    if r.returncode != 0:
        print(r.stderr[-800:])
        sys.exit(1)
    real = ffprobe_duration(out_full)
    print(f"voiceover.mp3: {real:.1f}s (timeline said {total:.1f}s, drift {real-total:+.2f}s)")
    if abs(real - total) > 0.1:
        print("WARNING: drift > 0.1s -- check concat list / sample rates")
    (root / "data" / "audio_check.json").write_text(
        json.dumps({"realDuration": real, "timelineDuration": total,
                    "drift": round(real - total, 3)}), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="remotion project root")
    ap.add_argument("--voice", default="zh-CN-YunxiNeural",
                    help="edge-tts voice: Yunxi(年轻干脆) Yunjian(浑厚) Xiaoxiao(女声)")
    ap.add_argument("--rate", default="+12%", help="speaking rate, e.g. +12%%")
    args = ap.parse_args()
    asyncio.run(run(Path(args.root), args.voice, args.rate))


if __name__ == "__main__":
    main()
