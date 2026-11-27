#!/usr/bin/env python3
"""Build the motion effect library: effect cards, metadata, demos and INDEX.md.

Source of truth: scripts/effects.json (+ ~/remotion-my-motions/*/motion.json).
Run from anywhere:  python scripts/build_library.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EFFECTS = ROOT / "effects"
INDEX = ROOT / "INDEX.md"
SOURCE = ROOT / "scripts" / "effects.json"
CUSTOM = Path.home() / "remotion-my-motions"

# Minimal, copy-pasteable demo arguments for each component.
DEMO_ARGS: dict[str, str] = {
    "fore-back-title": 'back={"让画面动起来"} front={<div style={{border:"1px solid #6FE3D2",padding:12}}>TOOL</div>} local={local} delay={at(0)}',
    "result-first-frame": 'local={local} delay={at(0)}',
    "number-accent": 'to={59200} format="comma" local={local} delay={at(0)} style={{fontSize:96}}',
    "cell-preload": 'count={6} local={local} delay={at(0)}',
    "sweep-highlight": 'local={local} delay={at(0)} style={{fontSize:64}}',
    "leader-line": 'x1={120} y1={180} x2={620} y2={320} local={local} delay={at(0)}',
    "geometric-wipe": 'local={local} delay={at(0)}',
    "dual-merge": 'left={<div>A</div>} right={<div>B</div>} result={<div>RESULT</div>} local={local} delay={at(0)}',
    "flow-dots": 'x1={80} y1={210} x2={820} y2={210} local={local} delay={at(0)}',
    "draw-path": "paths={['M 80 200 L 320 200', 'M 320 200 L 620 120']} local={local} delay={at(0)}",
    "drag-relink": 'from={{x:0,y:0}} to={{x:260,y:120}} local={local} delay={at(0)}',
    "scan-zones": 'local={local} delay={at(0)} from={80} to={600} zones={[{top:140,left:60,width:420,height:80,at:10},{top:300,left:60,width:420,height:80,at:30}]}',
    "ui-flow": "steps={[<div>选择模板</div>,<div>进度 100%</div>,<div>输入问题</div>]} delays={[at(0),at(1),at(2)]} local={local}",
    "typewriter-copy": 'text="先定版，再上动效" local={local} delay={at(0)} style={{fontSize:48}}',
    "playhead-frames": 'count={8} local={local} delay={at(0)}',
    "context-then-value": "parts={['2026 Q3','平台 A','万次']} value='59.2' local={local} delay={at(0)}",
    "checklist-trend": "items={['计划','完成','成效']} trendPath='M 0 180 L 180 140 L 360 60' local={local} delay={at(0)}",
    "parallel-merge": 'left={<div>A 方案</div>} right={<div>B 方案</div>} result={<div>选择 B</div>} local={local} delay={at(0)}',
    "spread-pages": 'left={<div style={{border:"1px solid #6FE3D2",padding:40}}>封面</div>} right={<div style={{border:"1px solid #6FE3D2",padding:40}}>内页</div>} local={local} delay={at(0)}',
    "image-relay": 'items={[<div style={{width:200,height:140,background:"#123"}}>1</div>,<div style={{width:200,height:140,background:"#234"}}>2</div>]} local={local} delay={at(0)}',
    "result-hold": 'local={local} delay={at(0)} len={180}',
    "counter-roll": 'to={59200} local={local} delay={at(0)} style={{fontSize:96}}',
    "rgb-glitch": 'local={local} delay={at(0)} style={{fontSize:80}}',
    "equalizer-bars": 'local={local} delay={at(0)}',
    "code-rain": 'local={local} delay={at(0)}',
    "terminal-type": "lines={['npm i remotion','npx remotion studio']} local={local} delay={at(0)}",
    "hud-layer": 'local={local} delay={at(0)} label="REC"',
    "holo-reveal": 'local={local} delay={at(0)}',
    "strike-stamp": 'local={local} delay={at(0)} stamp="FALSE" style={{fontSize:64}}',
    "node-connect": "nodes={[{x:120,y:200,label:'A'},{x:420,y:120,label:'B'},{x:720,y:200,label:'C'}]} edges={[[0,1],[1,2]]} local={local} delay={at(0)}",
    "slow-push": 'mode="gild" local={local} delay={at(0)}',
}

DEMO_CHILDREN: dict[str, str] = {
    "result-first-frame": '<div style={{fontSize:72}}>真实成果 / RESULT</div>',
    "geometric-wipe": '<div style={{fontSize:80}}>其实不是这样</div>',
    "rgb-glitch": "GLITCH",
    "sweep-highlight": "关键词",
    "holo-reveal": '<div style={{padding:40,border:"1px solid #6FE3D2"}}>核心概念</div>',
    "strike-stamp": "错误说法",
    "result-hold": '<div style={{fontSize:80}}>结论：先定版再动画</div>',
    "slow-push": '<div style={{fontSize:80}}>历史与人</div>',
    "drag-relink": '<div style={{border:"1px solid #6FE3D2",padding:16}}>NODE</div>',
}


def build_jsx(slug: str, comp: str, args: str) -> str:
    """args = props only. Children live in DEMO_CHILDREN; props may contain JSX."""
    args = args.strip()
    if slug in DEMO_CHILDREN:
        return f"<{comp} {args}>{DEMO_CHILDREN[slug]}</{comp}>"
    return f"<{comp} {args} />"


CARD = """# {en} — {cn} · Motion Prompt

