import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LeaderLine } from "../../core/MotionKit";

/* leader-line — Single Leader Line / 一笔引线
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const LeaderLineDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <LeaderLine x1={120} y1={180} x2={620} y2={320} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
