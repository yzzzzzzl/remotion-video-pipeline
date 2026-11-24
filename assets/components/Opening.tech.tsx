import React from "react";
import { interpolate, Easing } from "remotion";
import { FONT, MONO } from "../components/Chrome";
import { ShotProps, SceneLine, SceneProps } from "./ShotEngine";

/* ============================================================
   Opening.tech.tsx — 开头 15 秒「科技 / AI / 工具」主题参考实现
   来源：一条 3:09 横屏成片的真实返工，已逐帧质检 + 全片渲染验证。
   规范见 references/10-first-15s.md（硬指标、Hook 四拍、特效库、画风映射表）。

   【PORTING GUIDE · 换项目必读】
   1) 本文件是 1920×1080 横屏坐标。竖屏 1080×1920 按 10-first-15s.md §10
      的换算表改 Center inset / 字幕条 / HUD 各绝对坐标，先渲 3 帧验安全区。
   2) 换主题：改下面的 C（色板）+ FONT/MONO + CH0_CUTS 各页文案常量，
      再从 10-first-15s.md §4 特效库里换 3~4 个母题相符的特效。
      注意 Video.tsx 的全局背景色必须同步改成 C.bgDeep，否则切章会闪。
   3) C 是本文件自带的（含 greenBright 等字段），不依赖 Chrome.tsx 的
      token 版本；Chrome.tsx 只提供 FONT / MONO 两个字体常量。
   4) 接线：Video.tsx 的 SCENE_COMPONENTS[0] 指向本文件导出的 Ch0Scene
      （或 import 时改名 HookScene）。开场只动画面，音轨/时间轴零改动。

   实现铁律（详见 10-first-15s.md）：
   - 禁止整页出现 → 元素逐个 pop / 打字机 / 扫描揭示
   - 只放关键词   → 每页主体 ≤3~4 个文字块，HUD 小字低透明度装饰
   - 音画同步     → 切点对齐台词起点；句中切页改用页内节奏并写注释
   - 静态必须运动 → 计数/数据流/扫描线/光标/光带/呼吸，全部确定性
   - 不使用 Math.random()（Remotion 逐帧渲染需确定性）
   - 不使用大圆环/圆圈（用户明确不喜欢画面正中间的圆圈）
   - HUD 只在第 0 章渲染，章末必须完全消失（切章后抽 1 帧验证）
   ============================================================ */

/* 主题色板：换主题只改这里（映射表见 10-first-15s.md §5） */
const C = {
  bgDeep: "#0A0D09", bgLight: "#10150D",
  green: "#B6E388", greenBright: "#D9F99D", greenDeep: "#7FA65A",
  amber: "#E8C46A", gold: "#D4AF37", goldLight: "#F0D98C",
  red: "#C0392B", white: "#F2F5EE", dim: "#8A937D",
  cardBg: "rgba(182,227,136,0.055)", cardBorder: "rgba(182,227,136,0.26)",
};

const CYAN = "#6FE3D2";
const HUD_LINE = "rgba(182,227,136,0.26)";

/* ---------- 基础工具（与 Scenes.tsx 同款） ---------- */
const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children, style,
}) => (
  <div style={{
    position: "absolute", left: 120, right: 120, top: 130, bottom: 210,
    display: "flex", alignItems: "center", justifyContent: "center",
    ...style,
  }}>
    {children}
  </div>
);

const pop = (local: number, delay: number) => {
  const t = local - delay;
  if (t < 0) return { opacity: 0, scale: 0.86, translateY: 20 };
  const k = Math.min(1, t / 7);
  return {
    opacity: k, scale: interpolate(k, [0, 1], [0.86, 1]),
    translateY: interpolate(k, [0, 1], [20, 0]),
  };
};
const popStyle = (local: number, delay: number): React.CSSProperties => {
  const p = pop(local, delay);
  return { opacity: p.opacity, transform: `translateY(${p.translateY}px) scale(${p.scale})` };
};
const fmt = (n: number) =>
  Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* 小标签：MONO 等宽 + 方括号，科技 HUD 味 */
