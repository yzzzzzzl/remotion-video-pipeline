# -*- coding: utf-8 -*-
"""Real-voice route step 1: word-level ASR alignment of user recordings to script lines.

Usage:
  python align_real_voice.py --root <remotion-project> \
      --files "F:/.../part1.mp3" "F:/.../part2.mp3" \
      --line-split 46            # 0-based: file2 starts at line index 46
  # single file: --files "F:/.../voice.mp3" (no --line-split)

Requires:
  python -m pip install faster-whisper "av==15.1.0"
  set HF_ENDPOINT=https://hf-mirror.com     (model download mirror)

Output: <root>/data/align_raw.json  (cut points + per-line bounds)

Algorithm: greedy two-pointer char alignment between ASR char stream
(derived from whisper word timestamps) and the normalized script text.
Accepts ASR hallucinations (look-ahead <= 8 chars) and ASR drops
(skip a script char). Match rate below 85% => stop and inspect audio.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from faster_whisper import WhisperModel

FFMPEG = "ffmpeg"
MODEL = "small"          # medium gets OOM-killed on 16GB machines
CUT1_PAD = 0.25          # keep this much after the split-line end in file1
GAP = 0.7                # silence inserted between recordings
LEAD2 = 0.25             # keep this much before first speech in file2+
TAIL = 1.6
MIN_MATCH_RATE = 0.85


def norm(s: str) -> str:
    return re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]", "", s)


def preprocess(path: str, out: str):
    """Denoise + downsample for better ASR. Returns out path."""
    subprocess.run([FFMPEG, "-y", "-i", path, "-af",
                    "highpass=f=80,afftdn=nf=-25,lowpass=f=7500",
                    "-ar", "16000", "-ac", "1", out], capture_output=True)
    return out


def transcribe_words(model, path):
    segments, _ = model.transcribe(path, language="zh", word_timestamps=True,
                                   vad_filter=False, beam_size=5)
    words = []
    for seg in segments:
        for w in (seg.words or []):
            t = norm(w.word)
            if t:
                words.append({"chars": list(t), "start": w.start, "end": w.end})
    return words


def char_stream(words):
    out = []
    for w in words:
        for ch in w["chars"]:
            out.append({"ch": ch, "start": w["start"], "end": w["end"]})
    return out


def align(chars, script_norm):
    """Greedy two-pointer alignment. Returns list len(script_norm) of (start,end) or None."""
    res = [None] * len(script_norm)
    j = 0
    i = 0
    N, M = len(script_norm), len(chars)
    misses = 0
    while i < N:
        sc = script_norm[i]
        if j < M and chars[j]["ch"] == sc:
            res[i] = (chars[j]["start"], chars[j]["end"])
            i += 1
            j += 1
            continue
        found = None
        for k in range(j + 1, min(j + 9, M)):
            if chars[k]["ch"] == sc:
                found = k
                break
        if found is not None:
            j = found
            continue
        misses += 1
        i += 1
    matched = sum(1 for r in res if r)
    print(f"  aligned {matched}/{N} chars ({misses} skipped)")
    return res, matched / N


def fill_neighbors(times):
    last = None
    for i, t in enumerate(times):
        if t is not None:
            last = t
        elif last is not None:
            times[i] = last
    nxt = None
    for i in range(len(times) - 1, -1, -1):
        if times[i] is not None:
            nxt = times[i]
        elif nxt is not None:
            times[i] = nxt
    return times


def line_bounds(sn, times, lines_slice):
    bounds = []
    pos = 0
    for l in lines_slice:
        n = len(norm(l["t"]))
        seg = [t for t in times[pos:pos + n] if t is not None]
        bounds.append((seg[0][0], seg[-1][1]) if seg else None)
        pos += n
    return bounds


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    ap.add_argument("--files", nargs="+", required=True, help="1 or 2 recording files, in order")
    ap.add_argument("--line-split", type=int, default=None,
                    help="0-based line index where file 2 starts (required if 2 files)")
    ap.add_argument("--tmpdir", default=None)
    args = ap.parse_args()

    root = Path(args.root)
    tmp = Path(args.tmpdir) if args.tmpdir else root / "data"
    tmp.mkdir(parents=True, exist_ok=True)

    files = [Path(f) for f in args.files]
    if len(files) == 2 and args.line_split is None:
        print("FATAL: --line-split required when passing 2 files"); sys.exit(1)
    if len(files) > 2:
        print("FATAL: this script supports up to 2 files; concat extras manually first"); sys.exit(1)

    scenes = json.loads((root / "data" / "scenes.json").read_text(encoding="utf-8"))
    lines = scenes["lines"]
    fps = scenes["fps"]
    split = args.line_split if args.line_split is not None else len(lines)

    model = WhisperModel(MODEL, device="cpu", compute_type="int8")

    script1 = "".join(l["t"] for l in lines[:split])
    script2 = "".join(l["t"] for l in lines[split:])
    sn1, sn2 = norm(script1), norm(script2)
    print(f"script part1: {len(sn1)} chars, part2: {len(sn2)} chars")

    def do_align(f, sn, tag):
        clean = preprocess(str(f), str(tmp / f"_clean_{tag}.wav"))
        print(f"transcribing {f.name}...")
        cs = char_stream(transcribe_words(model, clean))
        print(f"  whisper chars: {len(cs)}")
        res, rate = align(cs, sn)
        if rate < MIN_MATCH_RATE:
            print(f"FATAL: match rate {rate:.0%} < {MIN_MATCH_RATE:.0%}. "
                  "Check: recording covers script? audio quality? try denoise params.")
            sys.exit(1)
        return fill_neighbors(res)

    t1 = do_align(files[0], sn1, "1")
    b1 = line_bounds(sn1, t1, lines[:split])

    if len(files) == 1:
        cut1 = None
        b2 = []
    else:
        t2 = do_align(files[1], sn2, "2")
        b2 = line_bounds(sn2, t2, lines[split:])
        end_split = b1[split - 1][1] if b1[split - 1] else None
        if end_split is None:
            print("FATAL: cannot find end of split line in file1"); sys.exit(1)
        cut1 = round(end_split + CUT1_PAD, 3)
        first2 = b2[0][0] if b2 and b2[0] else 0.0
        print(f"file1 trim at {cut1:.2f}s; file2 speech starts {first2:.2f}s")

    out = {
        "files": [str(f) for f in files],
        "cut1": cut1,
        "cut2_in": None,   # filled by build_timeline via ffmpeg silenceremove, or manually
        "gap": GAP, "tail": TAIL, "fps": fps,
        "b1": [[round(a, 3), round(b_, 3)] if b_ else None for a, b_ in b1],
        "b2": [[round(a, 3), round(b_, 3)] if b_ else None for a, b_ in b2],
        "line_texts": [l["t"] for l in lines],
        "line_chapters": [l["c"] for l in lines],
    }
    (root / "data" / "align_raw.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("saved data/align_raw.json -> next: build_timeline.py")


if __name__ == "__main__":
    main()
