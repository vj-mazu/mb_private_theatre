'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { introDelay } from './IntroLoader';
import { PROP_ART, propsFor, type Tone } from './heroProps';

export interface HeroSlide { name: string; image: string; href: string }

/*
 * Full-screen occasion slider. Each occasion floods the hero with one theme colour, its name sits huge behind a
 * framed theatre photo, and celebration props (cake, popcorn, poppers, balloons…) float around it at different depths.
 * A slide holds for a couple of seconds (its photo slowly zooming inside the frame), then the whole slide zooms
 * through the screen: every layer flies towards the viewer from the photo's centre by a different amount (word least,
 * blurred corner props most) while the slide fades, and the next slide grows into place behind it. Going back
 * plays the same move in reverse.
 * Everything inside a slide is drawn on a 1440 × 900 design frame scaled by --u.
 */

type Mode = 'd' | 'm';
const FRAME_W = 1440;
const U = (v: number) => `calc(var(--u) * ${v})`;
const EASE = 'cubic-bezier(0.22, 0.8, 0.3, 1)';
const FACTORS = [0.4, 0.3, 0.15, 0.55, 0.75]; // parallax travel per layer: word, shadow, photo, props, corners
const HOLD_MS = 2400;        // a settled slide stays this long, then zooms through to the next
const THROUGH_MS = 950;      // the zoom-through
const THROUGH = [1.6, 1.75, 2, 2.6, 3.4]; // how far each layer flies towards the viewer: word, shadow, photo, props, corners
const ARRIVE = [0.86, 0.84, 0.8, 0.72, 0.62]; // the incoming slide's layers grow from these
const EASE_IN = 'cubic-bezier(0.4, 0, 0.75, 0.55)'; // rushes into the screen, visibly from the start
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';   // settles softly
const PHOTO_DRIFT = 1.08;    // slow zoom of the photo inside its frame while a slide holds

interface Theme { bg: string; word: string; ink: string; accent: string; line: string; shadow: string; cta: 'gold' | 'navy'; tones: [Tone, Tone]; glow: boolean }
const THEMES: Theme[] = [
  { bg: 'radial-gradient(80% 75% at 50% 42%, #1f5a8c 0%, #0E2A47 60%, #071a2d 100%)', word: '#FBF7EF', ink: '#FFFFFF', accent: '#E7C77D', line: 'rgba(255,255,255,0.35)', shadow: 'rgba(2,10,22,0.55)', cta: 'gold', tones: ['sky', 'gold'], glow: true },
  { bg: 'radial-gradient(80% 75% at 50% 42%, #74c9f1 0%, #2A9BD9 55%, #126496 100%)', word: '#FFFFFF', ink: '#FFFFFF', accent: '#0E2A47', line: 'rgba(255,255,255,0.45)', shadow: 'rgba(8,40,70,0.45)', cta: 'navy', tones: ['gold', 'cream'], glow: true },
  { bg: 'radial-gradient(80% 75% at 50% 42%, #e6c57c 0%, #c09034 58%, #8a6216 100%)', word: '#FFFDF9', ink: '#FFFFFF', accent: '#0E2A47', line: 'rgba(255,255,255,0.45)', shadow: 'rgba(70,45,8,0.45)', cta: 'navy', tones: ['sky', 'cream'], glow: true },
  { bg: 'radial-gradient(80% 75% at 50% 42%, #FFFFFF 0%, #FBF7EF 55%, #EADFC9 100%)', word: '#0E2A47', ink: '#0E2A47', accent: '#C9962E', line: 'rgba(14,42,71,0.25)', shadow: 'rgba(14,42,71,0.28)', cta: 'navy', tones: ['sky', 'gold'], glow: false },
];

