# Motion Library — 给 Agent 的通用入口

本目录是 **Remotion 讲解视频动效库**：31 个可复用效果，每个有 `effects/<slug>/MOTION.md`（规则）、`effects/<slug>/motion.json`（元数据）、`effects/<slug>/demo.tsx`（最小可运行示例）；`core/MotionKit.tsx` 是**唯一代码源**。

任何能读写文件、执行命令的 Agent 都能用：把本仓库地址交给它，让它先读本文件与 `INDEX.md`，再按需求挑效果、拷组件、绑台词锚点、抽帧质检。**不依赖任何特定 Agent 的专有工具。**

| 用户的需求 | 去哪 |
|---|---|
| 没选效果 /「有哪些动效」 | [`INDEX.md`](INDEX.md) 按讲解目的与触发词查 |
| 已选效果，要知道规则与坑 | `effects/<slug>/MOTION.md` |
| 怎么写代码、组件 API | [`core/README.md`](core/README.md) + `core/MotionKit.tsx` |
| 这一页该挑哪个效果、时序、密度 | [`MOTION-DIRECTOR.md`](MOTION-DIRECTOR.md) |
| 帧参数契约、质检、常见错误 | [`MOTION-TECHNIQUE.md`](MOTION-TECHNIQUE.md) |
| 「改成我的效果」「从空白做一个」 | [`MY-MOTIONS.md`](MY-MOTIONS.md) |
| 接入完整的口播视频流水线 | 上一级 [`../AGENTS.md`](../AGENTS.md) 与 [`../SKILL.md`](../SKILL.md) |

## 开工顺序

1. **先看用户自己的效果**：若 `~/remotion-my-motions/README.md` 存在，先读它；用户点名的效果先在自己的目录里找，再找库里的。
2. **按触发词挑效果**：读 `INDEX.md`，按这一页台词里的触发词挑 **1 个主动作/章**。开场装饰（H 组）只补运动密度，不替代语义动作。
3. **读那张效果卡**：`effects/<slug>/MOTION.md`，记下 `component`、触发词、时序、坑。
4. **拷代码**：把 `core/MotionKit.tsx` 拷进项目的 `src/components/`；不需要 `npm install` 任何新包。
5. **绑锚点**：`delay` 传 `at(i)`（本章台词行索引换算到本页帧偏移），禁止拍秒数。
6. **先验静帧再上动效**：先 `remotion still` 看排版不溢出，再渲动效；抽三帧（起点前 1 帧 / 起点后 2 帧 / 结果停稳帧）。
7. **改/建自己的效果**：按 `MY-MOTIONS.md`，成品放 `~/remotion-my-motions/<slug>/`，跑 `python scripts/build_library.py` 并入 `INDEX.md`。

## 不可协商（任何 Agent 都适用）

- `delay` 必须来自 `at(i)`，**禁止写死秒数或常数帧**；`t = local - delay < 0` 时保持未触发初始态。
- **禁 `Math.random()`**：Remotion 逐帧独立渲染，随机值会让画面每帧抖动；用 `sin(local/k + i*phase)` 或 `floor(local/n)` 派生。
- **元素进场，不是整页进场**；进场单位是标题、数字、图标、卡片、连线各自有时刻。
- 一屏文字块 ≤3~4；完整句子只进字幕条。
- **不引入新 npm 依赖**：只用 Remotion 内置 `interpolate` / `Easing` + 原生 CSS / SVG。
- 结果停稳 ≥1 秒，且停稳期保留一个永动小元素（进度条 / 呼吸光 / 数据轨）。
- H 组装饰特效：**frame 450 后必须完全消失**；HUD 透明度 0.3~0.6，不压字幕/头像/帧计数器。
- **本库不新增确认门**：G1（选配音方式）与 G2（试听确认）仍由主流程 `../SKILL.md` 管理；选效果、配色、切几页自行决定，不追问。

## 与画风库的关系（正交）

平级的 `../style-lib/` 是**画风库（60 个画风）**：管一整支片的色板、字体、底板、材质与镜头气质。本库管「元素怎么动」。两者**不互相改源码**：

- 一支片 = **1 个画风 slug** + 每章 **1 个主动作**。
- 用 `<StyleStage slug="...">` 包住整片，取色 `getStyle(slug).palette.accent` 传给本库的组件（`color` / `style` prop 或 `var(--style-accent)`）。
- `delay` 仍一律 `at(i)`，画风不接管动画锚点；本库组件不需要为画风做任何改动。
- 完整组合规范见 `../references/14-style-library.md`。

## 与完整流水线怎么配合

| 流水线阶段 | 用本库做什么 |
|---|---|
| 阶段 4 分镜设计 | 按台词触发词从 `INDEX.md` 挑主动作，写进镜头表 |
| 阶段 5 视觉体系 | 拷 `MotionKit.tsx`，把效果组件嵌进场景；与 `Chrome.tsx` / `ShotEngine.tsx` 共存 |
| 阶段 6 质检 | 三帧抽查并入 `06-qc-render.md`；装饰类另查 450 帧残留 |
| 改稿 | 音轨变了重走主流程 G2；只动画效不用 |

## 目录

```text
motion-lib/
├── AGENTS.md              本文件：通用入口
├── SKILL.md               自动发现用的 frontmatter + 简短说明
├── CLAUDE.md / GEMINI.md  Claude Code / Gemini CLI 入口（指向 AGENTS.md）
├── .cursor/rules/         Cursor 规则
├── .github/               GitHub Copilot 指令
├── plugin/                Claude Code plugin 安装路径
├── INDEX.md               31 个效果的索引（脚本生成，勿手改）
├── MOTION-DIRECTOR.md     选效果、时序、密度的判定
├── MOTION-TECHNIQUE.md    实现契约、质检、反模式
├── MY-MOTIONS.md          自定义效果流程
├── core/MotionKit.tsx     31 个组件的唯一代码源
├── core/README.md         API 速查
├── effects/<slug>/        MOTION.md + motion.json + demo.tsx
├── _template/             新建效果的三件套模板
└── scripts/               effects.json（数据源）+ 生成与校验脚本
```

## 常用命令

```bash
python scripts/build_library.py   # 从 effects.json + 用户自定义目录重建效果卡与 INDEX.md
python scripts/validate.py        # 校验元数据、组件导出、禁用随机、文件完整性
```
