/**
 * 音视频提取中转服务
 *
 * 功能：接收视频URL → ffmpeg 提取音频 → 返回音频下载URL
 * 用途：配合 Dify 工作流使用，解决 stvlynn/ffmpeg 插件不稳定的问题
 *
 * 部署方式：
 *   1. VPS:   node extract-audio-server.js  (配合 nginx/PM2)
 *   2. 本地:  node extract-audio-server.js  (配合 ngrok 暴露公网)
 *
 * 环境要求：Node.js 18+, ffmpeg 已安装并在 PATH 中
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, unlink, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';

// ─── 配置 ───────────────────────────────────────────────────
const PORT = process.env.PORT || 8899;
const HOST = process.env.HOST || '0.0.0.0';
const API_KEY = process.env.API_KEY || '';  // 可选：设置后需要在请求头传 Authorization
const MAX_FILE_SIZE = 500 * 1024 * 1024;    // 500MB
const CLEANUP_AFTER_MS = 30 * 60 * 1000;    // 30分钟后清理临时文件
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// ────────────────────────────────────────────────────────────

const WORK_DIR = join(tmpdir(), 'extract-audio-server');
await mkdir(WORK_DIR, { recursive: true });

// ─── 工具函数 ───────────────────────────────────────────────

/** 下载文件到本地，返回本地路径 */
async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败: HTTP ${res.status}`);
  const ext = extname(new URL(url).pathname) || '.mp4';
  const localPath = join(WORK_DIR, `${randomUUID()}${ext}`);
  await pipeline(res.body, createWriteStream(localPath));
  return localPath;
}

/** ffmpeg 提取音频: 视频 → 16kHz mono WAV */
async function extractAudio(inputPath) {
  const outputPath = join(WORK_DIR, `${randomUUID()}.wav`);
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i', inputPath,
      '-vn',                 // 丢弃视频流
      '-ar', '16000',        // 16kHz 采样率（ASR 最佳）
      '-ac', '1',            // 单声道
      '-c:a', 'pcm_s16le',   // PCM WAV
      '-y',                  // 覆盖已有文件
      outputPath,
    ], { timeout: 300_000 }); // 5分钟超时

    let stderr = '';
    proc.stderr.on('data', d => stderr += d);

    proc.on('close', code => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
}

/** 获取文件大小，返回 MB 字符串 */
async function getFileSize(path) {
  const s = await stat(path);
  return (s.size / 1024 / 1024).toFixed(1) + 'MB';
}

/** 定时清理临时文件 */
function scheduleCleanup(filePath) {
  setTimeout(async () => {
    try { await unlink(filePath); } catch { /* 忽略 */ }
  }, CLEANUP_AFTER_MS);
}

// ─── HTTP 服务 ──────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API Key 校验（如果配置了）
  if (API_KEY) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${API_KEY}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // ── GET /health ──
  if (url.pathname === '/health' && req.method === 'GET') {
    // 检查 ffmpeg 是否可用
    const ffmpegOk = await new Promise(resolve => {
      const p = spawn('ffmpeg', ['-version']);
      p.on('close', code => resolve(code === 0));
      p.on('error', () => resolve(false));
    });
    res.writeHead(ffmpegOk ? 200 : 500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: ffmpegOk ? 'ok' : 'ffmpeg_missing', ffmpeg: ffmpegOk }));
  }

  // ── POST /extract-audio ──
  //
  // 请求体 JSON:
  //   { "videoUrl": "https://example.com/video.mp4" }
  //
  // 或者直接上传文件 (multipart/form-data, field name = "file"):
  //   curl -F "file=@video.mp4" http://localhost:8899/extract-audio
  //
  // 返回:
  //   { "audioUrl": "https://your-server.com/audio/xxx.wav", "durationSec": 120.5, "sizeMB": "2.3MB" }
  //
  if (url.pathname === '/extract-audio' && req.method === 'POST') {
    let videoPath;
    try {
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('multipart/form-data')) {
        // ── 直接接收文件上传 ──
        const { fields, files } = await parseMultipart(req);
        const uploadedFile = files?.file;
        if (!uploadedFile) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: '缺少 file 字段' }));
        }
        videoPath = uploadedFile.path;
      } else {
        // ── JSON: 传 videoUrl ──
        const body = await readBody(req);
        const { videoUrl } = JSON.parse(body);
        if (!videoUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: '缺少 videoUrl' }));
        }
        console.log(`[extract-audio] 下载: ${videoUrl}`);
        videoPath = await downloadFile(videoUrl);
        scheduleCleanup(videoPath); // 下载的源文件定时删
      }

      console.log(`[extract-audio] 提取音频: ${videoPath}`);
      const audioPath = await extractAudio(videoPath);
      scheduleCleanup(audioPath); // 音频文件定时删

      const sizeMB = await getFileSize(audioPath);
      const filename = audioPath.split(/[/\\]/).pop();

      console.log(`[extract-audio] 完成: ${filename} (${sizeMB})`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        audioUrl: `${BASE_URL}/audio/${filename}`,
        filename,
        sizeMB,
      }));
    } catch (err) {
      console.error('[extract-audio] 错误:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // ── GET /audio/:filename ──
  // 下载提取好的音频文件，30分钟后自动过期
  if (url.pathname.startsWith('/audio/') && req.method === 'GET') {
    const filename = url.pathname.split('/audio/').pop();
    // 安全检查：防止路径穿越
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.writeHead(400);
      return res.end('Bad filename');
    }
    const filePath = join(WORK_DIR, filename);
    try {
      await stat(filePath);
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: '文件不存在或已过期' }));
    }
    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    const readStream = createReadStream(filePath);
    readStream.pipe(res);
    readStream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end('Stream error');
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ─── 简易 multipart 解析（不引入第三方依赖）─────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function parseMultipart(req) {
  const contentType = req.headers['content-type'];
  const boundary = '--' + contentType.split('boundary=')[1];
  const raw = Buffer.from(await readBodyRaw(req));
  const fields = {};
  const files = {};

  const parts = splitBuffer(raw, Buffer.from(boundary));
  for (const part of parts) {
    if (part.length < 4) continue;
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerStr = part.slice(0, headerEnd).toString();
    const body = part.slice(headerEnd + 4);
    // 去掉末尾 \r\n
    const cleanBody = body.slice(0, body.length - 2);

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];

    if (filenameMatch) {
      const filename = filenameMatch[1];
      const tmpPath = join(WORK_DIR, `${randomUUID()}_${filename}`);
      await writeFile(tmpPath, cleanBody);
      scheduleCleanup(tmpPath);
      files[name] = { filename, path: tmpPath, size: cleanBody.length };
    } else {
      fields[name] = cleanBody.toString();
    }
  }
  return { fields, files };
}

function readBodyRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function splitBuffer(buf, separator) {
  const parts = [];
  let start = 0;
  while (start < buf.length) {
    const idx = buf.indexOf(separator, start);
    if (idx === -1) break;
    parts.push(buf.slice(start, idx));
    start = idx + separator.length;
  }
  return parts;
}

// ─── 启动 ──────────────────────────────────────────────────

server.listen(PORT, HOST, () => {
  console.log(`🎙️  Extract Audio Server`);
  console.log(`  地址:  http://${HOST}:${PORT}`);
  console.log(`  健康检查: http://${HOST}:${PORT}/health`);
  console.log(`  POST ${BASE_URL}/extract-audio`);
  if (API_KEY) console.log(`  API Key:  已配置`);
  else console.log(`  API Key:  未配置（任何人可访问）`);
});
