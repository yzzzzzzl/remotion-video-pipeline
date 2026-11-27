# MotionKit API 速查

`MotionKit.tsx` 是动效库**唯一代码源**：31 个效果组件 + 6 个时间工具函数。拷进 `remotion-project/src/components/` 即可；只依赖 `react` 与 `remotion`，不新增 npm 包。

## 统一契约

| 参数 | 含义 |
|---|---|
| `local` | 本页内帧号（场景组件收到的 `local`） |
| `delay` | 触发帧，**必须来自 `at(i)`**（台词行索引 → 本页帧偏移）；禁写死秒数 |
| `t` | 内部 `t = local - delay`；`t < 0` 时保持未触发初始态 |

工具函数：

| 函数 | 用途 |
|---|---|
| `tOf(local, delay)` | 返回局部帧 `t` |
| `prog(local, delay, duration, easing?)` | 0→1 进度，默认 `Easing.out(Easing.cubic)` |
| `popStyle(local, delay, distance?)` | 上滑+微缩放+淡入的 `CSSProperties` |
| `holdOpacity(local, len, fadeIn?, fadeOut?)` | 进场→停稳→退场的 opacity |
| `fmt(n, mode?)` | 整数 / 千分位格式化 |
| `MOTION_KIT_EXPORTS` | 31 个导出组件名清单（脚本校验用） |

## 组件清单

按 `INDEX.md` 的八组排列。每张卡的 `§5 实现配方` 都有可直接复制的 JSX。

| 组 | 组件 | 主要 props（除 `local` / `delay`） | 效果卡 |
|---|---|---|---|
| A 钩子 | `ForeBackTitle` | `back`, `front?`, `height?`, `frontDelay?` | `fore-back-title` |
| | `ResultFirstFrame` | `children`, `color?` | `result-first-frame` |
| | `NumberAccent` | `to`, `from?`, `duration?`, `format?`, `color?` | `number-accent` |
| | `PulseCells` | `count`, `gap?`, `size?`, `color?`, `dim?` | `cell-preload` |
| B 文字 | `SweepHighlight` | `children`, `duration?`, `color?` | `sweep-highlight` |
| | `LeaderLine` | `x1`, `y1`, `x2`, `y2`, `duration?`, `strokeWidth?` | `leader-line` |
| | `GeometricWipe` | `children`, `duration?`, `color?` | `geometric-wipe` |
| C 过程 | `DualMerge` | `left`, `right`, `result`, `resultDelay?`, `width?` | `dual-merge` |
| | `FlowDots` | `x1,y1,x2,y2`, `count?`, `duration?`, `active?` | `flow-dots` |
| | `DrawPath` | `paths: string[]`, `gap?`, `duration?`, `width?`, `height?` | `draw-path` |
| | `DragRelink` | `children`, `from{x,y}`, `to{x,y}`, `duration?` | `drag-relink` |
| | `ScanZones` | `from`, `to`, `duration?`, `zones[{top,left,width,height,at}]` | `scan-zones` |
| D 操作 | `UIFlow` | `steps[]`, `delays[]`, `width?`, `title?` | `ui-flow` |
| | `TypewriterCopy` | `text`, `perChar?`, `color?` | `typewriter-copy` |
| | `PlayheadFrames` | `count`, `duration?`, `frameWidth?` | `playhead-frames` |
| E 数据 | `ContextThenValue` | `parts[]`, `value`, `gap?`, `color?` | `context-then-value` |
| | `ChecklistTrend` | `items[]`, `gap?`, `trendPath?` | `checklist-trend` |
| F 对比 | `ParallelMerge` | `left`, `right`, `result`, `mergeDelay?` | `parallel-merge` |
| | `SpreadPages` | `left`, `right`, `gap?` | `spread-pages` |
| | `ImageRelay` | `items[]`, `gap?`, `focusIndex?` | `image-relay` |
| G 收尾 | `ResultHold` | `children`, `len` | `result-hold` |
| H 装饰 | `CounterRoll` | `to`, `duration?`, `format?` | `counter-roll` |
| | `RGBGlitch` | `children`, `colorA?`, `colorB?` | `rgb-glitch` |
| | `EqualizerBars` | `count?`, `height?`, `barWidth?` | `equalizer-bars` |
| | `CodeRain` | `rows?`, `cols?`, `fontSize?` | `code-rain` |
| | `TerminalType` | `lines[]`, `perChar?` | `terminal-type` |
| | `HUDLayer` | `label?`, `width?`, `height?` | `hud-layer` |
| | `HoloReveal` | `children`, `duration?`, `color?` | `holo-reveal` |
| | `StrikeStamp` | `children`, `stamp?`, `color?` | `strike-stamp` |
| | `NodeConnect` | `nodes[{x,y,label?}]`, `edges[[a,b]]`, `width?`, `height?` | `node-connect` |
| | `SlowPush` | `children`, `mode: "push"\|"flip"\|"gild"`, `duration?` | `slow-push` |

## 最小示例

```tsx
import { SweepHighlight, NumberAccent, HUDLayer } from "./MotionKit";

// 场景组件收到 local；at(i) 由 timeline.json 换算本章第 i 句的本页帧偏移
<div style={{ position: "relative" }}>
  <SweepHighlight local={local} delay={at(1)}>关键词</SweepHighlight>
  <NumberAccent to={59200} format="comma" local={local} delay={at(2)} />
  <HUDLayer local={local} delay={at(0)} label="REC" />
</div>
```

## 实现约束

- `Math.random()` 一律禁用；`CodeRain` / `EqualizerBars` / `RGBGlitch` 的相位都由 `i` 与 `local` 派生。
- SVG 连线统一用 `pathLength={1}` + `strokeDasharray={1}` + `strokeDashoffset={1-p}`，免算路径长度。
- 停稳期保留一个永动小元素（进度条 / 呼吸光 / 数据轨 / 扫线）满足画面铁律四。
- H 组装饰特效只在开场第 0 章渲染，`frame 450` 后完全卸载。
- 校验：`python scripts/validate.py` 会检查组件导出、元数据完整性、禁用随机与文件三件套。