const Tag: React.FC<{
  text: string; color?: string; size?: number; style?: React.CSSProperties;
}> = ({ text, color = C.green, size = 22, style }) => (
  <div style={{
    fontFamily: MONO, fontSize: size, letterSpacing: 3, color,
    display: "flex", alignItems: "center", gap: 10, ...style,
  }}>
    <span style={{ color: "rgba(182,227,136,0.45)" }}>[</span>{text}<span style={{ color: "rgba(182,227,136,0.45)" }}>]</span>
  </div>
);

/* ============================================================
   常驻科技 HUD 层（覆盖整个 ch0，低透明度，不抢主体）
   ============================================================ */
const Corner4: React.FC<{ x: number; y: number; hx: number; hy: number; opacity?: number }> = ({
  x, y, hx, hy, opacity = 0.5,
}) => (
  <div style={{ position: "absolute", left: x, top: y, opacity }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 30, height: 2, background: C.green }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 2, height: 30, background: C.green }} />
    <div style={{ position: "absolute", left: hx - 30, top: 0, width: 30, height: 2, background: C.green }} />
    <div style={{ position: "absolute", left: hx - 2, top: 0, width: 2, height: 30, background: C.green }} />
    <div style={{ position: "absolute", left: 0, top: hy - 2, width: 30, height: 2, background: C.green }} />
    <div style={{ position: "absolute", left: 0, top: hy - 30, width: 2, height: 30, background: C.green }} />
    <div style={{ position: "absolute", left: hx - 30, top: hy - 2, width: 30, height: 2, background: C.green }} />
    <div style={{ position: "absolute", left: hx - 2, top: hy - 30, width: 2, height: 30, background: C.green }} />
  </div>
);

const OpeningHUD: React.FC<{ local: number; len: number }> = ({ local, len }) => {
  const scanY = 130 + ((local * 2.1) % 740);
  const rail = Array.from({ length: 16 }, (_, i) => {
    const seed = (i * 73 + Math.floor(local / 3) * 17) % 4096;
    return seed.toString(16).toUpperCase().padStart(3, "0");
  });
  const pct = Math.min(99, Math.floor((local / Math.max(1, len)) * 100));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* 内容画框四角（避开右上 WaveAvatar / 右下 FrameCounter / 底部字幕） */}
      <Corner4 x={70} y={110} hx={1780} hy={770} opacity={0.34} />

      {/* 左上状态栏 */}
      <div style={{
        position: "absolute", left: 118, top: 60, display: "flex", alignItems: "center", gap: 18,
        fontFamily: MONO, fontSize: 17, letterSpacing: 3, color: "rgba(182,227,136,0.6)",
      }}>
        <span style={{ color: C.red, fontSize: 15 }}>●</span>
        REC / AUTO-RENDER
        <span style={{ color: "rgba(182,227,136,0.3)" }}>·</span>
        <span style={{ color: CYAN }}>SYS.PIPELINE v1.2</span>
      </div>
      {/* 顶部中：解码进度 */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 62, textAlign: "center",
        fontFamily: MONO, fontSize: 16, letterSpacing: 4, color: "rgba(182,227,136,0.38)",
      }}>
        DECODING FRAME · {String(local).padStart(4, "0")} · {pct}%
      </div>

      {/* 左侧十六进制数据轨（确定性滚动） */}
      <div style={{
        position: "absolute", left: 84, top: 236, width: 74,
        fontFamily: MONO, fontSize: 15, lineHeight: "36px", letterSpacing: 2,
        color: "rgba(111,227,210,0.34)",
      }}>
        {rail.map((h, i) => (
          <div key={i} style={{ opacity: 0.35 + 0.45 * Math.abs(Math.sin(local / 16 + i * 0.7)) }}>
            0x{h}
          </div>
        ))}
      </div>
      {/* 右侧刻度 */}
      <div style={{ position: "absolute", right: 92, top: 250, display: "flex", flexDirection: "column", gap: 15 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            width: i % 3 === 0 ? 26 : 13, height: 2,
            background: i === Math.floor((local / 8) % 12) ? C.greenBright : "rgba(182,227,136,0.28)",
            marginLeft: "auto",
          }} />
        ))}
      </div>

      {/* 水平扫描线 */}
      <div style={{
        position: "absolute", top: scanY, left: 110, right: 110, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(182,227,136,0.30), transparent)",
      }} />

      {/* 底部说明行：放在字幕条(top 936)上方的空隙，避免压字幕 */}
      <div style={{
        position: "absolute", left: 118, top: 892,
        fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: "rgba(182,227,136,0.34)",
      }}>
        1920×1080 · 30 FPS · REMOTION / CODE-RENDERED
      </div>
    </div>
  );
};

