'use client';

import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button, Spinner, cn, resizeImage, useToast } from '@/components/ui';

/** Image picker that uploads to /api/admin/upload and returns the served URL. */
export function ImageUpload({ value, onChange, label = 'Image', aspect = 'aspect-[4/3]' }: {
  value: string; onChange: (url: string) => void; label?: string; aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await resizeImage(file);
      const fd = new FormData();
      fd.append('file', blob, file.name.replace(/\.\w+$/, '.webp'));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      onChange(json.data.url);
    } catch (e: any) {
      toast(e.message || 'Upload failed', 'error');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-navy-soft">{label}</span>
      <button type="button" onClick={() => ref.current?.click()}
        className={cn('group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-cream transition hover:border-brand-400', aspect)}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover transition duration-300 group-hover:opacity-80" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-navy-soft"><ImagePlus className="h-6 w-6" />Upload</span>
        )}
        {busy && <span className="absolute inset-0 flex items-center justify-center bg-white/70"><Spinner /></span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {value && <button type="button" onClick={() => onChange('')} className="mt-1 text-xs text-navy-soft hover:text-red-600">Remove</button>}
    </div>
  );
}

/**
 * Upload a video (admins). The server compresses it for the web and makes a cover photo, passed as `poster`.
 * Shows upload progress, then "Compressing…" while the server works.
 */
export function VideoUpload({ value, onChange, label = 'Video', hint }: { value: string; onChange: (url: string, poster?: string) => void; label?: string; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const toast = useToast();

  function pick(file?: File) {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) { toast('Video must be under 200 MB', 'error'); return; }
    const fd = new FormData();
    fd.append('file', file, file.name);
    // XMLHttpRequest (not fetch) so a large video shows real upload progress.
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload?kind=video');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      setProgress(null);
      if (ref.current) ref.current.value = '';
      let json: any = null;
      try { json = JSON.parse(xhr.responseText); } catch { /* handled below */ }
      if (json?.ok) { onChange(json.data.url, json.data.poster || undefined); toast('Video compressed and saved'); }
      else toast(json?.error || 'Upload failed', 'error');
    };
    xhr.onerror = () => { setProgress(null); toast('Upload failed. Check your connection and try again.', 'error'); };
    setProgress(0);
    xhr.send(fd);
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-navy-soft">{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative flex aspect-[9/16] w-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-cream">
          {value
            ? <video src={value} controls playsInline preload="metadata" className="h-full w-full bg-black object-cover" />
            : <span className="px-2 text-center text-xs text-navy-soft">No video yet</span>}
          {progress !== null && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/85 text-xs font-semibold text-navy">
              <Spinner />{progress < 100 ? `Uploading ${progress}%` : 'Compressing…'}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Button type="button" size="sm" variant="secondary" disabled={progress !== null} onClick={() => ref.current?.click()}>{value ? 'Replace video' : 'Upload video'}</Button>
          {value && <button type="button" onClick={() => onChange('')} className="block text-xs text-navy-soft hover:text-red-600">Remove</button>}
          <p className="max-w-xs text-xs text-navy-faint">{hint || 'MP4, iPhone MOV or WebM, under 200 MB. It is compressed automatically (takes up to a minute). Vertical (9:16) videos look best.'}</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="video/mp4,video/quicktime,video/webm,.mov" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
