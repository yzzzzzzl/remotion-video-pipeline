import React from "react";
import { interpolate, Easing } from "remotion";

/* ============================================================
   MotionKit.tsx — remotion-video-pipeline 动效库核心代码

   自包含：只依赖 react + remotion，不需要 Chrome.tsx 或其他本地文件。
   31 个效果组件与 references/13-motion-library.md 的 M01~M21、
   10-first-15s.md §4 的开场装饰特效一一对应。

   【统一契约】
   - local : 本页内帧号（ShotSequence / OpeningCuts 传给场景的 local）
   - delay : 触发帧，必须来自 at(i)（台词行索引换算），禁止写死秒数
   - 内部 t = local - delay；t < 0 时保持未触发的初始态
   - 禁止内置随机函数：全部用 interpolate / sin(local) 确定性派生
   - 停稳之后保留一个永动小元素（进度条/呼吸光/数据轨）避免铁律四违规
   - 不引入新 npm 依赖；只写 Remotion 内置 API + 原生 CSS / SVG

   【用法】拷进 remotion-project/src/components/，与场景组件同级：
     import { SweepHighlight, NumberAccent, HUDLayer } from "./MotionKit";
   ============================================================ */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** t = local - delay，负值表示尚未触发 */
export const tOf = (local: number, delay: number) => local - delay;

/** 0→1 进度，默认 cubic ease-out；所有组件的时间换算入口 */
export const prog = (
  local: number,
  delay: number,
  duration: number,
  easing: (t: number) => number = Easing.out(Easing.cubic)
) =>
  interpolate(tOf(local, delay), [0, duration], [0, 1], {
    ...CLAMP,
    easing,
  });

/** popIn 的样式化包装：上滑 + 微缩放 + 淡入 */
export const popStyle = (
  local: number,
  delay: number,
  distance = 18
): React.CSSProperties => {
  const p = prog(local, delay, 12);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px) scale(${0.94 + 0.06 * p})`,
  };
};

/** 结果停稳：进场淡入 + 退场淡出，返回 0~1 opacity */
export const holdOpacity = (
  local: number,
  len: number,
  fadeIn = 10,
  fadeOut = 12
) =>
  Math.min(
    interpolate(local, [0, fadeIn], [0, 1], CLAMP),
    interpolate(local, [len - fadeOut, len], [1, 0], CLAMP)
  );

/** 千分位格式化（数字类效果共用） */
export const fmt = (n: number, mode: "int" | "comma" = "comma") => {
  const v = Math.round(n).toString();
  return mode === "comma" ? v.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : v;
};

/* ============================================================
   A · 开场钩子（M01~M04）
   ============================================================ */

/** M01 前后景大字遮挡：后景大字 + 前景元素晚 4 帧压住一角 */
export const ForeBackTitle: React.FC<{
  back: React.ReactNode;
  front?: React.ReactNode;
  local: number;
  delay: number;
  height?: number;
  frontDelay?: number;
  style?: React.CSSProperties;
}> = ({ back, front, local, delay, height = 420, frontDelay = 4, style }) => {
  const p = prog(local, delay, 16);
  const inset = (1 - p) * 18;
  return (
    <div style={{ position: "relative", height, overflow: "hidden", ...style }}>
      <div
        style={{
          fontSize: 128,
          fontWeight: 800,
          lineHeight: 1.05,
          opacity: p,
          clipPath: `inset(0 ${inset}% 0 ${inset}%)`,
        }}
      >
        {back}
      </div>
      {front ? (
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 12,
            ...popStyle(local, delay + frontDelay, 24),
          }}
        >
          {front}
        </div>
      ) : null}
    </div>
  );
};

/** M02 真实成果首帧：首帧铺真结果，frame 0 就缓推近 */
export const ResultFirstFrame: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, local, delay, color = "#6FE3D2", style }) => {
  const scale = 1 + prog(local, delay, 90, (t) => t) * 0.04;
  const p = popStyle(local, delay, 10);
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        border: `1px solid ${color}`,
        boxShadow: `0 0 40px ${color}33`,
        opacity: p.opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** M03 / M16 数字重音：滚动到目标值并短距上移停稳 */
export const NumberAccent: React.FC<{
  to: number;
  local: number;
  delay: number;
  from?: number;
  duration?: number;
  format?: "int" | "comma";
  color?: string;
  style?: React.CSSProperties;
}> = ({
  to,
  local,
  delay,
  from = 0,
  duration = 30,
  format = "comma",
  color,
  style,
}) => {
  const p = prog(local, delay, duration);
  const lift = interpolate(p, [0, 1], [0, -32], CLAMP);
  return (
    <span
      style={{
        display: "inline-block",
        fontVariantNumeric: "tabular-nums",
        transform: `translateY(${lift}px)`,
        opacity: p,
        color,
        ...style,
      }}
    >
      {fmt(from + (to - from) * p, format)}
    </span>
  );
};

/** M04 逐格点亮预告：N 个占位格按 gap 帧逐格亮 */
export const PulseCells: React.FC<{
  count: number;
  local: number;
  delay: number;
  gap?: number;
  size?: number;
  color?: string;
  dim?: string;
  style?: React.CSSProperties;
}> = ({
  count,
  local,
  delay,
  gap = 4,
  size = 16,
  color = "#6FE3D2",
  dim = "#334155",
  style,
}) => (
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
            background: on ? color : dim,
            boxShadow: on ? `0 0 12px ${color}` : "none",
          }}
        />
      );
    })}
  </div>
);

/* ============================================================
   B · 文字强调（M05~M07）
   ============================================================ */

/** M05 重点词扫入：词底半透明色块从左扫出，不遮字 */
export const SweepHighlight: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  local,
  delay,
  duration = 12,
  color = "rgba(34,211,238,0.28)",
  style,
}) => {
  const p = prog(local, delay, duration);
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

/** M06 一笔引线：折线一笔画出，终点停在主图边缘 */
export const LeaderLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  strokeWidth?: number;
}> = ({
  x1,
  y1,
  x2,
  y2,
  local,
  delay,
  duration = 14,
  color = "#6FE3D2",
  strokeWidth = 2,
}) => {
  const p = prog(local, delay, duration, (t) => t);
  const mid = x1 + (x2 - x1) * 0.55;
  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <path
        d={`M ${x1} ${y1} L ${mid} ${y1} L ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        opacity={tOf(local, delay) < 0 ? 0 : 0.95}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
};

