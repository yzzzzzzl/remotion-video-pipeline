import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SpreadPages } from "../../core/MotionKit";

/* spread-pages — Two-Page Spread / 双页展开 / 版式对照
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const SpreadPagesDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <SpreadPages left={<div style={{border:"1px solid #6FE3D2",padding:40}}>封面</div>} right={<div style={{border:"1px solid #6FE3D2",padding:40}}>内页</div>} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
