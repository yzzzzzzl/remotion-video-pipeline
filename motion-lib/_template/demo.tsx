import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MyEffect } from "../../core/MotionKit";

/* my-effect — My Effect / 我的效果
   最小可运行示例。local 取当前帧；at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成从 timeline.json 换算的 at(i)。 */
export const MyEffectDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <MyEffect local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
