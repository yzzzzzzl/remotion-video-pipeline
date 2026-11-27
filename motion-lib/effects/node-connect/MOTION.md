# Node & Edge Reveal — 节点连线 · Motion Prompt

> SVG 连线 + 节点逐个 pop 点亮；边用 pathLength 归一化逐条画出。
>
> 来源 `10 §4` ｜ 分类 **H · 开场装饰** ｜ 组件 `NodeConnect` ｜ 建议时长 24~60 帧

## 1. 它是什么，不是什么

SVG 连线 + 节点逐个 pop 点亮；边用 pathLength 归一化逐条画出。

**不是**：不是节点和边同时全亮；逐个点亮才表达顺序。

## 2. 触发词与时机

- **触发词**：流程、生态、兼容性
- **时序**：节点按 gap=6 帧依次 pop；每条边在对应节点后 +2 帧开始画。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

方形节点（不用圆）；边 2px；节点标签 ≤6 字。

## 4. 原生动作（菜单，按需取用）

- **节点点亮＝对象登场**｜适合：生态角色、模块
- **边画出＝关系建立**｜适合：流程、兼容性
- **逐个推进＝讲解顺序**｜适合：多节点系统

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <NodeConnect nodes={[…]} edges={[[0,1],[1,2]]} local={local} delay={at(1)} />
2. 边用 pathLength=1 + dashoffset
3. 结点/边共用识别色

```tsx
import { NodeConnect } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<NodeConnect nodes={[{x:120,y:200,label:'A'},{x:420,y:120,label:'B'},{x:720,y:200,label:'C'}]} edges={[[0,1],[1,2]]} local={local} delay={at(0)} />
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 一次性全亮
- 节点标签太长
- 边穿过字幕区

## 7. 变化空间（同一效果的不同用法）

- 生态关系图
- 流程节点
- 兼容矩阵

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