interface Slot { x: number; y: number; w: number; r: number }
// Props stay below the word band so they never cover the letters.
const SLOTS_D: Slot[] = [
  { x: 355, y: 335, w: 118, r: -8 },
  { x: 985, y: 330, w: 128, r: 8 },
  { x: 285, y: 545, w: 145, r: -6 },
  { x: 1200, y: 470, w: 145, r: 10 },
  { x: 985, y: 590, w: 125, r: -10 },
];
const CORNERS_D: Slot[] = [
  { x: -50, y: 330, w: 230, r: -12 },
  { x: 1290, y: 330, w: 200, r: 14 },
];
// Phones only show the middle ~700 design px (x 370-1070), so props get their own spots inside that,
// fully on screen in the gutters beside a slightly narrower photo; the blurred ones peek in from the edges.
const SLOTS_M: Slot[] = [
  { x: 390, y: 285, w: 114, r: -8 },
  { x: 938, y: 272, w: 118, r: 8 },
  { x: 382, y: 525, w: 128, r: -6 },
  { x: 940, y: 480, w: 122, r: 10 },
  { x: 835, y: 630, w: 112, r: -10 },
];
const CORNERS_M: Slot[] = [
  { x: 338, y: 690, w: 140, r: -12 },
  { x: 995, y: 372, w: 115, r: 14 },
];
// Layout per mode. Region = the vertical slice of the design frame that must stay visible between the UI bands.
// The word sits above the photo; the photo only tucks under the bottom edge of the letters, so the name stays readable.
const GEO = {
  d: { viewW: 1440, top: 64, bottom: 128, region: [70, 735], photo: { x: 495, y: 262, w: 450, h: 440 }, wordCy: 172, maxWord: 250, zoomCy: 482, slots: SLOTS_D, corners: CORNERS_D },
  m: { viewW: 700, top: 56, bottom: 244, region: [80, 790], photo: { x: 524, y: 250, w: 392, h: 524 }, wordCy: 160, maxWord: 165, zoomCy: 512, slots: SLOTS_M, corners: CORNERS_M },
} as const;

/** Big background word: drop generic words so "Birthday Party" reads "Birthday", "Date & Proposal" reads "Proposal". */
function shortWord(name: string) {
  const last = name.split('&').map((s) => s.trim()).filter(Boolean).pop() || name;
  return last.replace(/\b(party|event|celebrations?|night|special)\b/gi, '').replace(/\s+/g, ' ').trim() || name;
}

const layersOf = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>(':scope > [data-frame] > [data-l]'));
const pad = (v: number) => String(v).padStart(2, '0');

