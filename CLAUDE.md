# CLAUDE.md

本仓库是一套 **Remotion 口播讲解视频流水线**，不是 WorkBuddy 专属技能。

请先完整阅读并遵循 [`AGENTS.md`](AGENTS.md)，再按 [`SKILL.md`](SKILL.md) 的七阶段流程执行：

- `SKILL.md` 顶部的 YAML frontmatter 只供 WorkBuddy 自动发现，Claude Code 忽略即可，读正文。
- 核心主线在 `SKILL.md`；分阶段细节在 `references/`；可执行脚本在 `scripts/`；可复用 Remotion 组件与模板在 `assets/`。
- 默认横屏 **1920×1080 @30fps**，用户明确要竖屏才改 1080×1920。
- G1（选配音方式）与 G2（试听确认音轨）是两道阻塞门，必须停下等用户明确答复；G2 通过前不生成画面、不渲染 MP4。