/* ============================================================
   P0 · 0–44 · 点赞数冲屏（Hook：数字冲击 + 故障 + 均衡器）
   ============================================================ */
const OpImpact: React.FC<ShotProps> = ({ local, at }) => {
  const n = interpolate(local, [2, 32], [0, 487392], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const g = Math.sin(local * 1.9) * 3.2;
  const bars = Array.from({ length: 22 }, (_, i) => {
    const h = 26 + Math.abs(Math.sin(local * 0.28 + i * 0.85)) * 96;
    return h;
  });
  return (
    <Center style={{ flexDirection: "column", gap: 26 }}>
      <div style={popStyle(local, at(0) + 1)}>
        <Tag text="VIRAL / 几十万赞" color={CYAN} size={22} />
      </div>
      <div style={{ position: "relative", ...popStyle(local, at(0) + 4) }}>
        {/* RGB 故障副本 */}
        <div style={{
          position: "absolute", inset: 0, fontFamily: MONO, fontWeight: 900, fontSize: 168,
          letterSpacing: 6, color: "rgba(255,70,70,0.55)", transform: `translate(${g}px, -1px)`,
        }}>{fmt(n)}</div>
        <div style={{
          position: "absolute", inset: 0, fontFamily: MONO, fontWeight: 900, fontSize: 168,
          letterSpacing: 6, color: "rgba(111,227,210,0.5)", transform: `translate(${-g}px, 1px)`,
        }}>{fmt(n)}</div>
        <div style={{
          position: "relative", fontFamily: MONO, fontWeight: 900, fontSize: 168,
          letterSpacing: 6, color: C.greenBright, textShadow: "0 0 54px rgba(182,227,136,0.45)",
        }}>{fmt(n)}</div>
      </div>
      <div style={{ ...popStyle(local, at(0) + 14), fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.white, letterSpacing: 6 }}>
        LIKES · 一条 AI 动画视频
      </div>
      {/* 底部均衡器（永动） */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 122, marginTop: 12 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: 22, height: h, borderRadius: 3,
            background: i > 15 ? C.greenBright : "rgba(182,227,136,0.42)",
            opacity: pop(local, at(0) + 8 + i).opacity,
          }} />
        ))}
      </div>
    </Center>
  );
};

/* ============================================================
   P1 · 44–88 · 代码洪流（承接「画面全是代码」前奏）
   ============================================================ */
