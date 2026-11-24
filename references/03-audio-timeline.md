# 阶段 3：配音与逐字对轴

两条路线，产出同一个东西：`public/voiceover.mp3` + `data/timeline.json`。

> **走哪条路线由 G1 的用户选择决定，禁止自行选**（`09-interaction-gates.md`）：选「自己录」→ 路线 B；选「AI 生成」→ 路线 A。
>
> **无论哪条路线，音轨成型后都必须停在 G2**：把 `voiceover.mp3` 交付用户试听、拿到明确确认，才允许进入阶段 4 做画面。AI 配音是**强制门**，真人录音路线建议同样过一遍。
>
> 此刻改音频最便宜（只重跑一个脚本）；一进画面就要连带返工 `timeline.json`、镜头表 `from`、画面文案四处。

## 路线 A：AI 配音 / TTS（快速出稿 / 草稿版）

`scripts/make_audio.py`（已参数化）：

```bash
python scripts/make_audio.py --root <工程路径> --voice zh-CN-YunxiNeural --rate +12%
```

- **逐句生成**（不是整篇一段）：每行一个 mp3，`ffprobe` 测真实时长——这是「零漂移」的来源
- 声音选择：教程类 `zh-CN-YunxiNeural`（年轻干脆）；浑厚播音用 `zh-CN-YunjianNeural`；女声 `zh-CN-XiaoxiaoNeural`
- 帧换算：时长 × fps 四舍五入，每行 `startFrame = round(start*fps)`，累计无浮点误差
- 章节间垫 0.9s、行间 0.35s、开头 0.4s / 结尾 1.6s 静音
- 拼接用 ffmpeg concat demuxer（`-c:a libmp3lame -b:a 128k -ar 44100` 重编码统一规格）

校验：`拼接总时长 ≈ Σ(各句时长) + 静音`，误差 < 0.05s。脚本会打印，超了就查 concat 列表路径。

### 审听门 G2（强制，不得跳过）

`voiceover.mp3` + `timeline.json` 生成完就**停**，不要顺势开始搭工程：

1. 把音轨**交付给用户听**：`present_files` 呈现 `voiceover.mp3`（或给出绝对路径让用户本地播放），不要只在终端打印「已生成，时长 3:52」
2. 附试听自检卡：路径 / 时长 / 句数 / 音色 / 语速 / `口播稿-纯文本.md` 逐句对照 / 留意点（章节静音、开头结尾静音、多音字、断句）
3. 明确问一句「配音听起来没问题吗？确认后我才开始做画面和成片」，**等明确确认**；沉默、「你看着办」不算通过
4. 确认前**禁止**进入阶段 4/5/6、禁止写镜头表动画、禁止 `remotion render` 出 MP4

用户不满意就改完**重新交付试听**，直到确认（同一道门内迭代，不算多打断一次）：

| 反馈 | 动作 |
|---|---|
| 某字/词读错、多音字 | 改 `scenes.json` 该行文本或换同音词，只重跑该句 TTS 再拼接 |
| 整体太快 / 太慢 | 改 `--rate` 重跑 `make_audio.py`，timeline 整体重算，零画面返工 |
| 某句停顿别扭、断句错 | 调行间/章节静音或重新拆行；**行数变了必须同步 04 镜头表 `from`** |
| 音色不喜欢 | 换 `--voice` 整段重跑 |

完整提问模板、判据与反模式见 `09-interaction-gates.md`。

## 路线 B：真人录音（正式版）

用户语速和 TTS 差别巨大（实测快 30%），必须**逐字对轴**而不是按句估时。

### 环境准备

```bash
python -m pip install faster-whisper edge-tts
python -m pip install "av==15.1.0"        # av>=19 与 faster-whisper 不兼容，必装 15.x
set HF_ENDPOINT=https://hf-mirror.com     # 模型下载走国内镜像
```

模型用 `small`（CPU int8，4 分钟录音约 2~3 分钟跑完）。`medium` 会被系统杀掉（内存 >4GB）。识别率不够时**先降噪再换模型**：

```
-af "highpass=f=80,afftdn=nf=-25,lowpass=f=7500" -ar 16000 -ac 1
```

### 对齐算法（`scripts/align_real_voice.py`）

1. 转写拿到**词级时间戳** → 展开成字流（每字继承所属词的起止时间）
2. 稿子去标点（只留 `0-9A-Za-z\u4e00-\u9fff`）成目标字符串
3. **贪心两指针对齐**：游标 j 在 ASR 字流上走，允许前瞻 ≤8 字跳过 ASR 幻觉，也允许跳过 ASR 漏掉的稿字
4. 每行的 (start, end) = 该行首尾已对齐字的时间；漏对齐字用前后邻插值
5. 匹配率 = 对齐字数 / 稿字数，**低于 85% 要停下来**：先查录音质量/降噪，再考虑人工修正

### 分段录音的处理（常见！用户经常录到一半断）

- 录音 1 覆盖 0..K 行（第 K 行只说了一半）：把录音 1 在 `行K结束时间 + 0.25s` 剪断
- 录音 2 从第 K 行重新开始：定位它**首个语音起点**，剪掉之前的空白（留 0.25s lead-in）
- 两段之间垫 0.7s 静音拼接；录音 2 的所有行时间 **+ offset**（= 剪后长度 + 间隔）
- `align_raw.json` 存剪点，`build_timeline.py` 负责实际拼接 + 时间轴生成

> 拼接完成后**同样把 `voiceover.mp3` 交付用户试听**（G2 建议门）：分段剪点和 0.7s 垫静音最容易听出不自然，此时调整只需重跑 `build_timeline.py`，画面还没做。

### timeline.json 构建规则（`scripts/build_timeline.py`）

- 每行时长 = `下一行 start - 0.08s`（字幕比语音早收一点）；最后一行 `end + 1.0s`
- 单调性强制修正：行 start 不得小于上一行，倒挂的给 `+0.01s`
- 章节边界 = 本章首行 start / 末行 end + 0.4s
- `durationInFrames = round(总时长 × fps)`；`totalDuration` 记秒
- 校验音轨：`ffprobe voiceover.mp3` 的 duration 与时间轴总长差 < 0.1s

## 换配音改稿速查

| 场景 | 操作 |
|---|---|
| 用户重录整段 | 路线 B 全流程重跑（scenes.json 不动，镜头不用改）→ **重走 G2** |
| 换 AI 音色 / 语速 | 改 `--voice` / `--rate` 重跑 `make_audio.py`，timeline 整体重算 → **重走 G2** |
| 删掉某几句 | ffmpeg 在该句末剪断 + 垫尾静音；timeline 删行、改章节 endFrame 和 durationInFrames；镜头表里指向被删行的 `from` 前移 → **重走 G2** |
| 中途加一句 | scenes.json 插行 → 重对轴 → 检查加句位置之后的镜头 `from` 是否要 +1 → **重走 G2** |
| 只动画面（配色/动效/画面文案），音轨不变 | 不用重走 G2，改完直接渲染 |

**删/加行之后，镜头表 `from` 和 `from` 之后所有行索引必须重新过一遍**——错位一格的画面/台词不同步就是这么来的。
**音轨只要变过，G2 就要重走一次**（`09-interaction-gates.md` §改稿阶段）：把新音轨再交付试听，别默认沿用上一次的确认。
