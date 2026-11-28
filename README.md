# remotion-video-pipeline

一套供 **Agent 直接使用**的 Remotion 口播讲解视频流水线：把主题、文章、要点或参考视频，变成带逐字字幕、分镜动画、配音和成片 MP4 的完整流程。

用法很简单：**把本仓库地址交给 Agent，再告诉它要做什么视频**。它下载后会读仓库里的 `AGENTS.md` 和 `SKILL.md`，按规范自行完成，只在两处停下问你。

## 给 Agent 的一句话

复制下面这段，把【】里的内容换成你的需求：

```text
请从 https://github.com/yzzzzzzl/remotion-video-pipeline 下载/克隆这个 skill，先读 AGENTS.md 和 SKILL.md，然后按流程做一条【主题/要求】的讲解视频。默认横屏 1920×1080 @30fps；只在 G1（选配音方式）和 G2（试听确认）停下问我，其他规格你自己定。
```

例子：

```text
请从 https://github.com/yzzzzzzl/remotion-video-pipeline 下载/克隆这个 skill，先读 AGENTS.md 和 SKILL.md，然后做一条介绍「AI 剪辑六步法」的横屏讲解视频，口播要有具体工具名。只在选配音方式和试听音轨时问我。
```

## 它能做什么

- **两种起步方式**：给参考视频链接/本地原片做拆解；或只给主题、文章、要点直接推导配方卡。
- **音画对轴**：原创口播稿 → 拆句 → AI 配音或真人录音 → 逐字时间戳对齐 → `timeline.json`。
- **不无聊的画面**：开头 15 秒帧级快切，正片观点页 ↔ 解释页交替，每页只放关键词。
- **外部素材规范**：代码画不出的真实物件/场景允许检索可商用素材，含版权判定、统一画风与落地引用规则。
- **讲解型动效库**：21 个语义动作模式 + 可复用 Remotion 组件原语，做到「讲到什么就演什么」。
- **Agent 通用动效库 `motion-lib/`**：31 个效果卡（中英文触发词可查）+ 一份自包含 `MotionKit.tsx`，Claude Code / Cursor / Gemini CLI / GitHub Copilot / WorkBuddy 都能直接用，也能脱离本流水线单独用。
- **60 种整片画风 `style-lib/`**：12 类各 5 个，从深色科技发布到中国水墨、黑板粉笔、工程蓝图、像素 RPG；`StyleStage` 一个组件换皮，色板/字体/底板/材质全跟着变。与 31 个动效正交组合，一支片选 1 个画风 + 每章 1 个主动作。
- **质检与渲染**：先静帧检查排版，再抽帧验动效，最后输出 MP4。

## Agent 从哪里开始

1. 下载/克隆本仓库到工作目录。
2. 读 `AGENTS.md`：通用执行规则、默认规格、两道门、四条铁律。
3. 读 `SKILL.md`：七阶段主流程；按任务需要查 `references/`。
4. 用 `scripts/` 做环境体检、配音、逐字对轴；从 `assets/` 拷贝组件与模板。
5. 在 G1（选配音方式）与 G2（试听确认音轨）两次停下等用户明确答复，其余环节不停。
6. 成片输出到 `<工作目录>/output/`。

如果 Agent 没有自动读取，就在需求里明确加一句「先读 `AGENTS.md`」。

## 交付物与默认规格

- **产物**：`voiceover.mp3` + `timeline.json` + Remotion 工程 + MP4
- **画幅**：默认 1920×1080 @30fps 横屏；用户明确要求抖音/小红书竖屏时才改 1080×1920（换算见 `references/10-first-15s.md` §10）
- **时间基准**：字幕是唯一基准，所有时间点查 `timeline.json`，不估秒数
- **主音轨**：`voiceover.mp3` 唯一，素材音效压 0.2~0.4
- **阻塞门**：只有 G1 与 G2；素材检索随配方卡软交付，不是第三道门
- **画风**：从 `style-lib/` 的 60 个里选 1 个写进配方卡，整片统一；用户未指定就按主题自动定，**不新增确认门**
- **画面四条铁律**：元素进场而非整页、主画面只放关键词、动画绑台词锚点、静态画面挂运动

## 目录结构

```text
remotion-video-pipeline/
├── AGENTS.md                    唯一通用入口：Agent 先读这份
├── SKILL.md                     主流程：七阶段、两道门、四条铁律
├── README.md                    本说明
├── references/                  各阶段详细规范（00~13）
├── scripts/                     环境体检、配音、对轴、时间轴生成、抖音流截获
├── motion-lib/                  Agent 通用动效库（31 个效果，可单独使用）
│   ├── AGENTS.md                通用入口；INDEX.md 效果索引
│   ├── MOTION-DIRECTOR.md / MOTION-TECHNIQUE.md / MY-MOTIONS.md
│   ├── core/MotionKit.tsx       31 个自包含组件的唯一代码源
│   ├── effects/<slug>/          MOTION.md + motion.json + demo.tsx
│   └── plugin/ .cursor/ .github/ 各 Agent 的自动发现入口
├── style-lib/                  Agent 通用画风库（60 个画风，可单独使用）
│   ├── AGENTS.md                通用入口；styles/INDEX.md 画风索引
│   ├── STYLE-DIRECTOR.md / STYLE-TECHNIQUE.md / MY-STYLES.md
│   ├── core/StyleKit.tsx       12 种底板族的唯一渲染代码源
│   ├── core/style-tokens.ts    脚本生成的 60 份 token
│   ├── styles/<slug>/          STYLE.md + style.json + demo.tsx
│   └── plugin/ .cursor/ .github/ 各 Agent 的自动发现入口
└── assets/
    ├── components/              可复用 Remotion 组件：Chrome / ShotEngine / Opening / Motion.primitives
    └── templates/               Video / Root / scenes.json 模板
```

## 版本

当前版本：**v1.9.0**（默认横屏、画幅自适应底座、Agent 通用动效库 `motion-lib/` + 60 画风库 `style-lib/`）。完整变更记录见 `SKILL.md` 末尾「参考」章节。