> {essence}
>
> 来源 `{source}` ｜ 分类 **{category}** ｜ 组件 `{component}` ｜ 建议时长 {dmin}~{dmax} 帧

## 1. 它是什么，不是什么

{essence}

**不是**：{boundary}

## 2. 触发词与时机

- **触发词**：{triggers}
- **时序**：{timing}
- `delay` 必须来自 `at(i)`（本章台词行索引 → 本页帧偏移，见 `../../../references/03-audio-timeline.md`），**禁止写死秒数或常数帧**。
- 局部帧 `t = local - delay`；`t < 0` 时必须保持未触发的初始态。

## 3. 画面构成

{composition}

## 4. 原生动作（菜单，按需取用）

{moves}

每章挑 **1 个主动作用透**，比每页换花活更强；装饰特效只补运动密度。

## 5. 实现配方

{recipe}

```tsx
import {{ {component} }} from "./MotionKit";
// local = 本页内帧号；delay = at(i)
{jsx}
```

`core/MotionKit.tsx` 是全部效果的唯一代码源：拷进 `remotion-project/src/components/` 即可，**不引入新 npm 依赖**。

## 6. 反模式 / 坑

{pitfalls}

## 7. 变化空间（同一效果的不同用法）

{variations}

## 8. 质检（三帧抽查）

- 动作起点**前 1 帧**：元素尚未出现。
- 起点**后 2 帧**：正在进场。
- **结果停稳帧**：可读、无重叠、无溢出；停稳期保留一个永动小元素（铁律四）。
- 一屏文字块 ≤3~4，完整句子只进字幕条；`Math.random()` 一律禁用。
- 装饰类效果（H 组）额外确认：**frame 450 后无任何 HUD 残留**。

---

[返回索引](../../INDEX.md) · [核心代码](../../core/MotionKit.tsx) · [API 说明](../../core/README.md) · [本效果 demo](demo.tsx)
"""

DEMO = """import React from "react";
import {{ AbsoluteFill, useCurrentFrame }} from "remotion";
import {{ {component} }} from "../../core/MotionKit";

/* {slug} — {en} / {cn}
   最小可运行示例：local 取当前帧，at(i) 为本页台词锚点（示例按 20 帧一句）。
   真正做片时把 delay 换成 from timeline.json 换算的 at(i)。 */
