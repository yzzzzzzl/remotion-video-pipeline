# Counter Roll — 数字滚动计数 · Motion Prompt

> 开场装饰用的纯数字计数器：从 0 冲到目标值，千分位格式化，不带上移。
>
> 来源 `10 §4` ｜ 分类 **H · 开场装饰** ｜ 组件 `CounterRoll` ｜ 建议时长 24~48 帧

## 1. 它是什么，不是什么

开场装饰用的纯数字计数器：从 0 冲到目标值，千分位格式化，不带上移。

**不是**：装饰特效，不承担口径交代；需要口径走 context-then-value。

## 2. 触发词与时机

- **触发词**：数据、成绩、规模
- **时序**：frame 0 或主题词处起滚 36 帧；可与 HUD、代码雨叠加。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

大号等宽数字；不占字幕区。

## 4. 原生动作（菜单，按需取用）

- **滚动＝数字在增长**｜适合：开场冲击
- **千分位＝可读性**｜适合：大数
- **滚完停稳＝读数**｜适合：核心指标

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <CounterRoll to={59200} local={local} delay={at(0)} format="comma" />
2. 与 number-accent 分工：这里只滚不lift
3. HUD 低透明度，别压数字

```tsx
import { CounterRoll } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<CounterRoll to={59200} local={local} delay={at(0)} style={{fontSize:96}} />
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 数字无来源
- 滚动与口播错位
- 与大号标题叠在同一区

## 7. 变化空间（同一效果的不同用法）

- 规模数字
- 时间数字
- 计数数字

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