const OpDataFlood: React.FC<ShotProps> = ({ local }) => {
  const cols = Array.from({ length: 14 }, (_, i) => {
    const speed = 0.9 + (i % 4) * 0.35;
    const off = (local * speed + i * 47) % 620;
    const chars = ["<div>", "{ t }", "<//>", "0xF2", "=> {}", "[i]", "px;", "RGB"];
    return Array.from({ length: 9 }, (_, j) => chars[(i * 3 + j + Math.floor(local / 12)) % chars.length]);
  });
  return (
    <Center style={{ flexDirection: "column", gap: 20 }}>
      {/* 背景代码列 */}
      <div style={{
        position: "absolute", inset: -40, display: "flex", justifyContent: "space-around",
        overflow: "hidden", opacity: 0.5,
      }}>
        {cols.map((col, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", gap: 26,
            fontFamily: MONO, fontSize: 20, letterSpacing: 1,
            color: i % 3 === 0 ? CYAN : "rgba(182,227,136,0.55)",
            transform: `translateY(${(local * (0.9 + (i % 4) * 0.35) + i * 47) % 120}px)`,
          }}>
            {col.map((c, j) => <div key={j}>{c}</div>)}
          </div>
        ))}
      </div>
      {/* 中央大括号（暗色衬底，避免被代码雨字符叠花） */}
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 40,
        padding: "26px 76px", borderRadius: 24,
        background: "radial-gradient(ellipse at center, rgba(6,10,5,0.94) 0%, rgba(6,10,5,0.82) 58%, rgba(6,10,5,0) 82%)",
        ...popStyle(local, 3),
      }}>
        <span style={{ fontFamily: MONO, fontSize: 190, color: C.greenBright, textShadow: `0 0 40px rgba(182,227,136,0.5)` }}>{"{"}</span>
        <span style={{
          fontFamily: MONO, fontSize: 40, color: C.white, letterSpacing: 4,
          opacity: 0.5 + 0.5 * Math.abs(Math.sin(local / 9)),
        }}>CODE</span>
        <span style={{ fontFamily: MONO, fontSize: 190, color: C.greenBright, textShadow: `0 0 40px rgba(182,227,136,0.5)` }}>{"}"}</span>
      </div>
      <div style={popStyle(local, 12)}>
        <Tag text="NO EDITOR / 纯代码生成" color={CYAN} size={22} />
      </div>
    </Center>
  );
};

/* ============================================================
   P2 · 88–156 · 终端 render.tsx 代码逐行打出 + 画面 = 代码
   ============================================================ */
const CODE = [
  "const Frame = ({ t }) => (",
  "  <AbsoluteFill>",
  "    <Grid opacity={t} />",
  "    <Caption text={lines[i]} />",
  "  </AbsoluteFill>",
  ");",
];
const OpTerminal: React.FC<ShotProps> = ({ local, at }) => (
  <Center style={{ gap: 60 }}>
    {/* 终端窗口 */}
    <div style={{
      width: 900, borderRadius: 14, overflow: "hidden",
      background: "rgba(6,10,5,0.94)", border: `1.5px solid ${HUD_LINE}`,
      boxShadow: "0 0 60px rgba(0,0,0,0.7), inset 0 0 40px rgba(182,227,136,0.04)",
      ...popStyle(local, at(1) + 1),
    }}>
      <div style={{
        height: 46, display: "flex", alignItems: "center", gap: 9, padding: "0 18px",
        background: "rgba(182,227,136,0.08)", borderBottom: `1px solid ${HUD_LINE}`,
      }}>
        {[C.red, "#E8C46A", C.green].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c, opacity: 0.8 }} />
        ))}
        <span style={{ fontFamily: MONO, fontSize: 18, color: C.dim, marginLeft: 14, letterSpacing: 2 }}>
          render.tsx — 60 fps
        </span>
        <span style={{
          marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: CYAN,
          opacity: 0.45 + 0.55 * Math.abs(Math.sin(local / 7)),
        }}>● LIVE</span>
      </div>
      <div style={{ padding: "26px 34px" }}>
        {CODE.map((l, i) => (
          <div key={i} style={{
            fontFamily: MONO, fontSize: 27, lineHeight: 1.75, whiteSpace: "pre",
            color: i === 0 || i === 5 ? C.greenBright : (i % 2 ? CYAN : C.green),
            ...popStyle(local, at(1) + 6 + i * 4),
          }}>{l}</div>
        ))}
        <div style={{
          width: 12, height: 26, marginTop: 8, background: C.greenBright,
          opacity: 0.35 + 0.65 * Math.abs(Math.sin(local / 6)),
        }} />
      </div>
    </div>
    {/* 右侧结论 */}
    <div style={{ display: "flex", flexDirection: "column", gap: 18, ...popStyle(local, at(1) + 26) }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.white }}>画面</div>
      <div style={{ fontFamily: MONO, fontSize: 46, color: C.green }}>=</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.greenBright, textShadow: "0 0 30px rgba(182,227,136,0.4)" }}>代码</div>
    </div>
  </Center>
);

