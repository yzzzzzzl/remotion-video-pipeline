# Remotion Motion Library · 通用动效库

一套 **Agent 无关**的 Remotion 讲解视频动效库：31 个可复用效果，按「这一页要让观众看懂什么」分类，中英文触发词可查；每个效果有一张规则卡、一份机器元数据和最小 demo；全部组件集中在一个自包含的 `MotionKit.tsx` 里，只依赖 React + Remotion。

参考 `lemomo-ai/lemo-opuscar` 的组织方式：**通用入口 → 逐效果卡 → 索引 → 技术/导演指南 → 自定义目录 → 各 Agent 适配入口**。

## 给 Agent 的一句话

复制下面这段，把【】换成你的需求：

```text
请从 https://github.com/yzzzzzzl/remotion-video-pipeline 下载/克隆这个仓库，先读 motion-lib/AGENTS.md 和 motion-lib/INDEX.md，然后按【需求】挑选并实现动效。delay 一律用 at(i)，不要用 Math.random，不要新增 npm 依赖；做完抽三帧自检。
```

例子：

```text
先读 motion-lib/AGENTS.md，然后给这段口播做 Remotion 讲解视频：讲到「六个工具」时逐格点亮，讲到「59.2 万亿」时数字重音上移，讲流程时逐段连线。只在选配音方式和试听音轨时问我。
```

## 各主流 Agent 怎么用

| Agent | 接入方式 |
|---|---|
| **通用（任何 Agent）** | 把仓库地址给它，让它读 `motion-lib/AGENTS.md` → `INDEX.md` → `effects/<slug>/MOTION.md` |
| **Claude Code** | `claude plugin marketplace add yzzzzzzl/remotion-video-pipeline`，再 `claude plugin install remotion-motion-lib`；或直接把本目录当 skill 目录用 |
| **Cursor** | 把 `motion-lib/.cursor/rules/motion-lib.mdc` 拷进项目的 `.cursor/rules/` |
| **Gemini CLI** | 仓库根的 `GEMINI.md` 已指向 `AGENTS.md`，克隆后自动生效 |
| **GitHub Copilot** | `motion-lib/.github/copilot-instructions.md` 拷进项目 `.github/` |
| **WorkBuddy / 支持 SKILL.md 的工具** | 把 `motion-lib/` 整个目录放到 skills 目录下，`SKILL.md` 的 frontmatter 会被自动发现 |
| **其它 Agent** | 让它读 `AGENTS.md`；没有自动读取时，在需求里加一句「先读 AGENTS.md」 |

> 本库**不新增用户确认门**。完整口播流水线的 G1（选配音方式）与 G2（试听确认）由上一级 `../SKILL.md` 管理。

## 31 个效果

按讲解目的分八组，完整表见 [`INDEX.md`](INDEX.md)：

| 组 | 效果 | 什么时候用 |
|---|---|---|
| A 开场钩子 | 前后景大字遮挡、真实成果首帧、数字重音上移、逐格点亮预告 | 主题首次出现、数字冲击、建立预期 |
| B 文字强调 | 重点词扫入、一笔引线、几何擦除换版 | 一句话里哪几个字是重点 |
| C 过程演示 | 双路汇入、走线流动、逐段连线、拖动重连、扫描识别 | 两个东西的关系、流程、数据流向 |
| D 操作演示 | 界面流程、打字机复制粘贴、播放头扫画格 | 工具怎么用、导出、套模板 |
| E 数据揭示 | 先口径后揭值、逐条打勾+趋势 | 任何统计数字、累积成效 |
| F 对比合流 | 分路并行合流、双页展开、多图接力 | A/B、两种排版、多张素材 |
| G 收尾 | 结果停稳 | 结论、领取方式 |
| H 开场装饰 | 数字滚动、RGB 故障字、均衡器、代码雨、终端打字、HUD、全息卡、删除线印章、节点连线、缓推近/翻页/烫金 | 给画面质感，不替代语义动作 |

## 目录

```text
motion-lib/
├── AGENTS.md              通用入口（所有 Agent 从这里开始）
├── INDEX.md               效果索引（脚本生成，勿手改）
├── MOTION-DIRECTOR.md     选效果、时序、密度的判定
├── MOTION-TECHNIQUE.md    实现契约与质检
├── MY-MOTIONS.md          自定义效果流程
├── SKILL.md / CLAUDE.md / GEMINI.md / .cursor/rules/ / .github/
│                          各 Agent 的自动发现入口
├── plugin/                Claude Code plugin 安装路径
├── core/MotionKit.tsx     31 个组件的唯一代码源
├── core/README.md         API 速查
├── effects/<slug>/        MOTION.md + motion.json + demo.tsx（31 份）
├── _template/             新建效果模板
└── scripts/               effects.json（数据源）+ 生成/校验脚本
```

## 命令

```bash
python scripts/build_library.py   # 改了 effects.json 或自定义效果后重建卡片与 INDEX.md
python scripts/validate.py        # 校验元数据、组件导出、禁用随机、三件套完整
```

## 与 remotion-video-pipeline 的关系

本库是那套口播流水线在**阶段 4 分镜选动作 / 阶段 5 搭画面 / 阶段 6 抽帧质检**的组件与规则来源；也可以脱离流水线单独使用——任何 Remotion 工程拷走 `MotionKit.tsx` 就能用。

**与平级 `../style-lib/`（60 个画风）正交**：画风管「整片长什么样」，本库管「元素怎么动」。一支片选 1 个画风 slug + 每章 1 个主动作；用 `getStyle(slug).palette.accent` 把画风色传给本库组件即可，**不需要修改 `MotionKit.tsx`**。组合规范见 `../references/14-style-library.md`。

当前版本：**v1.0.0**。
