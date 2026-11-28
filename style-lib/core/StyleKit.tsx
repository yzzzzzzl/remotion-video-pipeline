import React from "react";
import { AbsoluteFill } from "remotion";
import { STYLE_TOKENS, STYLE_SLUGS, StyleToken } from "./style-tokens";

/**
 * StyleKit — 60 个画风的唯一渲染代码源。
 *
 * 只用 React + Remotion + 原生 CSS，零新增 npm 依赖。
 * 画风层（本文件）与动作层（motion-lib/core/MotionKit.tsx）正交：
 *   <StyleStage slug="blueprint">
 *     <MotionKit.NumberAccent ... color={getStyle("blueprint").palette.accent} />
 *   </StyleStage>
 *
 * 一整支片只用一个 slug，不要每页换皮。所有底板都是确定性 CSS，
 * 禁用 Math.random()。拷进 Remotion 工程的 src/components/ 即可。
 */

export type { StyleToken };
export { STYLE_TOKENS, STYLE_SLUGS };

/** 取一个画风的完整 token。slug 不存在时直接报错，避免静默回退到错误画风。 */
export function getStyle(slug: string): StyleToken {
  const token = STYLE_TOKENS[slug];
  if (!token) {
    throw new Error(
      `Unknown style slug "${slug}". Pick one from style-lib/styles/INDEX.md (${STYLE_SLUGS.length} available).`
    );
  }
  return token;
}

/** 兼容命名：不是 React hook，只是 getStyle 的别名，方便在组件里就地取色。 */
export const useStyle = getStyle;

/** 6 位 hex 追加 2 位 alpha，得到 8 位 hex（Chrome / Remotion 支持）。 */
function alpha(hex: string, a: string): string {
  return hex.length === 7 ? `${hex}${a}` : hex;
}

/** 把色板注入任意容器，供动效组件用 var(--style-accent) 取色。 */
export function styleVars(slug: string): React.CSSProperties {
  const p = getStyle(slug).palette;
  return {
    "--style-bg": p.bg,
    "--style-surface": p.surface,
    "--style-surface2": p.surface2,
    "--style-text": p.text,
    "--style-dim": p.dim,
    "--style-accent": p.accent,
    "--style-accent2": p.accent2,
    "--style-line": p.line,
    "--style-problem": p.problem,
  } as React.CSSProperties;
}

type StageLayers = {
  backgroundImage: string;
  backgroundSize?: string;
  extra?: React.CSSProperties;
  decor?: boolean;
  scratch?: boolean;
};

