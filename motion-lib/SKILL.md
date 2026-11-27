---
name: remotion-motion-lib
description: Remotion 讲解视频动效库（31 个可复用动效，中英文触发词可查）。用户要做带动画的知识讲解/教程/口播视频、要给视频加开场特效或正片语义动作（逐项进场、走线、扫描、打字机、数字滚动、分路合流、结果停稳、HUD、代码雨等）、要挑一个动效并把它套到 Remotion 场景里、要改现有动效或从空白创建自己的动效时使用。这是 agent 通用的 Markdown + TSX 库，不依赖特定工具；完整口播流水线在上一级 remotion-video-pipeline。
version: 1.0.0
---

# Remotion Motion Library

动效库本体在仓库根目录（`AGENTS.md`、`INDEX.md`、`effects/`、`core/`）。本 frontmatter 只供工具自动发现，Agent 读正文即可。

1. 先读同目录的 [`AGENTS.md`](AGENTS.md)：通用入口、不可协商规则、开工顺序。
2. 没挑动效就查 [`INDEX.md`](INDEX.md)：按讲解目的与台词触发词挑，每章一个主动作。
3. 已挑好就读 `effects/<slug>/MOTION.md`，按 `core/README.md` 把 `core/MotionKit.tsx` 拷进项目 `src/components/`。
4. `delay` 一律传 `at(i)`；抽帧验「起点前 1 帧未出现 / 起点后 2 帧正进场 / 结果停稳帧」。
5. 要改库效果或新建自己的，走 `MY-MOTIONS.md`；成品存 `~/remotion-my-motions/<slug>/`。

完整口播视频流水线（配音、对轴、分镜、渲染、两道确认门）见上一级 `../SKILL.md`。本库不新增用户确认门。
