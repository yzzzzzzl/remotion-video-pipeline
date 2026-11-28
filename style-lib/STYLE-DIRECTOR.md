# Style Director · 选画风的判定

> 给 Agent 的判定规则：**一支片只选 1 个画风**，按主题自动定，不追问用户。
> 画风定「整片长什么样」；动作另见 `../motion-lib/MOTION-DIRECTOR.md`。

## 1. 三步定 slug

1. **主题 → 类别**：查下面的映射表，落到 12 类之一。
2. **类别 → 画风**：读 `styles/INDEX.md` 该类 5 行，再看 `styles/<slug>/STYLE.md` §7 的「适合 / 不适合 / 触发词」。
3. **冲突裁决**：**不适合 > 适合 > 好看**。定不下来就取该类第 1 个，写进配方卡。

判定结果只写一行：`style: <slug> — <一句理由>`。

## 2. 主题 → 类别映射（与 `../references/10-first-15s.md` §5 对齐）

| 主题特征 | 类别 | 首选 slug | 别选 |
|---|---|---|---|
| 产品发布、新版本、工具教程、命令行 | 科技与界面 | `dark-tech-keynote` / `terminal-crt` | `crayon-book` |
| 统计、增长、复盘、结构拆解 | 数据与图表 | `dataviz-clean` / `blueprint` | `neon-tubes` |
| 课堂、公式推导、方法论、培训 | 板书与手绘 | `chalkboard` / `whiteboard` | `glass-product` |
| 深度长文、报道、观点、行业报告 | 印刷与编辑 | `editorial` / `type-swiss` | `pixel-rpg` |
| 人文、传统、古诗、节庆、东方美学 | 纸艺与工艺 | `ink-wash` / `paper-cut` | `spreadsheet-film` |
| 轻科普、儿童、趣味、游戏化 | 卡通与动画 | `midcentury` / `pixel-rpg` | `documentary` |
| 架构、模块、产品构造、空间关系 | 立体与材质 | `isometric` / `low-poly` | `one-line` |
| 历史、新闻、调查、真实事件 | 胶片与纪实 | `documentary` / `newsreel` | `memphis` |
| 抽象概念、系统感、节奏、信号 | 光与线 | `circuit-board` / `flow-field` | `woodcut` |
| 地理、考据、样本、规模对比 | 地图与实证 | `satellite` / `data-physical` | `rubber-hose` |
| 故事、情绪、审美、绘本 | 绘画笔触 | `watercolor` / `crayon-book` | `terminal-crt` |
| 概念定义、分类、原则、宣言 | 几何与构成 | `bauhaus` / `type-swiss` | `found-footage` |

用户**点名**了画风（中文名 / 英文名 / slug 都算）→ 直接用，跳过映射；点名的是类别 → 在该类 5 个里选最贴的。

## 3. 密度与节奏（画风侧）

| 画风 `motion.density` | 处理 |
|---|---|
| 低 | 留白多、动作少；靠排版与光变化推进，别堆装饰 |
| 中 | 每章 1 个主动作 + 1 个永动小元素即可 |
| 高 | 允许持续有元素在动，但仍遵守「一屏 ≤3~4 文字块」 |

无论哪档，**静态元素停留 >3s 必须挂运动**（主流水线铁律第 4 条）；画风底板本身是静止的，靠永动小元素（进度条 / 呼吸光 / 数据轨）补密度。

## 4. 与动作层的分工

| 决策 | 谁管 |
|---|---|
| 色板、字体、底板、材质、镜头气质 | 画风层（本库） |
| 哪个元素何时进场、怎么连线/滚动/停稳 | 动作层 `motion-lib/` |
| 开场 450 帧内的 HUD / 代码雨 / 故障字 | `10-first-15s.md` §4（H 组装饰） |
| 动画锚点 `at(i)` | 主流水线 `timeline.json`，画风不接管 |
| 每章 1 个主动作 | `motion-lib/MOTION-DIRECTOR.md` |

一张卡里 `recommendedMotions` 给的是**该类建议搭配**，不是强制；台词触发词优先级更高。

## 5. 不追问

- 用户没指定画风 → 按上表自动定，**不新增确认门**。
- 用户只说「好看点 / 高级点」→ 按主题自动定，不反问。
- 用户说「多来几种画风」→ 理解为「这个 skill 要能提供多种选择」，**仍是这一支片选 1 个**；可以在交付说明里附 2~3 个备选 slug，但不做混搭。
- G1 / G2 仍是仅有的两道门，见 `../references/09-interaction-gates.md`。

## 6. 反模式

- **每页换皮**：开场 `dark-tech-keynote`、正片 `chalkboard`、结尾 `neon-tubes` → 视觉散架，直接判不合格。
- **按好看选、不看不适合**：讲财报用 `crayon-book`、讲儿童用 `documentary`。
- **画风接管动作**：把「什么时候进场」写进 STYLE.md 或按秒数硬编码。
- **混两个画风的色板**：取 A 的底 + B 的强调色，破坏不变量。
- **为画风加依赖**：装外部字体、下载材质图、引 Three.js —— 本库明确零新增依赖。
- **用画风替代开场装饰**：H 组特效仍要按 `10` §4 走，只是 450 帧后卸载；画风底板保留。
