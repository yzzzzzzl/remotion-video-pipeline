# GitHub Copilot — Remotion Motion Library

本项目是 Remotion 讲解视频动效库。开始任何与动效相关的任务前，先读仓库根目录的 `AGENTS.md`，再按需求查 `INDEX.md`、对应 `effects/<slug>/MOTION.md` 与 `core/README.md`。

实施时遵守：

- `delay` 来自 `at(i)`，不写死秒数；`t = local - delay < 0` 保持未触发态。
- 禁用 `Math.random()`；用 `sin(local/k + i*phase)` / `floor(local/n)` 确定性派生。
- 元素进场而非整页；一屏文字块 ≤3~4；完整句子只进字幕条。
- 只依赖 Remotion 内置 API + 原生 CSS / SVG，不新增 npm 包。
- 结果停稳 ≥1s 且留一个永动小元素；H 组装饰特效 frame 450 后无残留。
- 改 `effects.json` 后跑 `python scripts/build_library.py` 重建卡片与索引，不要手改 `INDEX.md`。
