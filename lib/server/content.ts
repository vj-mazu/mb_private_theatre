import 'server-only';
import { q } from './db';
import { cached } from './cache';

export const getBranches = cached(
  () => q<any>('SELECT name, slug, address, phone, map_url FROM branches WHERE is_active ORDER BY sort_order, id'), 'branches');

export const getHomeGallery = cached(
  () => q<any>('SELECT id, image_url, caption, category FROM gallery WHERE is_active ORDER BY featured DESC, sort_order, id DESC LIMIT 8'), 'home-gallery');

export const getGallery = cached(
  () => q<any>('SELECT id, image_url, caption, category FROM gallery WHERE is_active ORDER BY sort_order, id DESC'), 'gallery');