/** 按 stage.type 生成底板纹理层；全部是静态 CSS，不随时间变化。 */
function stageLayers(t: StyleToken): StageLayers {
  const p = t.palette;
  const type = t.stage.type;
  const grid = t.stage.grid || 48;

  switch (type) {
    case "grid":
      return {
        backgroundImage: [
          `linear-gradient(${alpha(p.line, "55")} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${alpha(p.line, "55")} 1px, transparent 1px)`,
          `radial-gradient(ellipse at 50% 38%, ${alpha(p.accent, "14")} 0%, transparent 58%)`,
        ].join(", "),
        backgroundSize: `${grid}px ${grid}px, ${grid}px ${grid}px, 100% 100%`,
      };
    case "scanlines":
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${alpha(p.accent, "14")} 0px, ${alpha(p.accent, "14")} 1px, transparent 1px, transparent 4px)`,
          `radial-gradient(ellipse at 50% 50%, ${alpha(p.accent, "1C")} 0%, transparent 72%)`,
        ].join(", "),
        extra: { boxShadow: `inset 0 0 0 1px ${alpha(p.accent, "33")}` },
      };
    case "paper":
      return {
        backgroundImage: [
          `repeating-linear-gradient(45deg, ${alpha(p.text, "0A")} 0px, ${alpha(p.text, "0A")} 1px, transparent 1px, transparent 6px)`,
          `repeating-linear-gradient(-45deg, ${alpha(p.text, "07")} 0px, ${alpha(p.text, "07")} 1px, transparent 1px, transparent 9px)`,
        ].join(", "),
      };
    case "chalk":
      return {
        backgroundImage: [
          `repeating-linear-gradient(115deg, ${alpha(p.text, "0D")} 0px, ${alpha(p.text, "0D")} 2px, transparent 2px, transparent 24px)`,
          `radial-gradient(circle at 22% 78%, ${alpha(p.text, "12")} 0%, transparent 42%)`,
          `radial-gradient(circle at 78% 22%, ${alpha(p.text, "0C")} 0%, transparent 38%)`,
        ].join(", "),
      };
    case "stroke":
      return {
        backgroundImage: [
          `radial-gradient(ellipse at 26% 30%, ${alpha(p.accent, "26")} 0%, transparent 48%)`,
          `radial-gradient(ellipse at 76% 72%, ${alpha(p.accent2, "20")} 0%, transparent 52%)`,
          `radial-gradient(ellipse at 60% 12%, ${alpha(p.accent, "12")} 0%, transparent 40%)`,
        ].join(", "),
      };
    case "flat":
      return {
        backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 64%, ${alpha(p.accent, "1A")} 64%, ${alpha(p.accent, "1A")} 100%)`,
        decor: true,
      };
    case "glow":
      return {
        backgroundImage: [
          `radial-gradient(ellipse at 50% 48%, ${alpha(p.accent, "2E")} 0%, transparent 62%)`,
          `radial-gradient(ellipse at 50% 50%, ${alpha(p.accent2, "14")} 0%, transparent 80%)`,
        ].join(", "),
        extra: { boxShadow: `inset 0 0 0 1px ${alpha(p.accent, "3D")}` },
      };
    case "film":
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${alpha(p.text, "0C")} 0px, ${alpha(p.text, "0C")} 1px, transparent 1px, transparent 3px)`,
          `repeating-linear-gradient(90deg, ${alpha(p.text, "07")} 0px, ${alpha(p.text, "07")} 1px, transparent 1px, transparent 8px)`,
        ].join(", "),
        scratch: true,
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${alpha(p.accent, "3D")} 1.6px, transparent 1.7px)`,
        backgroundSize: "18px 18px",
      };
    case "toy":
      return {
        backgroundImage: [
          `linear-gradient(30deg, ${alpha(p.line, "55")} 1px, transparent 1px)`,
          `linear-gradient(150deg, ${alpha(p.line, "55")} 1px, transparent 1px)`,
          `linear-gradient(180deg, ${alpha(p.text, "0A")} 0%, transparent 45%)`,
        ].join(", "),
        backgroundSize: `${grid}px ${grid}px, ${grid}px ${grid}px, 100% 100%`,
      };
    case "lens":
      return {
        backgroundImage: `radial-gradient(circle at 50% 50%, ${p.surface} 0%, ${p.surface} 40%, ${alpha(p.bg, "CC")} 62%, ${p.bg} 100%)`,
        extra: { boxShadow: `inset 0 0 120px ${alpha(p.bg, "CC")}` },
      };
    case "lines":
      return {
        backgroundImage: [
          `repeating-linear-gradient(60deg, ${alpha(p.accent, "26")} 0px, ${alpha(p.accent, "26")} 1px, transparent 1px, transparent 15px)`,
          `repeating-linear-gradient(-60deg, ${alpha(p.accent2, "1C")} 0px, ${alpha(p.accent2, "1C")} 1px, transparent 1px, transparent 24px)`,
        ].join(", "),
      };
    default:
      return { backgroundImage: "none" };
  }
}

export type StyleStageProps = {
  slug: string;
  children?: React.ReactNode;
  /** 传给最外层 AbsoluteFill 的额外样式（不要覆盖 background）。 */
  style?: React.CSSProperties;
  /** 关掉纹理层，只留纯色底板（用于对比或调试）。 */
  showTexture?: boolean;
};

