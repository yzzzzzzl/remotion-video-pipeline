#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""画风库自检：数据源、三件套、索引、token、代码契约。

用法：python scripts/validate_styles.py
任何一项失败都以非零退出码结束，便于接进 CI / Agent 自检。
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = HERE / "styles.json"
STYLES = ROOT / "styles"
CORE = ROOT / "core"

errors = []
checks = 0


def ok(cond, msg):
    global checks
    checks += 1
    if not cond:
        errors.append(msg)


def no_random(code):
    """只检查真正的代码，忽略注释里『禁用 Math.random』这类说明文字。"""
    stripped = re.sub(r"/\*[\s\S]*?\*/", "", code)
    stripped = re.sub(r"//[^\n]*", "", stripped)
    return "Math.random" not in stripped


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    styles = data["styles"]
    cats = {c["id"]: c for c in data["categories"]}
    slugs = [s["slug"] for s in styles]

    ok(len(styles) == 60, f"画风数量应为 60，实际 {len(styles)}")
    ok(len(cats) == 12, f"分类数量应为 12，实际 {len(cats)}")
    ok(len(set(slugs)) == len(slugs), "slug 有重复")
    for c in cats:
        n = sum(1 for s in styles if s["cat"] == c)
        ok(n == 5, f"分类 {c} 应有 5 个画风，实际 {n}")

    required = ("slug", "cn", "en", "cat", "sig", "bg", "surface", "text",
                "accent", "accent2", "tex", "feel", "cam", "good", "bad",
                "trig", "inv", "pit")
    hex_re = re.compile(r"^#[0-9A-Fa-f]{6}$")
    for s in styles:
        ok(all(k in s and s[k] for k in required), f"{s.get('slug')} 缺字段")
        ok(s["cat"] in cats, f"{s['slug']} 的分类 {s['cat']} 不存在")
        for k in ("bg", "surface", "text", "accent", "accent2"):
            ok(bool(hex_re.match(s[k])), f"{s['slug']}.{k} 不是合法 6 位 hex: {s[k]}")
        ok(len(s["inv"]) >= 2, f"{s['slug']} 不变量少于 2 条")
        ok(len(s["pit"]) >= 2, f"{s['slug']} 坑少于 2 条")
        ok(len(s["trig"]) >= 3, f"{s['slug']} 触发词少于 3 个")
        ok(bool(re.match(r"^[a-z0-9-]+$", s["slug"])), f"{s['slug']} slug 格式不合法")

    for s in styles:
        d = STYLES / s["slug"]
        for name in ("STYLE.md", "style.json", "demo.tsx"):
            ok((d / name).is_file(), f"缺文件 {s['slug']}/{name}")

        full = json.loads((d / "style.json").read_text(encoding="utf-8"))
        ok(full["slug"] == s["slug"], f"{s['slug']}/style.json slug 不一致")
        ok(len(full["palette"]) == 9, f"{s['slug']} 色板字段数不对")
        ok(full["stage"]["type"] in data["stageTypes"], f"{s['slug']} stage.type 未定义")
        ok(len(full["recommendedMotions"]) >= 2, f"{s['slug']} 未推荐动效")

        md = (d / "STYLE.md").read_text(encoding="utf-8")
        ok("do not edit by hand" in md, f"{s['slug']}/STYLE.md 缺生成标记")
        ok("## 11. 质检" in md, f"{s['slug']}/STYLE.md 缺质检节")
        ok(s["slug"] in md, f"{s['slug']}/STYLE.md 未写出 slug")

        tsx = (d / "demo.tsx").read_text(encoding="utf-8")
        ok("StyleStage" in tsx, f"{s['slug']}/demo.tsx 未使用 StyleStage")
        ok(f'"{s["slug"]}"' in tsx, f"{s['slug']}/demo.tsx slug 不对")
        ok(no_random(tsx), f"{s['slug']}/demo.tsx 用了 Math.random")

    index = (STYLES / "INDEX.md").read_text(encoding="utf-8")
    ok("do not edit by hand" in index, "INDEX.md 缺生成标记")
    for s in styles:
        ok(f"`{s['slug']}`" in index, f"INDEX.md 未收录 {s['slug']}")
    for c in cats.values():
        ok(f"## {c['cn']}" in index, f"INDEX.md 缺分类 {c['cn']}")
    ok("**60**" in index, "INDEX.md 总数不是 60")

    tokens = (CORE / "style-tokens.ts").read_text(encoding="utf-8")
    ok("do not edit by hand" in tokens, "style-tokens.ts 缺生成标记")
    for s in styles:
        ok(f'"{s["slug"]}": {{' in tokens, f"style-tokens.ts 缺 {s['slug']}")
    ok("export const STYLE_SLUGS" in tokens, "style-tokens.ts 缺 STYLE_SLUGS")

    kit = (CORE / "StyleKit.tsx").read_text(encoding="utf-8")
    ok(no_random(kit), "StyleKit.tsx 用了 Math.random")
    for fn in ("getStyle", "StyleStage", "StyledTitle", "StyledBody", "StyledLabel",
               "StyleCard", "StyledCaption", "styleVars"):
        ok(f"export" in kit and fn in kit, f"StyleKit.tsx 缺导出 {fn}")
    ok(kit.count("case \"") >= 12, "StyleKit.tsx 底板族少于 12 种")

    print(f"checked {checks} assertions across {len(styles)} styles / {len(cats)} categories")
    if errors:
        print(f"FAILED ({len(errors)}):")
        for e in errors[:40]:
            print("  -", e)
        if len(errors) > 40:
            print(f"  ... and {len(errors) - 40} more")
        return 1
    print("PASS: 60 styles / 180 generated files / index current / no Math.random / 12 stage types")
    return 0


if __name__ == "__main__":
    sys.exit(main())
