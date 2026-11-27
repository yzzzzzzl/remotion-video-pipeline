import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ChecklistTrend } from "../../core/MotionKit";

/* checklist-trend — Checklist Into Trend / 逐条打勾 + 趋势逐点
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const ChecklistTrendDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <ChecklistTrend items={['计划','完成','成效']} trendPath='M 0 180 L 180 140 L 360 60' local={local} delay={at(0)} />
    </AbsoluteFill>
  );
};
