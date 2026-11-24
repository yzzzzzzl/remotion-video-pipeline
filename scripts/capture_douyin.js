#!/usr/bin/env node
/**
 * capture_douyin.js — 无头 Chrome + CDP 截获抖音视频/音频流地址
 *
 * 用法:
 *   node capture_douyin.js "https://www.douyin.com/video/<id>" urls.json [--timeout 30000]
 *
 * 输出 urls.json: { videoUrl, audioUrl, all: [...] }
 *   videoUrl 含 "media-video-avc1"，audioUrl 含 "media-audio-und-mp4a"
 *
 * 前置:
 *   - 本机 Chrome（路径见下方 CHROME 常量，可 env CHROME_PATH 覆盖）
 *   - Node 22+（全局 WebSocket）
 *
 * 下载（流地址有时效，拿到立刻下）:
 *   curl -A "<桌面UA>" -H "Referer: https://www.douyin.com/" "<videoUrl>" -o video.mp4
 *   ffmpeg -y -i video.mp4 -i audio.mp4 -c copy original.mp4
 *
 * 注意:
 *   - 必须伪装（--disable-blink-features=AutomationControlled + 桌面 UA），否则不开播
 *   - 页面不自动播放：脚本会调 video.play() 并等待
 *   - Web Worker 发出的请求抓不到；抓不到媒体流时打印 page title 供排查
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const CHROME = process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333 + Math.floor(Math.random() * 100);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const url = process.argv[2];
const outPath = process.argv[3] || "urls.json";
const timeoutMs = parseInt((process.argv[4] || "").replace("--timeout=", ""), 10) || 30000;
if (!url) { console.error("usage: node capture_douyin.js <url> [out.json] [--timeout=30000]"); process.exit(1); }

function httpJson(p) {
  return fetch(`http://127.0.0.1:${PORT}${p}`).then(r => r.json());
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "douyin_cap_"));
  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run", "--disable-gpu", "--window-size=1280,900",
    "--disable-blink-features=AutomationControlled",
    `--user-agent=${UA}`,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    // 等 DevTools 端口就绪
    let targets = null;
    for (let i = 0; i < 40; i++) {
      try { targets = await httpJson("/json/list"); break; } catch { await sleep(300); }
    }
    if (!targets) throw new Error("chrome devtools port not ready");

    const page = targets.find(t => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let msgId = 0;
    const pending = new Map();
    const mediaUrls = [];
    const send = (method, params = {}) => new Promise((res) => {
      const id = ++msgId;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
      if (m.method === "Network.requestWillBeSent") {
        const u = m.params.request.url;
        if (/douyinvod|media-video|media-audio|\.mp4|\.m4a/.test(u)) mediaUrls.push(u);
      }
    };

    await send("Network.enable");
    await send("Page.enable");
    await send("Page.navigate", { url });
    await sleep(8000);

    // 点播放（抖音页面默认暂停）
    await send("Runtime.evaluate", {
      expression: `document.querySelector('video') && document.querySelector('video').play()`,
    });

    // 等媒体流出现
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await sleep(1500);
      if (mediaUrls.some(u => /media-video/.test(u)) &&
          mediaUrls.some(u => /media-audio/.test(u))) break;
      // 再戳一次播放
      await send("Runtime.evaluate", {
        expression: `document.querySelector('video') && document.querySelector('video').play()`,
      });
    }

    const videoUrl = mediaUrls.find(u => /media-video/.test(u));
    const audioUrl = mediaUrls.find(u => /media-audio/.test(u));

    let title = "";
    try {
      const t = await send("Runtime.evaluate", { expression: "document.title", returnByValue: true });
      title = t && t.result && t.result.value || "";
    } catch {}

    const result = { videoUrl: videoUrl || null, audioUrl: audioUrl || null,
                     title, count: mediaUrls.length, all: mediaUrls };
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

    if (videoUrl) {
      console.log(`OK video+audio captured -> ${outPath}`);
      console.log(`  title: ${title}`);
      console.log(`  urls valid ~30min; download with Referer: https://www.douyin.com/`);
    } else {
      console.log(`NO media stream captured (${mediaUrls.length} candidates)`);
      console.log(`  page title: ${title}`);
      console.log(`  anti-bot or worker-delivered stream; see references/07-gotchas.md`);
    }
    ws.close();
  } finally {
    chrome.kill();
    // 临时 profile 会残留数百 MB，必须清掉
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
