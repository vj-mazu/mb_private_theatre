'use client';

import Image from '@/components/Img';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, Users, TicketPercent, X, PlayCircle } from 'lucide-react';
import { Button, Field, Input, Modal, Select, Textarea, api, cn } from '@/components/ui';
import { BranchTabs } from '@/components/site/BranchTabs';
import { PackageTicket, type BookPackage } from './PackageTicket';
import { CakeWeight } from './CakeWeight';
import { Counter, Summary, TheatrePreview } from './BookingParts';
import { addDays, addonItem, priceTiers, isValidPhone, phoneDigits, cakeCharge, computeQuote, durationLabel, formatDate, inr, isSlotExpired, shortPackagePrice, slotLabel, todayIST } from '@/lib/booking-rules';

const STEPS = ['Slot', 'Package', 'Cake & extras', 'Details'];

interface Props {
  catalog: { branches: any[]; theatres: any[]; packages: any[]; customPackage: { enabled: boolean; tagline: string; includes: string[]; image_url: string }; cakes: any[]; addons: any[]; occasions: any[] };
  coupons: any[];
  cutoffMinutes: number;
  advance: number;
  initial: { branch?: string; theatre?: number; occasion?: string };
}

export function BookingFlow({ catalog, coupons, cutoffMinutes, advance, initial }: Props) {
  const router = useRouter();
  const { branches, theatres, packages, customPackage, cakes, addons, occasions } = catalog;

  const startTheatre = theatres.find((t) => t.id === initial.theatre);
  const startBranch = startTheatre?.branch_id ?? branches.find((b) => b.slug === initial.branch)?.id ?? branches[0]?.id;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [branchId, setBranchId] = useState<number>(startBranch);
  const [date, setDate] = useState(todayIST());
  const [theatreId, setTheatreId] = useState<number | null>(startTheatre?.id ?? null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [packageId, setPackageId] = useState<number | null>(packages[0]?.id ?? null);
  const [guests, setGuests] = useState(0);
  const [cakeId, setCakeId] = useState<number | null>(null);
  const [cakeKg, setCakeKg] = useState(0.5);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [form, setForm] = useState({ special_person_name: '', customer_name: '', phone: '', email: '', occasion: initial.occasion || '', notes: '' });
  // Own wording when the occasion is "Other".
  const [occasionOther, setOccasionOther] = useState('');
  const occasionValue = form.occasion === 'Other' ? occasionOther.trim() : form.occasion;
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [booked, setBooked] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [extraMax, setExtraMax] = useState<Record<string, number>>({});
  const [extraHours, setExtraHours] = useState(0);
  const [times, setTimes] = useState<Record<string, { start: string; end: string; shifted: boolean; short?: boolean }>>({});
  // Actual time of a slot today (it moves later when an earlier booking was extended, and may then be a short slot).
  const at = (tid: number, s: any) => times[`${tid}:${s.id}`] || { start: s.start_time as string, end: s.end_time as string, shifted: false, short: false };
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [video, setVideo] = useState<{ src: string; poster: string; name: string } | null>(null);

  // Refresh availability on change and every minute; re-evaluate slot expiry every 30s.
  useEffect(() => {
    let alive = true;
    const load = () => api(`/api/availability?branch=${branchId}&date=${date}`).then((d) => { if (alive) { setBooked(d.booked); setBlocked(d.blocked || []); setExtraMax(d.extraMax || {}); setTimes(d.times || {}); setLoadingSlots(false); } }).catch(() => setLoadingSlots(false));
    setLoadingSlots(true);
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [branchId, date]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  // Warm the browser cache with cake & add-on photos once the guest reaches the package step.
  useEffect(() => {
    if (step < 1) return;
    const t = setTimeout(() => { [...cakes, ...addons].forEach((x: any) => { if (x.image_url) { const img = new window.Image(); img.src = x.image_url; } }); }, 800);
    return () => clearTimeout(t);
  }, [cakes, addons, step >= 1]); // eslint-disable-line react-hooks/exhaustive-deps

  const branchTheatres = theatres.filter((t) => t.branch_id === branchId);
  const theatre = theatres.find((t) => t.id === theatreId);
  const slot = theatre?.slots.find((s: any) => s.id === slotId);
  const pkg = packages.find((p) => p.id === packageId);
  // The chosen room's own photos (admin → Theatres), main photo first.
  const roomPhotos: string[] = theatre ? Array.from(new Set([theatre.image_url, ...(theatre.images || [])].filter(Boolean))) : [];
  // Short slot (squeezed by an earlier booking's extra hours): packages cost the theatre's short-slot discount less.
  const short = theatre && slot ? !!at(theatre.id, slot).short : false;
  const pkgPrice = pkg && theatre && theatre.prices[pkg.id] ? shortPackagePrice(theatre.prices[pkg.id].price, short, theatre.short_slot_discount) : undefined;
  // Package cards always show the chosen theatre's own photos (each package starts on a different one).
  const rotate = (list: string[], k: number) => (list.length ? [...list.slice(k % list.length), ...list.slice(0, k % list.length)] : list);
  const cake = cakes.find((c) => c.id === cakeId);

  const slotState = (t: any, s: any) =>
    booked.includes(`${t.id}:${s.id}`) ? 'booked' : blocked.includes(`${t.id}:${s.id}`) ? 'blocked'
      : isSlotExpired(date, at(t.id, s).start, cutoffMinutes, now) ? 'closed' : 'open';
  // How many extra hours the chosen slot can take before the next booking (+15 min gap).
  const maxExtra = theatre && slot ? extraMax[`${theatre.id}:${slot.id}`] ?? 0 : 0;
  useEffect(() => { setExtraHours((h) => Math.min(h, maxExtra)); }, [maxExtra]);
  useEffect(() => { setExtraHours(0); }, [slotId, theatreId, date]);

  // If the chosen slot gets taken or expires, drop it.
  useEffect(() => {
    if (theatre && slot && slotState(theatre, slot) !== 'open') setSlotId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booked, now, date]);

  // A new room starts at its own included guests (no extra guests carried over from another room).
  useEffect(() => { if (theatre) setGuests(theatre.base_capacity); }, [theatre?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (pkg && theatre && theatre.prices[pkg.id] === undefined) setPackageId(null); }, [pkg, theatre]);

  const includedQty = (addonId: number): number => (pkg?.included_addons || []).find((x: any) => x.addon_id === addonId)?.qty || 0;
  // Bill lines; a pack-priced add-on (fog pots) is charged at its pack price.
  const items = Object.entries(picked).filter(([, q]) => q > 0).flatMap(([id, qty]) => {
    const a = addons.find((x) => x.id === Number(id));
    const line = a ? addonItem(a, qty) : null;
    return line ? [line] : [];
  });
  const quote = theatre ? computeQuote({
    basePrice: pkg ? pkgPrice ?? 0 : theatre.base_price, includesCake: false, baseCapacity: theatre.base_capacity,
    extraPersonPrice: theatre.extra_person_price, guests: guests || theatre.base_capacity, cakePrice: cakeCharge(cake, cakeKg, !!pkg?.includes_cake), items, discount: coupon?.discount || 0,
    extraHours, extraHourPrice: theatre.extra_hour_price,
  }) : null;

  // Coupon depends on the subtotal; drop it if the bill changes below its minimum.
  useEffect(() => { setCoupon(null); setCouponMsg(''); }, [packageId, theatreId, guests, extraHours, cakeId, cakeKg, picked]);

  const dates = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(todayIST(), i)), []);

  // Each step is a history entry, so the browser's Back button goes to the previous step instead of leaving the booking page.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const n = typeof e.state?.bookStep === 'number' ? e.state.bookStep : 0;
      setError('');
      setStep((cur) => { setDir(n > cur ? 1 : -1); return n; });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function go(n: number) {
    if (n === step) return;
    setError('');
    setDir(n > step ? 1 : -1);
    setStep(n);
    if (n > step) window.history.pushState({ ...window.history.state, bookStep: n }, '');
    else window.history.replaceState({ ...window.history.state, bookStep: n }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const allowCustom = !!catalog.customPackage?.enabled;
  const canNext = [
    !!(theatre && slot),
    !!theatre && (pkg ? pkgPrice !== undefined : allowCustom),
    !pkg?.includes_cake || cakeId !== null,
    form.special_person_name.trim().length > 1 && isValidPhone(form.phone) && (form.occasion !== 'Other' || occasionOther.trim().length > 1),
  ][step];
  const hints = ['Choose a theatre and time slot', 'Choose a package', 'Choose your cake flavour', form.occasion === 'Other' && occasionOther.trim().length < 2 ? 'Type your occasion' : 'Enter name and WhatsApp number'];

  async function applyCoupon() {
    if (!quote || !couponInput.trim()) return;
    setCouponMsg('');
    try {
      const r = await api('/api/coupons/validate', { method: 'POST', json: { code: couponInput, subtotal: quote.subtotal } });
      setCoupon(r);
      setCouponMsg(`${r.code} applied — you save ${inr(r.discount)}`);
    } catch (e: any) {
      setCoupon(null);
      setCouponMsg(e.message);
    }
  }

  async function submit() {
    if (!theatre || !slot) return;
    setBusy(true);
    setError('');
    try {
      const phone = form.phone.replace(/\D/g, '').slice(-10);
      const r = await api<{ ref: string }>('/api/bookings', {
        method: 'POST',
        json: {
          branch_id: branchId, theatre_id: theatre.id, slot_id: slot.id, booking_date: date, package_id: packageId,
          guests: guests || theatre.base_capacity, extra_hours: extraHours, cake_id: cakeId, cake_kg: cakeKg, addons: Object.entries(picked).filter(([, q]) => q > 0).map(([id, qty]) => ({ addon_id: Number(id), qty })),
          customer_name: form.customer_name.trim() || form.special_person_name.trim(), special_person_name: form.special_person_name,
          phone, whatsapp: phone, email: form.email, occasion: occasionValue, notes: form.notes, coupon_code: coupon?.code || '',
        },
      });
      router.push(`/ticket/${r.ref}`);
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
      if (/slot/i.test(e.message)) {
        setSlotId(null);
        setExtraHours(0);
        setDir(-1);
        setStep(0);
        window.history.replaceState({ ...window.history.state, bookStep: 0 }, '');
        api(`/api/availability?branch=${branchId}&date=${date}`)
          .then((d) => { setBooked(d.booked); setBlocked(d.blocked || []); setExtraMax(d.extraMax || {}); setTimes(d.times || {}); })
          .catch(() => {});
      }
    }
  }

  return (
    <div className="container-page pb-32 pt-8 lg:pb-16">
      <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
        <p className="eyebrow">Book a private theatre</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{['When would you like to celebrate?', 'Choose your package', 'Cake & extras', 'Almost done'][step]}</h1>
      </div>

      {/* Progress */}
      <ol className="mt-6 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button aria-label={s} disabled={i > step} onClick={() => go(i)} className="w-full text-left">
              <span className="block h-1 overflow-hidden rounded-full bg-line">
                <motion.span className="block h-full bg-brand-500" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
              </span>
              <span className={cn('mt-2 hidden text-xs font-medium sm:block', i <= step ? 'text-navy' : 'text-navy-faint')}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 overflow-x-clip">
            <motion.div key={step}
              initial={{ opacity: 0, x: dir * 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>

              {step === 0 && (
                <div className="space-y-8">
                  <BranchTabs branches={branches} value={branchId} onChange={(id) => { setBranchId(id); setTheatreId(null); setSlotId(null); }} />

                  <div>
                    <h2 className="font-sans text-sm font-bold">Date</h2>
                    <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
                      {dates.map((d) => {
                        const active = d === date;
                        return (
                          <button key={d} onClick={() => { setDate(d); setSlotId(null); }}
                            className={cn('flex w-[62px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-all duration-200',
                              active ? 'border-brand-500 bg-brand-600 text-white shadow-card' : 'border-line bg-cream-card hover:border-brand-300')}>
                            <span className={cn('text-[11px] font-medium', active ? 'text-white' : 'text-navy-soft')}>{formatDate(d, { weekday: 'short' })}</span>
                            <span className="text-lg font-bold leading-tight">{formatDate(d, { day: 'numeric' })}</span>
                            <span className={cn('text-[11px]', active ? 'text-white' : 'text-navy-soft')}>{formatDate(d, { month: 'short' })}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-sans text-sm font-bold">Theatre & time</h2>
                    {branchTheatres.map((t) => {
                      const open = t.slots.filter((s: any) => slotState(t, s) === 'open').length;
                      return (
                        <div key={t.id} className={cn('card overflow-hidden transition-shadow duration-300', theatreId === t.id && 'ring-2 ring-brand-300')}>
                          <div className="flex flex-col gap-4 p-4 sm:flex-row">
                            <div className="group relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl bg-cream-deep sm:aspect-[4/3] sm:w-60 lg:w-72">
                              {t.image_url
                                ? <Image src={t.image_url} alt={t.name} fill priority={branchTheatres.indexOf(t) === 0} sizes="(min-width: 1024px) 288px, (min-width: 640px) 240px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                : <span className="absolute inset-0 flex items-center justify-center text-sm text-navy-soft">Photos coming soon</span>}
                              {t.video_url && (
                                <button type="button" onClick={() => setVideo({ src: t.video_url, poster: t.image_url, name: t.name })}
                                  className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-white/95 py-2 text-xs font-semibold text-navy shadow-lift backdrop-blur transition hover:bg-white">
                                  <PlayCircle className="h-4 w-4 text-brand-600" />Watch room video
                                </button>
                              )}
                            </div>
                            <div className="min-w-0 sm:py-1">
                              <h3 className="text-2xl">{t.name}</h3>
                              {t.description && <p className="mt-1 line-clamp-2 text-sm text-navy-soft">{t.description}</p>}
                              <p className="mt-2 flex items-center gap-1.5 text-sm text-navy-soft"><Users className="h-4 w-4" />{t.base_capacity} included · up to {t.max_capacity} guests</p>
                              <p className={cn('mt-1 text-sm font-medium', open ? 'text-emerald-700' : 'text-navy-faint')}>{loadingSlots ? 'Checking availability…' : open ? `${open} slot${open > 1 ? 's' : ''} available` : 'Fully booked on this date'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-line bg-cream/60 p-3 sm:grid-cols-3">
                            {t.slots.map((s: any) => {
                              const st = loadingSlots ? 'loading' : slotState(t, s);
                              const active = theatreId === t.id && slotId === s.id;
                              return (
                                <button key={s.id} disabled={st !== 'open'} onClick={() => { setTheatreId(t.id); setSlotId(s.id); }}
                                  className={cn('rounded-xl border px-2 py-2 text-center text-[13px] font-semibold transition-all duration-200',
                                    active ? 'border-brand-600 bg-brand-600 text-white shadow-sm' :
                                      st === 'open' ? 'border-line bg-white hover:border-brand-400 hover:bg-brand-50' :
                                        'cursor-not-allowed border-transparent bg-cream-deep/70 text-navy-faint')}>
                                  {/* A slot pushed out by an earlier booking's extra hours shows its normal time (the reason is shown to staff only). */}
                                  {st === 'blocked' && at(t.id, s).shifted ? slotLabel(s.start_time, s.end_time) : slotLabel(at(t.id, s).start, at(t.id, s).end)}
                                  {st === 'open' && at(t.id, s).short
                                    ? <span className={cn('block text-[10px] font-semibold', active ? 'text-white' : 'text-amber-600')}>{durationLabel(at(t.id, s).start, at(t.id, s).end)} slot · packages {inr(t.short_slot_discount)} less</span>
                                    : at(t.id, s).shifted && st === 'open' && <span className="block text-[10px] font-medium text-amber-600">new timing</span>}
                                  <span className={cn('block text-[10px] font-medium', active ? 'text-white' : st === 'open' ? 'text-emerald-700' : 'text-navy-faint')}>
                                    {st === 'booked' ? 'Booked' : st === 'blocked' ? 'Unavailable' : st === 'closed' ? 'Expired' : st === 'loading' ? '…' : 'Available'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && theatre && (
                <div className="space-y-6">
                  <TheatrePreview theatre={theatre} branch={branches.find((b) => b.id === branchId)?.name} />
                  <PackageTicket
                    theatreName={theatre.name}
                    value={packageId}
                    onChange={setPackageId}
                    items={[
                      ...packages.filter((p) => theatre.prices[p.id]).map((p, k): BookPackage => ({
                        id: p.id, name: p.name, tagline: p.tagline, includes: p.includes, price: shortPackagePrice(theatre.prices[p.id].price, short, theatre.short_slot_discount),
                        original_price: short ? theatre.prices[p.id].price : theatre.prices[p.id].original_price, images: rotate(roomPhotos, k), highlight: p.highlight, includesCake: p.includes_cake,
                        meta: `${slot ? durationLabel(at(theatre.id, slot).start, at(theatre.id, slot).end) : '2 hours'}${short ? ` short slot · ${inr(theatre.short_slot_discount)} less` : ''} · up to ${theatre.base_capacity} people · extra person ${inr(theatre.extra_person_price)}`,
                      })),
                      ...(customPackage.enabled ? [{ id: null, name: 'Custom', tagline: customPackage.tagline, price: theatre.base_price, original_price: null,
                        images: rotate(roomPhotos, packages.filter((p) => theatre.prices[p.id]).length), highlight: false, includesCake: false, meta: `Room only · up to ${theatre.base_capacity} people · extra person ${inr(theatre.extra_person_price)}`,
                        includes: customPackage.includes }] : []),
                    ]}
                  />
                  <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold">Number of guests</p>
                      <p className="text-sm text-navy-soft">{theatre.base_capacity} included · {inr(theatre.extra_person_price)} per extra guest · max {theatre.max_capacity}</p>
                    </div>
                    <Counter value={guests} min={1} max={theatre.max_capacity} onChange={setGuests} />
                  </div>
                  <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold">Extra time <span className="font-normal text-navy-soft">· optional</span></p>
                      <p className="text-sm text-navy-soft">
                        {short && maxExtra === 0 && slot && at(theatre.id, slot).shifted
                          ? 'Not available for a short slot'
                          : maxExtra > 0
                            ? `${inr(theatre.extra_hour_price)} per extra hour · up to ${maxExtra} hour${maxExtra > 1 ? 's' : ''} available for this slot`
                            : 'Not available for this slot — the next slot is already booked'}
                      </p>
                      {extraHours > 0 && slot && <p className="mt-1 text-sm font-medium text-brand-700">New timing: {slotLabel(at(theatre.id, slot).start, at(theatre.id, slot).end, extraHours)}</p>}
                    </div>
                    <Counter value={extraHours} min={0} max={maxExtra} onChange={setExtraHours} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10">
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-sans text-sm font-bold">Cake flavour</h2>
                      <span className="text-xs text-navy-soft">{pkg?.includes_cake ? '500 g included · pick a flavour, then the weight' : 'Optional'}</span>
                    </div>
                    {cake && (
                      <div className="mt-4"><CakeWeight kg={cakeKg} onChange={setCakeKg} pricePer500={cake.price} includedInPackage={!!pkg?.includes_cake} /></div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {!pkg?.includes_cake && (
                        <button onClick={() => setCakeId(null)} className={cn('flex aspect-square flex-col items-center justify-center rounded-3xl bg-cream-card text-sm font-semibold shadow-card ring-2 transition-all', cakeId === null ? 'ring-brand-500' : 'ring-transparent hover:ring-brand-200')}>
                          No cake
                        </button>
                      )}
                      {cakes.map((c) => {
                        const active = cakeId === c.id;
                        return (
                          <button key={c.id} onClick={() => setCakeId(c.id)}
                            className={cn('group rounded-3xl bg-cream-card p-1.5 text-left shadow-card ring-2 transition-all duration-300 ease-smooth hover:-translate-y-0.5', active ? 'ring-brand-500 shadow-lift' : 'ring-transparent')}>
                            <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#E1C9AF]">
                              <Image src={c.image_url} alt={`${c.name} cake`} fill unoptimized loading="eager" sizes="(min-width: 768px) 200px, 45vw" className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105" />
                              <AnimatePresence>
                                {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow"><Check className="h-4 w-4" /></motion.span>}
                              </AnimatePresence>
                            </div>
                            <p className={cn('px-1 pb-1.5 pt-2.5 text-center font-display text-[15px] transition-colors', active && 'text-brand-700')}>{c.name}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-center text-xs text-navy-faint">Cake designs may vary slightly</p>
                  </div>

                  <div>
                    {pkg && (
                      <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <p className="text-sm font-semibold text-emerald-800">Already included in your {pkg.name} package</p>
                        <ul className="mt-2 grid gap-x-4 gap-y-1 text-sm text-emerald-900 sm:grid-cols-2">
                          {(pkg.includes as string[]).map((inc) => <li key={inc} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{inc}</li>)}
                        </ul>
                        <p className="mt-2 text-xs text-emerald-800/80">Anything you add below is an extra and is charged on top of the package.</p>
                      </div>
                    )}
                    <h2 className="font-sans text-sm font-bold">Add-ons <span className="font-normal text-navy-soft">· extra, optional</span></h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
                      {addons.map((a) => {
                        const qty = picked[a.id] || 0;
                        const tiers = priceTiers(a);
                        return (
                          <div key={a.id} className={cn('rounded-2xl border bg-cream-card p-3 transition-all duration-200', qty ? 'border-brand-400 shadow-card' : 'border-line', tiers.length > 0 && 'sm:col-span-2')}>
                            <div className="flex items-center gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                                {a.image_url && <Image src={a.image_url} alt="" fill unoptimized loading="eager" sizes="64px" className="object-cover" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{a.name}</p>
                                <p className="text-sm text-navy-soft">
                                  {tiers.length ? <>From {inr(tiers[0].price)} <span className="text-xs">· choose an option · extra</span></> : <>{inr(a.price)} <span className="text-xs">each · extra</span></>}
                                </p>
                                {includedQty(a.id) > 0 && <p className="mt-0.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{pkg?.name} already includes {tiers.find((t) => t.qty === includedQty(a.id))?.label || includedQty(a.id)}</p>}
                              </div>
                              {tiers.length === 0 && (qty === 0
                                ? <Button size="sm" variant="secondary" onClick={() => setPicked((p) => ({ ...p, [a.id]: 1 }))}>Add</Button>
                                : <Counter value={qty} min={0} max={10} onChange={(n) => setPicked((p) => ({ ...p, [a.id]: n }))} />)}
                            </div>
                            {tiers.length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {tiers.map((t) => {
                                  const on = qty === t.qty;
                                  return (
                                    <button key={t.qty} type="button" aria-pressed={on} onClick={() => setPicked((p) => ({ ...p, [a.id]: on ? 0 : t.qty }))}
                                      className={cn('rounded-xl border px-2 py-2 text-center text-sm transition-all duration-200',
                                        on ? 'border-brand-600 bg-brand-600 text-white shadow-sm' : 'border-line bg-white hover:border-brand-400 hover:bg-brand-50')}>
                                      <span className="block font-semibold">{t.label}</span>
                                      <span className={cn('block text-xs tabular-nums', on ? 'text-white' : 'text-navy-soft')}>{inr(t.price)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="card space-y-4 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Special person's name" required hint="Shown on the screen and LED board"><Input value={form.special_person_name} onChange={(e) => setForm({ ...form, special_person_name: e.target.value })} /></Field>
                    <Field label="Occasion">
                      <Select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
                        <option value="">Select occasion</option>
                        {occasions.filter((o) => o.name !== 'Kids Birthday').map((o) => <option key={o.id}>{o.name}</option>)}
                        <option>Other</option>
                      </Select>
                    </Field>
                    {form.occasion === 'Other' && (
                      <Field label="Your occasion" required hint="Shown on your ticket" className="sm:col-span-2">
                        <Input autoFocus maxLength={60} value={occasionOther} onChange={(e) => setOccasionOther(e.target.value)} placeholder="e.g. Retirement party, Graduation, Welcome home" />
                      </Field>
                    )}
                    <Field label="Your WhatsApp number" required hint="Ticket and updates are sent here"><Input type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })} placeholder="10-digit mobile number" /></Field>
                    <Field label="Your name"><Input autoComplete="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></Field>
                    <Field label="Email (optional)" className="sm:col-span-2"><Input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                    <Field label="Anything we should know? (optional)" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Name on cake, decoration colour, surprise plan…" /></Field>
                  </div>

                  <div className="rounded-xl bg-cream p-4">
                    {coupon ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-semibold text-emerald-700"><TicketPercent className="h-4 w-4" />{couponMsg}</span>
                        <button onClick={() => { setCoupon(null); setCouponMsg(''); }} aria-label="Remove coupon" className="rounded p-1 text-navy-soft hover:text-navy"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
                          <Button variant="secondary" onClick={applyCoupon}>Apply</Button>
                        </div>
                        {couponMsg && <p className="mt-2 text-xs text-red-600">{couponMsg}</p>}
                        {coupons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {coupons.map((c) => (
                              <button key={c.code} onClick={() => setCouponInput(c.code)} className="rounded-full border border-dashed border-brand-300 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
                                {c.code} · {c.discount_type === 'percent' ? `${c.value}% off` : `${inr(c.value)} off`}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? <Button variant="ghost" className="w-full sm:w-auto" onClick={() => go(step - 1)}><ChevronLeft className="h-4 w-4" />Back</Button> : <span className="hidden sm:block" />}
            {!canNext && <p className="text-center text-sm text-navy-soft sm:hidden">{hints[step]}</p>}
            {step < 3
              ? <Button size="lg" className="w-full sm:w-auto" disabled={!canNext} onClick={() => go(step + 1)}>Continue</Button>
              : <Button size="lg" className="w-full sm:w-auto" disabled={!canNext} loading={busy} onClick={submit}>Continue to payment</Button>}
          </div>
        </div>

        {/* Summary (desktop) */}
        <aside className="card sticky top-24 hidden p-5 lg:block">
          <Summary {...{ theatre, slot: slot && theatre ? { ...slot, start_time: at(theatre.id, slot).start, end_time: at(theatre.id, slot).end } : slot, date, pkg, cake, cakeKg, extraHours, items, quote: step >= 1 ? quote : null, coupon, advance, short, branch: branches.find((b) => b.id === branchId) }} />
        </aside>
      </div>

      <Modal open={!!video} onClose={() => setVideo(null)} title={video ? `${video.name} — room video` : ''} size="lg">
        {video && <video src={video.src} poster={video.poster || undefined} controls autoPlay playsInline className="w-full rounded-xl bg-black" />}
      </Modal>

      {/* Bottom bar (mobile & tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream-card/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {step > 0 && <button onClick={() => go(step - 1)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-line" aria-label="Back"><ChevronLeft className="h-5 w-5" /></button>}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-navy-soft">{canNext ? (slot ? `${formatDate(date, { day: 'numeric', month: 'short' })} · ${slotLabel(at(theatre!.id, slot).start, at(theatre!.id, slot).end, extraHours)}` : '') : hints[step]}</p>
            <p className="text-lg font-bold tabular-nums">{step >= 1 && quote && slot ? inr(quote.total) : '—'}</p>
          </div>
          {step < 3
            ? <Button size="lg" disabled={!canNext} onClick={() => go(step + 1)}>Continue</Button>
            : <Button size="lg" disabled={!canNext} loading={busy} onClick={submit}>Pay advance</Button>}
        </div>
      </div>
    </div>
  );
}
