# 阶段 5 补充规范 · 画风库 style-lib（60 个画风）

> 本文件是 `05-visual-system.md` 与 `10-first-15s.md` §5 的**画风落地层**。
> 一句话：**画风管「整片长什么样」，动效管「元素怎么动」，两层正交，不互相改源码。**

## 1. 为什么单独有一层

v1.8 之前，画风散在 `10-first-15s.md` §5 的主题映射表和 `Chrome.tsx` 的深蓝科技底座里，结果是「一套科技模板通吃」。v1.9 起把画风独立成 `style-lib/`：

| 层 | 目录 | 管什么 | 粒度 | 代码源 |
|---|---|---|---|---|
| **画风层** | `style-lib/` | 色板、字体、底板、材质、镜头语法、动作质感 | **一整支片 1 个** | `core/StyleKit.tsx` |
| **动作层** | `motion-lib/` | 元素进场、强调、连线、滚动、停稳 | **每章 1 个主动作** | `core/MotionKit.tsx` |
| 装饰层 | `10-first-15s.md` §4 | 开场 HUD / 代码雨 / 故障字 | 开场 450 帧内 | `MotionKit.tsx` H 组 |

三者可以叠加，但**不要互相修改源码**：画风通过 `getStyle(slug).palette.accent` 把颜色传给动效组件，动作锚点仍一律 `at(i)`。

## 2. 什么时候定画风

| 阶段 | 动作 |
|---|---|
| **0 定规格** | 从 `style-lib/styles/INDEX.md` 选 **1 个 slug** 写进配方卡；用户没指定就按主题自动定，**不追问、不新增确认门** |
| **1 配方卡** | 配方卡里记 `style: <slug>` 与选它的理由一行 |
| **4 分镜** | 镜头表每页只标画风 slug（整片相同），另标本章主动作；见 `style-lib/STYLE-DIRECTOR.md` |
| **5 搭画面** | 拷 `StyleKit.tsx` + `style-tokens.ts` 进 `src/components/`，`<StyleStage slug="...">` 包住所有场景页 |
| **6 质检** | 三帧抽查 + 本文件 §6 的画风专项检查 |
| **7 改稿** | 只换画风 → 改一个 slug 重渲，页面/动效/时间轴都不用动 |

## 3. 60 个画风速查（12 类 × 5）

| 类别 | 代表 slug | 适合 |
|---|---|---|
| 科技与界面 | `dark-tech-keynote` / `holo-hud` / `terminal-crt` / `desktop-cards` / `spreadsheet-film` | 产品发布、工具教程、命令行 |
| 数据与图表 | `dataviz-clean` / `blueprint` / `radar-sweep` / `thermal` / `xray` | 统计、结构、监测、透视图 |
| 板书与手绘 | `chalkboard` / `whiteboard` / `sketchnote` / `marker` / `one-line` | 教学、推导、笔记、金句 |
| 印刷与编辑 | `editorial` / `newspaper` / `risograph` / `woodcut` / `type-swiss` | 长文、报道、观点、设计 |
| 纸艺与工艺 | `paper-cut` / `paper-lightbox` / `stained-glass` / `gilded` / `ink-wash` | 人文、传统、节庆、东方美学 |
| 卡通与动画 | `cel-anime` / `rubber-hose` / `midcentury` / `manga` / `pixel-rpg` | 轻科普、趣味、游戏化 |
| 立体与材质 | `low-poly` / `isometric` / `brick-toy` / `tilt-shift` / `glass-product` | 结构拆解、产品、空间 |
| 胶片与纪实 | `newsreel` / `caption-news` / `documentary` / `found-footage` / `broadcast` | 历史、新闻、调查、盘点 |
| 光与线 | `neon-tubes` / `circuit-board` / `oscilloscope` / `flow-field` / `firefly` | 科技感、节奏、抽象概念 |
| 地图与实证 | `satellite` / `transit-map` / `microscope` / `archive-light` / `data-physical` | 地理、考据、样本、规模 |
| 绘画笔触 | `watercolor` / `impasto` / `colored-pencil` / `crayon-book` / `ukiyo-e` | 故事、情绪、审美、儿童 |
| 几何与构成 | `bauhaus` / `art-deco` / `memphis` / `constructivist` / `pictogram` | 概念、分类、方法论 |

