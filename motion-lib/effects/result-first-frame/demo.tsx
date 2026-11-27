import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ResultFirstFrame } from "../../core/MotionKit";

/* result-first-frame — Real Result First Frame / 真实成果首帧
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const ResultFirstFrameDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <ResultFirstFrame local={local} delay={at(0)}><div style={{fontSize:72}}>真实成果 / RESULT</div></ResultFirstFrame>
    </AbsoluteFill>
  );
};
