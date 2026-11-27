import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FlowDots } from "../../core/MotionKit";

/* flow-dots — Flow Dots & Branch Highlight / 走线流动 + 支路高亮
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const FlowDotsDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <FlowDots x1={80} y1={210} x2={820} y2={210} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
