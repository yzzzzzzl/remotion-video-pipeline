import React from "react";
import { interpolate, Easing } from "remotion";

/* ============================================================
   ShotEngine — 台词行索引驱动的镜头页切换引擎
   从 Scenes.tsx 中抽出的已验证实现，直接拷贝使用。

   用法（每章）:
     import { ShotSequence, ShotDef } from "./ShotEngine";
     const CH1_SHOTS: ShotDef[] = [
       { from: 0, Comp: (p) => <Overview {...p} hl={-1} /> },
       { from: 1, Comp: (p) => <Overview {...p} hl={0} /> },
       { from: 2, Comp: ExplCode },
     ];
     export const Ch1Scene: React.FC<SceneProps> = (p) => (
       <ShotSequence shots={CH1_SHOTS} local={p.local} len={p.len} lines={p.lines} />
     );

   规则见 references/04-shot-design.md:
   - from = 本章内的台词行索引（不是帧）
   - 页时长 = 相邻两页 from 行的 relStart 之差
   - 转场 = 7 帧淡入 + 36px 上滑
   ============================================================ */

export type SceneLine = { text: string; relStart: number; dur: number };
export type SceneProps = {
  local: number;    // 本章内帧号
  len: number;      // 本章帧长
  curLine: number;  // 全局行索引（可选使用）
  lines: SceneLine[]; // 本章的行（Video.tsx 已过滤并换算 relStart）
};
export type ShotProps = {
  local: number;
  len: number;
  /**
   * 铁律三：查字幕，不估。
   * at(i) = 本章第 i 句台词在本页内的帧偏移（0 = 本页起始帧）。
   * 用法: <div style={popIn(local, at(3) + 4)}>…</div>
   * 禁止在组件里拍常数 delay（除非该页只覆盖一句且已核对）。
   */
  at: (chapterLineIdx: number) => number;
};
export type ShotDef = { from: number; Comp: React.FC<ShotProps> };

const shotTransition = (local: number, len: number) => {
  const fadeIn = interpolate(local, [0, 7], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(local, [len - 6, len], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return {
    opacity: Math.min(fadeIn, fadeOut),
    ty: interpolate(local, [0, 10], [36, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  };
};

const Fill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children, style,
}) => (
  <div style={{ position: "absolute", inset: 0, ...style }}>{children}</div>
);

export const ShotSequence: React.FC<{
  shots: ShotDef[];
  local: number;
  len: number;
  lines: SceneLine[];
}> = ({ shots, local, len, lines }) => {
  // 当前说到本章第几行
  let relLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].relStart <= local) relLine = i;
  }
  // 选镜头（from <= 当前行 的最后一个）
  let idx = 0;
  for (let i = 0; i < shots.length; i++) {
    if (shots[i].from <= relLine) idx = i;
  }
  const shot = shots[idx];
  const shotStart = lines[Math.min(shot.from, lines.length - 1)]?.relStart ?? 0;
  const nextFrom = shots[idx + 1]?.from;
  const shotEnd =
    nextFrom !== undefined
      ? lines[Math.min(nextFrom, lines.length - 1)]?.relStart ?? len
      : len;
  const Comp = shot.Comp;
  const sl = local - shotStart;
  const slLen = Math.max(1, shotEnd - shotStart);

  // 铁律三：把「本章第 i 句」映射到「本页内帧偏移」
  const at = (i: number) => {
    const idxLine = Math.min(Math.max(0, i), Math.max(0, lines.length - 1));
    const rel = lines[idxLine]?.relStart ?? 0;
    return Math.max(0, rel - shotStart);
  };

  const tr = shotTransition(sl, slLen);
  return (
    <Fill style={{ opacity: tr.opacity, transform: `translateY(${tr.ty}px)` }}>
      <Comp local={sl} len={slLen} at={at} />
    </Fill>
  );
};
