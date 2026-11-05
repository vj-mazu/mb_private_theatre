'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  PhoneCall, 
  Flame, 
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface TheatreSlotSummary {
  theatreId: number;
  theatreName: string;
  emoji: string;
  capacity: number;
  price: string;
  totalSlots: number;
  availableSlots: number;
  slots: {
    id: number;
    time: string;
    is_booked: boolean;
  }[];
}

export default function HeroSection() {
  const router = useRouter();

  // Gala Town booking bar state
  const [selectedBranch, setSelectedBranch] = useState<'electronic-city' | 'btm-stage-2' | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const today = new Date().toISOString().split('T')[0];

  // Live Slots Preview State
  const [showSlotsBoard, setShowSlotsBoard] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsSummary, setSlotsSummary] = useState<TheatreSlotSummary[]>([]);
  const [totalAvailableCount, setTotalAvailableCount] = useState<number>(0);
  const [totalSlotsCount, setTotalSlotsCount] = useState<number>(0);
  const slotsBoardRef = useRef<HTMLDivElement>(null);

  const fetchSlotsForBar = async (branch: string, date: string) => {
    setLoadingSlots(true);
    setShowSlotsBoard(true);
    try {
      const res = await fetch(`/api/availability?branch=${branch}&date=${date}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTotalAvailableCount(json.available_slots || 0);
        setTotalSlotsCount(json.total_slots || 0);

        const priceMap: Record<string, string> = {
          'Couple Theater': '₹899',
          'Celebration Theater': '₹1,499',
          'Family Theater': '₹1,699',
          'VIP Celebration Suite': '₹1,599',
        };

        const groups: Record<number, TheatreSlotSummary> = {};
        json.data.forEach((s: any) => {
          if (!groups[s.theatre_id]) {
            groups[s.theatre_id] = {
              theatreId: s.theatre_id,
              theatreName: s.theatre_name || 'Private Theater',
              emoji: s.theatre_emoji || '🎬',
              capacity: s.theatre_capacity || 2,
              price: priceMap[s.theatre_name] || '₹899',
              totalSlots: 0,
              availableSlots: 0,
              slots: [],
            };
          }
          groups[s.theatre_id].totalSlots += 1;
          if (!s.is_booked) groups[s.theatre_id].availableSlots += 1;
          groups[s.theatre_id].slots.push({
            id: s.id,
            time: `${s.start_time} – ${s.end_time}`,
            is_booked: s.is_booked,
          });
        });

        setSlotsSummary(Object.values(groups));

        // Smooth scroll to the slots board so user sees it right away
        setTimeout(() => {
          slotsBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to fetch slot availability:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const branchToUse = selectedBranch || 'electronic-city';
    const dateToUse = selectedDate || today;

    if (!selectedBranch) setSelectedBranch(branchToUse);
    if (!selectedDate) setSelectedDate(dateToUse);

    fetchSlotsForBar(branchToUse, dateToUse);
  };

  const handleSlotSelect = (theatreId: number, slotId: number) => {
    const branchToUse = selectedBranch || 'electronic-city';
    const dateToUse = selectedDate || today;
    router.push(`/book-now?branch=${branchToUse}&theatre=${theatreId}&date=${dateToUse}&slot=${slotId}`);
  };

  // 10 video items (using client's lightweight 400KB web loops)
  const videoItems = [
    { id: 1, src: '/videos/video_1.mp4', poster: '/videos/posters/poster_1.jpg', title: 'Couple Romantic Suite' },
    { id: 2, src: '/videos/video_2.mp4', poster: '/videos/posters/poster_2.jpg', title: 'Grand Birthday Fog Entry' },
    { id: 3, src: '/videos/video_3.mp4', poster: '/videos/posters/poster_3.jpg', title: 'Candlelit Proposal Night' },
    { id: 4, src: '/videos/video_4.mp4', poster: '/videos/posters/poster_4.jpg', title: '150-inch Family Dolby' },
    { id: 5, src: '/videos/video_5.mp4', poster: '/videos/posters/poster_5.jpg', title: 'Cold Fire Pyro Sparklers' },
    { id: 6, src: '/videos/video_6.mp4', poster: '/videos/posters/poster_6.jpg', title: 'Party Ambient Glow Wall' },
    { id: 7, src: '/videos/video_7.mp4', poster: '/videos/posters/poster_7.jpg', title: 'Neon Milestone Celebration' },
    { id: 8, src: '/videos/video_1.mp4', poster: '/videos/posters/poster_1.jpg', title: 'Rose Petals & Fairy Lights' },
    { id: 9, src: '/videos/video_2.mp4', poster: '/videos/posters/poster_2.jpg', title: 'Celebration Fog Walkway' },
    { id: 10, src: '/videos/video_4.mp4', poster: '/videos/posters/poster_4.jpg', title: 'Dolby Atmos Surround' },
  ];

  // Carousel physics & cylinder curve state
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Motion state: Automatic continuous horizontal video scrolling
  const isHoveredRef = useRef<boolean>(false);
  const scrollOffsetRef = useRef<number>(-3 * 196); // Align Coffee/suite card in center like reference
  const velocityRef = useRef<number>(-38); // Continuous smooth automatic right -> left scrolling!
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pointerHistoryRef = useRef<{ x: number; t: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure all video elements play cleanly
    const videos = container.querySelectorAll('video');
    videos.forEach((v) => {
      v.muted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.play().catch(() => {});
    });

    const CARD_COUNT = videoItems.length; // 10
    lastTimeRef.current = performance.now();

    function renderLoop(now: number) {
      if (!container) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const rect = container.getBoundingClientRect();
      const containerW = rect.width || window.innerWidth;
      const isMobile = containerW <= 768;

      // Reelmark scaling specification:
      // Mobile (<= 768px): compact scale with guaranteed non-overlapping gap
      const u = isMobile 
        ? Math.min(Math.max(containerW / 580, 0.48), 0.75) 
        : Math.min(Math.max(containerW / 1440, 0.6), 1.05);

      const cardBaseWidth = isMobile ? 112 : 170;
      const cardExpansion = isMobile ? 24 : 48;
      const CARD_PITCH_U = isMobile ? 152 : 196;
      const TOTAL_SPAN_U = CARD_COUNT * CARD_PITCH_U;

      // Handle automatic continuous scrolling or drag inertia
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 40) {
          // Coasting inertia decay after user drag
          velocityRef.current *= Math.pow(0.05, dt);
        } else if (!isHoveredRef.current) {
          // Continuous smooth automatic right -> left drift
          velocityRef.current = -38;
        } else {
          // Pause smoothly on hover
          velocityRef.current = 0;
        }
        scrollOffsetRef.current += velocityRef.current * dt;
      }

      // Seamless infinite looping
      while (scrollOffsetRef.current < -TOTAL_SPAN_U) scrollOffsetRef.current += TOTAL_SPAN_U;
      while (scrollOffsetRef.current > 0) scrollOffsetRef.current -= TOTAL_SPAN_U;

      const containerH = rect.height || (isMobile ? 220 : 400);
      const centerX = containerW / 2;
      const centerY = containerH * 0.52;
      const refWidth = isMobile ? Math.max(containerW * 0.46, 170) : Math.max(containerW * 0.48, 300);

      cardElementsRef.current.forEach((el, index) => {
        if (!el) return;

        // Position t relative to center with wrapping
        let t = (index * CARD_PITCH_U + scrollOffsetRef.current) % TOTAL_SPAN_U;
        if (t > TOTAL_SPAN_U / 2) t -= TOTAL_SPAN_U;
        if (t < -TOTAL_SPAN_U / 2) t += TOTAL_SPAN_U;

        // Math-driven cylinder expansion
        const pushedX = centerX + (t * u) * (1 + 0.083 * Math.pow(t / 706, 2));
        const d = Math.abs(pushedX - centerX) / refWidth;
        const width = (cardBaseWidth + cardExpansion * Math.pow(d, 2)) * u;
        const cardCenterY = centerY - (12 * Math.pow(d, 2)) * u;

        // Arched cylinder edge heights
        const leftQ = Math.abs((pushedX - width / 2) - centerX) / refWidth;
        const rightQ = Math.abs((pushedX + width / 2) - centerX) / refWidth;
        const baseHeight = isMobile ? 210 : 280;
        const heightCurve = isMobile ? 60 : 92;
        const hLeft = (baseHeight + heightCurve * Math.pow(leftQ, 2.6)) * u;
        const hRight = (baseHeight + heightCurve * Math.pow(rightQ, 2.6)) * u;
        const maxH = Math.max(hLeft, hRight);

        // Position card
        el.style.left = `${pushedX - width / 2}px`;
        el.style.top = `${cardCenterY - maxH / 2}px`;
        el.style.width = `${width}px`;
        el.style.height = `${maxH}px`;

        // Apply cylinder arched quad clip-path
        const topL = (maxH - hLeft) / 2;
        const botL = topL + hLeft;
        const topR = (maxH - hRight) / 2;
        const botR = topR + hRight;

        el.style.clipPath = `polygon(
          0px ${topL}px,
          ${width}px ${topR}px,
          ${width}px ${botR}px,
          0px ${botL}px
        )`;
      });

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [videoItems.length]);

  // Pointer drag event handlers with inertia
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    pointerHistoryRef.current = [{ x: e.clientX, t: performance.now() }];
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;

    const containerW = containerRef.current?.clientWidth || window.innerWidth;
    const isMobile = containerW <= 768;
    const u = isMobile 
      ? Math.min(Math.max(containerW / 640, 0.45), 0.75) 
      : Math.min(Math.max(containerW / 1440, 0.6), 1.05);

    scrollOffsetRef.current += delta / u;

    const now = performance.now();
    pointerHistoryRef.current.push({ x: e.clientX, t: now });
    if (pointerHistoryRef.current.length > 5) pointerHistoryRef.current.shift();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const history = pointerHistoryRef.current;
    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0.01) {
        const containerW = containerRef.current?.clientWidth || window.innerWidth;
        const isMobile = containerW <= 768;
        const u = isMobile 
          ? Math.min(Math.max(containerW / 640, 0.45), 0.75) 
          : Math.min(Math.max(containerW / 1440, 0.6), 1.05);
        const speedPx = (last.x - first.x) / dt;
        velocityRef.current = (speedPx / u) * 0.7;
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-sand-50 select-none pt-2 pb-8 sm:pt-4 sm:pb-14">
      
      {/* Container Frame */}
      <div className="relative w-full max-w-[1440px] mx-auto overflow-hidden flex flex-col justify-between">
        
        {/* Soft studio backdrop lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-royal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. MINT TRUST BADGE */}
        <div className="flex justify-center z-20 mt-1 mb-1 sm:mt-2 sm:mb-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:px-5 sm:py-2 rounded-full bg-[#DAE7C7] border border-[#C5D9AD] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#08482D] animate-ping" />
            <span className="font-inter text-[11px] sm:text-sm font-semibold text-[#08482D]">
              Trusted by 12,500+ happy guests in Bengaluru
            </span>
          </div>
        </div>

        {/* 2. HEADLINE & SUBLINE (Compact, high contrast, zero excessive gaps) */}
        <div className="text-center px-3 sm:px-4 max-w-4xl mx-auto z-20 mt-1 sm:mt-3 relative">
          
          {/* Hand-drawn note: "//" doodle at top-left (desktop) */}
          <div className="hidden lg:block absolute -left-12 top-2 pointer-events-none text-[#08482D]">
            <span className="font-caveat text-4xl font-black">//</span>
          </div>

          {/* Hand-drawn note: "Be seen / with private cinema" rotated 16° (desktop) */}
          <div className="hidden lg:block absolute -right-20 top-2 text-left pointer-events-none rotate-[16deg]">
            <span className="font-caveat text-2xl sm:text-[27px] font-bold text-[#08482D] block leading-tight">
              Be seen<br />with private cinema
            </span>
            <svg className="w-16 h-16 text-[#08482D] ml-2 -mt-1" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10,8 C28,18 20,38 36,46" />
              <path d="M28,42 L36,46 L36,36" />
            </svg>
          </div>

          {/* Headline: Inter Tight with tight responsive line-height */}
          <h1 className="font-interTight text-[32px] sm:text-5xl lg:text-[76px] font-extrabold text-[#101410] tracking-[-0.035em] leading-[1.08] sm:leading-[1.02]">
            Captivate Crowds <br />
            <span className="tracking-[-0.022em] text-[#101410]">with Private Celebrations</span>
          </h1>

          {/* Subline: Clean, readable dark slate */}
          <p className="mt-1.5 sm:mt-3 font-inter text-xs sm:text-[18px] text-[#2D3139] font-normal max-w-xl mx-auto leading-relaxed px-2">
            Celebrate birthdays, anniversaries, and date nights with exclusive 4K screens by our dedicated crew. Ready to lift your celebration higher.
          </p>
        </div>

        {/* 3. ARCHED VIDEO CAROUSEL - Smooth automatic horizontal scrolling */}
        <div className="relative group/carousel my-2 sm:my-4">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; }}
            className="relative w-full h-[200px] sm:h-[300px] lg:h-[390px] overflow-hidden cursor-grab active:cursor-grabbing touch-none z-10"
          >
            {videoItems.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  cardElementsRef.current[idx] = el;
                }}
                className="absolute overflow-hidden rounded-[12px] sm:rounded-[15px] bg-[#000] select-none will-change-transform shadow-md"
              >
                <video
                  src={item.src}
                  poster={item.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Frosted Play Icon at Bottom-Left */}
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1.5 pointer-events-none z-10">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white border border-white/60 shadow-sm">
                    <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-bold text-white line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. BUTTON WITH ZERO-OVERLAP PRICING BADGE & DASHED OUTLINE RING */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 my-4 sm:my-6 z-20">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-[#08482D] border-2 border-emerald-400 font-caveat text-xl sm:text-2xl font-bold shadow-xs select-none">
            <span>Starting at ₹899</span>
            <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">per slot</span>
          </div>

          {/* Dashed outline ring with CTA button */}
          <div className="p-1 rounded-full border-2 border-dashed border-[#08482D] shadow-sm">
            <Link
              href="/book-now"
              className="px-7 py-3.5 sm:px-10 sm:py-4 rounded-full text-sm sm:text-base font-bold leading-normal text-white bg-[#08482D] hover:bg-[#063a24] shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="leading-normal">Book Your Screen</span>
              <ChevronRight className="w-4 h-4 text-emerald-200" />
            </Link>
          </div>
        </div>

        {/* 5. GALA TOWN HIGH-CONVERTING BOOKING BAR */}
        <div className="mt-2 sm:mt-4 max-w-4xl mx-auto w-full px-3 sm:px-4 z-20">
          <div className="bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-4 shadow-elevated border-2 border-slate-200 transition-all hover:border-royal-500">
            <form onSubmit={handleCheckAvailability} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              
              {/* Step 1: Branch Picker */}
              <div className="flex-1 flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full hover:bg-slate-50 transition-colors">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-royal-100 text-royal-700 shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-branch-select" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-royal-900">
                    Step 1: Select Branch
                  </label>
                  <select
                    id="hero-branch-select"
                    suppressHydrationWarning
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value as any)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer truncate"
                    required
                  >
                    <option value="" disabled>Choose your branch...</option>
                    <option value="electronic-city">Electronic City (Near Sri Vishnu Grand)</option>
                    <option value="btm-stage-2">BTM 2nd Stage (Near Udupi Garden - NEW)</option>
                  </select>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-200" />

              {/* Step 2: Date Picker */}
              <div className={`flex-1 flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full transition-colors ${
                !selectedBranch ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'
              }`}>
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 text-slate-900 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-date-select" className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Step 2: Select Date
                  </label>
                  <input
                    id="hero-date-select"
                    suppressHydrationWarning
                    type="date"
                    min={today}
                    disabled={!selectedBranch}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Step 3: Check Availability Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all"
                >
                  <span>Check Slots</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <a
                  href="tel:+919902923656"
                  className="hidden md:flex items-center justify-center p-3.5 rounded-full text-royal-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  title="Book on Call"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </form>
          </div>

          {/* Live availability proof chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-6 text-[10px] sm:text-xs text-slate-800">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span><strong className="text-slate-900">18 guests</strong> checking slots</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Weekend slots filling fast</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-royal-600" />
              <span>Instant WhatsApp confirmation &bull; 72hr reschedule</span>
            </div>
          </div>

          {/* 6. LIVE SLOTS AVAILABILITY BOARD (Appears directly when clicking Check Slots) */}
          {showSlotsBoard && (
            <div 
              ref={slotsBoardRef}
              className="mt-4 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-royal-600 animate-in fade-in slide-in-from-top-3"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div>
                    <h3 className="font-playfair text-base sm:text-xl font-bold text-slate-900 leading-tight">
                      Available Showtime Slots &bull; {selectedBranch === 'btm-stage-2' ? 'BTM 2nd Stage' : 'Electronic City'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing live schedule for <strong>{selectedDate || today}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🟢 {totalAvailableCount} of {totalSlotsCount} Slots Open
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSlotsBoard(false)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    aria-label="Close Slots Board"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingSlots ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-royal-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Checking live slots across Couple, Celebration, and Family Theatres...</p>
                </div>
              ) : (
                <>
                  {/* Theatres Slot Cards (Responsive 3 or 4 columns) */}
                  <div className={`grid grid-cols-1 ${slotsSummary.length >= 4 ? 'lg:grid-cols-4 sm:grid-cols-2' : 'md:grid-cols-3'} gap-3 sm:gap-4 mt-4`}>
                    {slotsSummary.map((t) => (
                      <div
                        key={t.theatreId}
                        className="rounded-2xl border-2 border-slate-200 bg-sand-50/60 p-3.5 sm:p-4 flex flex-col justify-between hover:border-royal-400 transition-all shadow-sm"
                      >
                        {/* Theatre Header */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{t.emoji}</span>
                            <span className="font-playfair text-sm font-black text-royal-900">{t.price}</span>
                          </div>
                          <h4 className="font-playfair text-base font-bold text-slate-900 mt-1">{t.theatreName}</h4>
                          <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-royal-600" />
                              <span>Up to {t.capacity} Guests</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {t.availableSlots} Open Slots
                            </span>
                          </div>
                        </div>

                        {/* Slots Buttons List */}
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Click a slot to reserve:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                            {t.slots.map((s) => {
                              if (s.is_booked) {
                                return (
                                  <div
                                    key={s.id}
                                    className="p-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-100 text-slate-400 text-center select-none text-[10px] line-through"
                                    title="Sold out"
                                  >
                                    {s.time}
                                  </div>
                                );
                              }
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleSlotSelect(t.theatreId, s.id)}
                                  className="p-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-slate-900 hover:text-white transition-all text-center text-[10px] font-bold shadow-sm active:scale-95 group/slot"
                                >
                                  <span>{s.time}</span>
                                  <span className="block text-[8px] font-extrabold text-emerald-700 group-hover/slot:text-amber-300">
                                    Book ↗
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Direct Theatre Booking Button */}
                        <div className="mt-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const branchToUse = selectedBranch || 'electronic-city';
                              const dateToUse = selectedDate || today;
                              router.push(`/book-now?branch=${branchToUse}&theatre=${t.theatreId}&date=${dateToUse}`);
                            }}
                            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-royal-700 hover:bg-royal-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>Book {t.theatreName}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                    <a
                      href="#theatres-and-slots"
                      onClick={() => setShowSlotsBoard(false)}
                      className="text-royal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Explore Hall Amenities &amp; Room Photos Below &darr;</span>
                    </a>

                    <Link
                      href={`/book-now?branch=${selectedBranch || 'electronic-city'}&date=${selectedDate || today}`}
                      className="text-slate-700 font-semibold hover:text-royal-900 flex items-center gap-1"
                    >
                      <span>Go to Full Booking Page &rarr;</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}