/** M07 几何擦除换版：矩形 clip-path 左→右擦除 + 随帧移动的高亮边 */
export const GeometricWipe: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, local, delay, duration = 14, color = "#6FE3D2", style }) => {
  const p = prog(local, delay, duration, (t) => t);
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>{children}</div>
      {p > 0 && p < 1 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${p * 100}%`,
            width: 2,
            background: color,
            boxShadow: `0 0 18px ${color}`,
          }}
        />
      ) : null}
    </div>
  );
};

/* ============================================================
   C · 过程演示（M08~M12）
   ============================================================ */

/** M08 双路汇入再展开：左右两路汇入中央 → 翻页 → 逐项立起 */
export const DualMerge: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  result: React.ReactNode;
  local: number;
  delay: number;
  resultDelay?: number;
  width?: number;
}> = ({ left, right, result, local, delay, resultDelay = 16, width = 900 }) => {
  const p = prog(local, delay, 12);
  const x = (1 - p) * width * 0.32;
  const ang = interpolate(prog(local, delay + resultDelay, 18), [0, 1], [80, 0], CLAMP);
  return (
    <div style={{ position: "relative", width, height: 420 }}>
      <div style={{ position: "absolute", left: x, top: 80, opacity: p }}>{left}</div>
      <div style={{ position: "absolute", right: x, top: 80, opacity: p }}>{right}</div>
      <div
        style={{
          position: "absolute",
          inset: 100,
          transform: `perspective(900px) rotateX(${ang}deg)`,
          opacity: prog(local, delay + resultDelay, 8),
        }}
      >
        {result}
      </div>
    </div>
  );
};

/** M09 走线流动 + 支路高亮：小块沿线进目标；active=false 压暗该支路 */
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
  active?: boolean;
}> = ({
  x1,
  y1,
  x2,
  y2,
  local,
  delay,
  count = 4,
  duration = 30,
  color = "#6FE3D2",
  size = 12,
  active = true,
}) => {
  const t = tOf(local, delay);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const p = interpolate(t - i * 3, [0, duration], [0, 1], CLAMP);
        if (p <= 0 || p >= 1) return null;
        return (
          <rect
            key={i}
            x={x1 + (x2 - x1) * p - size / 2}
            y={y1 + (y2 - y1) * p - size / 2}
            width={size}
            height={size}
            rx={3}
            fill={color}
            opacity={active ? 0.95 : 0.28}
          />
        );
      })}
    </>
  );
};

/** M10 逐段连线：多条 SVG path 依次一笔画出（pathLength 归一化，免算长度） */
export const DrawPath: React.FC<{
  paths: string[];
  local: number;
  delay: number;
  gap?: number;
  duration?: number;
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}> = ({
  paths,
  local,
  delay,
  gap = 10,
  duration = 12,
  color = "#6FE3D2",
  width = 900,
  height = 420,
  strokeWidth = 2,
}) => (
  <svg width={width} height={height}>
    {paths.map((d, i) => {
      const p = prog(local, delay + i * gap, duration, (t) => t);
      return (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          opacity={p > 0 ? 0.95 : 0}
        />
      );
    })}
  </svg>
);

/** M11 拖动产生变化：对象沿可见路径位移，随后重连 */
export const DragRelink: React.FC<{
  children: React.ReactNode;
  from: { x: number; y: number };
  to: { x: number; y: number };
  local: number;
  delay: number;
  duration?: number;
  guideColor?: string;
}> = ({ children, from, to, local, delay, duration = 16, guideColor = "#6FE3D2" }) => {
  const p = prog(local, delay, duration);
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          border: `1px dashed ${guideColor}66`,
          position: "absolute",
          left: from.x,
          top: from.y,
          width: Math.abs(to.x - from.x) || 2,
          height: Math.abs(to.y - from.y) || 2,
          opacity: p > 0 && p < 1 ? 0.8 : 0,
        }}
      />
      <div style={{ transform: `translate(${x}px, ${y}px)` }}>{children}</div>
    </div>
  );
};

/** M12 扫描分区识别：扫描线下移 + 遇区域留定位框 */
export const ScanZones: React.FC<{
  local: number;
  delay: number;
  from: number;
  to: number;
  duration?: number;
  width?: number;
  color?: string;
  zones: { top: number; left: number; width: number; height: number; at: number }[];
}> = ({ local, delay, from, to, duration = 60, width = 900, color = "#6FE3D2", zones }) => {
  const t = tOf(local, delay);
  const y = interpolate(t, [0, duration], [from, to], CLAMP);
  return (
    <div style={{ position: "relative", width, height: to + 40 }}>
      {t >= 0 && t <= duration + 12 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            boxShadow: `0 0 16px ${color}`,
          }}
        />
      ) : null}
      {zones.map((z, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: z.top,
            left: z.left,
            width: z.width,
            height: z.height,
            border: `2px solid ${color}`,
            ...popStyle(local, delay + z.at, 8),
          }}
        />
      ))}
    </div>
  );
};

/* ============================================================
   D · 操作演示（M13~M15）
   ============================================================ */

/** M13 界面流程演示：窗口位置不动，内部按台词锚点逐段揭示 */
export const UIFlow: React.FC<{
  steps: React.ReactNode[];
  delays: number[];
  local: number;
  width?: number;
  title?: string;
  color?: string;
}> = ({ steps, delays, local, width = 860, title = "APP", color = "#6FE3D2" }) => (
  <div
    style={{
      width,
      border: `1px solid ${color}66`,
      background: "rgba(10,14,20,0.92)",
      borderRadius: 12,
      padding: 24,
    }}
  >
    <div style={{ color, fontSize: 20, letterSpacing: 2, marginBottom: 18 }}>{title}</div>
    {steps.map((step, i) => (
      <div key={i} style={{ ...popStyle(local, delays[i] ?? 0, 12), marginBottom: 14 }}>
        {step}
      </div>
    ))}
  </div>
);

/** M14 打字机 + 复制粘贴：逐字输入，完成后副本滑出 */
export const TypewriterCopy: React.FC<{
  text: string;
  local: number;
  delay: number;
  perChar?: number;
  color?: string;
}> = ({ text, local, delay, perChar = 3, color = "#6FE3D2" }) => {
  const t = tOf(local, delay);
  const chars = [...text];
  const shown = Math.max(0, Math.min(chars.length, Math.floor(t / perChar)));
  const done = shown >= chars.length;
  const copy = prog(local, delay + chars.length * perChar + 6, 14);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ color }}>
        {chars.slice(0, shown).join("")}
        {!done && Math.sin(local / 5) > -0.2 ? "▍" : null}
      </div>
      {done ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 40,
            opacity: copy,
            transform: `translateX(${copy * 60}px)`,
            border: `1px solid ${color}`,
            padding: "6px 12px",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};

/** M15 播放头扫画格：播放头横扫，已扫过的画格高亮 */
export const PlayheadFrames: React.FC<{
  count: number;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  frameWidth?: number;
}> = ({ count, local, delay, duration = 60, color = "#6FE3D2", frameWidth = 96 }) => {
  const p = prog(local, delay, duration, (t) => t);
  return (
    <div style={{ position: "relative", display: "flex", gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            width: frameWidth,
            height: 54,
            border: `2px solid ${i <= Math.floor(p * count) ? color : "#334155"}`,
            background: i <= Math.floor(p * count) ? `${color}22` : "#0f172a",
            borderRadius: 4,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: -6,
          bottom: -6,
          left: p * (count * (frameWidth + 8) - 8),
          width: 2,
          background: color,
          boxShadow: `0 0 14px ${color}`,
        }}
      />
    </div>
  );
};

/* ============================================================
   E · 数据揭示（M16~M17）
   ============================================================ */

/** M16 先口径后揭值：日期→对象→单位→主数字，逐段进；数字停稳 ≥30 帧 */
export const ContextThenValue: React.FC<{
  parts: string[];
  value: string;
  local: number;
  delay: number;
  gap?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ parts, value, local, delay, gap = 8, color = "#6FE3D2", style }) => (
  <div style={style}>
    {parts.map((part, i) => (
      <div key={i} style={{ ...popStyle(local, delay + i * gap, 10), fontSize: 24, opacity: 0.7 }}>
        {part}
      </div>
    ))}
    <div
      style={{
        ...popStyle(local, delay + parts.length * gap, 26),
        fontSize: 96,
        fontWeight: 800,
        color,
      }}
    >
      {value}
    </div>
  </div>
);

/** M17 逐条打勾 + 趋势逐点：勾选按序亮，趋势线复用已出现的数据 */
export const ChecklistTrend: React.FC<{
  items: string[];
  local: number;
  delay: number;
  gap?: number;
  trendPath?: string;
  color?: string;
}> = ({ items, local, delay, gap = 8, trendPath, color = "#6FE3D2" }) => (
  <div>
    {items.map((item, i) => {
      const on = tOf(local, delay + i * gap) >= 0;
      return (
        <div key={i} style={{ display: "flex", gap: 12, fontSize: 28, opacity: on ? 1 : 0.25, marginBottom: 8 }}>
          <span style={{ color: on ? color : "#334155" }}>{on ? "✓" : "□"}</span>
          <span>{item}</span>
        </div>
      );
    })}
    {trendPath ? (
      <svg width={900} height={200}>
        <path
          d={trendPath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - prog(local, delay + items.length * gap, 24, (t) => t)}
        />
      </svg>
    ) : null}
  </div>
);

/* ============================================================
   F · 对比合流（M18~M20）
   ============================================================ */

/** M18 分路并行 + 结果合流：两条轨道各自推进，末尾连到确认卡 */
export const ParallelMerge: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  result: React.ReactNode;
  local: number;
  delay: number;
  mergeDelay?: number;
  color?: string;
}> = ({ left, right, result, local, delay, mergeDelay = 24, color = "#6FE3D2" }) => {
  const p = prog(local, delay, 40, (t) => t);
  return (
    <div style={{ position: "relative", width: 900, height: 420 }}>
      <div style={{ position: "absolute", left: 40, top: 60, opacity: p }}>{left}</div>
      <div style={{ position: "absolute", right: 40, top: 210, opacity: p }}>{right}</div>
      <div
        style={{
          position: "absolute",
          left: 450,
          bottom: 20,
          transform: "translateX(-50%)",
          border: `1px solid ${color}`,
          padding: "12px 24px",
          ...popStyle(local, delay + mergeDelay, 16),
        }}
      >
        {result}
      </div>
    </div>
  );
};

/** M19 双页展开 / 版式对照：两卡并排错峰立起，rotateY 从 ±18° 归零 */
export const SpreadPages: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  local: number;
  delay: number;
  gap?: number;
}> = ({ left, right, local, delay, gap = 6 }) => {
  const a = prog(local, delay, 18);
  const b = prog(local, delay + gap, 18);
  return (
    <div style={{ display: "flex", gap: 32 }}>
      <div style={{ transform: `perspective(1000px) rotateY(${(1 - a) * -18}deg)`, opacity: a }}>{left}</div>
      <div style={{ transform: `perspective(1000px) rotateY(${(1 - b) * 18}deg)`, opacity: b }}>{right}</div>
    </div>
  );
};

/** M20 多图接力换位：沿横轴错峰滑入，重点张停中间 */
export const ImageRelay: React.FC<{
  items: React.ReactNode[];
  local: number;
  delay: number;
  gap?: number;
  focusIndex?: number;
}> = ({ items, local, delay, gap = 8, focusIndex = 0 }) => (
  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
    {items.map((item, i) => {
      const p = prog(local, delay + i * gap, 12);
      const focus = i === focusIndex;
      return (
        <div
          key={i}
          style={{
            opacity: p,
            transform: `translateX(${(1 - p) * 160}px) scale(${focus ? 1.08 : 1})`,
            zIndex: focus ? 3 : 1,
          }}
        >
          {item}
        </div>
      );
    })}
  </div>
);

/* ============================================================
   G · 收尾（M21）
   ============================================================ */

/** M21 结果停稳：进场 + 至少 1s 停稳 + 退场；停稳期另挂永动小元素 */
export const ResultHold: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  len: number;
  style?: React.CSSProperties;
}> = ({ children, local, delay, len, style }) => (
  <div
    style={{
      ...popStyle(local, delay, 18),
      opacity: Math.min(popStyle(local, delay).opacity ?? 1, holdOpacity(local, len)),
      ...style,
    }}
  >
    {children}
  </div>
);

/* ============================================================
   H · 开场装饰特效（10-first-15s.md §4）
   ============================================================ */

/** 数字滚动计数：纯计数器，无上移；适合数据/成绩/规模开场 */
export const CounterRoll: React.FC<{
  to: number;
  local: number;
  delay: number;
  duration?: number;
  format?: "int" | "comma";
  color?: string;
  style?: React.CSSProperties;
}> = ({ to, local, delay, duration = 36, format = "comma", color, style }) => (
  <span
    style={{
      fontVariantNumeric: "tabular-nums",
      color,
      opacity: prog(local, delay, 6),
      ...style,
    }}
  >
    {fmt(to * prog(local, delay, duration), format)}
  </span>
);

/** RGB 故障字：双色偏移 + sin 抖动，确定性 */
export const RGBGlitch: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  colorA?: string;
  colorB?: string;
  style?: React.CSSProperties;
}> = ({ children, local, delay, colorA = "#ff4d6d", colorB = "#22d3ee", style }) => {
  const on = tOf(local, delay) >= 0;
  const dx = on ? Math.sin(local * 1.9) * 3 : 0;
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ position: "absolute", left: -dx, color: colorA, opacity: on ? 0.75 : 0 }}>{children}</span>
      <span style={{ position: "absolute", left: dx, color: colorB, opacity: on ? 0.75 : 0 }}>{children}</span>
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

/** 均衡器 / 柱状生长：sin 派生，永不静止 */
export const EqualizerBars: React.FC<{
  count?: number;
  local: number;
  delay: number;
  height?: number;
  barWidth?: number;
  color?: string;
}> = ({ count = 26, local, delay, height = 120, barWidth = 10, color = "#6FE3D2" }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
    {Array.from({ length: count }, (_, i) => {
      const h = 26 + Math.abs(Math.sin(local * 0.28 + i * 0.85)) * (height - 26);
      return (
        <div
          key={i}
          style={{
            width: barWidth,
            height: tOf(local, delay) >= 0 ? h : 4,
            background: color,
            opacity: 0.55 + (i % 3) * 0.15,
          }}
        />
      );
    })}
  </div>
);

/** 代码雨 / 十六进制数据轨：确定性 seed，不调用内置随机函数 */
export const CodeRain: React.FC<{
  rows?: number;
  cols?: number;
  local: number;
  delay: number;
  color?: string;
  fontSize?: number;
}> = ({ rows = 12, cols = 24, local, delay, color = "#B6E388", fontSize = 14 }) => {
  const step = Math.floor(local / 3);
  return (
    <div style={{ fontFamily: "monospace", fontSize, lineHeight: 1.35, color, opacity: 0.62 }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r}>
          {Array.from({ length: cols }, (_, c) => {
            const v = (c * 73 + step * 17 + r * 131) % 4096;
            return v.toString(16).padStart(3, "0").slice(0, 2);
          }).join(" ")}
        </div>
      ))}
    </div>
  );
};

/** 终端打字机：逐行逐字，光标 sin 闪烁 */
export const TerminalType: React.FC<{
  lines: string[];
  local: number;
  delay: number;
  perChar?: number;
  color?: string;
}> = ({ lines, local, delay, perChar = 2, color = "#B6E388" }) => {
  const t = tOf(local, delay);
  let cursor = true;
  return (
    <div style={{ fontFamily: "monospace", fontSize: 20, color, lineHeight: 1.6 }}>
      {lines.map((line, i) => {
        const shown = Math.max(0, Math.min(line.length, Math.floor((t - i * 14) / perChar)));
        if (shown < line.length) cursor = false;
        return <div key={i}>{line.slice(0, shown)}</div>;
      })}
      {cursor && Math.sin(local / 5) > -0.2 ? <div>▍</div> : null}
    </div>
  );
};

/** 常驻 HUD 层：L 角标 + REC + 帧号 + 扫描线，低透明度不抢主体 */
export const HUDLayer: React.FC<{
  local: number;
  delay: number;
  label?: string;
  color?: string;
  width?: number;
  height?: number;
}> = ({ local, delay, label = "REC", color = "#6FE3D2", width = 1920, height = 1080 }) => {
  const p = prog(local, delay, 10);
  const bracket = (style: React.CSSProperties) => ({
    position: "absolute" as const,
    width: 36,
    height: 36,
    borderColor: color,
    borderStyle: "solid" as const,
    opacity: 0.45 * p,
    ...style,
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 }}>
      <div style={bracket({ left: 40, top: 40, borderWidth: 2, borderRight: 0, borderBottom: 0 })} />
      <div style={bracket({ right: 40, top: 40, borderWidth: 2, borderLeft: 0, borderBottom: 0 })} />
      <div style={bracket({ left: 40, bottom: 40, borderWidth: 2, borderRight: 0, borderTop: 0 })} />
      <div style={bracket({ right: 40, bottom: 40, borderWidth: 2, borderLeft: 0, borderTop: 0 })} />
      <div style={{ position: "absolute", left: 88, top: 48, color, fontSize: 14, letterSpacing: 3, opacity: 0.6 * p }}>
        {Math.sin(local / 8) > 0 ? "●" : "○"} {label}
      </div>
      <div style={{ position: "absolute", right: 88, bottom: 48, color, fontSize: 14, opacity: 0.6 * p }}>
        F {String(local).padStart(4, "0")} / {width}×{height}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: (local * 9) % height,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.22 * p,
        }}
      />
    </div>
  );
};

/** 全息卡揭示：clipPath 展开 + 渐变光带扫描（产品 / 核心概念） */
export const HoloReveal: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, local, delay, duration = 18, color = "#6FE3D2", style }) => {
  const p = prog(local, delay, duration, (t) => t);
  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      <div style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>{children}</div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${p * 100 - 8}%`,
          width: "16%",
          background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
          opacity: p > 0 && p < 1 ? 1 : 0,
        }}
      />
    </div>
  );
};

