import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HoloReveal } from "../../core/MotionKit";

/* holo-reveal — Hologram Card Reveal / 全息卡揭示
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const HoloRevealDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <HoloReveal local={local} delay={at(0)}><div style={{padding:40,border:"1px solid #6FE3D2"}}>核心概念</div></HoloReveal>
    </AbsoluteFill>
  );
};
