import React from "react";
import { interpolate, Easing } from "remotion";
import { C, FONT, MONO, popIn } from "./Chrome";

/* ============================================================
   Motion.primitives.tsx — 讲解型动效原语库（配套 references/13-motion-library.md）
   把「口播词触发的语义动作」做成可直接 import 的组件。

   【用法】拷进 src/components/，与 Chrome.tsx 同级。
     import { StaggerList, ScanLine, Typewriter, ... } from "./Motion.primitives";
   每个原语统一收两个帧参数：
     local = 本页内帧号（ShotSequence / OpeningCuts 传给场景组件的那个 local）
     delay = 触发帧，传 at(i)（本章第 i 句台词在本页的帧偏移，见铁律三）
   内部 t = local - delay；t < 0 时保持初始态（元素未出现），绝不拍全局常数。

   【实现铁律】（与 10-first-15s.md §4 / 13 §0 一致）
   - 禁 Math.random()：全部用 interpolate / sin(local) 确定性派生
   - 不引入新依赖：只用 Remotion 内置 API + 原生 CSS / SVG
   - 进场单位是元素不是页面；一屏 ≤3~4 个文字块（13 模式卡已写死）
   - delay 一律由 at(i) 换算，禁止在组件里写死秒数
   - 数字/走线/打字都停在"结果"，停稳期另挂一个永动小元素（见 10 §4）
   ============================================================ */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** popIn → CSSProperties（Chrome.tsx 只导出 popIn，这里补一个样式化包装） */
export const popStyle = (
  local: number,
  delay: number
): React.CSSProperties => {
  const p = popIn(local, delay);
  return {
    opacity: p.opacity,
    transform: `translateY(${p.translateY}px) scale(${p.scale})`,
  };
};

/** t = local - delay，统一入口，负值表示尚未触发 */
const tOf = (local: number, delay: number) => local - delay;

/* ------------------------------------------------------------
   1. StaggerList — 逐项进场 / 逐格点亮（M04 / M06 / M17）
   连续列举按说的顺序逐项出现；点亮色用 C.cyan，未亮用 cardBorder。
   ------------------------------------------------------------ */
export const StaggerList: React.FC<{
  items: React.ReactNode[];
  local: number;
  delay: number;
  gap?: number; // 每项间隔帧，默认 5
  direction?: "up" | "right";
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}> = ({ items, local, delay, gap = 5, direction = "up", style, itemStyle }) => (
  <div
    style={{
      display: "flex",
      flexDirection: direction === "up" ? "column" : "row",
      gap: direction === "up" ? 18 : 22,
      ...style,
    }}
  >
    {items.map((item, i) => (
      <div key={i} style={{ ...popStyle(local, delay + i * gap), ...itemStyle }}>
        {item}
      </div>
    ))}
  </div>
);

/** 逐格点亮的小方块（M04 逐格预告）：比 StaggerList 更轻，只亮不进场 */
export const PulseCells: React.FC<{
  count: number;
  local: number;
  delay: number;
  gap?: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ count, local, delay, gap = 4, size = 16, color = C.cyan, style }) => (
  <div style={{ display: "flex", gap: 10, ...style }}>
    {Array.from({ length: count }, (_, i) => {
      const on = tOf(local, delay + i * gap) >= 0;
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 4,
            background: on ? color : C.cardBorder,
            boxShadow: on ? `0 0 12px ${color}` : "none",
          }}
        />
      );
    })}
  </div>
);

/* ------------------------------------------------------------
   2. ScanLine — 扫描线（M12 扫描分区识别）
   窄线随语音从上到下移动；从 from 到 to 按 duration 帧走完。
   ------------------------------------------------------------ */
