import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { StyleStage, StyledTitle, StyledBody, getStyle } from "../../core/StyleKit";

// 新建画风的最小 demo：把 slug 换成自己的，其余照抄。
// 更推荐把字段写进 scripts/styles.json 后跑 build_styles.py 自动生成。
const SLUG = "my-new-look";

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = getStyle(SLUG);
  const rise = interpolate(frame, [0, 18], [28, 0], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <StyleStage slug={SLUG}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
        <div style={{ opacity: fade, transform: `translateY(${rise}px)` }}>
          <StyledTitle slug={SLUG}>{t.cn}</StyledTitle>
          <StyledBody slug={SLUG} style={{ marginTop: 28 }}>{t.signature}</StyledBody>
        </div>
      </AbsoluteFill>
    </StyleStage>
  );
};

export default Demo;
