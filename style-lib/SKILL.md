---
name: remotion-style-lib
description: Remotion 讲解视频画风库（60 个原创画风，12 类，中英文触发词可查）。用户要给视频定整体视觉风格/画风、要换配色字体底板材质、要做多画风的讲解视频、要按主题挑一个画风、要改现有画风或从空白创建自己的画风时使用。与动效库正交：画风管整片长什么样，动效管元素怎么动。Agent 通用的 Markdown + TSX 库，不依赖特定工具；完整口播流水线在上一级 remotion-video-pipeline。
version: 1.0.0
---

# Remotion Style Library

画风库本体在仓库根目录（`AGENTS.md`、`styles/INDEX.md`、`core/`）。本 frontmatter 只供工具自动发现，Agent 读正文即可。

1. 先读同目录的 [`AGENTS.md`](AGENTS.md)：通用入口、不可协商规则、开工顺序。
2. 没挑画风就查 [`styles/INDEX.md`](styles/INDEX.md)：按主题与触发词从 60 个里选 **1 个**，一整支片只用这一个。
3. 已挑好就读 `styles/<slug>/STYLE.md`，按 [`core/README.md`](core/README.md) 把 `core/StyleKit.tsx` + `core/style-tokens.ts` 拷进项目 `src/components/`。
4. `<StyleStage slug="...">` 包住整片；取色 `getStyle(slug).palette.accent` 传给动效组件；`delay` 仍一律 `at(i)`。
5. 抽三帧验「起点前 1 帧底板已就位 / 起点后 2 帧色板字体生效 / 结果停稳帧不压字幕」。
6. 要改画风或新建自己的，走 `MY-STYLES.md`；成品存 `~/remotion-my-styles/<slug>/`。

画风与 `motion-lib/` 的 31 个动效**正交组合**，不要修改 `MotionKit.tsx` 源码。完整口播流水线见上一级 `../SKILL.md` 与 `../references/14-style-library.md`。本库不新增用户确认门。
