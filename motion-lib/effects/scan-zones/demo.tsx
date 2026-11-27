import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ScanZones } from "../../core/MotionKit";

/* scan-zones — Scan & Zone Recognition / 扫描分区识别
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const ScanZonesDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <ScanZones local={local} delay={at(0)} from={80} to={600} zones={[{top:140,left:60,width:420,height:80,at:10},{top:300,left:60,width:420,height:80,at:30}]} />
    </AbsoluteFill>
  );
};
