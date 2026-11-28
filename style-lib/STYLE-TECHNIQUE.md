# Style Technique · 实现契约与质检

> `core/StyleKit.tsx` 是唯一渲染代码源；`core/style-tokens.ts` 由 `scripts/build_styles.py` 生成，**勿手改**。
> 改内容改 `scripts/styles.json`，重跑生成 + 校验。

## 1. 技术边界（不可突破）

- 只用 **React + Remotion + 原生 CSS**；`npm install` 零新增包。
- 字体栈全是系统字体（`Inter / PingFang SC / Microsoft YaHei / Georgia / Songti SC / Consolas / Kaiti SC …`），**不加载外部字体文件**。
- 底板全部是 CSS 渐变 / 内联样式，**不加载图片、不用 Three.js、不用 Canvas**。
- **禁 `Math.random()`**：Remotion 逐帧独立渲染，随机会让画面每帧抖动；要「随机感」用 `sin(local/k + i*phase)` 或固定序列派生。
- **不改 `motion-lib/core/MotionKit.tsx`**：取色走 prop / CSS 变量。

## 2. StyleToken 契约

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

派生规则（`build_styles.py`）：`surface2 = mix(surface, text, .10)`，`dim = mix(text, bg, .45)`，`line = mix(text, bg, .12)`，`problem = #FF5C5C`。所有色值必须是 6 位 hex。

## 3. 12 种底板族

| `stage.type` | CSS 实现 | 用于 |
|---|---|---|
| `grid` | 双向 1px 网格 + 强调色径向微光 + 暗角 | 科技 / 数据 / 蓝图 |
| `scanlines` | 横向重复扫描线 + inset 发光边框 | 终端 / HUD |
| `paper` | 双向极淡斜纹 | 印刷 / 纸艺 / 绘本 |
| `chalk` | 斜向擦痕 + 两处粉尘晕 | 板书 |
| `stroke` | 三处柔和色斑 | 绘画笔触 |
| `flat` | 斜切色块 + 圆/方/三角装饰 | 卡通 / 几何 |
| `glow` | 双层径向辉光 + inset 边框 | 霓虹 / 光效 |
| `film` | 正交细颗粒 + 两条竖向划痕 + 暗角 | 胶片纪实 |
| `dots` | 径向点阵平铺 | 像素 / 网点 |
| `toy` | 30°/150° 等距网格 + 顶部高光 | 立体 / 等距 |
| `lens` | 圆形径向遮罩 + inset 暗角 | 显微 / 卫星 |
| `lines` | 双方向细斜线流场 | 流场 / 电路 |

`StyleStage` 的层序固定：**底色 → 纹理 → 装饰/划痕 → 暗角 → 细边框 → children**。`showTexture={false}` 只留底色，用于对比调试。

## 4. 组合契约（画风 × 动效）

```tsx
const SLUG = "blueprint";              // 整片唯一常量
const t = getStyle(SLUG);

<StyleStage slug={SLUG}>
  <StyleCard slug={SLUG}>
    <NumberAccent local={local} delay={at(2)} color={t.palette.accent} />
  </StyleCard>
  <StyledCaption slug={SLUG}>{完整句子}</StyledCaption>
</StyleStage>
```

- `StyleStage` 放 `Video.tsx` 最外层，或每个场景页最外层但 **slug 值相同**。
- 取色：`getStyle(slug)` / `useStyle(slug)` / `styleVars(slug)`（CSS 变量 `--style-accent` 等）。
- `delay` 仍一律 `at(i)`；画风不产生时间轴。
- 字幕条用 `StyledCaption`，**不要用强调色铺底**；任何画风下都要可读。

## 5. 三帧抽查（并入 `../references/06-qc-render.md`）

| 帧 | 期望 |
|---|---|
| 动作起点前 1 帧 | 底板已就位（色板/网格/材质可见），主体尚未出现 |
| 起点后 2 帧 | 标题字体、字重、字距、卡片色、强调色全部生效；无溢出/重叠 |
| 结果停稳帧 | 强调色只落最重要元素；暗角/辉光不压字幕条；永动小元素仍在动 |

额外画风专项（见 `../references/14-style-library.md` §6）：

- 全片只有 **1 个** slug（全局搜 `StyleStage` / `getStyle` 参数）。
- 开场 15 秒与正片同一套色板/字体/底板；H 组装饰 450 帧后卸载，画风底板保留。
- 字幕条在所有画风下可读；没有第二个同等权重的强调色。
- `python scripts/validate_styles.py` 通过。

## 6. 常见错误

| 错误 | 后果 | 修法 |
|---|---|---|
| 每页传不同 slug | 视觉散架 | 提为整片常量 |
| 在 demo 里写 `Math.random()` | 每帧抖动 | 固定序列 / 正弦派生 |
| 装外部字体或下载材质图 | 工程变重、离线跑不了 | 用系统字体栈 + CSS 渐变 |
| 直接改 `style-tokens.ts` | 下次生成被覆盖 | 改 `scripts/styles.json` 后重跑 |
| 用强调色铺字幕底 | 字幕读不清 | 用 `StyledCaption` |
| 把动画 `delay` 写死帧号 | 音画不同步 | 一律 `at(i)` |
| 改 `MotionKit.tsx` 来适配画风 | 两层耦合、升级冲突 | 用 `color` / `style` prop |
| 开场另用一套更炫的画风 | 违反铁律第 8 条 | 同画风，炫靠 H 组装饰 |

## 7. 自检命令

```bash
python scripts/build_styles.py     # 重建 180 份三件套 + INDEX.md + style-tokens.ts
python scripts/validate_styles.py  # 1601 项断言：60/60、字段、索引、无随机、12 底板族
```

在任何 Remotion 工程里验证可渲染：把 `core/StyleKit.tsx` + `core/style-tokens.ts` 拷进 `src/components/`，注册一个 `Composition` 用 `<StyleStage>`，跑 `remotion still` 抽帧目检。用 esbuild 批量编译全部 `demo.tsx` 可一次性查语法：

```js
esbuild.build({
  entryPoints: ["core/StyleKit.tsx", ...allDemoPaths],
  bundle: true, write: false,
  external: ["react", "react-dom", "remotion"],
  outdir: "out/compile",
});
```
