---
name: remotion-style-lib
description: Use the Remotion explainer-video style library (60 original looks in 12 categories: dark tech keynote, blueprint, chalkboard, editorial, ink wash, cel anime, isometric, documentary, neon tubes, satellite, watercolor, bauhaus, etc.) when the user asks to set or change the overall visual style of a video, pick a look by topic, produce videos in multiple looks, or create/save a custom look. One look per film; pairs with the motion library. Works with any coding agent; the library lives in the repository, this skill only points to it.
---

# Remotion Style Library (Claude Code 入口)

画风库本体**不在本目录**，而在仓库的 `style-lib/`。本 skill 只负责定位并交给它。

1. **定位库**：优先用当前工作区里含 `style-lib/AGENTS.md` 的目录，记为 `$LIB`。若工作区没有，运行 `sh "<skill base directory>/scripts/setup.sh"`：脚本会按常见位置查找并打印 `LIB=<path>`；找不到就提示用户把仓库克隆到工作区。
2. **跟随库**：读 `$LIB/AGENTS.md`，然后按 `styles/INDEX.md` → `styles/<slug>/STYLE.md` → `core/README.md` 的顺序工作。
3. **选 1 个**：按主题从 60 个画风里选 **1 个 slug**，写进配方卡，一整支片不换皮；用户没指定就自动定，不追问。
4. **落到项目**：把 `$LIB/core/StyleKit.tsx` + `$LIB/core/style-tokens.ts` 拷进用户的 `remotion-project/src/components/`；`<StyleStage slug="...">` 包住整片。
5. **接动作**：从相邻的 `motion-lib/INDEX.md` 挑主动作；取色走 `getStyle(slug).palette.accent`，**不改 `MotionKit.tsx`**；`delay` 一律 `at(i)`。
6. **交付前**：三帧抽查 + 全片只有一个 slug、开场与正片同画风、字幕条可读。

不给用户新增确认门。完整口播视频流水线（配音、对轴、分镜、渲染、G1/G2）在 `$LIB/../SKILL.md`，组合规范在 `$LIB/../references/14-style-library.md`。
