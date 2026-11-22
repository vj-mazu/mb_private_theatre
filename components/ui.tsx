'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X, ImagePlus } from 'lucide-react';
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

export const cn = clsx;

/* ---------- Button ---------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  dark: 'bg-navy text-cream hover:bg-navy/90 shadow-sm',
  secondary: 'bg-cream-card text-navy border border-line hover:border-brand-300 hover:bg-brand-50',
  ghost: 'text-navy-soft hover:bg-cream-deep hover:text-navy',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
const sizes = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }, ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-200 ease-smooth active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant], sizes[size], className
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

/* ---------- Form fields ---------- */
const fieldBase =
  'w-full rounded-xl border border-line bg-white px-3.5 text-sm text-navy placeholder:text-navy-faint transition-colors duration-200 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-cream-deep disabled:text-navy-soft';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) {
  return <select ref={ref} className={cn(fieldBase, 'h-10 pr-8', className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, 'min-h-[80px] py-2.5', className)} {...p} />;
});

export function Field({ label, hint, error, children, className, required }: {
  label: string; hint?: string; error?: string; children: React.ReactNode; className?: string; required?: boolean;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-navy-soft">
        {label}{required && <span className="text-brand-600"> *</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-navy-faint">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm text-navy">
      <span className={cn('relative h-6 w-10 rounded-full transition-colors duration-300 ease-smooth', checked ? 'bg-brand-500' : 'bg-line')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-smooth', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </span>
      {label}
    </button>
  );
}

/* ---------- Badge ---------- */
const tones = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  sky: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};
export function Badge({ tone = 'slate', children, className }: { tone?: keyof typeof tones; children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', tones[tone], className)}>{children}</span>;
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }[size];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-cream-card shadow-lift sm:rounded-3xl', width)}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-sans text-base font-bold">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-navy-soft transition hover:bg-cream-deep hover:text-navy" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toast ---------- */
type ToastItem = { id: number; text: string; tone: 'ok' | 'error' };
const ToastCtx = createContext<(text: string, tone?: 'ok' | 'error') => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className={cn('pointer-events-auto rounded-xl px-4 py-2.5 text-sm font-medium shadow-lift', t.tone === 'ok' ? 'bg-navy text-cream' : 'bg-red-600 text-white')}>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Confirm dialog (replaces the browser's confirm()) ---------- */
type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const ask = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), []);
  const close = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} title={state?.title || ''} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
          <Button variant={state?.danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>{state?.confirmLabel || 'Confirm'}</Button>
        </>}>
        {state?.message && <p className="text-sm leading-relaxed text-navy-soft">{state.message}</p>}
      </Modal>
    </ConfirmCtx.Provider>
  );
}

/* ---------- Misc ---------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-500', className)} />;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-semibold text-navy">{title}</p>
      {children && <div className="mt-1 text-sm text-navy-soft">{children}</div>}
    </div>
  );
}

/** Resize an image in the browser before upload (keeps uploads small and fast). */
export async function resizeImage(file: File, maxSide = 1600, quality = 0.84): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), 'image/webp', quality));
}

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

/** Small fetch helper for JSON APIs that return { ok, data, error }. */
export async function api<T = any>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init || {};
  const res = await fetch(url, {
    ...rest,
    headers: json !== undefined ? { 'Content-Type': 'application/json', ...(rest.headers || {}) } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body = await res.json().catch(() => ({ ok: false, error: 'Unexpected server response' }));
  if (!body.ok) throw new Error(body.error || 'Request failed');
  return body.data as T;
}