完整表（含触发词、底板族、强调色）见 `style-lib/styles/INDEX.md`；每张卡的色板/字体/不变量/坑见 `style-lib/styles/<slug>/STYLE.md`。

## 4. 怎么选（不追问）

1. 读 `10-first-15s.md` §5 的**主题→类别**映射，先定 12 类里的哪一类。
2. 在该类的 5 个画风里按 `STYLE.md` §7 的「适合 / 不适合 / 触发词」选 1 个。
3. 冲突时优先级：**不适合 > 适合 > 好看**。比如讲财报不要用 `crayon-book`，讲儿童不要用 `documentary`。
4. 定不下来就用该类的第 1 个，写进配方卡即可，**不要问用户**。
5. 一整支片只用这 1 个 slug；开场 15 秒、正片、结尾全部同一画风。

## 5. 落地代码

```tsx
import { StyleStage, StyleCard, StyledCaption, getStyle } from "./components/StyleKit";
import { NumberAccent, SweepHighlight } from "./components/MotionKit";

const SLUG = "blueprint";                 // 整片唯一
const t = getStyle(SLUG);

export const Shot = ({ local, at }) => (
  <StyleStage slug={SLUG}>
    <StyleCard slug={SLUG}>
      <NumberAccent to={470000} local={local} delay={at(2)} color={t.palette.accent} />
      <SweepHighlight local={local} delay={at(3)} color={t.palette.accent} />
    </StyleCard>
    <StyledCaption slug={SLUG}>{/* 完整句子只进字幕条 */}</StyledCaption>
  </StyleStage>
);
```

三条硬规则：

- **不改 `MotionKit.tsx`**：颜色走 `color` / `style` prop 或 `var(--style-accent)`。
- **不改时序**：`delay` 仍一律 `at(i)`，画风不接管动画锚点。
- **不换皮**：`slug` 是整片常量，不是每页变量。`StyleStage` 应包在 `Video.tsx` 最外层或每个场景页最外层，但值相同。

`StyleKit.tsx` 的 12 种底板族（grid / scanlines / paper / chalk / stroke / flat / glow / film / dots / toy / lens / lines）全是纯 CSS 渐变，**零新增 npm 依赖、不加载外部字体或图片、无 `Math.random()`**。

## 6. 画风专项质检（并入阶段 6）

- [ ] 全片只出现 **1 个** `slug`（全局搜索 `StyleStage` / `getStyle` 的参数）。
- [ ] 开场 15 秒与正片**同一套色板/字体/底板**；`10` 的 HUD 装饰在 450 帧后卸载，但画风底板保留。
- [ ] 强调色 `accent` 只落在最重要的元素上；没有出现第二个同等权重的强调色。
- [ ] 三帧抽查：起点前 1 帧底板已就位、主体未出现；起点后 2 帧色板/字体/材质全部生效且无溢出；停稳帧暗角/辉光不压字幕条。
- [ ] 字幕条在任何画风下都可读（`StyledCaption` 用面板色 + 细边，别用画风强调色铺底）。
- [ ] `python style-lib/scripts/validate_styles.py` 通过。
- [ ] 与 `08-screen-rules.md` 四条铁律不冲突：画风只换皮，不增加文字块、不整页进场。

## 7. 改画风 / 做自己的画风

- 改库里的：改 `style-lib/scripts/styles.json` → `python style-lib/scripts/build_styles.py` → `python style-lib/scripts/validate_styles.py`。
- 用户自己的：按 `style-lib/MY-STYLES.md`，成品放 `~/remotion-my-styles/<slug>/`，重跑生成脚本并入索引。
- 只换一支片的画风：**改一个 slug 重渲**，页面/动效/时间轴全部不用动。

## 8. 常见误区

| 误区 | 正解 |
|---|---|
| 每页换个画风才叫「多画风」 | 「多画风」指**这个 skill 能产出 60 种不同片子**，不是一支片里混 60 种。一支片只用 1 个 |
| 画风库要装字体/图片/新依赖 | 不需要，字体栈全是系统字体，底板全是 CSS |
| 画风选了就不能用动效库 | 正相反，两层正交，取色传进去就行 |
| 开场可以用另一套更炫的画风 | 开场与正片必须同画风；炫靠 H 组装饰特效，不靠换皮 |
| 用户没说画风就得问他 | 按主题自动定，**不新增确认门**（G1/G2 仍是仅有的两道门） |
