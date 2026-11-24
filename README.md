# remotion-video-pipeline

用 Remotion 做「口播讲解型」动画短视频的完整流水线，以 WorkBuddy Skill 的形式提供。

把「一段要讲的内容」变成一条**能被看完**的讲解动画：字幕是唯一时间基准，画面跟着语义翻页，观点页与解释页交替出现。**默认横屏 1920×1080 @30fps**；用户明确要求抖音/小红书竖屏时才覆盖为 1080×1920。

## 它能做什么

- **两种起步方式**：给参考视频链接/本地原片做拆解；或只给主题、文章、要点直接推导配方卡。
- **音画对轴**：原创口播稿 → 拆句 → AI 配音或真人录音 → 逐字时间戳对齐 → `timeline.json`。
- **不无聊的画面**：开头 15 秒帧级快切，正片观点页 ↔ 解释页交替，每页只放关键词。
- **外部素材规范**：代码画不出的真实物件/场景允许主动检索可商用素材，含版权判定、统一画风与落地引用规则。
- **讲解型动效库**：21 个语义动作模式 + 可复用的 Remotion 组件原语，做到「讲到什么就演什么」。
- **质检与渲染**：先静帧检查排版，再抽帧验动效，最后输出 MP4。

流程中只有两道确认门：G1 选配音方式、G2 试听确认音轨；其余规格用默认值兜底，不反复追问。

## 安装

把整个目录放到 WorkBuddy 的 skills 目录：

- 全局可用：`~/.workbuddy/skills/remotion-video-pipeline`
- 仅当前项目可用：`<项目>/.workbuddy/skills/remotion-video-pipeline`

重启会话后即可在对话里说「用 remotion-video-pipeline 这条 skill……」。

## 快速开始

1. 先做环境体检（只读，列出缺失项的安装命令）：

   ```bash
   python scripts/check_env.py
   ```

2. 对 WorkBuddy 描述需求，例如：`用 remotion-video-pipeline 帮我做一条介绍 XXX 的讲解视频，横屏。`

3. 按提示完成 G1（自己录 / AI 生成配音）与 G2（试听确认）。

4. 成片输出在 `<工作目录>/output/`。

依赖清单、版本红线与安装方式见 `references/00-dependencies.md`；Windows 平台踩坑见 `references/07-gotchas.md`。

## 目录结构

```text
remotion-video-pipeline/
├── SKILL.md                     主流程：七阶段、两道门、四条铁律
├── README.md                    本说明
├── references/                  各阶段详细规范（00~13）
├── scripts/                     环境体检、配音、对轴、时间轴生成、抖音流截获
└── assets/
    ├── components/              可复用 Remotion 组件：Chrome / ShotEngine / Opening / Motion.primitives
    └── templates/               Video / Root / scenes.json 模板
```

## 版本

当前版本：**v1.7.0**（默认横屏、画幅自适应底座）。完整变更记录见 `SKILL.md` 末尾「参考」章节。
