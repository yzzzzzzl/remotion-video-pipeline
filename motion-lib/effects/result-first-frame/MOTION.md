# Real Result First Frame — 真实成果首帧 · Motion Prompt

> 首帧直接铺本期真实成果（成品图 / 数据 / 截图），配一句问题立题；frame 0 就在动。
>
> 来源 `M02` ｜ 分类 **A · 开场钩子** ｜ 组件 `ResultFirstFrame` ｜ 建议时长 30~90 帧

## 1. 它是什么，不是什么

首帧直接铺本期真实成果（成品图 / 数据 / 截图），配一句问题立题；frame 0 就在动。

**不是**：不是网搜的漂亮配图；首帧道具必须是本期真结果，观众一眼能看出真假。

## 2. 触发词与时机

- **触发词**：一篇长文怎么变成、这是最终结果、成品长这样
- **时序**：frame 0 起缓推近 1.0→1.04；首句结束时收起图卡（scale 1→0.85 + 淡出），音轨连续。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

主图占主体区，保留可辨识的字与场景；用本期色板压一道统一色调；文字块 ≤3。

## 4. 原生动作（菜单，按需取用）

- **首帧铺真结果＝可信度**｜适合：成品图、数据看板、真实截图
- **缓推近＝开场就在动**｜适合：任何主题首帧
- **收起图卡＝转正文**｜适合：问题句结束

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <ResultFirstFrame local={local} delay={at(0)}><Img src={staticFile('assets/result.png')} /></ResultFirstFrame>
2. 素材必须走 12-asset-sourcing.md 的 A 档与 staticFile()
3. 无成品则退到 fore-back-title

```tsx
import { ResultFirstFrame } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<ResultFirstFrame local={local} delay={at(0)}><div style={{fontSize:72}}>真实成果 / RESULT</div></ResultFirstFrame>
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 首帧用无关网图
- frame 0 静止
- 收起图卡时硬切

## 7. 变化空间（同一效果的不同用法）

- 数据看板首帧
- 成品海报首帧
- 前后对比图首帧

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
