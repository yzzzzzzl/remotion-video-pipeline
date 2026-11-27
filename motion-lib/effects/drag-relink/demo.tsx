import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DragRelink } from "../../core/MotionKit";

/* drag-relink — Drag Then Relink / 拖动产生变化
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const DragRelinkDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <DragRelink from={{x:0,y:0}} to={{x:260,y:120}} local={local} delay={at(0)}><div style={{border:"1px solid #6FE3D2",padding:16}}>NODE</div></DragRelink>
    </AbsoluteFill>
  );
};
