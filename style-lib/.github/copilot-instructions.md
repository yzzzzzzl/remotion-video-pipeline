# GitHub Copilot — Remotion Style Library

本项目是 Remotion 讲解视频画风库（60 个画风 / 12 类）。开始任何与整体视觉风格相关的任务前，先读仓库根目录的 `AGENTS.md`，再按需求查 `styles/INDEX.md`、对应 `styles/<slug>/STYLE.md` 与 `core/README.md`。

实施时遵守：

- **一整支片 1 个 slug**：`<StyleStage slug="...">` 的值在整片是常量，不要每页换皮；开场与正片同画风。
- **两层正交**：画风管色板/字体/底板/材质，动效管元素动作；用 `getStyle(slug).palette.accent` 把颜色传给 `MotionKit.tsx` 组件，**不要修改 MotionKit 源码**。
- `delay` 仍来自 `at(i)`，不写死秒数；画风不接管动画锚点。
- 禁用 `Math.random()`；底板全是静态 CSS 渐变；不新增 npm 包、不加载外部字体或图片。
- 字幕条用 `StyledCaption`，任何画风下都要可读；强调色只落最重要的元素。
- 选画风由 Agent 按主题自行决定，**不新增确认门**（G1/G2 仍是主流水线仅有的两道门）。
- 改 `scripts/styles.json` 后跑 `python scripts/build_styles.py` 重建卡片与索引，跑 `python scripts/validate_styles.py` 自检；不要手改 `styles/INDEX.md` 或 `core/style-tokens.ts`。