/** 删除线 + 印章：破除误区，方框旋转（不用圆） */
export const StrikeStamp: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  stamp?: string;
  color?: string;
}> = ({ children, local, delay, stamp = "FALSE", color = "#ff4d6d" }) => {
  const p = prog(local, delay, 16, (t) => t);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: -6,
          top: "52%",
          height: 7,
          width: `${p * 112}%`,
          background: color,
          boxShadow: `0 0 18px ${color}`,
        }}
      />
      <span
        style={{
          position: "absolute",
          right: -40,
          top: -10,
          border: `3px solid ${color}`,
          color,
          padding: "2px 8px",
          fontSize: 18,
          transform: "rotate(-9deg)",
          opacity: prog(local, delay + 16, 8),
        }}
      >
        {stamp}
      </span>
    </span>
  );
};

/** 节点连线：节点逐个 pop + 边依次一笔画出 */
export const NodeConnect: React.FC<{
  nodes: { x: number; y: number; label?: string }[];
  edges: [number, number][];
  local: number;
  delay: number;
  gap?: number;
  width?: number;
  height?: number;
  color?: string;
}> = ({ nodes, edges, local, delay, gap = 6, width = 900, height = 420, color = "#6FE3D2" }) => (
  <svg width={width} height={height}>
    {edges.map(([a, b], i) => {
      const p = prog(local, delay + i * gap + 2, 10, (t) => t);
      return (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={color}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          opacity={p > 0 ? 0.85 : 0}
        />
      );
    })}
    {nodes.map((n, i) => {
      const p = popStyle(local, delay + i * gap, 8).opacity ?? 0;
      return (
        <g key={i} opacity={p}>
          <rect x={n.x - 9} y={n.y - 9} width={18} height={18} fill={color} rx={3} />
          {n.label ? (
            <text x={n.x + 16} y={n.y + 6} fill="#fff" fontSize={20}>
              {n.label}
            </text>
          ) : null}
        </g>
      );
    })}
  </svg>
);