export const ScanLine: React.FC<{
  local: number;
  delay: number;
  from: number; // 起始 y（px）
  to: number; // 结束 y（px）
  width?: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  local,
  delay,
  from,
  to,
  width = 900,
  duration = 60,
  color = C.cyan,
  style,
}) => {
  const t = tOf(local, delay);
  const y = interpolate(t, [0, duration], [from, to], clamp);
  const visible = t >= 0 && t <= duration + 12;
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        top: y,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 16px ${color}`,
        ...style,
      }}
    />
  );
};

/* ------------------------------------------------------------
   3. FlowLine — 走线 / 连线生长（M09 / M10 / M18 合流）
   SVG line + dashoffset 实现「一笔画出」；direction=rev 则反向收回（断线）。
   ------------------------------------------------------------ */
export const FlowLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  retract?: boolean; // true = 从完整到消失（断线，M10/M34）
}> = ({
  x1,
  y1,
  x2,
  y2,
  local,
  delay,
  duration = 12,
  color = C.cyan,
  strokeWidth = 2,
  dashed = false,
  retract = false,
}) => {
  const t = tOf(local, delay);
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const p = interpolate(t, [0, duration], [0, 1], clamp);
  const grow = retract ? 1 - p : p;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "8 8" : len}
      strokeDashoffset={dashed ? 0 : len * (1 - grow)}
      opacity={t < 0 ? 0 : 0.9}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
  );
};

/* ------------------------------------------------------------
   4. FlowDots — 小块沿走线流动（M09 数据流 / 分流）
   在两点之间按 t 运动的小块，可选并行路线的 offset。
   ------------------------------------------------------------ */
export const FlowDots: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  local: number;
  delay: number;
  count?: number;
  duration?: number;
  color?: string;
  size?: number;
  active?: boolean; // false = 支路未选中，压暗（M09 支路高亮）
}> = ({
  x1,
  y1,
  x2,
  y2,
  local,
  delay,
  count = 4,
  duration = 30,
  color = C.cyan,
  size = 12,
  active = true,
}) => {
  const t = tOf(local, delay);
  const opacity = active ? 0.95 : 0.28;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const p = interpolate(t - i * 3, [0, duration], [0, 1], clamp);
        if (p <= 0 || p >= 1) return null;
        const x = x1 + (x2 - x1) * p;
        const y = y1 + (y2 - y1) * p;
        return (
          <rect
            key={i}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            rx={3}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------
   5. Typewriter — 打字机（M14 打字 / 便笺复制粘贴）
   逐字出现，尾部光标 sin 闪烁；停在完整文本（结果停稳）。
   ------------------------------------------------------------ */
export const Typewriter: React.FC<{
  text: string;
  local: number;
  delay: number;
  perChar?: number; // 每字帧数，默认 3
  showCursor?: boolean;
  style?: React.CSSProperties;
}> = ({ text, local, delay, perChar = 3, showCursor = true, style }) => {
  const t = tOf(local, delay);
  const chars = [...text];
  const shown = Math.max(
    0,
    Math.min(chars.length, Math.floor(t / perChar))
  );
  const cursorOn = showCursor && shown < chars.length && Math.sin(local / 5) > -0.2;
  return (
    <span style={{ fontFamily: FONT, ...style }}>
      {chars.slice(0, shown).join("")}
      {cursorOn ? <span style={{ opacity: 0.8 }}>▍</span> : null}
    </span>
  );
};

/* ------------------------------------------------------------
   6. NumberRoll — 数字滚动（M03 / M16 揭值）
   从 0（或 from）冲到 to，Easing.out 收尾；comma 千分位。
   ------------------------------------------------------------ */
export const NumberRoll: React.FC<{
  to: number;
  local: number;
  delay: number;
  from?: number;
  duration?: number;
  format?: "int" | "comma";
  style?: React.CSSProperties;
}> = ({ to, local, delay, from = 0, duration = 30, format = "int", style }) => {
  const t = tOf(local, delay);
  const val = interpolate(t, [0, duration], [from, to], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const n = Math.round(val);
  const text =
    format === "comma"
      ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : n.toString();
  return <span style={{ fontFamily: MONO, ...style }}>{text}</span>;
};

/* ------------------------------------------------------------
   7. StrikeThrough — 划掉否定 / 删除线（M01 破误区 / Opening OpBreak）
   一条随 t 从左到右增长的删除线，盖在 children 上。
   ------------------------------------------------------------ */
export const StrikeThrough: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, local, delay, duration = 16, color = C.red, style }) => {
  const t = tOf(local, delay);
  const p = interpolate(t, [0, duration], [0, 1], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: -6,
          top: "52%",
          height: 7,
          width: `${p * 112}%`,
          background: color,
          borderRadius: 4,
          boxShadow: `0 0 18px ${color}`,
        }}
      />
    </span>
  );
};

/* ------------------------------------------------------------
   8. SweepHighlight — 重点词扫入（M05 口播字幕重点词）
   关键词底下一条半透明色块从左扫出；不遮盖文字本身。
   ------------------------------------------------------------ */
export const SweepHighlight: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  color?: string; // 建议用 rgba(34,211,238,0.28) 这类半透明
  style?: React.CSSProperties;
}> = ({ children, local, delay, duration = 12, color = "rgba(34,211,238,0.28)", style }) => {
  const t = tOf(local, delay);
  const p = interpolate(t, [0, duration], [0, 1], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: "0.08em",
          height: "0.9em",
          width: `${p * 100}%`,
          background: color,
          borderRadius: 6,
          zIndex: -1,
        }}
      />
      {children}
    </span>
  );
};

/* ------------------------------------------------------------
   9. FlipCard — 纸面翻页 / 版式对照（M08 展开 / M19 双页）
   rotateY 从 -70° 到 0，transform-origin 在左（书脊侧）。
   ------------------------------------------------------------ */
export const FlipCard: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ children, local, delay, duration = 18, style }) => {
  const t = tOf(local, delay);
  const ang = interpolate(t, [0, duration], [-70, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 6], [0, 1], clamp);
  return (
    <div
      style={{
        transform: `perspective(1000px) rotateY(${ang}deg)`,
        transformOrigin: "left center",
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------
   10. HoldFade — 结果停稳 + 章末淡出（M21 / 呼应 sceneOpacity）
   进场后保持可见 ≥1s，最后 duration 帧淡出。返回一个 opacity 数字，
   由调用方套到容器上；停稳期另挂永动小元素（见 10 §4）。
   ------------------------------------------------------------ */
export const holdOpacity = (
  local: number,
  len: number,
  fadeIn = 10,
  fadeOut = 12
): number => {
  const a = interpolate(local, [0, fadeIn], [0, 1], clamp);
  const b = interpolate(local, [len - fadeOut, len], [1, 0], clamp);
  return Math.min(a, b);
};

/* ------------------------------------------------------------
   11. ResultCard — 结果停稳卡（M21 收尾 / M08 生成结果）
   组合 popIn + holdOpacity：结果落稳后至少停 1 秒再退场。
   ------------------------------------------------------------ */
export const ResultCard: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  len: number;
  style?: React.CSSProperties;
}> = ({ children, local, delay, len, style }) => (
  <div
    style={{
      ...popStyle(local, delay),
      opacity: Math.min(popIn(local, delay).opacity, holdOpacity(local, len)),
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------
   用法示例（写进场景组件，片段）：

   // ch3 六个工具名逐项进场（M04 + M06）
   <StaggerList
     items={TOOLS.map(t => <span style={{fontFamily:FONT}}>{t}</span>)}
     local={local} delay={at(1)} gap={5}
   />

   // 讲扫描时扫描线下移（M12），delay 绑「扫描」那句
   <ScanLine local={local} delay={at(3)} from={140} to={760} duration={60} />

   // 讲数据流时小块沿走线进目标（M09）
   <svg width={900} height={420}>
     <FlowLine x1={80} y1={210} x2={820} y2={210} local={local} delay={at(2)} />
     <FlowDots x1={80} y1={210} x2={820} y2={210} local={local} delay={at(2)} />
   </svg>

   // 讲「写三行 prompt」逐字打出（M14）
   <Typewriter text="节奏要快，字幕放大，金句卡点" local={local} delay={at(4)} />

   // 揭关键数字（M03 / M16）
   <NumberRoll to={59200} local={local} delay={at(5)} format="comma" />

   // 破误区：划掉「难」（破误区，呼应 Opening OpBreak）
   <StrikeThrough local={local} delay={at(1)}>其实不难</StrikeThrough>

   // 收尾金句停稳（M21）
   <ResultCard local={local} delay={at(6)} len={len}>
     难的从来不是工具，是流程
   </ResultCard>

   注意： delay 全部来自 at(i)，不要在组件里写死 local>=40 这类常数。
   抽帧验：发声前 5 帧未出现、发声后 2 帧正在进场（铁律三）。
   ============================================================ */
