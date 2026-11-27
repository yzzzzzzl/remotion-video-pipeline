import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GeometricWipe } from "../../core/MotionKit";

/* geometric-wipe — Geometric Wipe Swap / 几何擦除换版
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const GeometricWipeDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <GeometricWipe local={local} delay={at(0)}><div style={{fontSize:80}}>其实不是这样</div></GeometricWipe>
    </AbsoluteFill>
  );
};
