import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EqualizerBars } from "../../core/MotionKit";

/* equalizer-bars — Equalizer Bars / 均衡器 / 柱状生长
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const EqualizerBarsDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <EqualizerBars local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
