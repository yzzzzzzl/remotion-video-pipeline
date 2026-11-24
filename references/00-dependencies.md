# 依赖清单与安装

**先跑一遍体检**（只读，不改环境）：

```bash
python <skill根目录>/scripts/check_env.py
```

输出会列出 ✅ 已就绪 / ❌ 缺失，并在末尾直接给出缺失项的安装命令。**必需项（Node / ffmpeg / Python / Chrome / Remotion）全绿再进入阶段 1**。

> 配音方式此时**还没定**（G1 才问用户），Python 包先用默认 `both` 做体检即可；某条配音路线的包缺失**不算阻塞**，等 G1 用户选完再只装 / 只校验对应那一组，别让用户装用不上的东西（见 `09-interaction-gates.md`）。

---

## 一、必需依赖

| 依赖 | 最低版本 | 实测版本 | 用在哪 | 缺了会怎样 |
|---|---|---|---|---|
| **Node.js** | 18（推荐 22+） | v22.22.2 | 跑 Remotion CLI；22+ 自带全局 `WebSocket`，抓抖音流不需要 `ws` 包 | 无法启动 Remotion |
| **ffmpeg / ffprobe** | 5.0 | 9.0.2 | 抽帧（模式 A）、提取音频、拼接音轨、测时长 | 模式 A 抽帧与阶段 3 全断；**模式 B 阶段 1 不用抽帧，但阶段 3 仍需** |
| **Python** | 3.9（推荐 3.10+） | 3.13.14 | 跑 `scripts/*.py` | 无法生成音轨/时间轴 |
| **Chrome**（或 Edge） | 任意近期版 | Chrome 131+ | 模式 A 的无头 CDP 抓参考视频流；**两种模式共用的** `remotion render` 渲染器（模式 B 不需要抓流，但渲染照样要 Chrome） | 抓不到抖音；Remotion 会自动下载 Chrome Headless Shell |
| **Remotion 工程** | 4.x | 4.0.540 | 动画渲染本体（`remotion` + `@remotion/cli` + `react` 19） | 无 |

### 安装命令（Windows / Git Bash）

```bash
# Node：本机已随 WorkBuddy 安装，路径形如
#   ~/.workbuddy/binaries/node/versions/22.22.2-6/
# 若需单独装：https://nodejs.org/ 或 winget install OpenJS.NodeJS.LTS

# ffmpeg：解压到固定目录并写全路径调用（本机在 F:\ffmpeg\bin\）
#   winget install Gyan.FFmpeg   或   https://www.gyan.dev/ffmpeg/builds/
```

> **Remotion 不要 `npm install`**。复用已有工程的 `node_modules`（同盘硬链接，秒级、零额外空间）：
>
> ```bash
> cd <已有remotion工程> && cp -al node_modules <新工程路径>/node_modules
> ```
>
> 跨盘硬链接会失败，此时退回 `robocopy /E`（慢、占空间）。

## 二、Python 包

> **装哪一组由 G1 的用户选择决定**（`09-interaction-gates.md`）：选「AI 生成」只需路线 A；选「自己录」需要路线 B。G1 之前不必决定，体检用 `check_env.py`（默认 `both`）两条都查；选完用 `--mode tts` / `--mode whisper` 复检对应路线即可。

### 路线 A：AI 配音 / TTS（不需要显卡，装得少）

```bash
python -m pip install edge-tts
```

| 包 | 实测版本 | 说明 |
|---|---|---|
| `edge-tts` | 7.3.1 | 微软 Edge 在线 TTS，免费、中文音色多（`zh-CN-YunxiNeural` 等）；需联网 |

### 路线 B：真人录音逐字对轴（需 faster-whisper）

```bash
python -m pip install faster-whisper "av==15.1.0"
```

| 包 | 实测版本 | 说明 |
|---|---|---|
| `faster-whisper` | 1.2.1 | 字级时间戳识别；首次运行自动下模型（small 约 500MB） |
| `av` | **必须 15.1.0** | 锁死版本：`av>=19` 删了 faster-whisper 依赖的 `open()` 兼容参数，直接 `TypeError` |
| `ctranslate2` / `numpy` | 4.9.0 / 2.5.5 | 随 faster-whisper 自动装，不用管 |

模型下载走国内镜像（HuggingFace 直连会被墙）：

```bash
export HF_ENDPOINT=https://hf-mirror.com        # Git Bash
set HF_ENDPOINT=https://hf-mirror.com           # cmd
$env:HF_ENDPOINT="https://hf-mirror.com"        # PowerShell
```

模型选择：`small` + `int8` 是默认；`medium` 在 16GB 内存机器上会被 OOM 杀掉（进程直接 Terminated），别硬上，改用 `small` + 音频降噪（`afftdn`）。

## 三、可选依赖

| 依赖 | 用途 | 备注 |
|---|---|---|
| `yt-dlp` | 下载视频 | 对抖音基本失效（需 cookies），只在 B站/YouTube 等站点有用；抖音走 `scripts/capture_douyin.js` |
| 无头 Chrome | 抓流、截图 | 用本机已装 Chrome 即可，不需要 puppeteer / playwright |
| `libx264` 编码器 | H.264 输出 | gyan.dev 的 essentials build 已内置 |

## 四、极简安装脚本（全新机器）

```bash
# 1) Python 依赖：G1 之后按选定路线装其一（两者都装也没问题）
python -m pip install edge-tts faster-whisper "av==15.1.0"

# 2) 建工程并复用 node_modules
mkdir -p <workdir>/remotion-project
cd <已有remotion工程> && cp -al node_modules <workdir>/remotion-project/node_modules

# 3) 体检
python <skill根目录>/scripts/check_env.py
```

## 五、版本兼容红线（踩过的）

1. `av==15.1.0` —— 唯一必须锁死的包
2. 裸 `pip` 可能装到另一个解释器 —— 一律 `python -m pip`
3. Node < 22 时 `capture_douyin.js` 的 CDP WebSocket 需要额外 `npm i ws`，脚本里已做降级判断
4. ffmpeg 不在 PATH 时脚本会用 `F:\ffmpeg\bin\ffmpeg.exe` 兜底，换机器要改 `FFMPEG` 常量或用 `--ffmpeg` 参数
