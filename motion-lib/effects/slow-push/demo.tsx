import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SlowPush } from "../../core/MotionKit";

/* slow-push — Slow Push / Flip / Gild / 缓推近 / 书页翻动 / 烫金浮出
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const SlowPushDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <SlowPush mode="gild" local={local} delay={at(0)}><div style={{fontSize:80}}>历史与人</div></SlowPush>
    </AbsoluteFill>
  );
};
