---
name: remotion-motion-lib
description: Use the Remotion explainer-video motion library (31 effects: stagger reveal, sweep highlight, leader line, flow dots, scan zones, typewriter, number roll, parallel merge, HUD, code rain, etc.) when the user asks to add animation to a Remotion video, choose a motion effect for a narration line, reuse an existing effect, or create/save a custom effect. Works with any coding agent; the library lives in the repository, this skill only points to it.
---

# Remotion Motion Library (Claude Code 入口)

动效库本体**不在本目录**，而在仓库的 `motion-lib/`。本 skill 只负责定位并交给它。

1. **定位库**：优先用当前工作区里含 `motion-lib/AGENTS.md` 的目录，记为 `$LIB`。若工作区没有，运行 `sh "<skill base directory>/scripts/setup.sh"`：脚本会按常见位置查找并打印 `LIB=<path>`；找不到就提示用户把仓库克隆到工作区。
2. **跟随库**：读 `$LIB/AGENTS.md`，然后按 `INDEX.md` → `effects/<slug>/MOTION.md` → `core/README.md` 的顺序工作。
3. **落到项目**：把 `$LIB/core/MotionKit.tsx` 拷进用户的 `remotion-project/src/components/`；`delay` 一律来自 `at(i)`，不新增 npm 依赖。
4. **交付前**：三帧抽查（起点前 1 帧 / 起点后 2 帧 / 停稳帧）；装饰类另查 frame 450 后无残留。

不给用户新增确认门。完整口播视频流水线（配音、对轴、分镜、渲染、G1/G2）在 `$LIB/../SKILL.md`。