export const {pascal}Demo: React.FC = () => {{
  const local = useCurrentFrame();
  const at = (i: number) => i * 20;
  return (
    <AbsoluteFill style={{{{ background: "#0A0D09", color: "#fff", padding: 80, justifyContent: "center" }}}}>
      {jsx}
    </AbsoluteFill>
  );
}};
"""


def fmt_move(move: str) -> str:
    if "｜" in move:
        name, fits = move.split("｜", 1)
        return f"- **{name}**｜{fits}"
    return f"- {move}"


def write_effect(effect: dict, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    comp = effect["component"]
    args = DEMO_ARGS.get(effect["slug"], 'local={local} delay={at(0)}')
    jsx = build_jsx(effect["slug"], comp, args)
    card = CARD.format(
        en=effect["en"], cn=effect["cn"], source=effect["source"],
        category=effect["category"], component=comp,
        essence=effect["essence"], boundary=effect["boundary"],
        dmin=effect["duration"][0], dmax=effect["duration"][1],
        triggers="、".join(effect["triggers"]), timing=effect["timing"],
        composition=effect["composition"],
        moves="\n".join(fmt_move(m) for m in effect["moves"]),
        recipe="\n".join(f"{i}. {r}" for i, r in enumerate(effect["recipe"], 1)),
        pitfalls="\n".join(f"- {p}" for p in effect["pitfalls"]),
        variations="\n".join(f"- {v}" for v in effect["variations"]),
        jsx=jsx,
    )
    (target / "MOTION.md").write_text(card, encoding="utf-8")
    meta = {
        "slug": effect["slug"], "en": effect["en"], "cn": effect["cn"],
        "category": effect["category"], "source": effect["source"],
        "component": comp, "triggers": effect["triggers"],
        "duration_frames": effect["duration"], "asset": effect["asset"],
        "custom": False,
    }
    (target / "motion.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    pascal = "".join(p.capitalize() for p in effect["slug"].split("-"))
    (target / "demo.tsx").write_text(
        DEMO.format(component=comp, slug=effect["slug"], en=effect["en"], cn=effect["cn"],
                    pascal=pascal, jsx=jsx),
        encoding="utf-8",
    )


def load_custom() -> list[tuple[dict, Path]]:
    out = []
    if not CUSTOM.exists():
        return out
    for f in sorted(CUSTOM.glob("*/motion.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            data["custom"] = True
            out.append((data, f.parent))
        except (json.JSONDecodeError, OSError):
            continue
    return out


def render_index(effects: list[dict], custom: list[tuple[dict, Path]]) -> str:
    groups: dict[str, list[dict]] = {}
    for e in effects:
        groups.setdefault(e["category"], []).append(e)
    lines = [
        "# 动效索引 · Motion Index",
        "",
        "按画面要解决的**讲解目的**分类。选中一个效果 → 读 `effects/<slug>/MOTION.md` → 从 `core/MotionKit.tsx` 拷组件。",
        "",
        "Select by what the shot must explain, then read its `MOTION.md`. Names work in English or Chinese.",
        "",
        "<!-- generated by scripts/build_library.py from scripts/effects.json; do not edit by hand -->",
        "",
    ]
    for cat, items in groups.items():
        lines += [f"## {cat}", "", "| 效果 / Effect | 触发词 | 组件 | 时长(帧) | 素材 |", "|---|---|---|---|---|"]
        for e in items:
            asset = {"none": "纯代码", "optional": "可选", "required": "必需"}[e.get("asset", "none")]
            lines.append(
                f"| {e['cn']} · {e['en']} | {'、'.join(e['triggers'][:3])} | `{e['component']}` | {e['duration'][0]}~{e['duration'][1]} | {asset} |"
            )
        lines.append("")
    if custom:
        lines += ["## 我的效果 · My motions", "", "| 效果 | 分类 | 来源 | 位置 |", "|---|---|---|---|"]
        for e, p in custom:
            lines.append(f"| {e.get('cn','')} · {e.get('en','')} | {e.get('category','')} | 自定义 | `{p}` |")
        lines.append("")
    lines += [
        "## 用法",
        "",
        "1. 阶段 4 分镜：按台词触发词从上表挑 **1 个主动作/章**，不是每页换花活。",
        "2. 阶段 5 搭画面：把 `core/MotionKit.tsx` 拷进 `src/components/`，`delay` 一律传 `at(i)`。",
        "3. 抽帧质检：起点前 1 帧 / 起点后 2 帧 / 结果停稳帧，见每张卡的 §8。",
        "4. 想改效果或新建自己的：见 `MY-MOTIONS.md`，成品放 `~/remotion-my-motions/<slug>/`，重新跑本脚本即可并入索引。",
        "",
    ]
    return "\n".join(lines)


def build_index(effects: list[dict], custom: list[tuple[dict, Path]]) -> None:
    INDEX.write_text(render_index(effects, custom), encoding="utf-8")


def main() -> int:
    effects = json.loads(SOURCE.read_text(encoding="utf-8"))
    seen = set()
    for e in effects:
        if e["slug"] in seen:
            raise SystemExit(f"duplicate slug: {e['slug']}")
        seen.add(e["slug"])
        write_effect(e, EFFECTS / e["slug"])
    custom = load_custom()
    build_index(effects, custom)
    print(f"OK: {len(effects)} effects, {len(custom)} custom, index -> {INDEX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
