#!/bin/sh
# Locate the style library and report missing system tools. Read-only; never installs anything.
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# plugin/skills/remotion-style-lib/scripts -> style-lib
candidates="$here/../../../.."
candidates="$candidates $HOME/remotion-video-pipeline/style-lib"
candidates="$candidates $HOME/lemo-opuscar/../remotion-video-pipeline/style-lib"

LIB=""
for c in $candidates; do
  if [ -f "$c/AGENTS.md" ] && [ -f "$c/core/StyleKit.tsx" ]; then
    LIB=$(CDPATH= cd -- "$c" && pwd)
    break
  fi
done

if [ -z "$LIB" ]; then
  echo "STYLE LIB NOT FOUND. Clone remotion-video-pipeline into your workspace, or set LIB explicitly."
  exit 1
fi

echo "LIB=$LIB"
for tool in node python python3 ffmpeg; do
  if command -v "$tool" >/dev/null 2>&1; then
    echo "[OK] $tool"
  else
    echo "[MISS] $tool  (only needed by the full video pipeline, not by the library itself)"
  fi
done
echo "NEXT: read \"$LIB/AGENTS.md\" and \"$LIB/styles/INDEX.md\"."
echo "NOTE: one look per film; motions come from the sibling motion-lib/."
