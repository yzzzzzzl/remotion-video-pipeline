# -*- coding: utf-8 -*-
"""Real-voice route step 2: merge recordings into voiceover.mp3 + build timeline.json.

Usage:
  python build_timeline.py --root <remotion-project> [--cut2-in 0.25]

Reads:  data/scenes.json + data/align_raw.json (from align_real_voice.py)
Writes: public/voiceover.mp3 + data/timeline.json

For 2 recordings: file1 is trimmed at align_raw.cut1, a GAP silence is
inserted, file2 offset = cut1 + gap. All file2 line times get + offset.
--cut2-in: seconds to trim from the head of file2 (speech lead-in to keep
minus actual silence; if file2 starts with long silence use
ffmpeg silenceremove to find it, pass the cut-in point here).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

FFMPEG = "ffmpeg"
FFPROBE = "ffprobe"


def dur(path):
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True)
    return float(out.stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    ap.add_argument("--cut2-in", type=float, default=0.0,
                    help="seconds to cut from head of file2 (0 = keep as is)")
    args = ap.parse_args()

    root = Path(args.root)
    raw = json.loads((root / "data" / "align_raw.json").read_text(encoding="utf-8"))
    scenes = json.loads((root / "data" / "scenes.json").read_text(encoding="utf-8"))
    lines = scenes["lines"]
    fps = scenes["fps"]

    files = [Path(f) for f in raw["files"]]
    cut1 = raw["cut1"]
    gap = raw["gap"]
    tail = raw["tail"]
    seg_dir = root / "public" / "audio_segments"
    seg_dir.mkdir(parents=True, exist_ok=True)

    b1, b2 = raw["b1"], raw["b2"]
    split = len(b1)

    # ---- build merged audio ----
    parts = []
    if len(files) == 2:
        assert cut1 is not None, "align_raw.json missing cut1 for 2-file mode"
        seg1 = seg_dir / "real_part1.mp3"
        subprocess.run([FFMPEG, "-y", "-i", str(files[0]), "-t", str(cut1),
                        "-c:a", "libmp3lame", "-b:a", "48k", str(seg1)], capture_output=True)
        sil = seg_dir / "sil_gap_real.mp3"
        subprocess.run([FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(gap), "-b:a", "48k", str(sil)], capture_output=True)
        seg2 = seg_dir / "real_part2.mp3"
        ci = args.cut2_in
        cmd = [FFMPEG, "-y", "-i", str(files[1])]
        if ci > 0:
            cmd += ["-ss", str(ci)]
        cmd += ["-c:a", "libmp3lame", "-b:a", "48k", str(seg2)]
        subprocess.run(cmd, capture_output=True)
        parts = [seg1, sil, seg2]
        offset2 = cut1 + gap
        # b2 times are local to (possibly trimmed) file2
        b2 = [[(a - ci if a is not None else None), b_ - ci if b_ is not None else None]
              for a, b_ in b2] if ci > 0 else b2
    else:
        seg1 = seg_dir / "real_part1.mp3"
        subprocess.run([FFMPEG, "-y", "-i", str(files[0]),
                        "-c:a", "libmp3lame", "-b:a", "48k", str(seg1)], capture_output=True)
        parts = [seg1]
        offset2 = 0.0

    lst = seg_dir / "real_concat.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    out_audio = root / "public" / "voiceover.mp3"
    r = subprocess.run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", "real_concat.txt",
                        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
                        str(out_audio)], capture_output=True, text=True, cwd=str(seg_dir))
    if r.returncode != 0:
        print(r.stderr[-600:])
        sys.exit(1)
    real_len = dur(out_audio)
    print(f"merged voiceover: {real_len:.2f}s")

    # ---- per-line absolute times ----
    starts, ends = [], []
    for i in range(len(lines)):
        if i < split:
            st, en = b1[i]
        else:
            st, en = b2[i - split]
            st, en = st + offset2, en + offset2
        starts.append(st)
        ends.append(en)

    # sanity: enforce monotonic
    for i in range(1, len(starts)):
        if starts[i] < starts[i - 1]:
            starts[i] = starts[i - 1] + 0.01
        if ends[i] < starts[i]:
            ends[i] = starts[i] + 0.2

    # ---- timeline lines: duration reaches next line start (minus 0.08) ----
    tl_lines = []
    total = real_len + tail
    for i, ln in enumerate(lines):
        if i + 1 < len(lines):
            d_end = starts[i + 1] - 0.08
        else:
            d_end = ends[i] + 1.0
        d_end = min(d_end, total - 0.1)
        dur_ = max(d_end - starts[i], 0.4)
        tl_lines.append({
            "idx": i, "text": ln["t"], "chapter": ln["c"],
            "start": round(starts[i], 3), "duration": round(dur_, 3),
            "startFrame": int(round(starts[i] * fps)),
            "durationFrames": int(round(dur_ * fps)),
        })

    chapters = []
    for ch in scenes["chapters"]:
        idxs = [i for i, l in enumerate(lines) if l["c"] == ch["id"]]
        if not idxs:
            continue
        s = starts[idxs[0]]
        e = ends[idxs[-1]] + 0.4
        chapters.append({
            "id": ch["id"], "title": ch["title"], "tag": ch["tag"],
            "start": round(s, 3), "end": round(e, 3),
            "startFrame": int(round(s * fps)),
            "endFrame": int(round(e * fps)),
        })

    timeline = {
        "fps": fps, "width": scenes["width"], "height": scenes["height"],
        "totalDuration": round(total, 3),
        "durationInFrames": int(round(total * fps)),
        "chapters": chapters, "lines": tl_lines,
    }
    (root / "data" / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"timeline: total {total:.1f}s / {timeline['durationInFrames']} frames")
    for c in chapters:
        print(f"  ch{c['id']} {c['title']}: {c['start']:.1f}s - {c['end']:.1f}s")
    print("QC: render stills at switch points, see references/06-qc-render.md")


if __name__ == "__main__":
    main()
