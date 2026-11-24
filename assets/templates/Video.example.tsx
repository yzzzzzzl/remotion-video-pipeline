import React from "react";
import { useCurrentFrame, AbsoluteFill, Audio, staticFile } from "remotion";
import timeline from "../data/timeline.json";
import {
  Background,
  ChapterTag,
  WaveAvatar,
  SubtitleBar,
  FrameCounter,
  ProgressBar,
  sceneOpacity,
} from "./components/Chrome";
import {
  HookScene,
  Ch1Scene,
  Ch2Scene,
  Ch3Scene,
  Ch4Scene,
  EndScene,
  SceneProps,
} from "./scenes/Scenes";

const tl: any = timeline;

// 第 0 章（开头 15 秒）：默认是正片式 HookScene。
// 要做帧级快切开场时，把 assets/components/Opening.tech.tsx 拷到 src/scenes/ 并改成：
//   // import { HookScene } from "./scenes/Scenes";  →  删掉
//   import { Ch0Scene as HookScene } from "./scenes/Opening.tech";
// 规范见 references/10-first-15s.md（≥6 页、单页 ≤75 帧、首帧在动、HUD 章末消失）。
const SCENE_COMPONENTS: React.FC<SceneProps>[] = [
  HookScene,
  Ch1Scene,
  Ch2Scene,
  Ch3Scene,
  Ch4Scene,
  EndScene,
];

export const Video: React.FC = () => {
  const frame = useCurrentFrame();

  // active chapter & scene props
  const chapters = tl.chapters as any[];
  const chIdx = chapters.findIndex(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );
  const active = chIdx >= 0 ? chapters[chIdx] : null;

  // active subtitle line
  const lines = tl.lines as any[];
  const sub = lines.find(
    (l) => frame >= l.startFrame && frame < l.startFrame + l.durationFrames
  ) ?? null;

  // current spoken line index (last line that has started)
  let curLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startFrame <= frame) curLine = i;
  }

  // ending fade to black
  const fadeOut = frame > tl.durationInFrames - 24
    ? (frame - (tl.durationInFrames - 24)) / 24
    : 0;

  const Scene = chIdx >= 0 ? SCENE_COMPONENTS[chIdx] : null;

  const sceneProps: SceneProps | null =
    active && Scene
      ? {
          local: frame - active.startFrame,
          len: active.endFrame - active.startFrame,
          curLine,
          lines: (lines as any[])
            .filter((l) => l.chapter === active.id)
            .map((l) => ({
              text: l.text,
              relStart: l.startFrame - active.startFrame,
              dur: l.durationFrames,
            })),
        }
      : null;

  // 换主题画风时，下面的背景色必须同步改成 C.bgDeep（见 10-first-15s.md §5）；
  // 否则开场与正片两套底色，切章会闪一下。
  return (
    <AbsoluteFill style={{ background: "#0B1526", fontFamily: '"Microsoft YaHei", sans-serif' }}>
      <Audio src={staticFile("voiceover.mp3")} />

      <Background />

      {active && active.tag ? (
        <ChapterTag tag={active.tag} title={active.title} startFrame={active.startFrame} />
      ) : null}

      <WaveAvatar />

      {sceneProps && Scene ? (
        <AbsoluteFill
          style={{ opacity: sceneOpacity(sceneProps.local, sceneProps.len) }}
        >
          <Scene {...sceneProps} />
        </AbsoluteFill>
      ) : null}

      <SubtitleBar
        line={
          sub
            ? {
                text: sub.text,
                startFrame: sub.startFrame,
                durationFrames: sub.durationFrames,
              }
            : null
        }
      />

      <FrameCounter />
      <ProgressBar />

      {fadeOut > 0 ? (
        <AbsoluteFill
          style={{ background: "#000", opacity: Math.min(1, fadeOut) }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
