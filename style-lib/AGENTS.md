# Style Library — 给 Agent 的通用入口

本目录是 **Remotion 讲解视频画风库**：60 个原创画风按 12 类组织，每个有 `styles/<slug>/STYLE.md`（规则）、`styles/<slug>/style.json`（机器元数据）、`styles/<slug>/demo.tsx`（最小可运行示例）；`core/StyleKit.tsx` 是**唯一渲染代码源**，`core/style-tokens.ts` 是脚本生成的 token 常量。

任何能读写文件、执行命令的 Agent 都能用：**把本仓库地址交给它，让它先读本文件与 `styles/INDEX.md`，再按主题选 1 个画风、拷组件、包住整片、抽帧质检**。不依赖任何特定 Agent 的专有工具，也不新增 npm 依赖。

| 用户的需求 | 去哪 |
|---|---|
| 没选画风 /「有哪些画风」 | [`styles/INDEX.md`](styles/INDEX.md) 按主题、触发词、类别查 |
| 已选画风，要规则与坑 | `styles/<slug>/STYLE.md` |
| 怎么落地、组件 API | [`core/README.md`](core/README.md) + `core/StyleKit.tsx` |
| 这一支片该选哪个画风、密度怎么定 | [`STYLE-DIRECTOR.md`](STYLE-DIRECTOR.md) |
| 实现契约、质检、常见错误 | [`STYLE-TECHNIQUE.md`](STYLE-TECHNIQUE.md) |
| 「改成我的画风」「从空白做一个」 | [`MY-STYLES.md`](MY-STYLES.md) |
| 与完整口播流水线配合 | 上一级 [`../AGENTS.md`](../AGENTS.md)、[`../SKILL.md`](../SKILL.md)、[`../references/14-style-library.md`](../references/14-style-library.md) |
| 动作怎么来（画风不管动作） | 平级 [`motion-lib/AGENTS.md`](../motion-lib/AGENTS.md) → `motion-lib/INDEX.md` |

## 开工顺序

1. **先看用户自己的画风**：若 `~/remotion-my-styles/README.md` 存在，先读它；用户点名的画风先在自己的目录里找，再找库里的。
2. **按主题选 1 个画风**：读 `styles/INDEX.md`，按主题对应到 12 类之一，再按 `STYLE.md` §7 的「适合 / 不适合 / 触发词」定 1 个 slug。**一整支片只用这一个**。
3. **读那张画风卡**：`styles/<slug>/STYLE.md`，记下色板、字体、底板族、不变量、坑。
4. **拷代码**：把 `core/StyleKit.tsx` + `core/style-tokens.ts` 拷进项目的 `src/components/`；不需要 `npm install` 任何新包。
5. **包住整片**：`<StyleStage slug="...">` 放在 `Video.tsx` 最外层（或每个场景页最外层但值相同），开场、正片、结尾全用同一 slug。
6. **接动作**：从 `motion-lib/INDEX.md` 按台词触发词挑 1 个主动作/章；`getStyle(slug).palette.accent` 传给动效组件；`delay` 仍一律 `at(i)`。
7. **先验静帧再上动效**：`remotion still` 看排版不溢出，再渲动效；抽三帧（起点前 1 帧 / 起点后 2 帧 / 结果停稳帧）。
8. **改/建自己的画风**：按 `MY-STYLES.md`，改 `scripts/styles.json` 或存 `~/remotion-my-styles/<slug>/`，跑 `python scripts/build_styles.py` 并入索引。

## 不可协商（任何 Agent 都适用）

- **一整支片 1 个 slug**：不要每页换皮，不要开场用 A、正片用 B。要换就整片重定。
- **不新增确认门**：选画风、配色、字体由 Agent 按主题自行决定，**不追问用户**。G1（选配音方式）与 G2（试听确认）仍由主流程 `../SKILL.md` 管理。
- **两层正交**：画风管「长什么样」，动效管「怎么动」；**不修改 `MotionKit.tsx` 源码**，颜色走 prop / CSS 变量。
- **时序仍归台词**：`delay` 必须来自 `at(i)`，禁止写死秒数或常数帧；画风不接管动画锚点。
- **禁 `Math.random()`**：底板与装饰全部确定性 CSS / 正弦派生；Remotion 逐帧独立渲染，随机会让画面抖动。
- **不引入新 npm 依赖、不加载外部字体/图片**：字体栈全是系统字体，底板全是 CSS 渐变。
- **字幕条必须可读**：`StyledCaption` 用面板色 + 细边，不要用强调色铺底。
- **开场 15 秒与正片同画风**：H 组装饰 450 帧后卸载，但画风底板保留（见 `../references/10-first-15s.md`）。

## 与完整流水线怎么配合

| 流水线阶段 | 用本库做什么 |
|---|---|
| 阶段 0 定规格 | 选 1 个 slug 写进配方卡（用户没指定就自动定，不追问） |
| 阶段 1 配方卡 | 记 `style: <slug>` + 一行理由 |
| 阶段 4 分镜设计 | 镜头表标整片画风；另按台词触发词从 `motion-lib/INDEX.md` 挑主动作 |
| 阶段 5 视觉体系 | 拷 `StyleKit.tsx` + `style-tokens.ts`，`StyleStage` 包住场景页；与 `Chrome.tsx` / `ShotEngine.tsx` / `MotionKit.tsx` 共存 |
| 阶段 6 质检 | 三帧抽查 + 「全片只有一个 slug / 色板字体统一 / 开场正片不混搭」，见 `../references/14-style-library.md` §6 |
| 改稿 | 只换画风 → 改一个 slug 重渲，页面/动效/时间轴都不用动 |

## 目录

```text
style-lib/
├── AGENTS.md              本文件：通用入口
├── SKILL.md               自动发现用的 frontmatter + 简短说明
├── CLAUDE.md / GEMINI.md  Claude Code / Gemini CLI 入口（指向 AGENTS.md）
├── .cursor/rules/         Cursor 规则
├── .github/               GitHub Copilot 指令
├── plugin/                Claude Code plugin 安装路径
├── styles/INDEX.md        60 个画风的索引（脚本生成，勿手改）
├── styles/<slug>/         STYLE.md + style.json + demo.tsx（60 份）
├── STYLE-DIRECTOR.md      选画风、主题→类别、密度判定
├── STYLE-TECHNIQUE.md     实现契约、12 种底板族、质检、反模式
├── MY-STYLES.md           自定义画风流程
├── core/StyleKit.tsx      唯一渲染代码源
├── core/style-tokens.ts   60 份 token（脚本生成，勿手改）
├── core/README.md         API 速查 + 与动效库组合契约
├── _template/             新建画风的三件套模板
└── scripts/               styles.json（数据源）+ build_styles.py + validate_styles.py
```

## 常用命令

```bash
python scripts/build_styles.py     # 从 styles.json + 用户自定义目录重建画风卡与 INDEX.md
python scripts/validate_styles.py  # 校验 60/60、字段、索引、无随机、文件完整性
```
