'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialBranch?: string;
  initialTheatre?: number;
  initialOccasion?: string;
}

export default function BookingWizard({ initialBranch, initialTheatre, initialOccasion }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [branchId, setBranchId] = useState<number>(initialBranch === 'btm-stage-2' ? 2 : 1);
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  const [theatreId, setTheatreId] = useState<number>(initialTheatre || 1);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [occasionId, setOccasionId] = useState<number>(1);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [screenName, setScreenName] = useState<string>('');

  // Selected addons map: addon_id -> quantity
  const [selectedAddons, setSelectedAddons] = useState<{ [key: number]: number }>({
    3: 1 // default Magical Fog Entry
  });

  // Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Coupon
  const [couponInput, setCouponInput] = useState<string>('MOVIEBASH200');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number } | null>({
    code: 'MOVIEBASH200',
    discount_amount: 200
  });
  const [couponError, setCouponError] = useState<string>('');

  // Payment & Submission state
  const [paymentMode, setPaymentMode] = useState<'advance_later' | 'razorpay'>('advance_later');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Loaded database items
  const [slotsList, setSlotsList] = useState<Array<any>>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Initial sync from query params
  useEffect(() => {
    const qBranch = searchParams.get('branch');
    const qDate = searchParams.get('date');
    const qTheatre = searchParams.get('theatre');
    const qOccasion = searchParams.get('occasion');
    const qSlot = searchParams.get('slot');

    if (qBranch === 'btm-stage-2') setBranchId(2);
    else if (qBranch === 'electronic-city') setBranchId(1);

    if (qDate) setBookingDate(qDate);
    if (qTheatre) setTheatreId(Number(qTheatre));
    if (qSlot) setSlotId(Number(qSlot));

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

  // Adjust default theatreId when branch changes
  useEffect(() => {
    if (branchId === 2 && theatreId < 4) {
      setTheatreId(4); // Couple BTM
    } else if (branchId === 1 && theatreId > 3) {
      setTheatreId(1); // Couple EC
    }
  }, [branchId, theatreId]);

  // Fetch slots whenever theatre or date changes
  const refreshSlots = React.useCallback(async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?theatre=${theatreId}&date=${bookingDate}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSlotsList(json.data);
        // auto-select first available slot if not selected or current slot is booked
        const currentSlotValid = json.data.find((s: any) => s.id === slotId && !s.is_booked);
        if (!currentSlotValid) {
          const firstAvailable = json.data.find((s: any) => !s.is_booked);
          if (firstAvailable) setSlotId(firstAvailable.id);
        }
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [theatreId, bookingDate, slotId]);

  useEffect(() => {
    refreshSlots();
  }, [theatreId, bookingDate]);

  // Static Data
  const branches = [
    {
      id: 1,
      slug: 'electronic-city',
      name: 'Electronic City Branch',
      shortName: 'Electronic City',
      address: 'Beside Sri Vishnu Grand, Nagananthapura Main Road',
      tag: '12,500+ Celebrations'
    },
    {
      id: 2,
      slug: 'btm-stage-2',
      name: 'BTM 2nd Stage Branch',
      shortName: 'BTM 2nd Stage',
      address: 'Near Udupi Garden Signal, 16th Main Road',
      tag: 'Newly Launched'
    }
  ];

  const branchTheatres = branchId === 1 ? [
    {
      id: 1,
      name: 'Couple Theater',
      emoji: '🎬',
      capacity: 2,
      basePrice: 899,
      extraPersonPrice: 300,
      image: '/images/couple_1.webp',
      description: 'Private candlelit recliner suite, 4K screen, OTT apps.'
    },
    {
      id: 2,
      name: 'Celebration Theater',
      emoji: '🎉',
      capacity: 6,
      basePrice: 1499,
      extraPersonPrice: 250,
      image: '/images/celebration_2.webp',
      description: 'Lounge couch seating, party laser glow, karaoke.'
    },
    {
      id: 3,
      name: 'Family Theater',
      emoji: '👨‍👩‍👧‍👦',
      capacity: 20,
      basePrice: 2499,
      extraPersonPrice: 200,
      image: '/images/ambience_2.webp',
      description: '150-inch Dolby cinema, stadium recliners, food tables.'
    }
  ] : [
    {
      id: 4,
      name: 'Couple Theater',
      emoji: '🎬',
      capacity: 2,
      basePrice: 899,
      extraPersonPrice: 300,
      image: '/images/couple_2.webp',
      description: 'Romantic mood lighting, intimate recliner, 4K Dolby.'
    },
    {
      id: 5,
      name: 'Celebration Theater',
      emoji: '🎉',
      capacity: 6,
      basePrice: 1499,
      extraPersonPrice: 250,
      image: '/images/celebration_3.webp',
      description: 'Spacious party cinema with custom neon setup.'
    },
    {
      id: 6,
      name: 'Family Theater',
      emoji: '👨‍👩‍👧‍👦',
      capacity: 20,
      basePrice: 2499,
      extraPersonPrice: 200,
      image: '/images/ambience_4.webp',
      description: 'Grand multiplex-sized room for large group screenings.'
    },
    {
      id: 7,
      name: 'VIP Celebration Suite',
      emoji: '✨',
      capacity: 8,
      basePrice: 1599,
      extraPersonPrice: 200,
      image: '/images/celebration_6.webp',
      description: '140-inch Laser 4K Cinema, luxury recliner suite, fog ready.'
    }
  ];

  const occasions = [
    { id: 1, name: 'Anniversary Celebration' },
    { id: 2, name: 'Birthday Party' },
    { id: 3, name: 'Romantic Date & Proposal' },
    { id: 4, name: 'Bachelorette / Bride-to-be' },
    { id: 5, name: 'Baby Shower' },
    { id: 6, name: 'Farewell & Corporate Hangout' },
    { id: 7, name: 'Casual Movie Screening' },
  ];

  const availableAddons = [
    { id: 1, name: 'Fresh Half-Kg Cake', price: 499, icon: '🎂', category: 'Cakes' },
    { id: 2, name: 'One-Kg Designer Cake', price: 899, icon: '🎂', category: 'Cakes' },
    { id: 3, name: 'Magical Fog Entry', price: 499, icon: '🌫️', category: 'Special Effects' },
    { id: 4, name: 'Cold Fire Pyro Sparklers', price: 399, icon: '✨', category: 'Special Effects' },
    { id: 5, name: 'Rose Bouquet (20 Roses)', price: 399, icon: '🌹', category: 'Flowers' },
    { id: 6, name: 'Photo & Reel Video Shoot', price: 1199, icon: '📸', category: 'Photography' },
    { id: 7, name: 'Popcorn & Beverage Combo', price: 299, icon: '🍿', category: 'Snacks' },
    { id: 8, name: 'Grand Balloon Canopy Decor', price: 799, icon: '🎈', category: 'Decor' },
  ];

  // Pricing math
  const currentTheatre = branchTheatres.find(t => t.id === theatreId) || branchTheatres[0];
  const extraGuests = Math.max(0, guestsCount - currentTheatre.capacity);
  const subtotalTheatre = currentTheatre.basePrice + (extraGuests * currentTheatre.extraPersonPrice);

  const selectedAddonsPayload = Object.entries(selectedAddons)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const addon = availableAddons.find(a => a.id === Number(id));
      return {
        addon_id: Number(id),
        name: addon?.name || '',
        quantity: qty,
        price: addon?.price || 0,
        total: (addon?.price || 0) * qty
      };
    });

  const addonsTotal = selectedAddonsPayload.reduce((acc, curr) => acc + curr.total, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const grandTotal = Math.max(0, subtotalTheatre + addonsTotal - discountAmount);
  const advanceAmount = 500;
  const balanceAmount = Math.max(0, grandTotal - (paymentMode === 'razorpay' ? advanceAmount : 0));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, amount: subtotalTheatre + addonsTotal }),
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

  const toggleAddon = (id: number) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your full name and 10-digit mobile number.');
      window.scrollTo({ top: 600, behavior: 'smooth' });
      return;
    }
    if (customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      window.scrollTo({ top: 600, behavior: 'smooth' });
      return;
    }
    if (!slotId) {
      setErrorMessage('Please select an available showtime slot.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
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
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          screen_name: screenName,
          guests: guestsCount,
          occasion_id: occasionId,
          addons: selectedAddonsPayload,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount: discountAmount,
          payment_mode: paymentMode,
          notes
        }),
      });

      const json = await res.json();
      if (json.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });

        // Construct direct WhatsApp message for the manager
        const selectedBranchObj = branches.find(b => b.id === branchId);
        const selectedOccasionObj = occasions.find(o => o.id === occasionId);
        const slotText = selectedSlot ? `${selectedSlot.start_time} – ${selectedSlot.end_time}` : 'Scheduled Slot';
        const addonsList = selectedAddonsPayload.length > 0
          ? selectedAddonsPayload.map(a => `${a.name} (x${a.quantity})`).join(', ')
          : 'None';

        const waText = 
          `🎬 *NEW MOVIE BASH BOOKING RESERVED* 🎬\n\n` +
          `*Booking Ref:* ${json.data.booking_ref}\n` +
          `*Name:* ${customerName}\n` +
          `*Phone:* ${customerPhone}\n` +
          `*Branch:* ${selectedBranchObj?.shortName || 'Electronic City'}\n` +
          `*Theatre:* ${currentTheatre.name} (${currentTheatre.emoji})\n` +
          `*Date:* ${bookingDate}\n` +
          `*Slot:* ${slotText}\n` +
          `*Guests:* ${guestsCount}\n` +
          `*Occasion:* ${selectedOccasionObj?.name || 'Celebration'}\n` +
          (screenName ? `*Screen Custom Title:* ${screenName}\n` : '') +
          `*Addons:* ${addonsList}\n` +
          `*Total Amount:* ₹${grandTotal}\n` +
          `*Advance Paid:* ₹${json.data.advance_paid || 0}\n` +
          `*Balance Due at Theatre:* ₹${json.data.balance || grandTotal}\n\n` +
          `Hi Movie Bash team, please confirm my booking setup!`;

        const waUrl = `https://wa.me/919902923656?text=${encodeURIComponent(waText)}`;

        // Save in sessionStorage so success page can re-trigger anytime
        try {
          sessionStorage.setItem('mb_last_booking_wa', waUrl);
          window.open(waUrl, '_blank');
        } catch (_) {}

        router.push(`/booking-success/${json.data.booking_ref}`);
      } else {
        if (res.status === 409) {
          setErrorMessage('⚠️ This slot was just booked by another guest! We have automatically refreshed the available slots below — please select an alternative time.');
          refreshSlots();
          window.scrollTo({ top: 400, behavior: 'smooth' });
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

  const selectedSlot = slotsList.find(s => s.id === slotId);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      
      {/* Top Banner: One-Page Express Flow */}
      <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Express 1-Minute Booking</span>
        </div>
        <h1 className="font-interTight text-2xl sm:text-4xl font-extrabold text-[#101410] tracking-tight">
          Reserve Your Private Screen
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-800 font-medium">
          Choose venue, slot, and surprise add-ons on a single screen with instant WhatsApp confirmation.
        </p>
      </div>

      <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: THE BOOKING SECTIONS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECTION 1: VENUE & DATE */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md hover:border-royal-500 transition-all space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-royal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">1</span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#101410]">Select Venue &amp; Date</h2>
              </div>
              <span className="text-xs font-bold text-royal-700 bg-royal-50 px-2.5 py-1 rounded-full border border-royal-200">2 Prime Bengaluru Branches</span>
            </div>

            {/* Branch Selector Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {branches.map((b) => (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={b.id}
                  onClick={() => setBranchId(b.id)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all flex items-start justify-between cursor-pointer ${
                    branchId === b.id
                      ? 'border-royal-800 bg-royal-50/90 shadow-md ring-2 ring-royal-600/30'
                      : 'border-slate-300 bg-white hover:border-royal-500 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${branchId === b.id ? 'text-royal-700' : 'text-slate-500'}`} />
                      <span className="text-sm font-extrabold text-[#101410]">{b.shortName}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-snug font-medium">{b.address}</p>
                    <span className="inline-block mt-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {b.tag}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 mt-0.5 ${
                    branchId === b.id ? 'border-royal-700 bg-royal-700 text-white' : 'border-slate-300'
                  }`}>
                    {branchId === b.id && <Check className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>

            {/* BookMyShow Style 7-Day Date Ribbon */}
            <div className="pt-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                Select Celebration Date
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
                      suppressHydrationWarning
                      onClick={() => setBookingDate(dateStr)}
                      className={`px-3 py-2 rounded-2xl flex flex-col items-center min-w-[62px] border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-royal-800 bg-royal-800 text-white shadow-md scale-105'
                          : 'border-slate-300 bg-white text-slate-800 hover:border-royal-600'
                      }`}
                    >
                      <span className="text-[10px] font-black tracking-wider opacity-80">{dayName}</span>
                      <span className="text-base font-black leading-none my-0.5">{dayNum}</span>
                      <span className="text-[9px] font-bold tracking-tight opacity-75">{monthName}</span>
                    </button>
                  );
                })}
                <div className="flex items-center gap-1.5 bg-white border-2 border-slate-300 px-3 py-2 rounded-2xl shrink-0 h-[58px]">
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
          </div>

          {/* SECTION 2: CHOOSE THEATRE & SHOWTIME SLOT */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border-2 border-slate-300 shadow-md hover:border-royal-500 transition-all space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-royal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">2</span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#101410]">Select Theatre &amp; Showtime Slot</h2>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Slots Available
              </span>
            </div>

            {/* Theatres Compact Cards (Mobile 3-col BookMyShow style, Desktop Adaptive Grid) */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${branchTheatres.length === 4 ? 'lg:grid-cols-4' : ''} gap-2 sm:gap-3.5`}>
              {branchTheatres.map((t) => (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={t.id}
                  onClick={() => setTheatreId(t.id)}
                  className={`p-2.5 sm:p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    theatreId === t.id
                      ? 'border-royal-800 bg-royal-50/90 shadow-md ring-2 ring-royal-600/30'
                      : 'border-slate-300 bg-white hover:border-royal-600 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg">{t.emoji}</span>
                      <span className="text-xs sm:text-sm font-black text-royal-900">₹{t.basePrice}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#101410] mt-1 truncate">{t.name}</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 line-clamp-1 font-medium">{t.description}</p>
                  </div>
                  <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] sm:text-[11px]">
                    <span className="text-slate-800 font-bold truncate">{t.capacity} Guests</span>
                    <span className={`font-extrabold px-1.5 py-0.5 rounded-full ${
                      theatreId === t.id ? 'bg-royal-800 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {theatreId === t.id ? '✓' : 'Select'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Time Slots Grid for the selected theatre */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-royal-700" />
                  <span>Available Showtime Slots ({bookingDate})</span>
                </span>
                {loadingSlots && <span className="text-[11px] font-bold text-royal-700 animate-pulse">Checking availability...</span>}
              </div>

              {slotsList.length === 0 && !loadingSlots ? (
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-center text-xs text-slate-700 font-semibold">
                  Loading available time slots for this date...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {slotsList.map((s) => {
                    const isBooked = s.is_booked;
                    const isSelected = slotId === s.id;
                    const rawTime = s.time || (s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : '');
                    const slotTime = rawTime ? rawTime.replace(/[–—]/g, '-') : 'Showtime';

                    if (isBooked) {
                      return (
                        <div
                          key={s.id}
                          className="p-2 sm:p-3 rounded-2xl bg-slate-100/90 border-2 border-dashed border-slate-300 text-center cursor-not-allowed select-none opacity-60 flex flex-col items-center justify-center gap-1"
                          title="This slot is already booked"
                        >
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[11px] sm:text-xs font-bold line-through truncate leading-tight">
                              {slotTime}
                            </span>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            Sold Out
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        suppressHydrationWarning
                        key={s.id}
                        onClick={() => setSlotId(s.id)}
                        className={`p-2 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer shadow-xs active:scale-95 group ${
                          isSelected
                            ? 'border-royal-950 bg-royal-900 text-white shadow-elevated ring-2 ring-amber-400/80 scale-[1.02]'
                            : 'border-emerald-500/70 bg-emerald-50/30 hover:border-royal-800 hover:bg-royal-50/60 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`} />
                          <span className={`text-[11px] sm:text-xs font-black tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-[#101410]'}`}>
                            {slotTime}
                          </span>
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-amber-400 text-royal-950 shadow-xs' 
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300 group-hover:bg-royal-900 group-hover:text-white group-hover:border-royal-900'
                        }`}>
                          {isSelected ? '✓ Selected' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: OCCASION & GUESTS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md hover:border-royal-500 transition-all space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
              <span className="w-7 h-7 rounded-full bg-royal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">3</span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#101410]">Occasion &amp; Guests</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                  Select Occasion
                </label>
                <select
                  value={occasionId}
                  onChange={(e) => setOccasionId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-royal-700 focus:bg-white cursor-pointer shadow-xs transition-colors"
                >
                  {occasions.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                  Total Guests Attending
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-9 h-9 rounded-lg bg-slate-100 shadow-xs flex items-center justify-center text-slate-900 hover:bg-slate-200 cursor-pointer active:scale-95"
                    >
                      <Minus className="w-4 h-4 font-bold" />
                    </button>
                    <span className="w-12 text-center font-extrabold text-base text-slate-900">{guestsCount}</span>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setGuestsCount(Math.min(25, guestsCount + 1))}
                      className="w-9 h-9 rounded-lg bg-slate-100 shadow-xs flex items-center justify-center text-slate-900 hover:bg-slate-200 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-700 font-bold">
                    {extraGuests > 0 ? `+${extraGuests} extra (+₹${extraGuests * currentTheatre.extraPersonPrice})` : `Base capacity: ${currentTheatre.capacity}`}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                  Name / Message to Display on Screen (Optional)
                </label>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g. Happy Birthday Rahul!, Happy 5th Anniversary Aditi & Rohan"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SURPRISE ADD-ONS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md hover:border-royal-500 transition-all space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-royal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">4</span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#101410]">Special Celebration Add-ons (Optional)</h2>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">Click to toggle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableAddons.map((addon) => {
                const isSelected = !!selectedAddons[addon.id];
                return (
                  <button
                    type="button"
                    suppressHydrationWarning
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-royal-700 bg-royal-50 shadow-md ring-2 ring-royal-600/30'
                        : 'border-slate-300 bg-white hover:border-royal-500 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{addon.icon}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-royal-700 border-royal-700 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-extrabold text-[#101410] mt-2 leading-snug line-clamp-1">{addon.name}</h4>
                    </div>
                    <span className="text-xs font-black text-royal-900 mt-2.5 block">+₹{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: CONTACT INFORMATION */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md hover:border-royal-500 transition-all space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100">
              <span className="w-7 h-7 rounded-full bg-royal-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">5</span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#101410]">Your Details (For WhatsApp Confirmation)</h2>
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
                  placeholder="e.g. Keep cake hidden until video ends"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-royal-700 focus:bg-white shadow-xs transition-colors"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE ORDER SUMMARY & CONFIRMATION (4 COLS - STICKY) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-elevated space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <h3 className="font-playfair text-xl font-black text-[#101410]">Booking Summary</h3>
              <span className="text-xs font-extrabold text-royal-800 px-2.5 py-1 rounded-full bg-royal-100 border border-royal-200">
                Live Pricing
              </span>
            </div>

            {/* Selected Snapshot */}
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Venue:</span>
                <span className="font-extrabold text-slate-950">{branches.find(b => b.id === branchId)?.shortName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Screen:</span>
                <span className="font-extrabold text-slate-950">{currentTheatre.name} ({guestsCount} Guests)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Date:</span>
                <span className="font-extrabold text-slate-950">{bookingDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Showtime:</span>
                <span className="font-black text-royal-800 text-xs sm:text-sm">
                  {selectedSlot 
                    ? (selectedSlot.time || (selectedSlot.start_time && selectedSlot.end_time ? `${selectedSlot.start_time} – ${selectedSlot.end_time}` : 'Scheduled Slot')) 
                    : 'None Selected'}
                </span>
              </div>
            </div>

            {/* Selected Add-ons list */}
            {selectedAddonsPayload.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Selected Add-ons</span>
                {selectedAddonsPayload.map(a => (
                  <div key={a.addon_id} className="flex items-center justify-between text-xs text-slate-800">
                    <span>{a.name}</span>
                    <span className="font-bold">₹{a.total}</span>
                  </div>
                ))}
              </div>
            )}

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

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Theatre Base ({currentTheatre.capacity} guests)</span>
                <span className="font-bold text-slate-900">₹{currentTheatre.basePrice}</span>
              </div>
              {extraGuests > 0 && (
                <div className="flex justify-between">
                  <span>Extra Guests ({extraGuests} &times; ₹{currentTheatre.extraPersonPrice})</span>
                  <span className="font-bold text-slate-900">₹{extraGuests * currentTheatre.extraPersonPrice}</span>
                </div>
              )}
              {addonsTotal > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons Total</span>
                  <span className="font-bold text-slate-900">₹{addonsTotal}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="text-sm font-bold">Total Celebration Price:</span>
                <span className="font-playfair text-xl font-black text-royal-900">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-bold text-emerald-800 pt-1">
                <span>Advance to Lock Slot:</span>
                <span className="text-sm">₹{advanceAmount}</span>
              </div>
              <span className="text-[10px] text-slate-600 block text-right">
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

            {/* Confirmation CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              <span>{isSubmitting ? 'Reserving Screen...' : `Confirm & Lock Screen (₹${advanceAmount} Advance)`}</span>
              <ChevronRight className="w-4 h-4 text-amber-300" />
            </button>

            {/* Trust Points */}
            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant confirmation on WhatsApp &amp; SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free reschedule up to 72 hours before event</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Private Screening (No strangers allowed)</span>
              </div>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}