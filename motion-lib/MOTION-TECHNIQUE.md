# MOTION-TECHNIQUE.md — 实现契约与质检

> 阶段 5 搭画面、阶段 6 抽帧质检时查。本文件只讲**怎么把动效写对**；选哪个效果看 `MOTION-DIRECTOR.md`。

## 1. 把库拷进项目

```bash
cp "<motion-lib>/core/MotionKit.tsx" <workdir>/remotion-project/src/components/
```

与 `Chrome.tsx`、`ShotEngine.tsx`、`Opening.tsx` 同级。**不需要 `npm install`**：库只用 `react` + `remotion` 内置 API + 原生 CSS / SVG。

```tsx
import { SweepHighlight, NumberAccent, HUDLayer } from "./MotionKit";
```

## 2. 帧参数契约（最重要）

| 参数 | 来源 | 禁止 |
|---|---|---|
| `local` | `ShotSequence` / 开场页传给场景的本页帧号 | 用 `useCurrentFrame()` 当本页帧（跨页会错） |
| `delay` | `at(i)`：本章第 i 句台词在本页的帧偏移，从 `timeline.json` 换算 | 写死 40、1.2s 这类常数 |
| `len` | 本页总帧数 | 估一个大概值 |

组件内部 `t = local - delay`；`t < 0` 时必须保持未触发态。所有效果都按这个契约写好了，调用方只要传对 `delay`。

`at(i)` 的典型实现（在场景组件里）：

```ts
const at = (i: number) => lineStartFrame(i) - shotStartFrame; // 都从 timeline.json 查
```

## 3. 确定性（Remotion 的硬约束）

- **禁用 `Math.random()`**：Remotion 逐帧独立渲染，随机序列会让画面每帧抖。
- 需要「随机感」时用：`Math.sin(local / k + i * phase)`、`Math.floor(local / n)`、`(i * 73 + step * 17 + r * 131) % M`。
- `CodeRain`、`EqualizerBars`、`RGBGlitch` 已经按确定性实现，直接抄公式即可。
- 所有进度统一走 `prog(local, delay, duration, easing)`，默认 `Easing.out(Easing.cubic)`。

## 4. 视觉与安全区

- 横屏 1920×1080 @30fps 默认；竖屏只在用户明确要求时改，坐标换算见 `../references/10-first-15s.md` §10。
- 装饰行放在字幕条**上方**空隙，不压：底部字幕条、右上声波头像、右下帧计数器、左上章节标签。
- HUD 透明度 0.3~0.6、`pointerEvents:none`；HUD 里的装饰小字计入「一屏 ≤5 个文字元素」。
- 不用大圆环 / 圆圈当画面正中装饰；用 L 形角标、方括号、终端框、卡片描边。
- SVG 连线统一 `pathLength={1}` + `strokeDasharray={1}` + `strokeDashoffset={1-p}`，免算路径长度。

## 5. 先定版再动画

1. 新页面先做静态帧：`npx remotion still src/index.ts MyComp out/still.png --frame=<n>`，看排版不溢出。
2. 再上动效；每页抽三帧检查，最后才全片渲染。
3. 不要一上来就全片渲染试错——全流程约 6× 实时，代码雨 + HUD 会更慢。

## 6. 质检：三帧抽查（用了动效库的页必做）

| 抽帧 | 期望 |
|---|---|
| 动作起点**前 1 帧** | 元素尚未出现（或仍是初始态） |
| 起点**后 2 帧** | 正在进场，不是已经铺满 |
| **结果停稳帧** | 可读、无重叠、无溢出；停稳 ≥1s 且有永动小元素 |

追加检查：

- [ ] 一屏文字块 ≤3~4，完整句子只进字幕条
- [ ] 特效确定性：同一帧渲染两次像素一致
- [ ] 音效（如有）压 0.2~0.4，不盖 `voiceover.mp3`
- [ ] H 组装饰特效：`frame 450` 后无任何 HUD / REC / 数据轨 / 四角框残留
- [ ] 与 `08-screen-rules.md` 的四条铁律自检卡、`10-first-15s.md` §7 的开头 15 秒自检一起过

## 7. 常见错误与修法

| 症状 | 原因 | 修法 |
|---|---|---|
| 画面每帧抖 | 用了 `Math.random()` | 换 `sin(local/k + i*phase)` 确定性派生 |
| 动作比口播早/晚 | `delay` 拍了常数秒 | 改成 `at(i)`，从 `timeline.json` 查 |
| 元素同帧全铺满 | 一页塞多个主动作 | 每章只留 1 个主动作，其余用 `10` 装饰补密度 |
| 数字滚动跳动 | 字体非等宽 | 用 `fontVariantNumeric: tabular-nums` / `MONO` |
| 连线指向错物 | 终端点坐标写死 | 用主图轮廓坐标，换版式时同步改 |
| 章末残留 HUD | 只在开场页条件渲染没写严 | `frame >= 450` 直接不渲染，切章后抽 1 帧确认 |
| 结果一闪就切走 | 没留停稳帧 | `ResultHold len` 给足 ≥30 帧，并挂永动小元素 |
| 静态截图 + 花字 | 违反铁律四 | 用代码画可交互 mockup，或按 `12` 找真实录屏素材 |

## 8. 自动化校验

```bash
python scripts/validate.py
```

检查项：`effects.json` 字段完整、slug 与目录一一对应、每个组件在 `MOTION_KIT_EXPORTS` 中存在、`MotionKit.tsx` 无 `Math.random()`、三件套（MOTION.md / motion.json / demo.tsx）齐全、`INDEX.md` 为最新生成。
