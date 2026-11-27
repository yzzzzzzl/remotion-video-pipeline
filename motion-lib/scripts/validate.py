#!/usr/bin/env python3
"""Validate the motion library. Read-only; run from anywhere."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_library import load_custom, render_index, SOURCE, INDEX, EFFECTS  # noqa: E402

REQUIRED = {"slug", "en", "cn", "category", "source", "component", "triggers", "duration", "asset"}
CUSTOM_REQUIRED = {"slug", "en", "cn", "category", "component", "triggers", "duration_frames", "asset"}


def main() -> int:
    errors: list[str] = []
    effects = json.loads(SOURCE.read_text(encoding="utf-8"))
    kit = (ROOT / "core" / "MotionKit.tsx").read_text(encoding="utf-8")

    if "Math.random" in kit:
        errors.append("MotionKit.tsx contains Math.random()")
    exports = set(re.findall(r'"(\w+)"', kit.rsplit("MOTION_KIT_EXPORTS = [", 1)[-1].split("]", 1)[0]))

    seen: set[str] = set()
    for e in effects:
        slug = e.get("slug", "<no slug>")
        if slug in seen:
            errors.append(f"duplicate slug: {slug}")
        seen.add(slug)
        missing = REQUIRED - set(e)
        if missing:
            errors.append(f"{slug}: missing fields {sorted(missing)}")
            continue
        comp = e["component"]
        if comp not in exports:
            errors.append(f"{slug}: component {comp} not in MOTION_KIT_EXPORTS")
        folder = EFFECTS / slug
        for name in ("MOTION.md", "motion.json", "demo.tsx"):
            if not (folder / name).is_file():
                errors.append(f"{slug}: missing {name}")
        demo = folder / "demo.tsx"
        if demo.is_file() and comp not in demo.read_text(encoding="utf-8"):
            errors.append(f"{slug}: demo.tsx does not import/use {comp}")
        meta = folder / "motion.json"
        if meta.is_file():
            data = json.loads(meta.read_text(encoding="utf-8"))
            for key in ("slug", "en", "cn", "component"):
                if data.get(key) != e.get(key):
                    errors.append(f"{slug}: motion.json.{key} mismatch")
        card = folder / "MOTION.md"
        if card.is_file():
            text = card.read_text(encoding="utf-8")
            for section in ("## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6.", "## 7.", "## 8."):
                if section not in text:
                    errors.append(f"{slug}: MOTION.md missing {section}")

    custom = load_custom()
    for e, path in custom:
        if CUSTOM_REQUIRED - set(e):
            errors.append(f"custom {path}: missing fields {sorted(CUSTOM_REQUIRED - set(e))}")
        for name in ("MOTION.md", "motion.json"):
            if not (path / name).is_file():
                errors.append(f"custom {path}: missing {name}")

    expected = render_index(effects, custom)
    if not INDEX.is_file() or INDEX.read_text(encoding="utf-8") != expected:
        errors.append("INDEX.md is stale — run: python scripts/build_library.py")

    for name in ("AGENTS.md", "README.md", "MOTION-DIRECTOR.md", "MOTION-TECHNIQUE.md", "MY-MOTIONS.md", "core/README.md"):
        if not (ROOT / name).is_file():
            errors.append(f"missing guide: {name}")

    if errors:
        print(f"FAIL: {len(errors)} issue(s)")
        for err in errors[:60]:
            print(" -", err)
        return 1
    print(f"OK: {len(effects)} effects, {len(custom)} custom, {len(exports)} exports, index current, no Math.random")
    return 0


if __name__ == "__main__":
    sys.exit(main())
