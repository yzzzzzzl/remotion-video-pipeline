import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/* ---------- palette ---------- */
export const C = {
  bgDeep: "#0B1526",
  bgLight: "#12233F",
  blue: "#3B82F6",
  blueLight: "#60A5FA",
  cyan: "#22D3EE",
  red: "#EF4444",
  green: "#22C55E",
  amber: "#F59E0B",
  white: "#F4F8FF",
  dim: "#8FA3C4",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(96,165,250,0.28)",
};

export const FONT =
  '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif';
export const MONO = '"Consolas", "Cascadia Code", monospace';

/**
 * 画幅自适应布局：默认横屏 1920×1080（已实测成片坐标），
 * 用户明确要竖屏 1080×1920 时自动切回竖屏坐标（见 10-first-15s.md §10）。
 * 场景组件可 import 本函数对齐安全区，不要在组件里写死字幕条 top。
 */
export const getChromeLayout = (width: number, height: number) => {
  if (width >= height) {
    return {
      landscape: true,
      glowX: width / 2,
      glowY: height / 2,
      glowSize: 1040,
      tagLeft: 70,
      tagTop: 56,
      tagTitleSize: 40,
      avatarRight: 66,
      avatarTop: 48,
      avatarSize: 130,
      avatarBarWidth: 7,
      subLeft: 160,
      subRight: 160,
      subTop: 892,
      subMaxWidth: 1600,
      subFontSize: 50,
      counterRight: 60,
      counterBottom: 34,
      counterFontSize: 22,
      barHeight: 8,
    };
  }
  return {
    landscape: false,
    glowX: width / 2,
    glowY: height * 0.4,
    glowSize: 1000,
    tagLeft: 44,
    tagTop: 92,
    tagTitleSize: 34,
    avatarRight: 44,
    avatarTop: 78,
    avatarSize: 168,
    avatarBarWidth: 8,
    subLeft: 90,
    subRight: 90,
    subTop: 1512,
    subMaxWidth: 880,
    subFontSize: 54,
    counterRight: 46,
    counterBottom: 118,
    counterFontSize: 26,
    barHeight: 10,
  };
};

/* ---------- background ---------- */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = getChromeLayout(width, height);
  const glowX = L.glowX + Math.sin(frame / 190) * (L.landscape ? 320 : 260);
  const glowY = L.glowY + Math.cos(frame / 240) * 180;
  return (
    <AbsoluteFill>
      {/* base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${C.bgDeep} 0%, ${C.bgLight} 58%, ${C.bgDeep} 100%)`,
        }}
      />
      {/* tech grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(96,165,250,0.05) 1px, transparent 1px),
             linear-gradient(90deg, rgba(96,165,250,0.05) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      {/* soft moving glow */}
      <div
        style={{
          position: "absolute",
          left: glowX - L.glowSize / 2,
          top: glowY - L.glowSize / 2,
          width: L.glowSize,
          height: L.glowSize,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0) 62%)",
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const AbsoluteFill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0 }}>{children}</div>
);

