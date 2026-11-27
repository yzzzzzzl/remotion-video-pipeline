# Drag Then Relink — 拖动产生变化 · Motion Prompt

> 节点沿可见拖动路径移动到新位置（带控制手柄 / 吸附参考线），随后把新连接从端点画到真实目标。
>
> 来源 `M11` ｜ 分类 **C · 过程演示** ｜ 组件 `DragRelink` ｜ 建议时长 20~36 帧

## 1. 它是什么，不是什么

节点沿可见拖动路径移动到新位置（带控制手柄 / 吸附参考线），随后把新连接从端点画到真实目标。

**不是**：不是瞬移；也不用静态截图演示拖动。

## 2. 触发词与时机

- **触发词**：调整、挪位置、拖动、重新连接
- **时序**：「拖动」发声帧起移动 16 帧；移动停稳后接 DrawPath 重连。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

from/to 两点 + 虚线参考路径；对象用 transform translate 移动。

## 4. 原生动作（菜单，按需取用）

- **可见路径＝证明被拖过**｜适合：拖拽操作、位置调整
- **虚线参考线＝对齐感**｜适合：编辑器、画布类主题
- **重连＝结果确认**｜适合：连线工具、流程编辑

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <DragRelink from={{x:0,y:0}} to={{x:280,y:120}} local={local} delay={at(2)}>{卡片}</DragRelink>
2. 移动结束后用 DrawPath 画新连接
3. 全程不要换场景背景

```tsx
import { DragRelink } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<DragRelink from={{x:0,y:0}} to={{x:260,y:120}} local={local} delay={at(0)}><div style={{border:"1px solid #6FE3D2",padding:16}}>NODE</div></DragRelink>
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 对象瞬移看不出过程
- 用静态截图演示拖动
- 拖动后不重连

## 7. 变化空间（同一效果的不同用法）

- 节点拖动
- 滑块调整
- 卡片换位

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
