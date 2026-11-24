# 环境坑清单（Windows / 本机实测）

每一条都踩过，先读再动手能省一小时。

> 装什么、什么版本、安装命令 → `00-dependencies.md`（含体检脚本 `scripts/check_env.py`）。
> 本文件只记「已经按清单装好了，为什么还是跑不起来」这类坑。

## Python 包

- **必须 `python -m pip install`**：裸 `pip` 可能装到另一个 Python 版本里（PATH 里有多个解释器时）
- **faster-whisper 需要 `av==15.1.0`**：`av>=19` 删除了 faster-whisper 依赖的 open 兼容参数，报 `TypeError ... got an unexpected keyword argument`；降级即修
- **whisper `medium` 模型在 16GB 内存机器上会被 OOM 杀掉**（进程直接 Terminated）：用 `small` + int8 + 降噪滤波；识别率不够先改降噪参数
- **HuggingFace 直连被墙**：`export HF_ENDPOINT=https://hf-mirror.com` 再跑（Windows 用 `set`）

## ffmpeg / ffprobe

- 本机在 `F:\ffmpeg\bin\`，不在 PATH；脚本里写全路径
- concat demuxer 的列表文件用**相对文件名 + cwd 指到列表所在目录**，别用绝对路径（列表解析对反斜杠/冒号敏感）
- mp3 拼接必须 `-c:a libmp3lame -ar 44100` 重编码统一采样率，`-c copy` 拼出的时长会漂

## 抖音下载

- `yt-dlp` 需要 cookies，桌面 UA 也救不了 → 走 CDP 截流（`scripts/capture_douyin.js`）
- 无头 Chrome 必须 `--disable-blink-features=AutomationControlled` + 真实桌面 UA + `--user-agent` 同步设置，否则页面黑屏/验证码
- 页面不自动播放：JS 里 `document.querySelector('video')?.play()` + 等 8~10 秒
- 拿到的流地址**有时效**（几十分钟），当轮立刻下完，别存着第二天用
- 下载流时必须带 `-H "Referer: https://www.douyin.com/"`，否则 403

## Node / Remotion

- **新工程复用 node_modules 用硬链接**：同盘 `cp -al node_modules <新工程>`（204 个包秒级完成，零额外空间；跨盘无效会失败，此时 robocopy）
- Git Bash 里裸命令名找不到 `.cmd`：显式 `./node_modules/.bin/remotion`（有 bash shim）或写全名
- Remotion 渲染是「headless Chrome 池」：机器同时开着自己的 Chrome 会抢内存，渲染慢是正常现象
- 渲染 crash 在中段：通常是某组件只在特定帧触发的 undefined 访问，静帧抽检要覆盖每个镜头页至少一帧

## 无头 Chrome + CDP（通用技巧）

```js
// 启动
chrome.exe --headless=new --remote-debugging-port=9333 \
  --user-data-dir=<临时目录> --no-first-run --disable-glink-features=AutomationControlled
// 端口信息: GET http://127.0.0.1:9333/json/list  → 每个页面的 webSocketDebuggerUrl
// Node 22+ 有全局 WebSocket，可直接连 CDP，无需 ws 包
```

- 用完必杀进程：临时 `user-data-dir` 目录几百 MB 起，残留即垃圾（本项目 Temp 里那个 1.9GB 的 chrome_feishu_profile 就是这么来的）
- 截获网络请求：`Network.enable` + 监听 `Network.requestWillBeSent`；**Web Worker 发出的请求监听不到**（飞书文档数据、部分播放器走 worker）——截不到就退回「页面滚动 + DOM 抓取」

## 本机沙箱

- `rm -rf` 对绝对路径（含盘符）会报 `SAFE_DELETE_INVALID_PATH`：**先 `cd` 进目录再删相对路径**；回收站系统 SID 部分需管理员
- PowerShell 里 `2>&1` 会把 native 命令的 exit code 改坏，避免
- 写 `.ps1`/`.bat` 别带非 ASCII 路径（编码会乱）；中文文件名操作优先 Git Bash + Python

## Windows 编码

- Python 脚本一律 `# -*- coding: utf-8 -*-` + `encoding="utf-8"` 读写
- 中文名文件在 bash/PowerShell/Python 三方传递时优先用 Python `pathlib` 处理

## 工具位置备忘（本机）

| 工具 | 位置 |
|---|---|
| ffmpeg / ffprobe | `F:\ffmpeg\bin\`（已在用户 PATH） |
| Node | `~/.workbuddy/binaries/node/versions/22.22.2-6/`（npm 在同目录） |
| Chrome | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| 参考工程（含可用 node_modules, remotion 4.0.540） | `F:\AI相关\龙人\skill\remotion-codex-10s\` |
| 官方 Remotion skills | `F:\AI相关\龙人\skill\remotion-skills\skills\` |
| 统一开发环境（用户 F 盘隔离规则） | `F:\dev-env\`：bin / tmp / npm-cache / npm-global / pip-cache / hf-cache |

**本机用户环境变量已重定向到 F 盘**（TEMP/TMP、npm cache/prefix、pip cache、HF_HOME）——临时文件、模型下载、包缓存都落 F，不占 C。改这些注册表值用 Python `winreg`（`reg.exe` 被安全策略拉黑；`setx` 会覆盖用户 PATH，**禁止用 setx 改 PATH**，改完要 `SendMessageTimeoutW` 广播 WM_SETTINGCHANGE）。
