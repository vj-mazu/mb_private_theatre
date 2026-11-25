import 'server-only';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import sharp from 'sharp';
import { q } from './db';
import { HttpError } from './api';

const ALLOWED = ['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/gif', 'image/heic', 'image/heif'];
const MAX_UPLOAD = 15 * 1024 * 1024;

/**
 * Stores an uploaded image in Postgres (so DB backups include every image) and returns its URL.
 * Every image is re-encoded on the server: max 2048 px (HD), WebP quality 90, EXIF rotation applied,
 * metadata stripped — sharp HD quality while keeping database size compact.
 */
export async function saveUpload(form: FormData, field = 'file', opts: { maxSide?: number; quality?: number } = {}): Promise<string> {
  const file = form.get(field);
  if (!(file instanceof Blob)) throw new HttpError(400, 'Please choose an image');
  if (file.type && !ALLOWED.includes(file.type)) throw new HttpError(400, 'Only JPG, PNG, WEBP or HEIC images are allowed');
  if (file.size > MAX_UPLOAD) throw new HttpError(400, 'Image must be under 15 MB');

  let data: Buffer;
  try {
    data = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'none', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: opts.maxSide ?? 2048, height: opts.maxSide ?? 2048, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: opts.quality ?? 90, effort: 4 })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'This file could not be read as an image');
  }

  const id = crypto.randomUUID();
  const name = ((file as File).name || 'image').replace(/\.\w+$/, '') + '.webp';
  await q('INSERT INTO files (id, mime, size, name, data) VALUES ($1,$2,$3,$4,$5)', [id, 'image/webp', data.length, name, data]);
  return `/api/files/${id}`;
}

const MAX_VIDEO = 200 * 1024 * 1024; // raw upload; it is stored compressed (usually 3–15 MB)
const MAX_SECONDS = 180;
const FFMPEG = process.env.FFMPEG_PATH?.trim() || 'ffmpeg';

/** Detects the real format from the file's first bytes (the browser's file type can't be trusted). */
function videoKind(head: Buffer): 'mp4' | 'mov' | 'webm' | null {
  if (head.length >= 12 && head.toString('latin1', 4, 8) === 'ftyp') return head.toString('latin1', 8, 12) === 'qt  ' ? 'mov' : 'mp4';
  if (head.length >= 4 && head.readUInt32BE(0) === 0x1a45dfa3) return 'webm';
  return null;
}

/** Runs ffmpeg; resolves with stdout, rejects with the end of stderr. ENOENT = ffmpeg not installed. */
function ffmpeg(args: string[], timeoutMs: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    const out: Buffer[] = []; let err = '';
    p.stdout.on('data', (d) => out.push(d));
    p.stderr.on('data', (d) => { err = (err + d).slice(-2000); });
    const timer = setTimeout(() => p.kill('SIGKILL'), timeoutMs);
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(err || `ffmpeg exited with ${code}`)); });
  });
}

// One compression at a time, so a big upload never starves the website of CPU.
let queue: Promise<unknown> = Promise.resolve();
const oneAtATime = <T>(job: () => Promise<T>): Promise<T> => {
  const run = queue.then(job, job);
  queue = run.catch(() => {});
  return run;
};

/**
 * Compresses a video from disk for the web: H.264 MP4, longest side ≤ 1280 px, ≤ 30 fps, AAC 96 kbps,
 * metadata removed, "faststart" (plays while it downloads), max 3 minutes. Also returns a WebP cover frame.
 */
async function compressVideo(src: string, dir: string): Promise<{ video: Buffer; poster: Buffer | null }> {
  const dst = path.join(dir, 'out.mp4');
  const even = (side: string) => `trunc(min(1280\\,${side})/2)*2`;
  await ffmpeg(['-i', src, '-t', String(MAX_SECONDS), '-map', '0:v:0', '-map', '0:a:0?',
    '-vf', `scale=w='if(gte(iw,ih),${even('iw')},-2)':h='if(gte(iw,ih),-2,${even('ih')})',fps=fps='min(30,source_fps)',format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-profile:v', 'high', '-threads', '2',
    '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-map_metadata', '-1', '-movflags', '+faststart', dst], 5 * 60_000);
  const video = await fs.readFile(dst);
  let poster: Buffer | null = null;
  try {
    const png = await ffmpeg(['-ss', '1', '-i', dst, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], 60_000);
    if (png.length) poster = await sharp(png).webp({ quality: 85 }).toBuffer();
  } catch { /* very short clip: no cover, the first frame is shown instead */ }
  return { video, poster };
}

const insertFile = async (mime: string, name: string, data: Buffer) => {
  const id = crypto.randomUUID();
  await q('INSERT INTO files (id, mime, size, name, data) VALUES ($1,$2,$3,$4,$5)', [id, mime, data.length, name, data]);
  return `/api/files/${id}`;
};

/**
 * Stores an uploaded video in Postgres (included in backups), streamed to disk before queuing so
 * concurrent uploads never exhaust Node heap. Returns the video URL and an automatic cover photo URL.
 */
export async function saveVideo(form: FormData, field = 'file'): Promise<{ url: string; poster: string }> {
  const file = form.get(field);
  if (!(file instanceof Blob)) throw new HttpError(400, 'Please choose a video');
  if (file.size > MAX_VIDEO) throw new HttpError(400, 'Video must be under 200 MB');

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mb-video-'));
  const src = path.join(dir, 'in');
  try {
    await pipeline(Readable.fromWeb(file.stream() as any), createWriteStream(src));
    const fh = await fs.open(src, 'r');
    const head = Buffer.alloc(12);
    try { await fh.read(head, 0, 12, 0); } finally { await fh.close(); }
    const kind = videoKind(head);
    if (!kind) throw new HttpError(400, 'Only MP4, MOV (iPhone) or WebM videos are allowed');
    const base = ((file as File).name || 'video').replace(/\.\w+$/, '').slice(0, 80) || 'video';

    let out: { video: Buffer; poster: Buffer | null };
    try {
      out = await oneAtATime(() => compressVideo(src, dir));
    } catch (e: any) {
      if (e?.code !== 'ENOENT') {
        console.error('[video] compression failed', e?.message);
        throw new HttpError(400, 'This video could not be processed. Try another file or export it as MP4.');
      }
      // ffmpeg not installed (local development): store MP4/WebM as uploaded.
      console.warn('[video] ffmpeg not found - storing the video uncompressed');
      if (kind === 'mov') throw new HttpError(400, 'iPhone .mov videos need the server video converter (ffmpeg). Please upload an MP4.');
      if (file.size > 60 * 1024 * 1024) throw new HttpError(400, 'Video must be under 60 MB');
      const raw = await fs.readFile(src);
      return { url: await insertFile(kind === 'webm' ? 'video/webm' : 'video/mp4', `${base}.${kind}`, raw), poster: '' };
    }
    const url = await insertFile('video/mp4', `${base}.mp4`, out.video);
    const poster = out.poster ? await insertFile('image/webp', `${base}-cover.webp`, out.poster) : '';
    return { url, poster };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