/* ---------- chapter tag (top-left) ---------- */
export const ChapterTag: React.FC<{ tag: string; title: string; startFrame: number }> = ({
  tag,
  title,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = getChromeLayout(width, height);
  const local = frame - startFrame;
  if (local < -5) return null;
  const s = spring({ frame: Math.max(0, local), fps: 30, config: { damping: 14 } });
  const slide = interpolate(s, [0, 1], [-220, 0]);
  const opacity = interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: L.tagLeft,
        top: L.tagTop,
        display: "flex",
        alignItems: "center",
        gap: 16,
        transform: `translateX(${slide}px)`,
        opacity,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.cyan} 100%)`,
          color: "#06101F",
          fontWeight: 800,
          fontSize: 30,
          padding: "10px 22px",
          borderRadius: 14,
          fontFamily: FONT,
          letterSpacing: 1,
        }}
      >
        {tag}
      </div>
      <div
        style={{
          color: C.white,
          fontWeight: 700,
          fontSize: L.tagTitleSize,
          fontFamily: FONT,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {title}
      </div>
    </div>
  );
};

/* ---------- wave avatar (top-right) ---------- */
export const WaveAvatar: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = getChromeLayout(width, height);
  const bars = [0, 1, 2, 3, 4];
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 11));
  return (
    <div
      style={{
        position: "absolute",
        right: L.avatarRight,
        top: L.avatarTop,
        width: L.avatarSize,
        height: L.avatarSize,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, #1E3A66 0%, #0D1B32 70%)",
        border: `3px solid rgba(96,165,250,${0.35 + pulse * 0.4})`,
        boxShadow: `0 0 ${18 + pulse * 26}px rgba(59,130,246,0.45)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
      }}
    >
      {bars.map((i) => {
        const h =
          22 +
          Math.abs(Math.sin(frame / (7 + i * 2.7) + i * 1.4)) * (34 + i * 6);
        return (
          <div
            key={i}
            style={{
              width: L.avatarBarWidth,
              height: h,
              borderRadius: 4,
              background: `linear-gradient(180deg, ${C.cyan} 0%, ${C.blue} 100%)`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- subtitle bar ---------- */
export type SubLine = { text: string; startFrame: number; durationFrames: number };

export const SubtitleBar: React.FC<{ line: SubLine | null }> = ({ line }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = getChromeLayout(width, height);
  if (!line) return null;
  const local = frame - line.startFrame;
  const reveal = Math.min(line.durationFrames, 16);
  const chars = [...line.text];
  return (
    <div
      style={{
        position: "absolute",
        left: L.subLeft,
        right: L.subRight,
        top: L.subTop,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 160,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: L.subMaxWidth,
          background: "rgba(5,12,24,0.72)",
          borderRadius: 22,
          padding: "30px 40px",
          border: "1px solid rgba(96,165,250,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        {chars.map((ch, i) => {
          const t = interpolate(
            local,
            [i * 0.55, i * 0.55 + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: L.subFontSize,
                lineHeight: 1.35,
                color: C.white,
                textShadow: "0 3px 14px rgba(0,0,0,0.85)",
                opacity: t,
                transform: `translateY(${(1 - t) * 14}px)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {/* reveal reference keeps eslint quiet */}
      <span style={{ display: "none" }}>{reveal}</span>
    </div>
  );
};

/* ---------- frame counter ---------- */
export const FrameCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const L = getChromeLayout(width, height);
  return (
    <div
      style={{
        position: "absolute",
        right: L.counterRight,
        bottom: L.counterBottom,
        fontFamily: MONO,
        fontSize: L.counterFontSize,
        color: "rgba(143,163,196,0.75)",
        letterSpacing: 1,
      }}
    >
      frame {frame} / {durationInFrames}
    </div>
  );
};

/* ---------- progress bar ---------- */
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const L = getChromeLayout(width, height);
  const p = frame / durationInFrames;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: L.barHeight,
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: L.barHeight,
          width: `${p * 100}%`,
          background: `linear-gradient(90deg, ${C.blue} 0%, ${C.cyan} 100%)`,
          boxShadow: "0 0 12px rgba(34,211,238,0.8)",
        }}
      />
    </>
  );
};

/* ---------- shared scene card ---------- */
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: C.cardBg,
      border: `1.5px solid ${C.cardBorder}`,
      borderRadius: 24,
      boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* helper: fade scene in/out at chapter bounds */
export const sceneOpacity = (local: number, len: number) => {
  const a = interpolate(local, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const b = interpolate(local, [len - 12, len], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(a, b);
};

export const popIn = (local: number, delay: number) => {
  const t = local - delay;
  if (t < 0) return { opacity: 0, scale: 0.7, translateY: 34 };
  const s = spring({ frame: t, fps: 30, config: { damping: 13, stiffness: 120 } });
  return {
    opacity: interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
    scale: interpolate(s, [0, 1], [0.7, 1]),
    translateY: interpolate(s, [0, 1], [34, 0]),
  };
};
