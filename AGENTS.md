# AGENTS.md — 通用 Agent 使用说明

本仓库是一套 **Remotion 口播讲解视频流水线**。它最初按 WorkBuddy Skill 格式打包，但内容不绑定 WorkBuddy：任何能读写文件、执行命令的 Agent（Claude Code / Codex / Cursor 等）都可以按本文件执行，人工也可以照着做。

## 先读什么

1. **`SKILL.md`** —— 主流程：七阶段、两道确认门、画面四条铁律、开头 15 秒规范。它顶部的 YAML frontmatter 只供 WorkBuddy 自动发现，其他 Agent 忽略即可，正文是通用 SOP。
2. 按任务需要再读 `references/`：

| 需要做什么 | 读哪份 |
|---|---|
| 拆参考视频（有链接/原片） | `01-reference-teardown.md` |
| 只给主题/文章推导配方卡 | `11-topic-only.md` |
| 写口播稿、拆句 | `02-script-and-lines.md` |
| 配音、真人录音逐字对轴 | `03-audio-timeline.md` |
| 分镜设计 | `04-shot-design.md` |
| 视觉体系与画幅安全区 | `05-visual-system.md` |
| 抽帧质检、渲染 | `06-qc-render.md` |
| 环境依赖与版本红线 | `00-dependencies.md` |
| Windows / 工具平台坑 | `07-gotchas.md` |
| 开头 15 秒黄金窗口 | `10-first-15s.md` |
| 画面四条铁律的判据 | `08-screen-rules.md` |
| G1 / G2 交互门协议 | `09-interaction-gates.md` |
| 外部素材检索与版权 | `12-asset-sourcing.md` |
| 讲解型动效库（21 个模式） | `13-motion-library.md` |

## 默认规格

- **画幅**：1920×1080 @30fps 横屏；用户明确要求抖音/小红书竖屏时才改 1080×1920，换算见 `10-first-15s.md` §10。
- **产物**：`voiceover.mp3` + `timeline.json` + Remotion 工程 + MP4。
- **时间基准**：字幕是唯一基准，所有时间点从 `timeline.json` 查，禁止估秒数。
- **主音轨**：`voiceover.mp3` 唯一；素材音效压 0.2~0.4，不能盖过口播。

## 必须遵守（不可协商）

- **只有两道阻塞门**：G1 交付口播稿并让用户选「自己录 / AI 配音」；G2 交付音轨试听并拿到明确确认。**G2 通过前不得生成任何画面或渲染 MP4**。沉默或「你看着办」不算通过。
- **只打断两次**：画风、特效、切几页、时长、配色等规格用默认值兜底，不额外追问。素材检索随配方卡软交付，**不是第三道门**。
- **画面四条铁律**：进场单位是元素不是整页；主画面只放关键词，完整句子只进字幕条；动画锚点绑台词行索引 `at(i)`；静态元素停留 >3s 必须挂运动。
- **开头 15 秒**：≥6 个镜头页、单页 ≤2.5s、首屏 ≤1.5s、frame 0 就在动；特效确定性，禁用 `Math.random()`；HUD 只在开场、450 帧后必须消失。
- **先定版再动画**：新页面先渲静帧看排版，不溢出再上动效，别直接全片渲染试错。

## 可直接用的工具与资产

- `scripts/check_env.py`：环境体检（只读，输出缺失项安装命令）
- `scripts/make_audio.py` / `align_real_voice.py` / `build_timeline.py`：AI 配音、真人录音逐字对轴、时间轴生成
- `scripts/capture_douyin.js`：无头 Chrome + CDP 截获抖音媒体流（模式 A 用）
- `assets/components/`：`Chrome.tsx`（画幅自适应底座）、`ShotEngine.tsx`（镜头页引擎）、`Opening.tech.tsx`（已验证横屏开场）、`Motion.primitives.tsx`（讲解型动效原语）
- `assets/templates/`：`Video.tsx` / `Root.tsx` / `scenes.json` 模板

## 工作目录约定

```text
<workdir>/
├── source/            原片、用户录音（只给主题时可为空）
├── frames/            参考片抽帧（只给主题时可为空）
├── analysis/          口播稿各版本 + 配方卡
├── output/            成片 MP4（文件名带版本后缀）
└── remotion-project/
    ├── data/scenes.json
    ├── data/timeline.json
    ├── public/voiceover.mp3
    ├── public/assets/
    └── src/
```

完整结构说明见 `SKILL.md`「工程结构」。

## WorkBuddy 用户

把本目录放到 `~/.workbuddy/skills/remotion-video-pipeline`（全局）或 `<项目>/.workbuddy/skills/remotion-video-pipeline`（项目级），即可被自动发现与触发。其他 Agent 不需要这一步。
