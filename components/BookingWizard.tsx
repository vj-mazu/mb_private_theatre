'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Tag, 
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Heart,
  PartyPopper,
  Camera,
  Film,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initialMockStore } from '@/lib/mock-data';

interface Props {
  initialBranch?: string;
  initialTheatre?: number;
  initialOccasion?: string;
}

export default function BookingWizard({ initialBranch, initialTheatre, initialOccasion }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step state: 1 = Showtime, 2 = Package, 3 = Cake & Addons, 4 = Celebration Details, 5 = Review & Confirm
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Branch & Date state
  const [branchId, setBranchId] = useState<number>(initialBranch === 'btm-stage-2' ? 2 : 1);
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  // Theatre & Slot state
  const [theatreId, setTheatreId] = useState<number>(initialTheatre || 1);
  const [slotId, setSlotId] = useState<number | null>(null);

  // Package state (Electronic City)
  const [packageType, setPackageType] = useState<'standard' | 'premium' | 'custom'>('standard');
  const [hoveredPackage, setHoveredPackage] = useState<'standard' | 'premium' | 'custom' | null>(null);

  // Step 3 Addons & Cake state
  const [selectedCakeFlavor, setSelectedCakeFlavor] = useState<string>('Chocolate Truffle');
  const [cakeMessage, setCakeMessage] = useState<string>('');
  
  // Custom package a-la-carte addons
  const [customHasCake, setCustomHasCake] = useState<boolean>(false);
  const [customFogPots, setCustomFogPots] = useState<number>(0); // 0, 1, 2, 3, 5
  const [customColdPyro, setCustomColdPyro] = useState<boolean>(false);
  const [customRosePetals, setCustomRosePetals] = useState<boolean>(false);
  const [customLedName, setCustomLedName] = useState<boolean>(false);
  const [customBouquet, setCustomBouquet] = useState<boolean>(false);
  const [customPhotography, setCustomPhotography] = useState<'none' | '30min' | '1hr'>('none');
  const [customIphoneReel, setCustomIphoneReel] = useState<boolean>(false);
  const [customTeddyMascot, setCustomTeddyMascot] = useState<boolean>(false);
  const [extraHours, setExtraHours] = useState<number>(0); // 0 or 1

  // Standard/Premium package optional add-ons
  const [pkgBouquet, setPkgBouquet] = useState<boolean>(false);
  const [pkgPhotography, setPkgPhotography] = useState<'none' | '30min' | '1hr'>('none');
  const [pkgIphoneReel, setPkgIphoneReel] = useState<boolean>(false);
  const [pkgTeddyMascot, setPkgTeddyMascot] = useState<boolean>(false);

  // Step 4 Celebration Details
  const [occasionId, setOccasionId] = useState<number>(1);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [screenName, setScreenName] = useState<string>('');
  const [ledNumberText, setLedNumberText] = useState<string>('');

  // Step 5 Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>('MOVIEBASH200');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number } | null>({
    code: 'MOVIEBASH200',
    discount_amount: 200
  });
  const [couponError, setCouponError] = useState<string>('');

  // Payment & Submission
  const [paymentMode, setPaymentMode] = useState<'advance_later' | 'razorpay'>('advance_later');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Slots availability state (all branch slots for Step 1 multi-theatre view)
  const [allBranchSlots, setAllBranchSlots] = useState<Array<any>>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Initial sync from query params
  useEffect(() => {
    const qBranch = searchParams.get('branch');
    const qDate = searchParams.get('date');
    const qTheatre = searchParams.get('theatre');
    const qOccasion = searchParams.get('occasion');
    const qSlot = searchParams.get('slot');
    const qPackage = searchParams.get('package');

    if (qBranch === 'btm-stage-2') setBranchId(2);
    else if (qBranch === 'electronic-city') setBranchId(1);

    if (qDate) setBookingDate(qDate);
    if (qTheatre) setTheatreId(Number(qTheatre));
    if (qPackage === 'premium' || qPackage === 'custom' || qPackage === 'standard') {
      setPackageType(qPackage);
    }
    if (qSlot) {
      setSlotId(Number(qSlot));
      setCurrentStep(2); // Jump to package selection if slot came from URL
    }

    if (qOccasion) {
      const matchOcc = [
        { id: 1, slug: 'anniversary' },
        { id: 2, slug: 'birthday-party' },
        { id: 3, slug: 'date-and-proposal' },
        { id: 4, slug: 'bachelorette-party' },
        { id: 5, slug: 'farewell' },
        { id: 6, slug: 'baby-shower' }
      ].find(o => o.slug === qOccasion);
      if (matchOcc) setOccasionId(matchOcc.id);
    }
  }, [searchParams]);

  // Adjust default theatre & guest count when branch or theatre changes
  useEffect(() => {
    if (branchId === 2 && theatreId < 4) {
      setTheatreId(4); // Couple BTM
    } else if (branchId === 1 && theatreId > 3) {
      setTheatreId(1); // Couple EC
    }
  }, [branchId, theatreId]);

  useEffect(() => {
    if (branchId === 1) {
      if (theatreId === 1) {
        setGuestsCount(prev => (prev < 2 ? 2 : prev));
      } else {
        setGuestsCount(prev => (prev < 6 ? 6 : prev));
      }
    }
  }, [theatreId, branchId]);

  // Fetch slots whenever branch or date changes
  const refreshSlots = React.useCallback(async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?branch=${branchId}&date=${bookingDate}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllBranchSlots(json.data);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [branchId, bookingDate]);

  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  // Occasions list
  const occasions = [
    { id: 1, name: 'Anniversary Celebration' },
    { id: 2, name: 'Birthday Party' },
    { id: 3, name: 'Romantic Date & Proposal' },
    { id: 4, name: 'Bachelorette / Farewell Party' },
    { id: 5, name: 'Baby Shower' },
    { id: 6, name: 'Movie Night & Private Screening' }
  ];

  // Cake flavors list
  const cakeFlavors = [
    'Chocolate Truffle',
    'Black Forest',
    'Red Velvet',
    'Butterscotch',
    'Fresh Pineapple',
    'Vanilla Strawberry'
  ];

  // Helper properties based on theatre
  const isEcity = branchId === 1;
  const isCoupleRoom = theatreId === 1 || theatreId === 4;
  const isCelebrationRoom = theatreId === 2 || theatreId === 5 || theatreId === 7;
  const isFamilyRoom = theatreId === 3 || theatreId === 6;

  // Base Room capacities & rates for Electronic City
  const baseCapacity = isCoupleRoom ? 2 : 6;
  const extraPersonRate = isCoupleRoom ? 99 : 149;
  const extraHourRate = isCoupleRoom ? 400 : 750;

  // Package base prices for the selected room
  let standardPrice = 1499;
  let standardOriginalPrice = 1890;
  let premiumPrice = 2800;
  let premiumOriginalPrice = 3297;
  let customBasePrice = 899;

  if (isCelebrationRoom || isFamilyRoom) {
    standardPrice = 2200;
    standardOriginalPrice = 2650;
    premiumPrice = 3500;
    premiumOriginalPrice = 4200;
    customBasePrice = 1699;
  }

  // Selected base package cost
  let selectedBasePrice = standardPrice;
  if (packageType === 'premium') selectedBasePrice = premiumPrice;
  else if (packageType === 'custom') selectedBasePrice = customBasePrice;

  // Extra persons calculation
  const extraGuestsCount = Math.max(0, guestsCount - baseCapacity);
  const extraGuestsCost = extraGuestsCount * extraPersonRate;

  // Extra hours cost
  const extraHoursCost = extraHours * extraHourRate;

  // Addons calculation
  let addonsCost = 0;
  const computedAddonsPayload: Array<{ addon_id: number; name: string; quantity: number; price: number; total: number }> = [];

  if (packageType === 'custom') {
    if (customHasCake) {
      addonsCost += 499;
      computedAddonsPayload.push({ addon_id: 1, name: `500g Cake (${selectedCakeFlavor})`, quantity: 1, price: 499, total: 499 });
    }
    if (customFogPots > 0) {
      const fogPrice = customFogPots === 1 ? 399 : customFogPots === 2 ? 750 : customFogPots === 3 ? 1000 : 1500;
      addonsCost += fogPrice;
      computedAddonsPayload.push({ addon_id: 3, name: `Fog Entry (${customFogPots} ${customFogPots === 1 ? 'Pot' : 'Pots'})`, quantity: 1, price: fogPrice, total: fogPrice });
    }
    if (customColdPyro) {
      addonsCost += 799;
      computedAddonsPayload.push({ addon_id: 4, name: 'Cold Pyro Sparkle Entry', quantity: 1, price: 799, total: 799 });
    }
    if (customRosePetals) {
      addonsCost += 250;
      computedAddonsPayload.push({ addon_id: 5, name: 'Rose Petal Table Decor with Candles', quantity: 1, price: 250, total: 250 });
    }
    if (customLedName) {
      addonsCost += 250;
      computedAddonsPayload.push({ addon_id: 6, name: 'Personalized LED Name Letters', quantity: 1, price: 250, total: 250 });
    }
    if (customBouquet) {
      addonsCost += 399;
      computedAddonsPayload.push({ addon_id: 7, name: 'Fresh Flower Bouquet', quantity: 1, price: 399, total: 399 });
    }
    if (customPhotography === '30min') {
      addonsCost += 499;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (30 mins)', quantity: 1, price: 499, total: 499 });
    } else if (customPhotography === '1hr') {
      addonsCost += 999;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (1 Hour)', quantity: 1, price: 999, total: 999 });
    }
    if (customIphoneReel) {
      addonsCost += 500;
      computedAddonsPayload.push({ addon_id: 9, name: 'iPhone Reel (1 Minute)', quantity: 1, price: 500, total: 500 });
    }
    if (customTeddyMascot) {
      addonsCost += 500;
      computedAddonsPayload.push({ addon_id: 10, name: 'Teddy Mascot Entry (30 mins)', quantity: 1, price: 500, total: 500 });
    }
  } else {
    // Standard or Premium
    if (pkgBouquet) {
      addonsCost += 399;
      computedAddonsPayload.push({ addon_id: 7, name: 'Fresh Flower Bouquet', quantity: 1, price: 399, total: 399 });
    }
    if (pkgPhotography === '30min') {
      addonsCost += 499;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (30 mins)', quantity: 1, price: 499, total: 499 });
    } else if (pkgPhotography === '1hr') {
      addonsCost += 999;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (1 Hour)', quantity: 1, price: 999, total: 999 });
    }
    if (pkgIphoneReel) {
      addonsCost += 500;
      computedAddonsPayload.push({ addon_id: 9, name: 'iPhone Reel (1 Minute)', quantity: 1, price: 500, total: 500 });
    }
    if (pkgTeddyMascot) {
      addonsCost += 500;
      computedAddonsPayload.push({ addon_id: 10, name: 'Teddy Mascot Entry (30 mins)', quantity: 1, price: 500, total: 500 });
    }
  }

  // Grand total calculation
  const subtotalBeforeDiscount = selectedBasePrice + extraGuestsCost + extraHoursCost + addonsCost;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const advanceAmount = 500;
  const balanceAmount = Math.max(0, grandTotal - (paymentMode === 'razorpay' ? advanceAmount : 0));

  // Current selected slot details
  const currentSlot = allBranchSlots.find(s => s.id === slotId);
  const currentSlotTime = currentSlot ? (currentSlot.time || `${currentSlot.start_time} - ${currentSlot.end_time}`) : 'Showtime';
  const currentTheatreName = isCoupleRoom ? 'Couple Room' : isCelebrationRoom ? 'Celebration Room' : 'Family Room';

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, amount: subtotalBeforeDiscount }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    }
  };

  const handleSlotSelect = (thId: number, slId: number) => {
    setTheatreId(thId);
    setSlotId(slId);
    setCurrentStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your full name and 10-digit WhatsApp number.');
      return;
    }
    if (customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!slotId) {
      setErrorMessage('Please select an available showtime slot.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          theatre_id: theatreId,
          slot_id: slotId,
          booking_date: bookingDate,
          package_type: packageType,
          cake_flavor: packageType === 'custom' && !customHasCake ? '' : selectedCakeFlavor,
          extra_hours: extraHours,
          guests: guestsCount,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          screen_name: screenName + (ledNumberText ? ` | LED: ${ledNumberText}` : '') + (cakeMessage ? ` | Cake: ${cakeMessage}` : ''),
          occasion_id: occasionId,
          addons: computedAddonsPayload.map(a => ({ addon_id: a.addon_id, quantity: a.quantity })),
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount: discountAmount,
          payment_mode: paymentMode,
          notes: notes
        }),
      });

      const json = await res.json();
      if (json.success) {
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch (_) {}

        router.push(`/booking-success/${json.data.booking_ref}`);
      } else {
        if (res.status === 409) {
          setErrorMessage('⚠️ This slot was just booked by another guest! Please choose an alternative slot.');
          refreshSlots();
          setCurrentStep(1);
        } else {
          setErrorMessage(json.error || 'Failed to complete booking. Please try again.');
        }
      }
    } catch (err) {
      setErrorMessage('Network error occurred. Please check your connection or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theatres for Electronic City
  const ecityTheatres = [
    {
      id: 1,
      name: 'Couple Room',
      emoji: '💑',
      capacity: 'Up to 2 People',
      description: 'Intimate couple cinema suite with cozy recliners, Dolby Atmos, and romantic ambiance.',
      startPrice: '₹899',
      standardPrice: '₹1,499'
    },
    {
      id: 2,
      name: 'Celebration Room',
      emoji: '🎁',
      capacity: 'Up to 6 People',
      description: 'Party celebration lounge with 135" screen, JBL sound, and party lighting for friend groups.',
      startPrice: '₹1,699',
      standardPrice: '₹2,200'
    },
    {
      id: 3,
      name: 'Family Room',
      emoji: '🧑‍🧑‍🧒‍🧒',
      capacity: 'Up to 6 People',
      description: 'Grand family cinema with giant screen, 7.1.2 Dolby system, and spacious seating.',
      startPrice: '₹1,699',
      standardPrice: '₹2,200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

      {/* Top Banner */}
      <div className="mb-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs mb-2.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Movie Bash — Electronic City Special Packages</span>
        </div>
        <h1 className="font-interTight text-2xl sm:text-4xl font-extrabold text-[#101410] tracking-tight">
          Reserve Your Private Celebration
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
          Select showtime, customize your package with complimentary cake &amp; surprise entries, and get instant WhatsApp confirmation.
        </p>

        {/* 5-Step Progress Indicator */}
        <div className="mt-5 flex items-center justify-between sm:justify-center gap-1 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { num: 1, label: 'Date & Slot' },
            { num: 2, label: 'Package' },
            { num: 3, label: 'Cake & Add-ons' },
            { num: 4, label: 'Details' },
            { num: 5, label: 'Confirm' }
          ].map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (st.num === 1 || (st.num < currentStep) || (st.num === 2 && slotId)) {
                  setCurrentStep(st.num);
                }
              }}
              disabled={st.num > currentStep && (!slotId || st.num > 2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                currentStep === st.num
                  ? 'bg-royal-900 text-amber-400 shadow-md ring-2 ring-amber-400/50 scale-105'
                  : currentStep > st.num
                  ? 'bg-emerald-100 text-emerald-900 cursor-pointer hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep > st.num ? 'bg-emerald-600 text-white' : currentStep === st.num ? 'bg-amber-400 text-royal-950' : 'bg-slate-300 text-slate-700'
              }`}>
                {currentStep > st.num ? '✓' : st.num}
              </span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Slot Sticky Context Banner (Visible from Step 2 onwards) */}
      {currentStep > 1 && slotId && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-royal-900 via-royal-800 to-indigo-900 text-white shadow-elevated flex flex-wrap items-center justify-between gap-3 border border-amber-400/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-white/10">{isCoupleRoom ? '💑' : isCelebrationRoom ? '🎁' : '🧑‍🧑‍🧒‍🧒'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Electronic City Branch</span>
                <span className="text-white/40">&bull;</span>
                <span className="text-xs font-black text-white">{currentTheatreName}</span>
              </div>
              <div className="text-sm font-black flex items-center gap-2 mt-0.5">
                <span>{bookingDate}</span>
                <span className="text-amber-400">@</span>
                <span className="text-amber-300 font-extrabold">{currentSlotTime}</span>
                {extraHours > 0 && <span className="text-xs bg-amber-400 text-royal-950 px-2 py-0.5 rounded-full font-black">+1 Hr Extension</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition-all border border-white/20 active:scale-95"
          >
            Change Slot
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: STEP CONTENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">

          {/* ========================================================================= */}
          {/* STEP 1: DATE & SHOWTIME SLOTS (COUPLE, CELEBRATION, FAMILY)               */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-royal-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">1</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#101410]">Select Date &amp; Showtime</h2>
                    <p className="text-xs text-slate-600 font-semibold">Click any timing below to choose your package</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time Live Availability</span>
                </div>
              </div>

              {/* Branch Indicator */}
              <div className="p-3.5 rounded-2xl bg-royal-50/80 border-2 border-royal-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-royal-700 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-royal-900 block">Current Venue</span>
                    <span className="text-sm font-extrabold text-slate-900">Movie Bash – Electronic City (Nagananthapura Main Road)</span>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-royal-800 text-white shrink-0">
                  3 Screen Suites
                </span>
              </div>

              {/* 7-Day Date Ribbon */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                  1. Pick Celebration Date
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TOM' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
                    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const isSelected = bookingDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setBookingDate(dateStr)}
                        className={`px-3 py-2.5 rounded-2xl flex flex-col items-center min-w-[66px] border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-royal-950 bg-royal-900 text-white shadow-md scale-105 ring-2 ring-amber-400'
                            : 'border-slate-300 bg-white text-slate-800 hover:border-royal-600'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider opacity-80">{dayName}</span>
                        <span className="text-base font-black leading-none my-0.5">{dayNum}</span>
                        <span className="text-[9px] font-bold tracking-tight opacity-75">{monthName}</span>
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1.5 bg-white border-2 border-slate-300 px-3 py-2 rounded-2xl shrink-0 h-[62px]">
                    <Calendar className="w-4 h-4 text-royal-700" />
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Theatres With Direct Showtime Buttons */}
              <div className="space-y-5 pt-1">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  2. Choose Theatre &amp; Timing Slot ({bookingDate})
                </label>

                {ecityTheatres.map((th) => {
                  const theatreSlots = allBranchSlots.filter((s: any) => s.theatre_id === th.id);

                  return (
                    <div 
                      key={th.id}
                      className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 hover:border-royal-400 hover:bg-white transition-all space-y-3.5"
                    >
                      {/* Theatre Info Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">{th.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-[#101410]">{th.name}</h3>
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                                {th.capacity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium line-clamp-1">{th.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 font-bold block">Packages from</span>
                          <span className="text-sm font-black text-royal-900">{th.startPrice} &bull; Standard {th.standardPrice}</span>
                        </div>
                      </div>

                      {/* Showtime Buttons Grid */}
                      <div className="pt-1">
                        {loadingSlots ? (
                          <div className="p-3 text-center text-xs text-royal-700 font-bold animate-pulse">
                            Loading showtimes...
                          </div>
                        ) : theatreSlots.length === 0 ? (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-600 font-semibold">
                            No showtimes configured for this date.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {theatreSlots.map((s: any) => {
                              const isBooked = s.is_booked;
                              const isSelected = slotId === s.id && theatreId === th.id;
                              const rawTime = s.time || (s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : 'Showtime');
                              const slotTime = rawTime.replace(/[–—]/g, '-');

                              if (isBooked) {
                                return (
                                  <div
                                    key={s.id}
                                    className="p-2 sm:p-2.5 rounded-xl bg-slate-200/80 border border-slate-300 text-center cursor-not-allowed opacity-50 flex flex-col items-center justify-center select-none"
                                    title="Already booked"
                                  >
                                    <span className="text-[11px] font-bold text-slate-600 line-through truncate">{slotTime}</span>
                                    <span className="text-[9px] font-black uppercase text-rose-700 mt-0.5">Sold Out</span>
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleSlotSelect(th.id, s.id)}
                                  className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-xs active:scale-95 group ${
                                    isSelected
                                      ? 'border-royal-950 bg-royal-900 text-white shadow-elevated ring-2 ring-amber-400'
                                      : 'border-emerald-500/80 bg-white hover:border-royal-900 hover:bg-royal-50 text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Clock className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`} />
                                    <span className={`text-[11px] sm:text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                      {slotTime}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full mt-1 ${
                                    isSelected
                                      ? 'bg-amber-400 text-royal-950'
                                      : 'bg-emerald-100 text-emerald-900 group-hover:bg-royal-900 group-hover:text-white'
                                  }`}>
                                    {isSelected ? '✓ Selected' : 'Book Now'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CHOOSE PACKAGE (STANDARD, PREMIUM, CUSTOM)                        */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-royal-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">2</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#101410]">Select Celebration Package</h2>
                    <p className="text-xs text-slate-600 font-semibold">Hover over any package to inspect all included amenities</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-royal-800 bg-royal-50 border border-royal-200 px-3 py-1 rounded-full">
                  For {currentTheatreName}
                </span>
              </div>

              {/* 3 Package Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Standard Package */}
                <div
                  onMouseEnter={() => setHoveredPackage('standard')}
                  onMouseLeave={() => setHoveredPackage(null)}
                  onClick={() => setPackageType('standard')}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    packageType === 'standard'
                      ? 'border-royal-900 bg-royal-50/70 shadow-elevated ring-2 ring-royal-700/50 scale-[1.02]'
                      : 'border-slate-300 bg-white hover:border-royal-600 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-royal-800 text-amber-300 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Most Popular &bull; Full Setup
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-royal-900 uppercase tracking-wider">Standard</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'standard' ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {packageType === 'standard' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-royal-950">₹{standardPrice}</span>
                        <span className="text-xs text-slate-400 line-through font-bold">₹{standardOriginalPrice}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-extrabold block">Save ₹{standardOriginalPrice - standardPrice}! (2 Hours)</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-800 font-semibold">
                      <div className="flex items-center gap-2">
                        <span>🎂</span> <span><strong>500g Cake Included</strong> (Pick flavor)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🌫️</span> <span>1 Fog Entry (1 Pot)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🔢</span> <span>LED Number (Age / Year)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🎈</span> <span>Premium Hall Decoration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📽️</span> <span>JBL Dolby Sound &amp; Projector</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🪧</span> <span>Personalized Name Board</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💡</span> <span>Happy Birthday Neon Light</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🛋️</span> <span>Luxury Sofas &amp; AC Screening</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackageType('standard');
                    }}
                    className={`mt-5 w-full py-2.5 rounded-xl font-black text-xs transition-all ${
                      packageType === 'standard'
                        ? 'bg-royal-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-royal-100'
                    }`}
                  >
                    {packageType === 'standard' ? '✓ Standard Selected' : 'Choose Standard'}
                  </button>
                </div>

                {/* 2. Premium Package */}
                <div
                  onMouseEnter={() => setHoveredPackage('premium')}
                  onMouseLeave={() => setHoveredPackage(null)}
                  onClick={() => setPackageType('premium')}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    packageType === 'premium'
                      ? 'border-amber-500 bg-gradient-to-b from-amber-50/80 to-white shadow-elevated ring-2 ring-amber-400 scale-[1.02]'
                      : 'border-slate-300 bg-white hover:border-amber-500 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Grand VIP Celebration</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Premium VIP</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'premium' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                      }`}>
                        {packageType === 'premium' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-950">₹{premiumPrice}</span>
                        <span className="text-xs text-slate-400 line-through font-bold">₹{premiumOriginalPrice}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-extrabold block">Save ₹{premiumOriginalPrice - premiumPrice}! (2 Hours)</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-800 font-semibold">
                      <div className="text-[11px] font-black text-amber-800 uppercase tracking-tight">
                        ✨ Everything in Standard PLUS:
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <span>🌫️</span> <span>Extra Fog Entry (2 Pots Total)</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <span>✨</span> <span>Cold Pyro Sparkle Entry</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <span>🌹</span> <span>Rose Petals / Heart with Candles</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <span>🅰️</span> <span>Personalized 1-Foot LED Name</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <span>🫧</span> <span>Celebration Bubbles Machine</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>🎂</span> <span>500g Cake Included</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackageType('premium');
                    }}
                    className={`mt-5 w-full py-2.5 rounded-xl font-black text-xs transition-all ${
                      packageType === 'premium'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {packageType === 'premium' ? '✓ Premium Selected' : 'Choose Premium VIP'}
                  </button>
                </div>

                {/* 3. Custom Package */}
                <div
                  onMouseEnter={() => setHoveredPackage('custom')}
                  onMouseLeave={() => setHoveredPackage(null)}
                  onClick={() => setPackageType('custom')}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    packageType === 'custom'
                      ? 'border-indigo-700 bg-indigo-50/70 shadow-elevated ring-2 ring-indigo-600/50 scale-[1.02]'
                      : 'border-slate-300 bg-white hover:border-indigo-600 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-indigo-800 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Room Only &bull; Build Your Own
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Custom Package</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'custom' ? 'border-indigo-800 bg-indigo-800 text-white' : 'border-slate-300'
                      }`}>
                        {packageType === 'custom' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-indigo-950">₹{customBasePrice}</span>
                        <span className="text-xs text-slate-500 font-bold">Room Only</span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-semibold block">2 Hours Private Screening</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-700 font-medium">
                      <p className="leading-snug">
                        Reserve the private theatre hall only. You can choose any add-ons a-la-carte in the next step:
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-indigo-200 space-y-1 text-[11px] font-bold text-indigo-950">
                        <div>&bull; Cake as per prices (₹499)</div>
                        <div>&bull; Fog Entry (1 Pot ₹399 / 2 Pots ₹750)</div>
                        <div>&bull; Cold Pyro Entry (₹799)</div>
                        <div>&bull; Rose Petals Decor (₹250)</div>
                        <div>&bull; LED Name (₹250) &bull; Photography</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackageType('custom');
                    }}
                    className={`mt-5 w-full py-2.5 rounded-xl font-black text-xs transition-all ${
                      packageType === 'custom'
                        ? 'bg-indigo-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-indigo-100'
                    }`}
                  >
                    {packageType === 'custom' ? '✓ Custom Selected' : 'Choose Custom (Room Only)'}
                  </button>
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Showtime</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-royal-900 text-white text-xs font-black hover:bg-royal-800 shadow-md flex items-center gap-2 active:scale-95"
                >
                  <span>Continue with {packageType === 'standard' ? 'Standard' : packageType === 'premium' ? 'Premium VIP' : 'Custom'} (Step 3)</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CAKE & SPECIAL ADD-ONS                                            */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-royal-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">3</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#101410]">Cake &amp; Celebration Add-ons</h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      {packageType !== 'custom' 
                        ? '500g celebratory cake is included in your package (₹0)! Customize flavor below.' 
                        : 'Choose your desired cake, surprise fog entry, cold pyro, and memories.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* CAKE SECTION                                                      */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎂</span>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#101410]">500g Pastry Cake</h3>
                      <span className="text-xs text-slate-700 font-semibold">
                        {packageType !== 'custom' ? (
                          <strong className="text-emerald-800">Included in {packageType.toUpperCase()} Package (₹0)</strong>
                        ) : (
                          'A-la-carte for Custom Package (₹499)'
                        )}
                      </span>
                    </div>
                  </div>

                  {packageType === 'custom' && (
                    <button
                      type="button"
                      onClick={() => setCustomHasCake(!customHasCake)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                        customHasCake
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      {customHasCake ? '✓ Cake Added (+₹499)' : '+ Add Cake (+₹499)'}
                    </button>
                  )}
                </div>

                {/* Flavor selector (always shown for Standard/Premium, or when customHasCake is true) */}
                {(packageType !== 'custom' || customHasCake) && (
                  <div className="pt-2 space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                      Select Cake Flavor:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {cakeFlavors.map((flavor) => {
                        const isSelected = selectedCakeFlavor === flavor;
                        return (
                          <button
                            key={flavor}
                            type="button"
                            onClick={() => setSelectedCakeFlavor(flavor)}
                            className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-royal-900 bg-white text-royal-950 shadow-xs ring-2 ring-amber-400'
                                : 'border-amber-300/80 bg-white/70 text-slate-800 hover:border-royal-700'
                            }`}
                          >
                            <span>{flavor}</span>
                            {isSelected && <span className="text-emerald-700 font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                        Name / Text on Cake (Optional):
                      </label>
                      <input
                        type="text"
                        value={cakeMessage}
                        onChange={(e) => setCakeMessage(e.target.value)}
                        placeholder="e.g. Happy Birthday Sneha!"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SPECIAL ADD-ONS SECTION                                           */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Celebration Add-ons &amp; Enhancements
                  </h3>
                  <span className="text-xs font-bold text-slate-600">Select what you love</span>
                </div>

                {/* IF CUSTOM PACKAGE: Full A-la-carte Addons */}
                {packageType === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Fog Entry Multi-pot */}
                    <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-2.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌫️</span>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">Magical Fog Entry</h4>
                            <p className="text-[11px] text-slate-600 font-medium">Dramatic dense dry-ice smoke effect for hero entry</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-royal-900">
                          {customFogPots === 0 ? 'None' : `${customFogPots} ${customFogPots === 1 ? 'Pot' : 'Pots'} (+₹${customFogPots === 1 ? 399 : customFogPots === 2 ? 750 : customFogPots === 3 ? 1000 : 1500})`}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[
                          { pots: 0, label: 'None', price: '₹0' },
                          { pots: 1, label: '1 Pot', price: '₹399' },
                          { pots: 2, label: '2 Pots', price: '₹750' },
                          { pots: 3, label: '3 Pots', price: '₹1000' },
                          { pots: 5, label: '5 Pots', price: '₹1500' }
                        ].map((tier) => (
                          <button
                            key={tier.pots}
                            type="button"
                            onClick={() => setCustomFogPots(tier.pots)}
                            className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer ${
                              customFogPots === tier.pots
                                ? 'border-royal-900 bg-royal-900 text-white font-black shadow-xs'
                                : 'border-slate-300 bg-white text-slate-800 font-bold hover:border-royal-600 text-xs'
                            }`}
                          >
                            <div className="text-[11px] leading-tight">{tier.label}</div>
                            <div className="text-[10px] opacity-80">{tier.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cold Pyro Sparkle */}
                    <button
                      type="button"
                      onClick={() => setCustomColdPyro(!customColdPyro)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customColdPyro ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">✨</span>
                          <span className="text-xs font-black text-slate-900">Cold Pyro Sparkle Entry</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">Indoor-safe cold spark fountains during entry</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹799</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customColdPyro ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customColdPyro && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Rose Petal Table Decor */}
                    <button
                      type="button"
                      onClick={() => setCustomRosePetals(!customRosePetals)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customRosePetals ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🌹</span>
                          <span className="text-xs font-black text-slate-900">Rose Petal Table Decor</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">Romantic heart shape / HBD table setup with candles</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹250</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customRosePetals ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customRosePetals && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Personalized LED Name */}
                    <button
                      type="button"
                      onClick={() => setCustomLedName(!customLedName)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customLedName ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🅰️</span>
                          <span className="text-xs font-black text-slate-900">Personalized LED Name</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">1-foot glowing LED letter display of your partner's name</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹250</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customLedName ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customLedName && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Bouquet */}
                    <button
                      type="button"
                      onClick={() => setCustomBouquet(!customBouquet)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customBouquet ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">💐</span>
                          <span className="text-xs font-black text-slate-900">Fresh Flower Bouquet</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">Handcrafted Dutch red rose celebration bouquet</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹399</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customBouquet ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customBouquet && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* DSLR Photography */}
                    <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📸</span>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">DSLR Photography</h4>
                          <p className="text-[11px] text-slate-600 font-medium">Dedicated pro photographer (30+ edited photos)</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {[
                          { key: 'none', label: 'None', price: '₹0' },
                          { key: '30min', label: '30 mins', price: '₹499' },
                          { key: '1hr', label: '1 Hour', price: '₹999' }
                        ].map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setCustomPhotography(p.key as any)}
                            className={`py-1.5 px-1 rounded-xl text-center border-2 transition-all cursor-pointer ${
                              customPhotography === p.key
                                ? 'border-royal-900 bg-royal-900 text-white font-black text-xs'
                                : 'border-slate-300 bg-white text-slate-800 font-bold hover:border-royal-600 text-xs'
                            }`}
                          >
                            <div className="text-[11px]">{p.label}</div>
                            <div className="text-[10px] opacity-80">{p.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* iPhone Reel */}
                    <button
                      type="button"
                      onClick={() => setCustomIphoneReel(!customIphoneReel)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customIphoneReel ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">📱</span>
                          <span className="text-xs font-black text-slate-900">iPhone Cinematic Reel</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">1-minute trending 4K reel edited with your favorite music</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹500</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customIphoneReel ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customIphoneReel && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Teddy Mascot */}
                    <button
                      type="button"
                      onClick={() => setCustomTeddyMascot(!customTeddyMascot)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        customTeddyMascot ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🧸</span>
                          <span className="text-xs font-black text-slate-900">Teddy Mascot Entry</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">30 mins live dancing giant Teddy mascot surprise</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹500</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        customTeddyMascot ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {customTeddyMascot && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                  </div>
                )}

                {/* IF STANDARD OR PREMIUM: Optional Add-ons */}
                {packageType !== 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Bouquet */}
                    <button
                      type="button"
                      onClick={() => setPkgBouquet(!pkgBouquet)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        pkgBouquet ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">💐</span>
                          <span className="text-xs font-black text-slate-900">Fresh Flower Bouquet</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">Handcrafted Dutch red rose celebration bouquet</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹399</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        pkgBouquet ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {pkgBouquet && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* DSLR Photography */}
                    <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📸</span>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">DSLR Photography</h4>
                          <p className="text-[11px] text-slate-600 font-medium">Pro photographer with 30+ edited high-res photos</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {[
                          { key: 'none', label: 'None', price: '₹0' },
                          { key: '30min', label: '30 mins', price: '₹499' },
                          { key: '1hr', label: '1 Hour', price: '₹999' }
                        ].map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setPkgPhotography(p.key as any)}
                            className={`py-1.5 px-1 rounded-xl text-center border-2 transition-all cursor-pointer ${
                              pkgPhotography === p.key
                                ? 'border-royal-900 bg-royal-900 text-white font-black text-xs'
                                : 'border-slate-300 bg-white text-slate-800 font-bold hover:border-royal-600 text-xs'
                            }`}
                          >
                            <div className="text-[11px]">{p.label}</div>
                            <div className="text-[10px] opacity-80">{p.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* iPhone Reel */}
                    <button
                      type="button"
                      onClick={() => setPkgIphoneReel(!pkgIphoneReel)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        pkgIphoneReel ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">📱</span>
                          <span className="text-xs font-black text-slate-900">iPhone Cinematic Reel</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">1-minute trending 4K reel edited with your song</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹500</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        pkgIphoneReel ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {pkgIphoneReel && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Teddy Mascot */}
                    <button
                      type="button"
                      onClick={() => setPkgTeddyMascot(!pkgTeddyMascot)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                        pkgTeddyMascot ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🧸</span>
                          <span className="text-xs font-black text-slate-900">Teddy Mascot Entry</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">30 mins live dancing giant Teddy mascot surprise</p>
                        <span className="text-xs font-black text-royal-900 mt-2 block">+₹500</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        pkgTeddyMascot ? 'border-royal-800 bg-royal-800 text-white' : 'border-slate-300'
                      }`}>
                        {pkgTeddyMascot && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                  </div>
                )}

                {/* Extra 1 Hour Extension (Available for ALL packages) */}
                <div className="pt-2">
                  <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    extraHours === 1 ? 'border-royal-900 bg-royal-50 shadow-xs ring-2 ring-royal-600/30' : 'border-slate-200 bg-white hover:border-royal-500'
                  }`}
                  onClick={() => setExtraHours(extraHours === 1 ? 0 : 1)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-royal-800 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900">Extend Showtime Duration (+1 Hour)</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-950">
                            Total 3 Hours
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          Enjoy an extra full hour of uninterrupted celebration and movie streaming
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-black text-royal-900 block">+₹{extraHourRate}</span>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        extraHours === 1 ? 'bg-royal-800 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {extraHours === 1 ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Packages</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(4);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-royal-900 text-white text-xs font-black hover:bg-royal-800 shadow-md flex items-center gap-2 active:scale-95"
                >
                  <span>Continue to Step 4 (Celebration Details)</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CELEBRATION & GUEST DETAILS                                       */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-royal-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">4</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#101410]">Celebration &amp; Guest Details</h2>
                    <p className="text-xs text-slate-600 font-semibold">Customize your screen presentation and guest count</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Occasion */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Celebration Occasion <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={occasionId}
                    onChange={(e) => setOccasionId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:border-royal-700 focus:bg-white cursor-pointer shadow-xs transition-colors"
                  >
                    {occasions.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Total People Attending
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                        className="w-9 h-9 rounded-lg bg-slate-100 shadow-xs flex items-center justify-center text-slate-900 hover:bg-slate-200 cursor-pointer active:scale-95"
                      >
                        <Minus className="w-4 h-4 font-bold" />
                      </button>
                      <span className="w-12 text-center font-extrabold text-base text-slate-900">{guestsCount}</span>
                      <button
                        type="button"
                        onClick={() => setGuestsCount(Math.min(25, guestsCount + 1))}
                        className="w-9 h-9 rounded-lg bg-slate-100 shadow-xs flex items-center justify-center text-slate-900 hover:bg-slate-200 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-700 font-bold leading-tight">
                      Base package covers {baseCapacity} people.
                      {extraGuestsCount > 0 ? (
                        <span className="text-amber-800 font-extrabold block">
                          +{extraGuestsCount} extra {extraGuestsCount === 1 ? 'person' : 'people'} (+₹{extraGuestsCost} @ ₹{extraPersonRate}/person)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold block">No extra charges</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Screen Custom Message */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Name / Message to Display on Screen (Big Projector Welcome)
                  </label>
                  <input
                    type="text"
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                    placeholder="e.g. Happy 5th Anniversary Priya & Arjun! / Happy Birthday Aditi!"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

                {/* LED Number input (for age / anniversary year) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Number for Glowing LED Display (Age or Anniversary Year)
                  </label>
                  <input
                    type="text"
                    value={ledNumberText}
                    onChange={(e) => setLedNumberText(e.target.value)}
                    placeholder="e.g. 25, 05, 1st"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Add-ons</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(5);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-royal-900 text-white text-xs font-black hover:bg-royal-800 shadow-md flex items-center gap-2 active:scale-95"
                >
                  <span>Review Summary &amp; Confirm (Step 5)</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: CUSTOMER DETAILS & FINAL CONFIRMATION                             */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-royal-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">5</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#101410]">Your Details (For WhatsApp Confirmation)</h2>
                    <p className="text-xs text-slate-600 font-semibold">We will send automated booking confirmation immediately to your WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Karthik Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    10-Digit WhatsApp Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9902923656"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. karthik@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Special Notes / Song Request (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Play our proposal video before cake cutting"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                  />
                </div>

              </div>

              {/* Trust badges */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-950 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Instant WhatsApp Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>100% Private Screening Suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Free Reschedule Available</span>
                </div>
              </div>

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE ORDER SUMMARY & SUBMIT (4 COLS - STICKY)               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-elevated space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <h3 className="font-playfair text-xl font-black text-[#101410]">Celebration Bill</h3>
              <span className="text-xs font-extrabold text-royal-800 px-2.5 py-1 rounded-full bg-royal-100 border border-royal-200">
                Live Pricing
              </span>
            </div>

            {/* Selected Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Venue:</span>
                <span className="font-extrabold text-slate-950">Electronic City</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Screen:</span>
                <span className="font-extrabold text-slate-950">{currentTheatreName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Date:</span>
                <span className="font-extrabold text-slate-950">{bookingDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Showtime:</span>
                <span className="font-black text-royal-800 text-xs sm:text-sm">
                  {currentSlotTime} {extraHours > 0 ? '(+1 Hr)' : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Package:</span>
                <span className="font-black text-royal-950 capitalize">{packageType} Package</span>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-1.5 text-xs text-slate-800 pt-1">
              <div className="flex justify-between">
                <span>{packageType === 'custom' ? 'Room Only' : `${packageType.toUpperCase()} Package`} ({baseCapacity} Guests)</span>
                <span className="font-bold text-slate-900">₹{selectedBasePrice}</span>
              </div>

              {packageType !== 'custom' ? (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>🎂 500g Cake ({selectedCakeFlavor})</span>
                  <span>Included (₹0)</span>
                </div>
              ) : customHasCake ? (
                <div className="flex justify-between">
                  <span>🎂 500g Cake ({selectedCakeFlavor})</span>
                  <span className="font-bold text-slate-900">₹499</span>
                </div>
              ) : null}

              {extraGuestsCount > 0 && (
                <div className="flex justify-between">
                  <span>Extra Guests ({extraGuestsCount} @ ₹{extraPersonRate})</span>
                  <span className="font-bold text-slate-900">₹{extraGuestsCost}</span>
                </div>
              )}

              {extraHours > 0 && (
                <div className="flex justify-between">
                  <span>Extra 1 Hour Extension</span>
                  <span className="font-bold text-slate-900">₹{extraHoursCost}</span>
                </div>
              )}

              {computedAddonsPayload
                .filter(a => !(packageType === 'custom' && a.addon_id === 1)) // cake already listed
                .map((a, i) => (
                  <div key={i} className="flex justify-between text-slate-700">
                    <span>{a.name}</span>
                    <span className="font-bold text-slate-900">₹{a.total}</span>
                  </div>
                ))}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            {/* Coupon Box */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                  ✓ Code {appliedCoupon.code} applied: ₹{appliedCoupon.discount_amount} OFF
                </span>
              )}
              {couponError && (
                <span className="text-[11px] font-bold text-rose-600 block mt-1">{couponError}</span>
              )}
            </div>

            {/* Total Section */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between items-baseline text-slate-900">
                <span className="text-sm font-bold">Grand Total:</span>
                <span className="font-playfair text-2xl font-black text-royal-900">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-bold text-emerald-800 pt-1">
                <span>Advance to Lock Slot:</span>
                <span className="text-sm font-black">₹{advanceAmount}</span>
              </div>
              <span className="text-[10px] text-slate-600 block text-right font-medium">
                Balance ₹{balanceAmount} payable upon arrival at venue
              </span>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action CTA Button */}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !slotId) {
                    setErrorMessage('Please select a timing slot above.');
                    return;
                  }
                  setCurrentStep(prev => prev + 1);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full py-3.5 px-6 rounded-full font-black text-sm text-white bg-royal-900 hover:bg-royal-800 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full font-black text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                <span>{isSubmitting ? 'Reserving Screen...' : `Confirm & Lock Screen (₹${advanceAmount} Advance)`}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            )}

            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant automated WhatsApp to you &amp; admin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Slot locked exclusively for you</span>
              </div>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