export function HeroStage({ title, slides, rating, from }: { title: string; slides: HeroSlide[]; rating: number; from: string }) {
  const n = slides.length;
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Photos load for the slide on screen and the next one (then stay): 9 photos at once would slow the first visit.
  const [seen, setSeen] = useState<number[]>([0, 1]);
  useEffect(() => {
    const n = slides.length;
    if (!n) return;
    setSeen((p) => { const add = [active, (active + 1) % n].filter((x) => !p.includes(x)); return add.length ? [...p, ...add] : p; });
  }, [active, slides.length]);
  const [mode, setMode] = useState<Mode>('d');
  const [sizes, setSizes] = useState<number[]>(() => slides.map(() => 260));
  const st = useRef({
    cur: 0, busy: false, intro: true, last: 0, inView: true, u: 1, reduce: false, down: null as null | { x: number; y: number },
    timer: 0 as ReturnType<typeof setTimeout> | 0, schedule: null as null | ((ms?: number) => void),
  });
  const zooms = useRef(new Map<number, Animation[]>());

  // ---- While a slide holds, its photo slowly zooms inside the frame (stopped once the slide has left).
  const stopZoom = useCallback((i: number) => {
    zooms.current.get(i)?.forEach((a) => a.cancel());
    zooms.current.delete(i);
  }, []);
  const startZoom = useCallback((i: number) => {
    const el = slideRefs.current[i];
    stopZoom(i);
    if (!el || st.current.reduce || typeof el.animate !== 'function') return;
    const anims = Array.from(el.querySelectorAll<HTMLElement>('[data-kb]')).map((k) => k.animate(
      [{ scale: '1' }, { scale: String(PHOTO_DRIFT) }],
      { duration: HOLD_MS + THROUGH_MS, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' }));
    zooms.current.set(i, anims);
  }, [stopZoom]);

  // ---- Scale the design frame to the hero box, and fit each word to the visible width.
  const layout = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const m: Mode = W < 1024 || H > W ? 'm' : 'd';
    const g = GEO[m];
    const [r0, r1] = g.region;
    const band = Math.max(200, H - g.top - g.bottom);
    const u = Math.max(0.2, Math.min(W / g.viewW, band / (r1 - r0)));
    el.style.setProperty('--u', `${u}px`);
    el.style.setProperty('--fx', `${(W - FRAME_W * u) / 2}px`);
    el.style.setProperty('--fy', `${g.top + (band - (r1 - r0) * u) / 2 - r0 * u}px`);
    st.current.u = u;
    setMode(m);

    // Fit each word to the visible width by measuring the real rendered text (Fraunces' optical sizing changes
    // letter widths with size, so two passes converge on the exact fit).
    const visible = Math.min(FRAME_W, W / u) * 0.9;
    const maxInk = m === 'd' ? Math.min(1330, visible) : visible;
    const spans = slides.map((_, i) => el.querySelector<HTMLElement>(`[data-word="${i}"]`));
    const fit = spans.map((sp) => Number(sp?.dataset.f) || 200);
    for (let pass = 0; pass < 2; pass++) {
      spans.forEach((sp, i) => {
        if (!sp) return;
        sp.style.fontSize = `calc(var(--u) * ${fit[i]})`;
        const w = sp.offsetWidth / u;
        if (w > 0) fit[i] = Math.min(g.maxWord, fit[i] * (maxInk / w));
      });
    }
    const next = fit.map((f) => Math.floor(f));
    spans.forEach((sp, i) => { if (sp) sp.style.fontSize = `calc(var(--u) * ${next[i]})`; });
    setSizes((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
  }, [slides]);

  // ---- Slide change: zoom-through. Forward: the old slide flies into the screen and fades while the new one grows
  // into place beneath it. Back: the old slide shrinks away and the new one comes down from the viewer on top.
  // Web Animations on the independent `scale` property, so it never fights the opening sequence's `transform`.
  const go = useCallback((to: number, dir: 1 | -1, user = true) => {
    const s = st.current;
    if (user) s.last = Date.now();
    if (s.busy || to === s.cur || n < 2) return;
    const A = slideRefs.current[s.cur], B = slideRefs.current[to];
    if (!A || !B) return;
    s.busy = true;
    setActive(to);
    const from = s.cur;
    const anims: Animation[] = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      anims.forEach((a) => a.cancel());
      A.style.visibility = 'hidden'; A.style.zIndex = '0'; A.setAttribute('aria-hidden', 'true');
      B.style.zIndex = '2'; B.removeAttribute('aria-hidden');
      s.cur = to; s.busy = false;
      stopZoom(from);
      startZoom(to);
      s.schedule?.();
    };
    B.style.visibility = 'visible';
    if (s.reduce || typeof A.animate !== 'function') { A.style.zIndex = '1'; return finish(); }

    // The incoming slide's colour is there at once; its content fades and grows in only once the old slide is
    // mostly gone, so the two never show as a double exposure.
    const T = THROUGH_MS;
    const frameOf = (el: HTMLElement) => el.querySelector<HTMLElement>(':scope > [data-frame]')!;
    if (dir > 0) {
      A.style.zIndex = '2'; B.style.zIndex = '1';
      layersOf(A).forEach((l, j) => anims.push(l.animate([{ scale: '1' }, { scale: String(THROUGH[j]) }], { duration: T * 0.7, easing: EASE_IN, fill: 'forwards' })));
      anims.push(A.animate([{ opacity: 1 }, { opacity: 1, offset: 0.3 }, { opacity: 0, offset: 0.68 }, { opacity: 0 }], { duration: T, fill: 'forwards' }));
      layersOf(B).forEach((l, j) => anims.push(l.animate([{ scale: String(ARRIVE[j]) }, { scale: '1' }], { duration: T, delay: T * 0.42, easing: EASE_OUT, fill: 'both' })));
      anims.push(frameOf(B).animate([{ opacity: 0 }, { opacity: 1 }], { duration: T * 0.5, delay: T * 0.45, easing: 'ease-out', fill: 'both' }));
    } else {
      A.style.zIndex = '1'; B.style.zIndex = '2';
      layersOf(A).forEach((l, j) => anims.push(l.animate([{ scale: '1' }, { scale: String(ARRIVE[j]) }], { duration: T, easing: EASE_IN, fill: 'forwards' })));
      anims.push(frameOf(A).animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], { duration: T, fill: 'forwards' }));
      anims.push(B.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T * 0.5, delay: T * 0.25, easing: 'ease-out', fill: 'both' }));
      layersOf(B).forEach((l, j) => anims.push(l.animate([{ scale: String(THROUGH[j]) }, { scale: '1' }], { duration: T, delay: T * 0.3, easing: EASE_OUT, fill: 'both' })));
    }
    Promise.all(anims.map((a) => a.finished)).then(finish).catch(() => {});
    setTimeout(finish, THROUGH_MS * 1.8); // never stuck if the tab was hidden mid-way
  }, [n, startZoom, stopZoom]);

  const next = useCallback(() => go((st.current.cur + 1) % n, 1), [go, n]);
  const prev = useCallback(() => go((st.current.cur - 1 + n) % n, -1), [go, n]);

  // ---- First layout (before paint), then the opening sequence once the phone/desktop layout has settled.
  const [laidOut, setLaidOut] = useState(false);
  const delayMs = useRef(0);
  useLayoutEffect(() => {
    st.current.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    delayMs.current = introDelay() * 1000; // read now, before the intro marks itself as played
    layout();
    setLaidOut(true);
    // Re-fit whenever the hero box changes size (window resize, rotation, header bar appearing).
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });
    if (rootRef.current) ro.observe(rootRef.current);
    document.fonts?.ready.then(() => layout()).catch(() => {});
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [layout]);

  useLayoutEffect(() => {
    const s = st.current;
    const root = rootRef.current, first = slideRefs.current[0];
    if (!laidOut) return;
    if (s.reduce || !root || !first) { s.intro = false; s.schedule?.(); return; }
    const d = delayMs.current;
    const W = FRAME_W * s.u;
    s.busy = true;
    const anims: Animation[] = [];
    layersOf(first).forEach((l, j) => anims.push(l.animate(
      [{ transform: `translate3d(${FACTORS[j] * W}px,0,0)` }, { transform: 'translate3d(0,0,0)' }],
      { duration: 900, delay: d, easing: EASE, fill: 'backwards' })));
    root.querySelectorAll<HTMLElement>('[data-rise]').forEach((el, k) => anims.push(el.animate(
      [{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }],
      { duration: 1000, delay: d + 250 + k * 80, easing: EASE, fill: 'backwards' })));
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      s.busy = false;
      s.intro = false;
      startZoom(0);
      s.schedule?.();
    };
    anims[0]?.finished.then(done).catch(() => {});
    const failsafe = setTimeout(() => { anims.forEach((a) => a.finish()); done(); }, d + 3000);
    return () => { clearTimeout(failsafe); anims.forEach((a) => a.cancel()); s.busy = false; };
    // Runs once, right after the first layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laidOut]);

  // ---- Autoplay, keyboard, swipe.
  useEffect(() => {
    const s = st.current;
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => { s.inView = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(root);
    // Autoplay: each settled slide holds HOLD_MS; waits while the tab is hidden, the hero is off screen, or just after a tap.
    const tick = () => {
      if (n < 2) return;
      if (document.hidden || !s.inView || s.busy || Date.now() - s.last < 6000) { s.timer = setTimeout(tick, 1000); return; }
      go((s.cur + 1) % n, 1, false);
    };
    s.schedule = (ms = HOLD_MS) => { clearTimeout(s.timer); s.timer = setTimeout(tick, ms); };
    // The opening sequence starts the first push-in and the timer itself when it ends.
    if (s.reduce) s.intro = false;
    if (!s.intro) { startZoom(s.cur); s.schedule(); }
    const onKey = (e: KeyboardEvent) => {
      if (!s.inView || (e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    const onUp = (e: PointerEvent) => {
      const d0 = s.down;
      s.down = null;
      if (!d0) return;
      const dx = e.clientX - d0.x, dy = e.clientY - d0.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerup', onUp);
    const zoomMap = zooms.current;
    return () => {
      io.disconnect(); clearTimeout(s.timer); s.schedule = null;
      zoomMap.forEach((list) => list.forEach((a) => a.cancel())); zoomMap.clear();
      window.removeEventListener('keydown', onKey); window.removeEventListener('pointerup', onUp);
    };
  }, [go, n, next, prev, startZoom]);

  // ---- Underline follows the active tab; the tab row scrolls it into the middle on small screens.
  useEffect(() => {
    const tab = tabRefs.current[active], bar = barRef.current, sc = scrollerRef.current;
    if (!tab || !bar) return;
    bar.style.width = `${tab.offsetWidth}px`;
    bar.style.transform = `translateX(${tab.offsetLeft}px)`;
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: tab.offsetLeft - (sc.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
  }, [active, mode, sizes]);

  const th = THEMES[active % THEMES.length];
  const g = GEO[mode];
  const words = title.trim().split(/\s+/);
  const head = words.slice(0, -2).join(' '), tail = words.slice(-2).join(' ');
  const uiStyle: CSSProperties = { color: th.ink, textShadow: th.glow ? '0 1px 10px rgba(4,14,28,0.28)' : 'none', transition: 'color 0.6s ease' };
  const ctaCls = th.cta === 'gold'
    ? 'bg-[linear-gradient(135deg,#f3e3b5,#d9b25f_55%,#c9962e)] text-navy shadow-[0_14px_30px_-12px_rgba(201,150,46,0.8),inset_0_1px_0_rgba(255,255,255,0.6)]'
    : 'bg-navy text-white shadow-[0_14px_30px_-14px_rgba(4,14,28,0.9)]';
  const item = slides[active];
  // Every layer zooms from the centre of the photo, so the photo pushes straight in and the props spread outwards.
  const layerStyle: CSSProperties = { transformOrigin: `${U(FRAME_W / 2)} ${U(g.zoomCy)}`, willChange: 'transform, scale' };

  const arrow = (dir: 1 | -1, extra = 'h-12 w-12') => (
    <button type="button" data-rise onClick={dir > 0 ? next : prev} aria-label={dir > 0 ? 'Next celebration' : 'Previous celebration'}
      className={`pointer-events-auto flex shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-500 hover:bg-white/15 ${extra}`}
      style={extra.includes('border-transparent') ? undefined : { borderColor: th.line }}>
      <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir > 0 ? 'M4 14h20 M16 6l8 8-8 8' : 'M24 14H4 M12 6l-8 8 8 8'} />
      </svg>
    </button>
  );
  const eyebrow = (
    <p className="flex items-center gap-2.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.24em] opacity-90 lg:text-[11px]">
      <span className="h-px w-6 bg-current opacity-60" />Private theatre celebrations
    </p>
  );
  const ratingEl = (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="flex">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</span>
      {rating.toFixed(1)} on Google
    </span>
  );

  return (
    <section ref={rootRef} aria-roledescription="carousel" aria-label="Celebrations"
      className="relative isolate h-[calc(100svh-var(--chrome-h,72px))] min-h-[540px] max-h-[1100px] touch-pan-y select-none overflow-hidden bg-navy"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('a,button')) return;
        st.current.down = { x: e.clientX, y: e.clientY };
      }}>
      {/* ---------- Slides ---------- */}
      {slides.map((s, i) => {
        const t = THEMES[i % THEMES.length];
        const kinds = propsFor(s.name);
        return (
          <div key={s.name + i} ref={(el) => { slideRefs.current[i] = el; }} aria-hidden={i === 0 ? undefined : true}
            aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${s.name}`}
            className="absolute inset-0 overflow-hidden" style={{ background: t.bg, visibility: i === 0 ? 'visible' : 'hidden', zIndex: i === 0 ? 2 : 0 }}>
            <div data-frame className="absolute" style={{ left: 'var(--fx)', top: 'var(--fy)', width: U(FRAME_W), height: U(900) }}>
              {/* word */}
              <div data-l className="absolute inset-0" style={layerStyle}>
                <span data-word={i} data-f={sizes[i] ?? 260} className="absolute left-1/2 whitespace-nowrap font-display font-medium leading-none"
                  style={{ top: U(g.wordCy), transform: 'translate(-50%,-50%)', fontSize: U(sizes[i] ?? 260), letterSpacing: '-0.02em', color: t.word }}>
                  {shortWord(s.name)}
                </span>
              </div>
              {/* floor shadows */}
              <div data-l className="absolute inset-0" style={layerStyle}>
                {[
                  [g.photo.x + g.photo.w / 2, g.photo.y + g.photo.h + 18, g.photo.w * 1.05, 38],
                  [g.slots[2].x + g.slots[2].w / 2, g.photo.y + g.photo.h - 10, 150, 20],
                  [g.slots[4].x + g.slots[4].w / 2, g.photo.y + g.photo.h + 30, 140, 20],
                ].map(([cx, cy, w, h], k) => (
                  <span key={k} className="absolute rounded-full" style={{
                    left: U(cx - w / 2), top: U(cy - h / 2), width: U(w), height: U(h), filter: `blur(${U(4)})`,
                    background: `radial-gradient(closest-side, ${t.shadow}, transparent)`,
                  }} />
                ))}
              </div>
              {/* framed theatre photo */}
              <div data-l className="absolute inset-0" style={layerStyle}>
                <div className="absolute" style={{ left: U(g.photo.x), top: U(g.photo.y), width: U(g.photo.w), height: U(g.photo.h) }}>
                  <div className="gold-frame h-full w-full" style={{ padding: U(5), borderRadius: U(38), boxShadow: `0 ${U(40)} ${U(70)} ${U(-22)} ${t.shadow}` }}>
                    <div className="relative h-full w-full overflow-hidden bg-navy" style={{ borderRadius: U(33) }}>
                      <div data-kb className="absolute inset-0" style={{ willChange: 'scale' }}>
                        {(seen.includes(i) || i === 0) && (
                          <Image src={s.image} alt={s.name} fill priority={i < 2} draggable={false} quality={88}
                            sizes="(min-width: 1024px) 42vw, 460px" className="object-cover" />
                        )}
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
                      <div aria-hidden className="pointer-events-none absolute border border-white/40" style={{ inset: U(13), borderRadius: U(23) }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* sharp props */}
              <div data-l className="absolute inset-0" style={layerStyle}>
                {g.slots.map((slot, j) => <Piece key={j} kind={kinds[j]} slot={slot} tone={t.tones[j % 2]} seed={i * 7 + j} />)}
              </div>
              {/* big blurred foreground props */}
              <div data-l className="absolute inset-0" style={{ ...layerStyle, filter: `blur(${U(9)})` }}>
                {g.corners.map((slot, j) => <Piece key={j} kind={kinds[5 + j]} slot={slot} tone={t.tones[(j + 1) % 2]} seed={i * 7 + 5 + j} />)}
              </div>
            </div>
          </div>
        );
      })}

      {/* ---------- UI ---------- */}
      <div className="pointer-events-none absolute inset-0 z-10" style={uiStyle}>
        {/* occasion tabs */}
        <div data-rise className={mode === 'd' ? 'absolute left-1/2 top-5 w-max max-w-[calc(100%-80px)] -translate-x-1/2' : 'absolute inset-x-0 top-3'}>
          <div ref={scrollerRef} className="pointer-events-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={mode === 'm' ? { maskImage: 'linear-gradient(90deg,transparent,#000 20px,#000 calc(100% - 20px),transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 20px,#000 calc(100% - 20px),transparent)' } : undefined}>
            <div role="tablist" aria-label="Celebration type" className="relative mx-auto flex w-max items-center gap-6 px-5 pb-1 lg:gap-9">
              {slides.map((s, i) => (
                <button key={s.name + i} ref={(el) => { tabRefs.current[i] = el; }} type="button" role="tab" aria-selected={i === active}
                  onClick={() => go(i, i > st.current.cur ? 1 : -1)}
                  className={`whitespace-nowrap py-1.5 text-[14px] font-medium transition-opacity duration-300 lg:text-[15px] ${i === active ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                  {s.name}
                </button>
              ))}
              <span ref={barRef} aria-hidden className="absolute bottom-0 left-0 h-[2px] rounded-full bg-current transition-[transform,width] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]" />
            </div>
          </div>
        </div>

        {mode === 'd' ? (
          <>
            <div data-rise className="absolute bottom-8 left-10 max-w-[420px] xl:max-w-[520px]">
              {eyebrow}
              <h1 style={{ color: 'inherit' }} className="mt-2.5 font-display text-[clamp(26px,2.4vw,40px)] leading-[1.05]">
                <span className="whitespace-nowrap">{head}</span><br /><em style={{ color: th.accent, transition: 'color 0.6s ease' }}>{tail}</em>
              </h1>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
              <Link data-rise href={item?.href || '/book'} className={`pointer-events-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 text-base font-semibold transition hover:-translate-y-0.5 hover:brightness-105 ${ctaCls}`} style={{ textShadow: 'none' }}>
                Book your slot <ArrowRight className="h-4 w-4" />
              </Link>
              <p data-rise className="flex items-center gap-2.5 whitespace-nowrap text-[13px] opacity-90">from {from}<span className="opacity-50">•</span>{ratingEl}</p>
            </div>
            <div className="absolute bottom-8 right-[104px] flex items-center gap-3">
              <span data-rise className="mr-1 text-sm font-medium tabular-nums opacity-85">{pad(active + 1)} <span className="opacity-50">/ {pad(n)}</span></span>
              {arrow(-1)}
              {arrow(1)}
            </div>
          </>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-5 text-center">
            {/* arrows + dots + swipe hint (clear of the props and the WhatsApp button) */}
            {n > 1 && (
              <div data-rise className="mb-4" style={{ textShadow: 'none' }}>
                <div className="pointer-events-auto flex items-center gap-2.5">
                {arrow(-1, 'h-9 w-9 bg-white/90 text-navy border-transparent shadow-card')}
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-navy shadow-card">
                  {slides.map((s, i) => (
                    <button key={s.name + i} type="button" onClick={() => go(i, i > st.current.cur ? 1 : -1)} aria-label={s.name}
                      className="h-2 rounded-full transition-all duration-500" style={{ width: i === active ? 18 : 7, background: i === active ? '#0E2A47' : 'rgba(14,42,71,0.22)' }} />
                  ))}
                  <span className="ml-1 text-[11px] font-semibold text-navy-soft">Swipe</span>
                </div>
                {arrow(1, 'h-9 w-9 bg-white/90 text-navy border-transparent shadow-card')}
            </div>
              </div>
            )}
            <div data-rise className="flex flex-col items-center">
              <p className="flex items-center gap-2 whitespace-nowrap text-xs opacity-90">from {from}<span className="opacity-50">•</span>{ratingEl}</p>
              <h1 style={{ color: 'inherit' }} className="mt-2 max-w-[22ch] font-display text-[clamp(24px,6.4vw,36px)] leading-[1.06]">
                <span className="whitespace-nowrap">{head}</span><br /><em style={{ color: th.accent, transition: 'color 0.6s ease' }}>{tail}</em>
              </h1>
            </div>
            <div className="mt-4 flex justify-center">
              <Link data-rise href={item?.href || '/book'} className={`pointer-events-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[15px] font-semibold ${ctaCls}`} style={{ textShadow: 'none' }}>
                Book your slot <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Piece({ kind, slot, tone, seed }: { kind: keyof typeof PROP_ART; slot: Slot; tone: Tone; seed: number }) {
  const art = PROP_ART[kind];
  // Deterministic "random" timing so server and client render the same.
  const dur = 3.2 + ((seed * 37) % 19) / 18 * 1.8;
  const delay = -(((seed * 53) % 17) / 16) * 4;
  return (
    <div className="absolute" style={{ left: U(slot.x), top: U(slot.y), width: U(slot.w), height: U(slot.w * art.ratio) }}>
      <div className="hero-bob h-full w-full"
        style={{ '--r': `${slot.r}deg`, '--dur': `${dur.toFixed(2)}s`, '--dl': `${delay.toFixed(2)}s`, filter: `drop-shadow(0 ${U(14)} ${U(14)} rgba(4,14,28,0.28))` } as CSSProperties}>
        {art.render(tone)}
      </div>
    </div>
  );
}
