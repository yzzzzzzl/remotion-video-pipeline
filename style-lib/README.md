# Remotion Style Library · 通用画风库

一套 **Agent 无关**的 Remotion 讲解视频画风库：**60 个原创画风**，按「这支片整体要呈现什么气质」分 12 类；中英文触发词可查；每个画风有一张规则卡、一份机器元数据、一个最小 demo；全部底板集中在一个自包含的 `StyleKit.tsx` 里，只依赖 React + Remotion + 原生 CSS。

参照 `lemomo-ai/lemo-opuscar` 的**组织方式**（通用入口 → 逐卡规则 → 索引 → 技术与导演指南 → 自定义目录 → 各 Agent 适配入口）。**色板、材质、镜头、不变量与坑全部为本项目原创，未复制其 STYLE.md 文本或 demo 代码**；也不依赖它的 Python / Three.js / Playwright / 素材管线。

## 给 Agent 的一句话

复制下面这段，把【】换成你的需求：

```text
请从 https://github.com/yzzzzzzl/remotion-video-pipeline 下载/克隆这个仓库，先读 style-lib/AGENTS.md 和 style-lib/styles/INDEX.md，按主题选 1 个画风（一整支片只用这一个），再读 motion-lib/INDEX.md 挑动作。用 StyleStage 包住整片，取色传给动效组件，delay 一律 at(i)；不新增 npm 依赖，做完抽三帧自检。
```

例子：

```text
先读 style-lib/AGENTS.md，给这段口播做一条讲「工程结构拆解」的横屏视频：画风用工程蓝图，讲流程时逐段连线，讲数字时先给口径再揭值。只在选配音方式和试听音轨时问我。
```

## 各主流 Agent 怎么用

| Agent | 接入方式 |
|---|---|
| **通用（任何 Agent）** | 把仓库地址给它，让它读 `style-lib/AGENTS.md` → `styles/INDEX.md` → `styles/<slug>/STYLE.md` |
| **Claude Code** | `claude plugin marketplace add yzzzzzzl/remotion-video-pipeline`，再 `claude plugin install remotion-style-lib`；或直接把本目录当 skill 目录用 |
| **Cursor** | 把 `style-lib/.cursor/rules/style-lib.mdc` 拷进项目的 `.cursor/rules/` |
| **Gemini CLI** | `style-lib/GEMINI.md` 已指向 `AGENTS.md`，克隆后自动生效 |
| **GitHub Copilot** | `style-lib/.github/copilot-instructions.md` 拷进项目 `.github/` |
| **WorkBuddy / 支持 SKILL.md 的工具** | 把 `style-lib/` 整个目录放到 skills 目录下，`SKILL.md` 的 frontmatter 会被自动发现 |
| **其它 Agent** | 让它读 `AGENTS.md`；没有自动读取时，在需求里加一句「先读 AGENTS.md」 |

> 本库**不新增用户确认门**。完整口播流水线的 G1（选配音方式）与 G2（试听确认）由上一级 `../SKILL.md` 管理；选画风自行决定，不追问。

## 60 个画风（12 类 × 5）

完整索引见 [`styles/INDEX.md`](styles/INDEX.md)，每类 5 个：

| 类 | 画风 | 什么时候用 |
|---|---|---|
| A 科技与界面 | 深色科技发布、全息 HUD、CRT 字符终端、桌面卡片穿梭、表格动画 | 产品发布、工具教程、命令行 |
| B 数据与图表 | 数据叙事、工程蓝图、雷达扫描、热成像、安检 X 光 | 统计、结构、监测、透视 |
| C 板书与手绘 | 黑板粉笔、白板讲解、视觉笔记、马克笔白纸、一笔画 | 教学、推导、笔记、金句 |
| D 印刷与编辑 | 杂志编辑、报纸印刷、孔版印刷、木刻版画、瑞士动态排版 | 长文、报道、观点、设计 |
| E 纸艺与工艺 | 红色剪纸、纸雕灯影、彩色玻璃、金箔彩绘、中国水墨 | 人文、传统、节庆、东方美学 |
| F 卡通与动画 | 80s 赛璐璐、橡皮管卡通、50s 扁平卡通、黑白漫画分格、16-bit 像素 | 轻科普、趣味、游戏化 |
| G 立体与材质 | 低多边形等距、等距信息图、积木玩具、移轴微缩、玻璃质感 | 结构拆解、产品、空间 |
| H 胶片与纪实 | 1920s 新闻影片、字幕新闻、暗色纪录片、后室录像带、电视新闻包装 | 历史、新闻、调查、盘点 |
| I 光与线 | 霓虹灯管、电路板、示波器、流场风线、萤火光点 | 科技感、节奏、抽象概念 |
| J 地图与实证 | 卫星简报、地铁线路图、显微镜下、档案看片台、数据实物化 | 地理、考据、样本、规模 |
| K 绘画笔触 | 水彩笔刷、油画厚涂、彩铅科普、蜡笔绘本、浮世绘 | 故事、情绪、审美、儿童 |
| L 几何与构成 | 包豪斯几何、装饰艺术、孟菲斯、构成主义蒙太奇、象形运动图形 | 概念、分类、方法论 |

## 目录

```text
style-lib/
├── AGENTS.md              通用入口（所有 Agent 从这里开始）
├── SKILL.md / CLAUDE.md / GEMINI.md / .cursor/ / .github/
│                          各 Agent 的自动发现入口
├── styles/INDEX.md        60 个画风索引（脚本生成，勿手改）
├── styles/<slug>/         STYLE.md + style.json + demo.tsx（60 份）
├── STYLE-DIRECTOR.md      选画风、主题→类别、密度判定
├── STYLE-TECHNIQUE.md     实现契约、12 种底板族、质检、反模式
├── MY-STYLES.md           自定义画风流程
├── core/StyleKit.tsx      唯一渲染代码源（12 种底板族）
├── core/style-tokens.ts   60 份 token（脚本生成，勿手改）
├── core/README.md         API 速查 + 与动效库组合契约
├── _template/             新建画风模板
└── scripts/               styles.json + build_styles.py + validate_styles.py
```

## 命令

```bash
python scripts/build_styles.py     # 改了 styles.json 或自定义画风后重建卡片与 INDEX.md
python scripts/validate_styles.py  # 校验 60/60、字段完整、索引最新、无随机
```

## 与 remotion-video-pipeline / motion-lib 的关系

- 与 **`motion-lib/`（31 个动效）正交**：画风管「整片长什么样」，动效管「元素怎么动」。一支片 = 1 个画风 + 每章 1 个主动作。取色用 `getStyle(slug).palette.accent` 传给动效组件，**不改 MotionKit 源码**。
- 与 **`10-first-15s.md` §5** 衔接：主题→类别映射在那里，具体 slug 在本库 `styles/INDEX.md`；开场与正片必须同一画风。
- 是主流水线**阶段 0/4/5/6** 的画风来源；也可以脱离流水线单独用——任何 Remotion 工程拷走 `StyleKit.tsx` + `style-tokens.ts` 就能换皮。
- 完整组合规范见 [`../references/14-style-library.md`](../references/14-style-library.md)。

当前版本：**v1.0.0**（随主 skill v1.9.0 引入）。
