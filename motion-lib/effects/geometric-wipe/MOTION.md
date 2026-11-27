# Geometric Wipe Swap — 几何擦除换版 · Motion Prompt

> 转折词或日期出现时，用矩形 clip-path 从左到右把旧底图换成新标题，擦除边缘留一条高亮线。
>
> 来源 `M07` ｜ 分类 **B · 文字强调** ｜ 组件 `GeometricWipe` ｜ 建议时长 12~20 帧

## 1. 它是什么，不是什么

转折词或日期出现时，用矩形 clip-path 从左到右把旧底图换成新标题，擦除边缘留一条高亮线。

**不是**：不是硬切；擦除过程中不要在两层堆文字，否则读成乱码。

## 2. 触发词与时机

- **触发词**：其实、但是、日期/年份
- **时序**：转折词发声帧起擦除 14 帧；擦完停稳 ≥1s。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

新层 clipPath inset(0 (1-p)*100% 0 0)；边缘 2px 高亮线随 p 移动。

## 4. 原生动作（菜单，按需取用）

- **擦除＝版式切换**｜适合：前后对比、时间跳转
- **边缘高亮＝擦除轨迹**｜适合：科技/系统感主题
- **换完停稳＝阅读时间**｜适合：新标题

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <GeometricWipe local={local} delay={at(3)}>新标题</GeometricWipe>
2. p 用线性 easing 保持擦除匀速
3. 旧层在同帧之后卸载

```tsx
import { GeometricWipe } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<GeometricWipe local={local} delay={at(0)}><div style={{fontSize:80}}>其实不是这样</div></GeometricWipe>
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 两层文字重叠可读成乱码
- 擦除方向来回跳
- 擦完不停稳

## 7. 变化空间（同一效果的不同用法）

- 左→右擦除
- 上→下擦除
- 从中心向两侧擦除

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
