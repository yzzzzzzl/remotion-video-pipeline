# RGB Glitch Text — RGB 故障字 · Motion Prompt

> 双色副本左右偏移 + sin(local*1.9)*3px 抖动，制造确定性故障感。
>
> 来源 `10 §4` ｜ 分类 **H · 开场装饰** ｜ 组件 `RGBGlitch` ｜ 建议时长 10~24 帧

## 1. 它是什么，不是什么

双色副本左右偏移 + sin(local*1.9)*3px 抖动，制造确定性故障感。

**不是**：不是随机故障；Math.random() 会让每帧抖动，禁止使用。

## 2. 触发词与时机

- **触发词**：科技、反差、系统异常
- **时序**：触发后持续抖动，章节末完全关闭；最多用一次，别通篇闪。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

三层叠字：青副本、红副本、白主字；主字保持可读。

## 4. 原生动作（菜单，按需取用）

- **双色偏移＝故障感**｜适合：科技、AI 主题
- **短抖动＝冲击**｜适合：反常识断言
- **一次即收＝克制**｜适合：开场钩子

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <RGBGlitch local={local} delay={at(0)}>标题</RGBGlitch>
2. 偏移用 Math.sin(local*1.9)*3，确定性
3. 字幕区不用故障，保证可读

```tsx
import { RGBGlitch } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<RGBGlitch local={local} delay={at(0)} style={{fontSize:80}}>GLITCH</RGBGlitch>
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 用 Math.random()
- 故障字铺满整屏
- 故障期间文字读不出

## 7. 变化空间（同一效果的不同用法）

- 青红偏移
- 单色重影
- 一次性闪断

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