/** 缓推近 / 书页翻动 / 烫金浮出：人文、书籍、历史类主题三种慢速质感 */
export const SlowPush: React.FC<{
  children: React.ReactNode;
  local: number;
  delay: number;
  mode?: "push" | "flip" | "gild";
  duration?: number;
  color?: string;
}> = ({ children, local, delay, mode = "push", duration = 90, color = "#D4AF37" }) => {
  const p = prog(local, delay, duration, (t) => t);
  if (mode === "flip") {
    return (
      <div style={{ transform: `perspective(1200px) rotateY(${(1 - p) * -22}deg)`, transformOrigin: "left center", opacity: prog(local, delay, 12) }}>
        {children}
      </div>
    );
  }
  if (mode === "gild") {
    return (
      <div style={{ position: "relative", opacity: prog(local, delay, 18) }}>
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(110deg, transparent ${p * 140 - 30}%, ${color}66 ${p * 140}%, transparent ${p * 140 + 30}%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    );
  }
  return <div style={{ transform: `scale(${1 + p * 0.06})` }}>{children}</div>;
};

/* ============================================================
   导出清单（供脚本校验与 agent 检索）
   export const MOTION_KIT_EXPORTS = [...]
   ============================================================ */
export const MOTION_KIT_EXPORTS = [
  "ForeBackTitle", "ResultFirstFrame", "NumberAccent", "PulseCells",
  "SweepHighlight", "LeaderLine", "GeometricWipe",
  "DualMerge", "FlowDots", "DrawPath", "DragRelink", "ScanZones",
  "UIFlow", "TypewriterCopy", "PlayheadFrames",
  "ContextThenValue", "ChecklistTrend",
  "ParallelMerge", "SpreadPages", "ImageRelay",
  "ResultHold",
  "CounterRoll", "RGBGlitch", "EqualizerBars", "CodeRain", "TerminalType",
  "HUDLayer", "HoloReveal", "StrikeStamp", "NodeConnect", "SlowPush",
] as const;
