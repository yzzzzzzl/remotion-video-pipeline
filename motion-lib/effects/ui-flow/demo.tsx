import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { UIFlow } from "../../core/MotionKit";

/* ui-flow — UI Step Flow / 界面流程演示
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const UiFlowDemo: React.FC = () => {
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}>
      <UIFlow steps={[<div>选择模板</div>,<div>进度 100%</div>,<div>输入问题</div>]} delays={[at(0),at(1),at(2)]} local={local} />
    </AbsoluteFill>
  );
};
