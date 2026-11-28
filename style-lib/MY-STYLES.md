# MY-STYLES · 改成自己的画风 / 从空白做一个

> 库里的 60 个画风都可以改；也可以从空白做一个。成品存到 `~/remotion-my-styles/<slug>/`，**更新 skill 不会删掉它**。
> 与 `../motion-lib/MY-MOTIONS.md` 是同一套思路，只是对象从「动作」换成「画风」。

## 三条路

| 用户说 | 走哪条 |
|---|---|
| 「把深色科技发布改成我们品牌的配色」 | **A 改库里的画风** |
| 「按这张参考图做一个我们的画风」 | **B 从空白做**（有参考图） |
| 「做一个适合法律科普的画风」 | **B 从空白做**（无参考图） |

## A · 改库里的画风

1. 打开 `scripts/styles.json`，找到那个 slug，改 `bg` / `surface` / `text` / `accent` / `accent2` / `tex` / `feel` / `cam` / `inv` / `pit`。
2. 跑：
   ```bash
   python scripts/build_styles.py
   python scripts/validate_styles.py
   ```
3. 抽三帧看新色板；**不要手改** `styles/<slug>/` 下生成的文件，下次生成会覆盖。

> 只想给某一支片临时换色、不想改库：不要改数据源，直接在工程里 spread `getStyle(slug).palette` 做一次性覆盖，并在配方卡里注明。整片仍算同一个 slug。

## B · 从空白做一个

### 第 1 个问题（只问一次，不新增主流程的门）

让用户确认**最接近的技术基础**：从 12 类里选一个类当底板族（决定 `stage.type`），最多再借 1 个画风的色板当参考。把选择和理由各写一行。

> 例：「用 `grid` 底板（科技与界面类）当基础，色板参考 `blueprint` 的蓝白，但换成法条的深棕金。理由是法律科普要有档案感、不要科幻感。」

### 必填字段（照 `_template/` 三件套）

| 字段 | 要求 |
|---|---|
| `slug` | 小写字母 + 连字符，全局唯一 |
| `cn` / `en` | 中英文画风名 |
| `cat` | 12 类 id 之一（决定默认字体/底板/动作质感） |
| `sig` | 一句话视觉签名（读出来就能想象画面） |
| `bg` / `surface` / `text` / `accent` / `accent2` | 6 位 hex；强调色只服务最重要元素 |
| `tex` | 材质描述（纸纹 / 网格 / 扫描线 / 笔触 …） |
| `feel` | 动作质感一句话（缓动、入场、密度） |
| `cam` | 镜头语法一句话 |
| `good` / `bad` | 至少各 2 项；「不适合」比「适合」更重要 |
| `trig` | 至少 3 个触发词 |
| `inv` | 至少 2 条不变量（画风不可协商的东西） |
| `pit` | 至少 2 条坑 |

### 落地

1. 把新对象加进 `scripts/styles.json` 的 `styles` 数组（或放进 `~/remotion-my-styles/<slug>/style.json`）。
2. 跑 `python scripts/build_styles.py` → 自动生成 `STYLE.md` / `style.json` / `demo.tsx` 并并入 `styles/INDEX.md`。
3. 跑 `python scripts/validate_styles.py`，必须 PASS。
4. 在真实 Remotion 工程里注册一个 `Composition` 用 `<StyleStage slug="新slug">`，`remotion still` 抽三帧目检。
5. 把成品与三帧截图一起存 `~/remotion-my-styles/<slug>/`，并在 `~/remotion-my-styles/README.md` 追加一行（slug + 一句话 + 适合什么）。

## 验收（四问）

- [ ] 这个画风**一眼能认出来**，不是把默认色换一换？
- [ ] 色板/字体/底板/材质**互相支持**，不是各说各话？
- [ ] `badFor` 写清楚了， Agent 不会把它用在错的题材上？
- [ ] 三帧抽查通过；字幕条仍然可读；没有引入外部字体/图片/依赖？

## 不要做

- 不要复制 `lemomo-ai/lemo-opuscar` 的 `STYLE.md` 文本或 demo 代码（许可证与原创性问题）；只借鉴「逐卡 + 索引 + 自定义目录」的组织方式。
- 不要为了「更炫」给画风加 Three.js / 图片生成器 / 外部素材下载。
- 不要每页换皮；新画风也是**一整支片 1 个 slug**。
- 不要改 `core/StyleKit.tsx` 来硬编码某个画风；新画风走 token 数据。
