import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DrawPath } from "../../core/MotionKit";

/* draw-path — Progressive Path Drawing / 逐段连线 / 手绘箭头
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const DrawPathDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <DrawPath paths={['M 80 200 L 320 200', 'M 320 200 L 620 120']} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
