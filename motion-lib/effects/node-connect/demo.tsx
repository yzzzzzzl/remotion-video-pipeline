import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { NodeConnect } from "../../core/MotionKit";

/* node-connect — Node & Edge Reveal / 节点连线
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const NodeConnectDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <NodeConnect nodes={[{x:120,y:200,label:'A'},{x:420,y:120,label:'B'},{x:720,y:200,label:'C'}]} edges={[[0,1],[1,2]]} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