/* ============================================================
   P3 · 156–200 · 「大模型 · 魔法？」+ 黑箱节点
   ============================================================ */
const OpMyth: React.FC<ShotProps> = ({ local, at }) => {
  const g = Math.sin(local * 2.3) * 4;
  return (
    <Center style={{ flexDirection: "column", gap: 40 }}>
      <div style={popStyle(local, at(2) + 1)}>
        <Tag text="HYPOTHESIS / 大众猜想" color={CYAN} size={22} />
      </div>
      <div style={{ position: "relative", ...popStyle(local, at(2) + 5) }}>
        <div style={{
          position: "absolute", inset: 0, fontFamily: FONT, fontWeight: 900, fontSize: 116,
          letterSpacing: 8, color: "rgba(255,70,70,0.5)", transform: `translate(${g}px,0)`,
        }}>大模型的魔法？</div>
        <div style={{
          position: "absolute", inset: 0, fontFamily: FONT, fontWeight: 900, fontSize: 116,
          letterSpacing: 8, color: "rgba(111,227,210,0.45)", transform: `translate(${-g}px,0)`,
        }}>大模型的魔法？</div>
        <div style={{
          position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 116,
          letterSpacing: 8, color: C.white, textShadow: "0 0 40px rgba(255,255,255,0.18)",
        }}>大模型的魔法？</div>
      </div>
      {/* 黑箱节点图 */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, ...popStyle(local, at(2) + 16) }}>
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div style={{
              width: 128, height: 100, borderRadius: 12,
              background: "rgba(138,147,125,0.10)", border: `1.5px dashed rgba(138,147,125,0.55)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontSize: 38, color: C.dim,
              opacity: pop(local, at(2) + 18 + i * 3).opacity,
            }}>?</div>
            {i < 3 ? (
              <div style={{
                width: 54, height: 2,
                background: "rgba(138,147,125,0.5)",
                opacity: pop(local, at(2) + 21 + i * 3).opacity,
              }} />
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: "rgba(138,147,125,0.8)",
        ...popStyle(local, at(2) + 30),
      }}>
        BLACK BOX · 看不懂 = 魔法
      </div>
    </Center>
  );
};

/* ============================================================
   P4 · 200–240 · 划掉魔法 + FALSE + 拆开看 →
   ============================================================ */
const OpBreak: React.FC<ShotProps> = ({ local }) => {
  // 本页覆盖 200–240，对应 line2 尾 +「拆开看」前奏。
  // 台词锚点 at(2)=156-200=-44 会全负，故以页内帧节奏逐段揭示：
  // 0 划掉 → 8 FALSE → 16 拆开看 → 24 标签，页内不留空档。
  const strike = interpolate(local, [2, 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return (
    <Center style={{ flexDirection: "column", gap: 34 }}>
      {/* 被划掉的「魔法」 */}
      <div style={{ position: "relative", opacity: 0.55, ...popStyle(local, 0) }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color: C.dim, letterSpacing: 8 }}>
          大模型的魔法
        </span>
        <div style={{
          position: "absolute", left: -10, top: "52%", height: 9, width: `${strike * 108}%`,
          background: C.red, borderRadius: 4, boxShadow: `0 0 22px rgba(192,57,43,0.7)`,
        }} />
      </div>
      {/* FALSE 印章（方框，不是圆）——避开右上角声波头像(右64 顶40 140×140) */}
      <div style={{
        position: "absolute", right: 240, top: 236,
        border: `5px solid ${C.red}`, padding: "8px 26px",
        fontFamily: MONO, fontWeight: 900, fontSize: 46, letterSpacing: 6, color: C.red,
        transform: `rotate(-12deg) scale(${pop(local, 8).scale})`,
        opacity: pop(local, 8).opacity,
        boxShadow: `0 0 30px rgba(192,57,43,0.25)`,
      }}>
        FALSE
      </div>
      {/* 结论 */}
      <div style={{ display: "flex", alignItems: "center", gap: 26, ...popStyle(local, 16) }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.greenBright, textShadow: "0 0 40px rgba(182,227,136,0.4)" }}>
          拆开看
        </span>
        <span style={{ fontFamily: MONO, fontSize: 80, color: C.green }}>→</span>
      </div>
      <div style={popStyle(local, 24)}>
        <Tag text="NO MAGIC / 只是流程" color={CYAN} size={24} />
      </div>
      {/* 锁定准星（四角 L，不用圆） */}
      <div style={{ position: "absolute", left: 60, top: 30, width: 1560, height: 560, opacity: 0.4 * strike }}>
        <Corner4 x={0} y={0} hx={1560} hy={560} opacity={0.85} />
      </div>
    </Center>
  );
};

/* ============================================================
   P5 · 240–311 · SKILL.md 全息核心
   ============================================================ */
const OpCore: React.FC<ShotProps> = ({ local, at }) => {
  const reveal = interpolate(local, [at(3) + 2, at(3) + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const beamY = ((local * 4) % 300);
  return (
    <Center style={{ flexDirection: "column", gap: 30 }}>
      <div style={popStyle(local, at(3) + 1)}>
        <Tag text="CORE DETECTED / 核心识别" color={CYAN} size={22} />
      </div>
      <div style={{
        position: "relative", width: 760, padding: "38px 46px", borderRadius: 16,
        background: "rgba(182,227,136,0.09)", border: `2px solid ${C.green}`,
        boxShadow: `0 0 54px rgba(182,227,136,0.28), inset 0 0 60px rgba(182,227,136,0.05)`,
        clipPath: `inset(0 ${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}%)`,
        overflow: "hidden",
      }}>
        {/* 扫描光带 */}
        <div style={{
          position: "absolute", top: beamY, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, rgba(217,249,157,0.55), transparent)",
        }} />
        <div style={{ fontFamily: MONO, fontWeight: 900, fontSize: 68, color: C.greenBright, letterSpacing: 4 }}>
          SKILL.md
        </div>
        <div style={{ height: 22 }} />
        {[640, 520, 400].map((w, i) => (
          <div key={i} style={{
            width: w, height: 14, borderRadius: 7, marginBottom: 16,
            background: i === 0 ? C.green : "rgba(182,227,136,0.4)",
            opacity: pop(local, at(3) + 12 + i * 5).opacity,
          }} />
        ))}
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 12,
          fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "rgba(182,227,136,0.6)",
        }}>
          <span>// RULES</span><span>{String(pctOf(local, at(3))).padStart(2, "0")} STEPS</span>
        </div>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white, ...popStyle(local, at(3) + 26) }}>
        核心是一套 <span style={{ color: C.greenBright }}>Skill</span>
      </div>
    </Center>
  );
};
const pctOf = (local: number, s: number) => Math.min(7, Math.max(1, Math.floor((local - s) / 8) + 1));

/* ============================================================
   P6 · 311–408 · 内核 + 四工具节点点亮连线
   ============================================================ */
const TOOLS = ["Claude", "WorkBuddy", "Codex", "任何 Agent"];
const OpAnyTool: React.FC<ShotProps> = ({ local, at }) => (
  <Center style={{ flexDirection: "column", gap: 18 }}>
    <div style={popStyle(local, at(4) + 1)}>
      <Tag text="TOOL-AGNOSTIC / 不挑工具" color={CYAN} size={22} />
    </div>
    <div style={{ position: "relative", width: 1180, height: 440, marginTop: 6 }}>
      {/* SVG 连线 */}
      <svg width={1180} height={440} style={{ position: "absolute", inset: 0 }}>
        {[
          [110, 70], [1070, 70], [110, 370], [1070, 370],
        ].map(([x, y], i) => (
          <line key={i} x1={590} y1={220} x2={x + 150} y2={y + 42}
            stroke={C.green} strokeWidth={2}
            opacity={pop(local, at(4) + 6 + i * 8).opacity * 0.6} />
        ))}
      </svg>
      {/* 中心内核 */}
      <div style={{
        position: "absolute", left: 470, top: 160, width: 240, height: 120,
        borderRadius: 14, background: "rgba(182,227,136,0.15)", border: `2.5px solid ${C.greenBright}`,
        boxShadow: `0 0 44px rgba(182,227,136,0.4)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontWeight: 900, fontSize: 50, color: C.greenBright,
        ...popStyle(local, at(4) + 2),
      }}>
        SKILL
      </div>
      {/* 四工具节点 */}
      {TOOLS.map((t, i) => {
        const pos = [
          { left: 110, top: 70 }, { left: 920, top: 70 },
          { left: 110, top: 370 }, { left: 920, top: 370 },
        ][i];
        return (
          <div key={i} style={{
            position: "absolute", ...pos, width: 300, height: 84, borderRadius: 12,
            background: "rgba(8,11,6,0.9)", border: `1.5px solid ${HUD_LINE}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: i === 3 ? FONT : MONO, fontWeight: 800, fontSize: 30, color: C.white,
            boxShadow: `0 0 ${10 + 20 * pop(local, at(4) + 6 + i * 8).opacity}px rgba(182,227,136,0.2)`,
            ...popStyle(local, at(4) + 6 + i * 8),
          }}>
            {t}
          </div>
        );
      })}
    </div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.greenBright, ...popStyle(local, at(4) + 38) }}>
      用什么工具都能跑
    </div>
  </Center>
);

/* ============================================================
   按帧快切的镜头序列（from = 本章内帧号）
   ============================================================ */
type OpCut = { from: number; Comp: React.FC<ShotProps> };
const CH0_CUTS: OpCut[] = [
  { from: 0, Comp: OpImpact },     // 0–44   点赞数冲屏
  { from: 44, Comp: OpDataFlood }, // 44–88  代码洪流
  { from: 88, Comp: OpTerminal },  // 88–156 终端代码
  { from: 156, Comp: OpMyth },     // 156–200 大模型·魔法？
  { from: 200, Comp: OpBreak },    // 200–240 划掉 + 拆开看
  { from: 240, Comp: OpCore },     // 240–311 SKILL 核心
  { from: 311, Comp: OpAnyTool },  // 311–408 任意工具
];

const OpeningCuts: React.FC<{
  cuts: OpCut[]; local: number; len: number; lines: SceneLine[];
}> = ({ cuts, local, len, lines }) => {
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (cuts[i].from <= local) idx = i;
  const start = cuts[idx].from;
  const end = cuts[idx + 1]?.from ?? len;
  const Comp = cuts[idx].Comp;
  const sl = local - start;
  const slLen = Math.max(1, end - start);
  // 铁律三：at(i) = 本章第 i 句台词在本页内的帧偏移
  const at = (i: number) => {
    const k = Math.min(Math.max(0, i), Math.max(0, lines.length - 1));
    return (lines[k]?.relStart ?? 0) - start;
  };
  // 快切转场：4 帧淡入 + 短横滑，页尾 3 帧淡出
  const fi = interpolate(local, [start, start + 4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fo = interpolate(local, [end - 3, end], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const dx = interpolate(local, [start, start + 9], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: Math.min(fi, fo), transform: `translateX(${dx}px)`,
    }}>
      <Comp local={sl} len={slLen} at={at} />
    </div>
  );
};

export const Ch0Scene: React.FC<SceneProps> = (p) => (
  <>
    <OpeningHUD local={p.local} len={p.len} />
    <OpeningCuts cuts={CH0_CUTS} local={p.local} len={p.len} lines={p.lines} />
  </>
);
