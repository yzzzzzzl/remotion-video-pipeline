# StyleKit API 速查

`core/StyleKit.tsx` 是 60 个画风的**唯一渲染代码源**，`core/style-tokens.ts` 是脚本生成的 token 常量（勿手改）。两个文件一起拷进 Remotion 工程的 `src/components/`，**不需要 `npm install` 任何新包**。

## 最小用法

```tsx
import { StyleStage, StyledTitle, StyledBody, getStyle } from "./components/StyleKit";

export const Shot = () => (
  <StyleStage slug="blueprint">
    <StyledTitle slug="blueprint">工程蓝图</StyledTitle>
    <StyledBody slug="blueprint">这一页讲结构怎么连起来。</StyledBody>
  </StyleStage>
);
```

一整支片**只用一个 slug**。想换风格就换 `<StyleStage slug="...">`，页面代码不用动。

## 导出

| 导出 | 作用 |
|---|---|
| `getStyle(slug)` | 取完整 `StyleToken`（色板 / 字体 / 底板 / 动作质感 / 不变量）。slug 不存在直接抛错，不静默回退 |
| `useStyle(slug)` | `getStyle` 的别名，方便组件里就地取色（**不是 React hook**） |
| `STYLE_TOKENS` / `STYLE_SLUGS` | 全部 60 个 token 与 slug 列表 |
| `styleVars(slug)` | 返回 CSS 变量对象，可 spread 到任意容器 |
| `StyleStage` | 画风底板：`slug` / `children` / `style` / `showTexture` |
| `StyledTitle` / `StyledBody` / `StyledLabel` | 按画风字体排版的文字组件 |
| `StyleCard` | 画风化卡片（面板色 + 细边，几何/印刷类自动收圆角） |
| `StyledCaption` | 底部字幕条，任何画风下都保持可读 |

## StyleToken 字段

```ts
{
  slug, cn, en, cat, catCn, catEn, signature,
  palette: { bg, surface, surface2, text, dim, accent, accent2, line, problem },
  fonts:   { display, body, mono, weight, tracking },
  stage:   { type, typeCn, texture, grid, glow, vignette },
  motion:  { feel, easing, spawn, density, fps },
  camera, goodFor[], badFor[], triggers[], invariants[], pitfalls[],
  recommendedMotions[]
}
```

## 12 种底板族（`stage.type`）

| type | 观感 | 由 CSS 生成 |
|---|---|---|
| `grid` | 细网格 + 暗角 | 双向 1px 网格线 + 强调色径向微光 |
| `scanlines` | 扫描线 + 磷光 | 横向重复线 + 内发光边框 |
| `paper` | 纸纤维 + 印刷颗粒 | 双向极淡斜纹 |
| `chalk` | 粉笔粉尘 + 擦痕 | 斜向擦痕 + 两处粉尘晕 |
| `stroke` | 笔触 + 湿边 | 三处柔和色斑 |
| `flat` | 纯色平涂 + 硬边几何 | 斜切色块 + 圆/方/三角装饰 |
| `glow` | 光晕描边 | 双层径向辉光 + inset 边框 |
| `film` | 胶片颗粒 + 划痕 | 正交细颗粒 + 两条竖向划痕 |
| `dots` | 半调网点 / 点阵 | 径向点阵平铺 |
| `toy` | 等距投影 + 立体高光 | 30°/150° 等距网格 + 顶部高光 |
| `lens` | 圆形视野 / 柔焦 | 圆形径向遮罩 + inset 暗角 |
| `lines` | 流线 / 波形 / 走线 | 双方向细斜线流场 |

全部是**静态 CSS 渐变 + 内联样式**，逐帧确定性，无 `Math.random()`，无外部图片/字体文件。

## 与动效库组合（正交契约）

画风管「长什么样」，动效库管「怎么动」，**两者不互相修改源码**：

```tsx
import { StyleStage, StyleCard, getStyle } from "./components/StyleKit";
import { NumberAccent, SweepHighlight } from "./components/MotionKit";

const SLUG = "dark-tech-keynote";
const t = getStyle(SLUG);

export const Shot = ({ local, at }) => (
  <StyleStage slug={SLUG}>
    <StyleCard slug={SLUG}>
      <NumberAccent
        to={470000}
        local={local}
        delay={at(2)}
        color={t.palette.accent}          {/* 取色，不改 MotionKit */}
      />
      <SweepHighlight local={local} delay={at(3)} color={t.palette.accent} />
    </StyleCard>
  </StyleStage>
);
```

三条规则：

1. **不改动 `MotionKit.tsx`**：通过 `color` / `style` prop 或 `var(--style-accent)` 把画风色传进去。
2. **`delay` 仍一律 `at(i)`**：画风不接管时序，动作锚点还是台词行索引。
3. **一整支片一个 slug**：不要每页换皮；要换就整片重定，混搭会破坏视觉统一。

## 自定义 / 新增画风

改 `scripts/styles.json`（加一个对象）→ `python scripts/build_styles.py` → `python scripts/validate_styles.py`。
用户自己的画风放 `~/remotion-my-styles/<slug>/`，见 `MY-STYLES.md`。

## 自检

```bash
python scripts/validate_styles.py   # 60/60、字段、索引、tsx 语法、无随机
```
抽三帧：起点前 1 帧（底板已就位、主体未出现）／起点后 2 帧（色板字体材质生效、无溢出）／结果停稳帧（强调色只落最重要元素、暗角不压字幕）。
