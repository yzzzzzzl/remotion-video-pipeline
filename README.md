# remotion-video-pipeline

一套可复用的 **Remotion 口播讲解视频流水线**：把主题、文章、要点或参考视频，变成带逐字字幕、分镜动画、配音和成片 MP4 的完整流程。

它最初按 WorkBuddy Skill 格式打包，但**内容不绑定 WorkBuddy**：`SKILL.md` 顶部的 frontmatter 只用于 WorkBuddy 自动发现，正文以及 `references/`、`scripts/`、`assets/` 对 Claude Code、Codex、Cursor 等任何能读写文件并执行终端命令的 Agent 都适用，人工照着做也可以。

把「一段要讲的内容」变成一条**能被看完**的讲解动画：字幕是唯一时间基准，画面跟着语义翻页，观点页与解释页交替出现。**默认横屏 1920×1080 @30fps**；用户明确要求抖音/小红书竖屏时才覆盖为 1080×1920（坐标换算见 `references/10-first-15s.md` §10）。

## 它能做什么

- **两种起步方式**：给参考视频链接/本地原片做拆解；或只给主题、文章、要点直接推导配方卡。
- **音画对轴**：原创口播稿 → 拆句 → AI 配音或真人录音 → 逐字时间戳对齐 → `timeline.json`。
- **不无聊的画面**：开头 15 秒帧级快切，正片观点页 ↔ 解释页交替，每页只放关键词。
- **外部素材规范**：代码画不出的真实物件/场景允许主动检索可商用素材，含版权判定、统一画风与落地引用规则。
- **讲解型动效库**：21 个语义动作模式 + 可复用的 Remotion 组件原语，做到「讲到什么就演什么」。
- **质检与渲染**：先静帧检查排版，再抽帧验动效，最后输出 MP4。

流程中只有两道阻塞门：G1 交付口播稿并让用户选配音方式；G2 交付音轨试听并拿到明确确认。**G2 通过前不生成画面、不渲染成片**。其余规格用默认值兜底，不反复追问。

## 在不同环境中使用

### WorkBuddy（自动触发）

把整个目录放到 skills 目录：

- 全局可用：`~/.workbuddy/skills/remotion-video-pipeline`
- 仅当前项目可用：`<项目>/.workbuddy/skills/remotion-video-pipeline`

重启会话后即可在对话里说「用 remotion-video-pipeline 这条 skill……」。

### Claude Code / Codex / Cursor 等 Agent

仓库根目录提供了两个通用入口：

- `AGENTS.md`：完整通用指令，告诉 Agent 先读什么、默认规格、两道门与四条铁律
- `CLAUDE.md`：Claude Code 的简短入口，指向 `AGENTS.md` 与 `SKILL.md`

把本仓库作为工作目录，或把这两个文件复制到你的项目根目录，Agent 会读取它们并顺着找到 `SKILL.md`。如果 Agent 没自动加载，直接说一句：

```text
先读 AGENTS.md 和 SKILL.md，然后按这个流程做一条关于 XXX 的横屏讲解视频。
```

这些 Agent 不需要关心 `SKILL.md` 顶部的 YAML frontmatter，读正文即可。

### 人工使用

从 `SKILL.md` 开始按七阶段执行；`scripts/` 里的脚本可独立运行，依赖与版本红线见 `references/00-dependencies.md`。

## 快速开始

1. 先做环境体检（只读，列出缺失项的安装命令）：

   ```bash
   python scripts/check_env.py
   ```

2. 描述需求，例如：`做一条介绍 XXX 的讲解视频，横屏。`

3. 按提示完成 G1（自己录 / AI 生成配音）与 G2（试听确认音轨）。

4. 成片输出在 `<工作目录>/output/`。

Windows 平台的工具坑与绕法见 `references/07-gotchas.md`。

## 目录结构

```text
remotion-video-pipeline/
├── SKILL.md                     主流程：七阶段、两道门、四条铁律
├── AGENTS.md                    通用 Agent 入口（跨 Agent 必读）
├── CLAUDE.md                    Claude Code 入口
├── README.md                    本说明
├── references/                  各阶段详细规范（00~13）
├── scripts/                     环境体检、配音、对轴、时间轴生成、抖音流截获
└── assets/
    ├── components/              可复用 Remotion 组件：Chrome / ShotEngine / Opening / Motion.primitives
    └── templates/               Video / Root / scenes.json 模板
```

## 版本

当前版本：**v1.7.0**（默认横屏、画幅自适应底座）。完整变更记录见 `SKILL.md` 末尾「参考」章节。
