# Terminal Typing — 终端打字机 · Motion Prompt

> 按 pctOf(local, start) 逐行逐字显示终端内容，光标 sin 闪烁。
>
> 来源 `10 §4` ｜ 分类 **H · 开场装饰** ｜ 组件 `TerminalType` ｜ 建议时长 30~90 帧

## 1. 它是什么，不是什么

按 pctOf(local, start) 逐行逐字显示终端内容，光标 sin 闪烁。

**不是**：不是一次性铺出全部命令行；要有打字过程。

## 2. 触发词与时机

- **触发词**：工具、教程、命令行
- **时序**：每行间隔 14 帧，每字 2 帧；最后一行打完后光标继续闪。
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

终端框 + 等宽绿字；不压字幕条。

## 4. 原生动作（菜单，按需取用）

- **逐字输入＝真实操作**｜适合：命令、配置
- **光标闪烁＝仍在运行**｜适合：停留期
- **逐行推进＝过程感**｜适合：步骤讲解

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

1. <TerminalType lines={['npm i remotion','npx remotion studio']} local={local} delay={at(0)} />
2. 逐行起点用 at(i)，不拍常数
3. 与 typewriter-copy 分工：这里是装饰背景

```tsx
import { TerminalType } from "./MotionKit";
// local = 本页内帧号；delay = at(i)
<TerminalType lines={['npm i remotion','npx remotion studio']} local={local} delay={at(0)} />
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

- 全部行一次出现
- 命令行内容太长
- 终端框压住字幕

## 7. 变化空间（同一效果的不同用法）

- 安装命令
- 运行日志
- 配置片段

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