/**
 * 画风底板。包住整页或整个 Composition。
 * 结构：底色 → 纹理层 → 装饰/划痕 → 暗角 → 细边框 → children。
 */
export const StyleStage: React.FC<StyleStageProps> = ({
  slug,
  children,
  style,
  showTexture = true,
}) => {
  const t = getStyle(slug);
  const p = t.palette;
  const layers = stageLayers(t);
  const v = t.stage.vignette;

  return (
    <AbsoluteFill style={{ backgroundColor: p.bg, ...styleVars(slug), ...style }}>
      {showTexture ? (
        <AbsoluteFill
          style={{
            backgroundImage: layers.backgroundImage,
            backgroundSize: layers.backgroundSize,
            ...(layers.extra || {}),
          }}
        />
      ) : null}

      {showTexture && layers.decor ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "16%",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: alpha(p.accent, "26"),
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12%",
              bottom: "18%",
              width: 140,
              height: 140,
              background: alpha(p.accent2, "22"),
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "26%",
              top: "12%",
              width: 0,
              height: 0,
              borderLeft: `60px solid transparent`,
              borderRight: `60px solid transparent`,
              borderBottom: `104px solid ${alpha(p.accent, "1F")}`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {showTexture && layers.scratch ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: "23%",
              top: 0,
              bottom: 0,
              width: 2,
              background: alpha(p.text, "14"),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "71%",
              top: 0,
              bottom: 0,
              width: 1,
              background: alpha(p.text, "0F"),
            }}
          />
        </AbsoluteFill>
      ) : null}

      {v > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,${v}) 100%)`,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          border: `1px solid ${alpha(p.line, "66")}`,
        }}
      />

      {children}
    </AbsoluteFill>
  );
};

/** 标题：按画风的 display 字体、字重、字距。 */
export const StyledTitle: React.FC<{
  slug: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ slug, children, style }) => {
  const t = getStyle(slug);
  return (
    <div
      style={{
        fontFamily: t.fonts.display,
        fontWeight: t.fonts.weight,
        letterSpacing: t.fonts.tracking,
        color: t.palette.text,
        fontSize: 92,
        lineHeight: 1.16,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 正文 / 说明：按画风 body 字体，次级文字色。 */
export const StyledBody: React.FC<{
  slug: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ slug, children, style }) => {
  const t = getStyle(slug);
  return (
    <div
      style={{
        fontFamily: t.fonts.body,
        color: t.palette.dim,
        fontSize: 34,
        lineHeight: 1.7,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 标签 / 编号 / 读数：等宽 + 强调色。 */
export const StyledLabel: React.FC<{
  slug: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ slug, children, style }) => {
  const t = getStyle(slug);
  return (
    <div
      style={{
        fontFamily: t.fonts.mono,
        color: t.palette.accent,
        fontSize: 24,
        letterSpacing: "0.08em",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 画风化卡片：面板色 + 细边；几何/印刷类画风自动收圆角。 */
export const StyleCard: React.FC<{
  slug: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ slug, children, style }) => {
  const t = getStyle(slug);
  const square = ["flat", "paper", "film"].includes(t.stage.type);
  return (
    <div
      style={{
        background: t.palette.surface,
        border: `1px solid ${alpha(t.palette.line, "AA")}`,
        borderRadius: square ? 0 : 16,
        padding: "32px 40px",
        color: t.palette.text,
        fontFamily: t.fonts.body,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 字幕条：不管什么画风都保持可读，只用面板色与细边，不加花哨效果。 */
export const StyledCaption: React.FC<{
  slug: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ slug, children, style }) => {
  const t = getStyle(slug);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "80%",
        background: alpha(t.palette.surface, "E6"),
        border: `1px solid ${alpha(t.palette.line, "99")}`,
        borderRadius: 12,
        padding: "14px 30px",
        color: t.palette.text,
        fontFamily: t.fonts.body,
        fontSize: 38,
        lineHeight: 1.4,
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
