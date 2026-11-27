# Hologram Card Reveal — 全息卡揭示 · Motion Prompt

> clipPath 展开卡片 + 渐变光带从左扫到右，露出产品/核心概念。
>
> 来源 `10 §4` ｜ 分类 **H · 开场装饰** ｜ 组件 `HoloReveal` ｜ 建议时长 18~30 帧

## 1. 它是什么，不是什么

clipPath 展开卡片 + 渐变光带从左扫到右，露出产品/核心概念。

**不是**：不是普通淡入；光带必须随 p 移动，揭示完成后停稳。

## 2. 触发词与时机

- **触发词**：产品、核心概念、揭晓
- **时序**：概念词发声帧起 18 帧揭示；停稳 ≥1s 让人看清。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

卡片主体 + 16% 宽光带；光带扫完自动关闭。

## 4. 原生动作（菜单，按需取用）

- **揭示＝概念登场**｜适合：产品、核心概念
- **光带＝扫描确认**｜适合：科技主题
- **停稳＝读数**｜适合：卡片内文字

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <HoloReveal local={local} delay={at(1)}>卡片</HoloReveal>
2. clipPath inset 用线性 p
3. 可与 leader-line 叠加指证据

```tsx
import { HoloReveal } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<HoloReveal local={local} delay={at(0)}><div style={{padding:40,border:"1px solid #6FE3D2"}}>核心概念</div></HoloReveal>
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 光带扫完不关
- 揭示过程中堆文字
- 光带压住关键字

## 7. 变化空间（同一效果的不同用法）

- 产品卡揭示
- 概念卡揭示
- 数据卡揭示

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
