import 'server-only';
import crypto from 'crypto';
import sharp from 'sharp';
import { q } from './db';
import { HttpError } from './api';

const ALLOWED = ['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/gif', 'image/heic', 'image/heif'];
const MAX_UPLOAD = 15 * 1024 * 1024;

/**
 * Stores an uploaded image in Postgres (so DB backups include every image) and returns its URL.
 * Every image is re-encoded on the server: max 1600 px, WebP, EXIF rotation applied, metadata stripped —
 * typically 100–300 KB, keeping the database small regardless of what the browser sent.
 */
export async function saveUpload(form: FormData, field = 'file', opts: { maxSide?: number; quality?: number } = {}): Promise<string> {
  const file = form.get(field);
  if (!(file instanceof Blob)) throw new HttpError(400, 'Please choose an image');
  if (file.type && !ALLOWED.includes(file.type)) throw new HttpError(400, 'Only JPG, PNG, WEBP or HEIC images are allowed');
  if (file.size > MAX_UPLOAD) throw new HttpError(400, 'Image must be under 15 MB');

  let data: Buffer;
  try {
    data = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'none' })
      .rotate()
      .resize({ width: opts.maxSide ?? 1600, height: opts.maxSide ?? 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: opts.quality ?? 80, effort: 4 })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'This file could not be read as an image');
  }

  const id = crypto.randomUUID();
  const name = ((file as File).name || 'image').replace(/\.\w+$/, '') + '.webp';
  await q('INSERT INTO files (id, mime, size, name, data) VALUES ($1,$2,$3,$4,$5)', [id, 'image/webp', data.length, name, data]);
  return `/api/files/${id}`;
}
