import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ImageRelay } from "../../core/MotionKit";

/* image-relay — Image Relay / 多图接力换位
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const ImageRelayDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <ImageRelay items={[<div style={{width:200,height:140,background:"#123"}}>1</div>,<div style={{width:200,height:140,background:"#234"}}>2</div>]} local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
