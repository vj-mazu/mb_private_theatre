'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTodayIST, getTomorrowIST, getDaysAgoIST } from '@/lib/time';
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
import { GrandAddonIcon } from '@/components/GrandIcons';
import confetti from 'canvas-confetti';
import { initialMockStore } from '@/lib/mock-data';
import UpiPaymentCard from '@/components/UpiPaymentCard';

// Base static theatre profiles (images, specs, video assets)
const baseEcityTheatres = [
  {
    id: 1,
    name: 'Couple Room',
    showTitle: 'Couple Show',
    emoji: '💑',
    capacity: 'Up to 2 People',
    spec: '4K Laser · JBL 5.1 Surround',
    description: 'Intimate couple cinema suite with cozy recliners, Dolby Atmos, and romantic rose-petal ambiance.',
    startPrice: '₹899',
    standardPrice: '₹1,499',
    images: ['/images/couple_1.webp', '/images/couple_3.webp'],
    video: '/videos/video_1.mp4',
  },
  {
    id: 2,
    name: 'Celebration Room',
    showTitle: 'Celebration Show',
    emoji: '🎁',
    capacity: 'Up to 6 People',
    spec: '4K Laser · JBL Pro Party Sound',
    description: 'Party celebration lounge with 135" screen, JBL sound, and party lighting for friend groups.',
    startPrice: '₹1,499',
    standardPrice: '₹2,200',
    images: ['/images/celebration_2.webp', '/images/celebration_6.webp'],
    video: '/videos/video_2.mp4',
  },
  {
    id: 3,
    name: 'Family Room',
    showTitle: 'Family Show',
    emoji: '🧑‍🧑‍🧒‍🧒',
    capacity: 'Up to 12 People',
    spec: '150″ Screen · Dolby 7.1.2 Atmos',
    description: 'Grand family cinema with giant screen, 7.1.2 Dolby system, and spacious multi-row plush seating.',
    startPrice: '₹1,699',
    standardPrice: '₹2,200',
    images: ['/images/celebration_1.webp', '/images/celebration_6.webp'],
    video: '/videos/video_3.mp4',
  }
];

const baseBtmTheatres = [
  {
    id: 4,
    name: 'Butterfly Blush',
    showTitle: 'Butterfly Blush',
    emoji: '🦋',
    capacity: 'Up to 2 People',
    spec: 'Signature Blush Glow · 4K Laser · Dolby Atmos',
    description: 'Intimate couple cinema suite with cozy recliners, signature blush ambient glow, and romantic setting.',
    startPrice: '₹899',
    standardPrice: '₹1,499',
    images: ['/images/rooms/btm-butterfly-blush.webp', '/images/couple_3.webp'],
    video: '/videos/btm-butterfly-blush.mp4',
  },
  {
    id: 5,
    name: 'Lavender Mist',
    showTitle: 'Lavender Mist',
    emoji: '🪻',
    capacity: 'Up to 6 People',
    spec: 'Aesthetic Lavender Hues · 135″ Cinema · High-Fi Audio',
    description: 'Private celebration lounge with stage backdrop, lavender ambient glow, party lighting, and cake podium.',
    startPrice: '₹1,499',
    standardPrice: '₹2,200',
    images: ['/images/rooms/btm-lavender-mist.webp', '/images/celebration_3.webp'],
    video: '/videos/btm-lavender-mist.mp4',
  },
  {
    id: 6,
    name: 'Scarlet Red',
    showTitle: 'Scarlet Red',
    emoji: '🌹',
    capacity: 'Up to 12 People',
    spec: 'Passionate Scarlet Theme · 150″ 4K Cinema · Recliner Suite',
    description: 'Grand 150″ wide screen theatre with luxury loungers, private dining table, and karaoke setup.',
    startPrice: '₹1,699',
    standardPrice: '₹2,600',
    images: ['/images/rooms/btm-scarlet-red.webp', '/images/rooms/btm-scarlet-red-alt.webp'],
    video: '/videos/btm-scarlet-red.mp4',
  },
  {
    id: 7,
    name: 'Shadow Suit',
    showTitle: 'Shadow Suit',
    emoji: '🎬',
    capacity: 'Up to 8 People',
    spec: 'Stealth Cinema Suite · 140″ Laser 4K · Dolby Audio',
    description: 'Stealth cinema suite with deep contrast acoustic walls, 140″ laser projection, and luxury recliners.',
    startPrice: '₹1,599',
    standardPrice: '₹2,400',
    images: ['/images/rooms/btm-shadow-suit.webp', '/images/celebration_2.webp'],
    video: '/videos/btm-butterfly-blush.mp4',
  }
];

interface Props {
  initialBranch?: string;
  initialTheatre?: number;
  initialOccasion?: string;
  initialLiveTheatres?: any[];
}

export default function BookingWizard({ initialBranch, initialTheatre, initialOccasion, initialLiveTheatres }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step state: 1 = Showtime, 2 = Package, 3 = Cake & Addons, 4 = Celebration Details, 5 = Review & Confirm
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Branch & Date state
  const isBtmInit = initialBranch === 'btm-stage-2' || initialBranch === 'btm-2nd-stage';
  const [branchId, setBranchId] = useState<number>(isBtmInit ? 2 : 1);
  const todayStr = getTodayIST();
  const tomorrowStr = getTomorrowIST();
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  // Theatre & Slot state (Branch 1: IDs 1-3, Branch 2: IDs 4-7)
  const [theatreId, setTheatreId] = useState<number>(() => {
    if (initialTheatre && (isBtmInit ? (initialTheatre >= 4 && initialTheatre <= 7) : (initialTheatre >= 1 && initialTheatre <= 3))) {
      return initialTheatre;
    }
    return isBtmInit ? 4 : 1;
  });
  const [slotId, setSlotId] = useState<number | null>(null);
  const [theatreMediaMap, setTheatreMediaMap] = useState<Record<number, 'photo1' | 'photo2' | 'video'>>({});

  // Package state (Electronic City)
  const [packageType, setPackageType] = useState<'standard' | 'premium' | 'custom'>('standard');
  const [hoveredPackage, setHoveredPackage] = useState<'standard' | 'premium' | 'custom' | null>(null);

  // Step 3 Addons & Cake state
  const [selectedCakeFlavor, setSelectedCakeFlavor] = useState<string>('Fresh Pineapple');
  const [cakeWeight, setCakeWeight] = useState<'500g' | '1kg'>('500g');
  const [cakeMessage, setCakeMessage] = useState<string>('');
  
  // Custom package a-la-carte addons
  const [customHasCake, setCustomHasCake] = useState<boolean>(false);
  const [customFogPots, setCustomFogPots] = useState<number>(0); // 0, 1, 2, 3, 5
  const [customColdPyro, setCustomColdPyro] = useState<boolean>(false);
  const [customRosePetals, setCustomRosePetals] = useState<boolean>(false);
  const [customLedName, setCustomLedName] = useState<boolean>(false);
  const [customBouquet, setCustomBouquet] = useState<boolean>(false);
  const [customBubbleEntry, setCustomBubbleEntry] = useState<boolean>(false);
  const [customPhotography, setCustomPhotography] = useState<'none' | '30min' | '1hr'>('none');
  const [customIphoneReel, setCustomIphoneReel] = useState<boolean>(false);
  const [customTeddyMascot, setCustomTeddyMascot] = useState<boolean>(false);
  const [extraHours, setExtraHours] = useState<number>(0); // 0 or 1

  // Standard/Premium package optional add-ons
  const [pkgColdPyro, setPkgColdPyro] = useState<boolean>(false);
  const [pkgExtraFogPot, setPkgExtraFogPot] = useState<boolean>(false);
  const [pkgRosePetals, setPkgRosePetals] = useState<boolean>(false);
  const [pkgLedName, setPkgLedName] = useState<boolean>(false);
  const [pkgBouquet, setPkgBouquet] = useState<boolean>(false);
  const [pkgBubbleEntry, setPkgBubbleEntry] = useState<boolean>(false);
  const [pkgPhotography, setPkgPhotography] = useState<'none' | '30min' | '1hr'>('none');
  const [pkgIphoneReel, setPkgIphoneReel] = useState<boolean>(false);
  const [pkgTeddyMascot, setPkgTeddyMascot] = useState<boolean>(false);

  // Step 4 Celebration Details
  const [occasionId, setOccasionId] = useState<number>(1);
  const [specialPersonName, setSpecialPersonName] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [screenName, setScreenName] = useState<string>('');
  const [ledNumberText, setLedNumberText] = useState<string>('');

  // Step 5 Customer details & Payment
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // Coupon state (synchronized with active database promo)
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number } | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount_value: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Payment & Submission (UPI Only - 100% direct instant verification)
  const [paymentMode, setPaymentMode] = useState<'upi'>('upi');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Slots availability state (all branch slots for Step 1 multi-theatre view)
  const [allBranchSlots, setAllBranchSlots] = useState<Array<any>>(() => {
    const initBranch = (initialBranch === 'btm-stage-2' || initialBranch === 'btm-2nd-stage') ? 2 : 1;
    const branchTheatres = initialMockStore.theatres.filter(t => t.branch_id === initBranch && (t as any).is_active !== 0);
    const thIds = branchTheatres.map(t => t.id);
    return initialMockStore.timeSlots
      .filter(s => thIds.includes(s.theatre_id) && s.is_active === 1)
      .map(s => {
        const th = branchTheatres.find(t => t.id === s.theatre_id);
        return {
          ...s,
          time: `${s.start_time} - ${s.end_time}`,
          theatre_name: th?.name,
          theatre_emoji: th?.emoji,
          theatre_capacity: th?.capacity,
          branch_id: th?.branch_id,
          is_booked: false
        };
      });
  });
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Initial sync from query params
  useEffect(() => {
    const qBranch = searchParams.get('branch');
    const qDate = searchParams.get('date');
    const qTheatre = searchParams.get('theatre');
    const qOccasion = searchParams.get('occasion');
    const qSlot = searchParams.get('slot');
    const qPackage = searchParams.get('package');

    if (qBranch === 'btm-stage-2' || qBranch === 'btm-2nd-stage') {
      setBranchId(2);
      if (!qTheatre) setTheatreId(4);
    } else if (qBranch === 'electronic-city') {
      setBranchId(1);
      if (!qTheatre) setTheatreId(1);
    }

    if (qDate) setBookingDate(qDate);
    if (qTheatre) {
      const parsedTh = Number(qTheatre);
      if (parsedTh >= 1 && parsedTh <= 7) {
        setTheatreId(parsedTh);
      }
    }
    if (qPackage === 'premium' || qPackage === 'celebration') {
      setPackageType('premium');
    } else if (qPackage === 'custom') {
      setPackageType('custom');
    } else if (qPackage === 'standard') {
      setPackageType('standard');
    }
    if (qSlot) {
      setSlotId(Number(qSlot));
      setCurrentStep(2); // Jump to package selection if slot came from URL
    }

    if (qOccasion) {
      const matchOcc = occasions.find(o => o.slug === qOccasion || o.slug.includes(qOccasion) || qOccasion.includes(o.slug));
      if (matchOcc) setOccasionId(matchOcc.id);
    }
  }, [searchParams]);

  // Adjust default theatre & guest count when branch or theatre changes
  useEffect(() => {
    if (branchId === 2 && (theatreId < 4 || theatreId > 7)) {
      setTheatreId(4); // Butterfly Blush BTM
    } else if (branchId === 1 && (theatreId < 1 || theatreId > 3)) {
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

  // Switching venue resets the theatre and any slot already chosen on the other branch
  const switchBranch = (id: number) => {
    if (id === branchId) return;
    setBranchId(id);
    setTheatreId(id === 2 ? 4 : 1);
    setSlotId(null);
    setExtraHours(0);
    setGuestsCount(2);
    setCurrentStep(1);
  };

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

  // Occasions list (synchronized with landing page)
  const occasions = [
    { id: 1, name: 'Birthday Party', icon: '🎂', slug: 'birthday-party', desc: 'Grand balloons, cake table & HBD neon lighting' },
    { id: 2, name: 'Romantic Proposal', icon: '💍', slug: 'date-and-proposal', desc: 'Will You Marry Me neon, candle aisle & cold sparklers' },
    { id: 3, name: 'Anniversary Celebration', icon: '💖', slug: 'anniversary', desc: 'Fairy lights, heart arch & fresh red roses' },
    { id: 4, name: 'Couple Date Night', icon: '✨', slug: 'couple-date', desc: 'Private cinema lounge, recliner & movie streaming' },
    { id: 5, name: 'Bride-to-be / Bachelorette', icon: '👰', slug: 'bachelorette-party', desc: 'Tiara, sash, champagne balloons & hilarious party props' },
    { id: 6, name: 'Kids Birthday Party', icon: '🎈', slug: 'kids-birthday', desc: 'Cartoon & superhero balloons with family cake party' },
    { id: 7, name: 'Baby Shower / Mom-to-be', icon: '👶', slug: 'baby-shower', desc: 'Pastel balloons and fairy buggy celebration entry' },
    { id: 8, name: 'Friends & Match Screening', icon: '🥳', slug: 'friends-party', desc: 'Gaming, live match screening & karaoke party' },
    { id: 9, name: 'Farewell / Bon Voyage', icon: '🎓', slug: 'farewell', desc: 'Emotional memory video on giant 4K cinema screen' }
  ];

  // Cake flavors list with grand bespoke icons and descriptions
  const cakeFlavors = [
    { name: 'Fresh Pineapple', iconKey: 'pineapple', icon: '🍍', badge: 'Popular Choice', desc: 'Light whipped cream & real juicy pineapple chunks' },
    { name: 'Belgian Chocolate Truffle', iconKey: 'chocolate', icon: '🍫', badge: 'Bestseller', desc: 'Rich Dutch dark chocolate truffle ganache' },
    { name: 'Classic Black Forest', iconKey: 'black-forest', icon: '🍒', badge: 'Classic', desc: 'Chocolate sponge, sweet-tart cherries & chocolate shavings' },
    { name: 'Crunchy Butterscotch', iconKey: 'butterscotch', icon: '🍯', badge: 'Crunchy', desc: 'Caramel butterscotch cream with praline nut crunch' },
    { name: 'Red Velvet Heart', iconKey: 'red-velvet', icon: '💖', badge: 'Romantic Pick', desc: 'Ruby cocoa sponge with rich cream cheese frosting' },
    { name: 'Vanilla Strawberry', iconKey: 'pineapple', icon: '🍓', badge: 'Fruity & Fresh', desc: 'Chilled vanilla cream layered with strawberry glaze' }
  ];

  // Helper properties based on theatre
  const isEcity = branchId === 1;
  const isCoupleRoom = theatreId === 1 || theatreId === 4;
  const isCelebrationRoom = theatreId === 2 || theatreId === 5 || theatreId === 7;
  const isFamilyRoom = theatreId === 3 || theatreId === 6;

  // Dynamic backend sync for theatres & add-ons (reflects Admin CMS modifications in real-time)
  const [dynamicTheatres, setDynamicTheatres] = useState<any[]>(() => initialLiveTheatres || []);
  const [dynamicAddons, setDynamicAddons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/theatres')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setDynamicTheatres(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/addons')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setDynamicAddons(json.data);
        }
      })
      .catch(() => {});

    // Only pre-fill the coupon box when a coupon is actually active.
    fetch('/api/coupons/featured')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.code) {
          const coupon = {
            code: json.data.code as string,
            discount_value: Number(json.data.discount_value) || 0,
          };
          setActiveCoupon(coupon);
          setCouponInput(coupon.code);
          setAppliedCoupon({ code: coupon.code, discount_amount: coupon.discount_value });
        } else {
          setActiveCoupon(null);
          setAppliedCoupon(null);
          setCouponInput('');
        }
      })
      .catch(() => {});
  }, []);



  const getAddonPrice = (id: number, fallback: number): number => {
    const match = dynamicAddons.find((a: any) => a.id === id);
    return match && typeof match.price === 'number' ? Number(match.price) : fallback;
  };

  // Add-ons switched off in the admin panel disappear from every step.
  const addonReady = dynamicAddons.length > 0;
  const addonActive = (id: number): boolean =>
    !addonReady || dynamicAddons.some((a: any) => Number(a.id) === id);

  // Drop any selection whose add-on has been switched off by the admin.
  useEffect(() => {
    if (!addonReady) return;
    if (!addonActive(1)) setCustomHasCake(false);
    if (!addonActive(3)) setCustomFogPots(0);
    if (!addonActive(4)) { setCustomColdPyro(false); setPkgColdPyro(false); }
    if (!addonActive(9)) { setCustomRosePetals(false); setPkgRosePetals(false); }
    if (!addonActive(5)) { setCustomLedName(false); setPkgLedName(false); }
    if (!addonActive(7)) { setCustomBouquet(false); setPkgBouquet(false); }
    if (!addonActive(11)) { setCustomBubbleEntry(false); setPkgBubbleEntry(false); }
    if (!addonActive(8)) {
      setCustomPhotography('none'); setPkgPhotography('none');
      setCustomIphoneReel(false); setPkgIphoneReel(false);
    }
    if (!addonActive(10)) { setCustomTeddyMascot(false); setPkgTeddyMascot(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonReady]);

  const mergeDynamicTheatres = (baseTheatres: typeof baseEcityTheatres) => {
    if (!dynamicTheatres.length) return baseTheatres;
    return baseTheatres.map(th => {
      const match = dynamicTheatres.find((d: any) => d.id === th.id);
      if (!match) return th;
      
      let images = th.images;
      if (match.image_url) {
        const extraImages = Array.isArray(match.images) 
          ? match.images.filter((img: string) => img !== match.image_url) 
          : th.images.filter((img: string) => img !== match.image_url);
        images = [match.image_url, ...extraImages];
      } else if (Array.isArray(match.images) && match.images.length > 0) {
        images = match.images;
      }

      const customP = match.custom_price !== undefined ? Number(match.custom_price) : (match.base_price !== undefined ? Number(match.base_price) : undefined);
      const standardP = match.standard_price !== undefined ? Number(match.standard_price) : undefined;
      const premiumP = match.premium_price !== undefined ? Number(match.premium_price) : undefined;
      const extraHr = match.extra_hour_rate !== undefined ? Number(match.extra_hour_rate) : undefined;
      const extraPerson = match.extra_person_price !== undefined ? Number(match.extra_person_price) : undefined;
      const capNum = typeof match.capacity === 'number' ? match.capacity : undefined;

      const dynamicName = match.name || th.name;
      const dynamicEmoji = match.emoji || th.emoji;
      const dynamicCapacity = typeof match.capacity === 'number' ? `Up to ${match.capacity} People` : (match.capacity || th.capacity);
      const dynamicSpec = match.amenities || th.spec;
      const dynamicVideo = match.video_url || th.video;

      return {
        ...th,
        name: dynamicName,
        showTitle: dynamicName,
        emoji: dynamicEmoji,
        capacity: dynamicCapacity,
        spec: dynamicSpec,
        video: dynamicVideo,
        images,
        standard_price: standardP,
        custom_price: customP,
        premium_price: premiumP,
        extra_hour_rate: extraHr,
        extra_person_price: extraPerson,
        capacity_num: capNum,
        startPrice: customP ? `₹${customP.toLocaleString('en-IN')}` : th.startPrice,
        standardPrice: standardP ? `₹${standardP.toLocaleString('en-IN')}` : th.standardPrice
      };
    });
  };

  const currentBranchTheatres = branchId === 2 ? mergeDynamicTheatres(baseBtmTheatres) : mergeDynamicTheatres(baseEcityTheatres);

  // Active selected theatre configuration from dynamic DB data
  const activeTheatreData = currentBranchTheatres.find(t => t.id === theatreId) || currentBranchTheatres[0];

  // Base Room capacities & rates (Dynamic from DB with smart fallbacks)
  const baseCapacity = typeof (activeTheatreData as any)?.capacity_num === 'number' 
    ? (activeTheatreData as any).capacity_num 
    : (isCoupleRoom ? 2 : 6);

  const extraPersonRate = (activeTheatreData as any)?.extra_person_price !== undefined
    ? Number((activeTheatreData as any).extra_person_price)
    : (isCoupleRoom ? 99 : 149);

  const extraHourRate = (activeTheatreData as any)?.extra_hour_rate !== undefined
    ? Number((activeTheatreData as any).extra_hour_rate)
    : (isCoupleRoom ? 400 : 750);

  // Package base prices for the selected room (Dynamic from DB with fallback)
  let standardPrice = (activeTheatreData as any)?.standard_price !== undefined
    ? Number((activeTheatreData as any).standard_price)
    : (isCoupleRoom ? 1499 : 2200);

  let standardOriginalPrice = Math.round(standardPrice * 1.25);

  let premiumPrice = (activeTheatreData as any)?.premium_price !== undefined
    ? Number((activeTheatreData as any).premium_price)
    : (isCoupleRoom ? 2800 : 3500);

  let premiumOriginalPrice = Math.round(premiumPrice * 1.2);

  let customBasePrice = (activeTheatreData as any)?.custom_price !== undefined
    ? Number((activeTheatreData as any).custom_price)
    : (isCoupleRoom ? 899 : 1699);

  // Selected base package cost
  let selectedBasePrice = standardPrice;
  if (packageType === 'premium') selectedBasePrice = premiumPrice;
  else if (packageType === 'custom') selectedBasePrice = customBasePrice;

  // Extra persons calculation
  const extraGuestsCount = Math.max(0, guestsCount - baseCapacity);
  const extraGuestsCost = extraGuestsCount * extraPersonRate;

  // Extra hours cost
  const extraHoursCost = extraHours * extraHourRate;

  // Addons calculation with dynamic DB prices
  let addonsCost = 0;
  const computedAddonsPayload: Array<{ addon_id: number; name: string; quantity: number; price: number; total: number }> = [];

  // Dynamic Addon prices from DB
  const cake500gPrice = getAddonPrice(1, 499);
  const fog1PotPrice = getAddonPrice(3, 399);
  const coldPyroPrice = getAddonPrice(4, 799);
  const rosePetalsPrice = getAddonPrice(9, 250);
  const ledNamePrice = getAddonPrice(5, 250);
  const bouquetPrice = getAddonPrice(7, 399);
  const bubblePrice = getAddonPrice(11, 199);
  const photo30minPrice = 499;
  const photo1hrPrice = getAddonPrice(8, 999);
  const reelPrice = 500;
  const mascotPrice = 500;

  // Cake weight upgrade (+400 for 1kg)
  if (cakeWeight === '1kg' && (packageType !== 'custom' || customHasCake)) {
    addonsCost += 400;
    computedAddonsPayload.push({ addon_id: 1, name: '1.0 Kg Cake Upgrade (+500g)', quantity: 1, price: 400, total: 400 });
  }

  if (packageType === 'custom') {
    if (customHasCake) {
      addonsCost += cake500gPrice;
      computedAddonsPayload.push({ addon_id: 1, name: `500g Cake (${selectedCakeFlavor})`, quantity: 1, price: cake500gPrice, total: cake500gPrice });
    }
    if (customFogPots > 0) {
      const fogPrice = customFogPots === 1 ? fog1PotPrice : customFogPots === 2 ? 750 : customFogPots === 3 ? 1000 : 1500;
      addonsCost += fogPrice;
      computedAddonsPayload.push({ addon_id: 3, name: `Fog Entry (${customFogPots} ${customFogPots === 1 ? 'Pot' : 'Pots'})`, quantity: 1, price: fogPrice, total: fogPrice });
    }
    if (customColdPyro) {
      addonsCost += coldPyroPrice;
      computedAddonsPayload.push({ addon_id: 4, name: 'Cold Pyro Sparkle Entry (2 Pots)', quantity: 1, price: coldPyroPrice, total: coldPyroPrice });
    }
    if (customRosePetals) {
      addonsCost += rosePetalsPrice;
      computedAddonsPayload.push({ addon_id: 5, name: 'Rose Petal Table Decor with Candles', quantity: 1, price: rosePetalsPrice, total: rosePetalsPrice });
    }
    if (customLedName) {
      addonsCost += ledNamePrice;
      computedAddonsPayload.push({ addon_id: 6, name: 'Personalized LED Name Letters', quantity: 1, price: ledNamePrice, total: ledNamePrice });
    }
    if (customBouquet) {
      addonsCost += bouquetPrice;
      computedAddonsPayload.push({ addon_id: 7, name: 'Fresh Flower Bouquet (15 Roses)', quantity: 1, price: bouquetPrice, total: bouquetPrice });
    }
    if (customBubbleEntry) {
      addonsCost += bubblePrice;
      computedAddonsPayload.push({ addon_id: 11, name: 'Grand Bubble Machine Entry', quantity: 1, price: bubblePrice, total: bubblePrice });
    }
    if (customPhotography === '30min') {
      addonsCost += photo30minPrice;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (30 mins)', quantity: 1, price: photo30minPrice, total: photo30minPrice });
    } else if (customPhotography === '1hr') {
      addonsCost += photo1hrPrice;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (1 Hour)', quantity: 1, price: photo1hrPrice, total: photo1hrPrice });
    }
    if (customIphoneReel) {
      addonsCost += reelPrice;
      computedAddonsPayload.push({ addon_id: 9, name: 'iPhone Reel (1 Minute)', quantity: 1, price: reelPrice, total: reelPrice });
    }
    if (customTeddyMascot) {
      addonsCost += mascotPrice;
      computedAddonsPayload.push({ addon_id: 10, name: 'Teddy Mascot Entry (30 mins)', quantity: 1, price: mascotPrice, total: mascotPrice });
    }
  } else {
    // Standard or Premium
    if (pkgColdPyro) {
      addonsCost += coldPyroPrice;
      computedAddonsPayload.push({ addon_id: 4, name: 'Cold Pyro Sparkle Entry (2 Pots)', quantity: 1, price: coldPyroPrice, total: coldPyroPrice });
    }
    if (pkgExtraFogPot) {
      addonsCost += fog1PotPrice;
      computedAddonsPayload.push({ addon_id: 3, name: 'Extra Fog Pot (Total 2 Pots)', quantity: 1, price: fog1PotPrice, total: fog1PotPrice });
    }
    if (pkgRosePetals) {
      addonsCost += rosePetalsPrice;
      computedAddonsPayload.push({ addon_id: 5, name: 'Rose Petal Table Decor with Candles', quantity: 1, price: rosePetalsPrice, total: rosePetalsPrice });
    }
    if (pkgLedName) {
      addonsCost += ledNamePrice;
      computedAddonsPayload.push({ addon_id: 6, name: 'Personalized LED Name Letters', quantity: 1, price: ledNamePrice, total: ledNamePrice });
    }
    if (pkgBouquet) {
      addonsCost += bouquetPrice;
      computedAddonsPayload.push({ addon_id: 7, name: 'Fresh Flower Bouquet (15 Roses)', quantity: 1, price: bouquetPrice, total: bouquetPrice });
    }
    if (pkgBubbleEntry) {
      addonsCost += bubblePrice;
      computedAddonsPayload.push({ addon_id: 11, name: 'Grand Bubble Machine Entry', quantity: 1, price: bubblePrice, total: bubblePrice });
    }
    if (pkgPhotography === '30min') {
      addonsCost += photo30minPrice;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (30 mins)', quantity: 1, price: photo30minPrice, total: photo30minPrice });
    } else if (pkgPhotography === '1hr') {
      addonsCost += photo1hrPrice;
      computedAddonsPayload.push({ addon_id: 8, name: 'DSLR Photography (1 Hour)', quantity: 1, price: photo1hrPrice, total: photo1hrPrice });
    }
    if (pkgIphoneReel) {
      addonsCost += reelPrice;
      computedAddonsPayload.push({ addon_id: 9, name: 'iPhone Reel (1 Minute)', quantity: 1, price: reelPrice, total: reelPrice });
    }
    if (pkgTeddyMascot) {
      addonsCost += mascotPrice;
      computedAddonsPayload.push({ addon_id: 10, name: 'Teddy Mascot Entry (30 mins)', quantity: 1, price: mascotPrice, total: mascotPrice });
    }
  }

  // Grand total calculation
  const subtotalBeforeDiscount = selectedBasePrice + extraGuestsCost + extraHoursCost + addonsCost;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const advanceAmount = 500;
  const balanceAmount = Math.max(0, grandTotal - advanceAmount);

  // Extend slot timing when +1 hour is added (e.g. 10:00 AM - 12:00 PM + 1hr = 10:00 AM – 01:00 PM (3 Hours Total))
  const extendSlotTime = (rawTime: string, extraHoursCount: number): string => {
    if (!rawTime || extraHoursCount <= 0) return rawTime;
    const parts = rawTime.split(/[-–—]/).map(s => s.trim());
    if (parts.length !== 2) return `${rawTime} (+${extraHoursCount} Hr)`;
    
    const [startStr, endStr] = parts;
    const match = endStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return `${rawTime} (+${extraHoursCount} Hr)`;
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    let meridiem = match[3].toUpperCase();
    
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    
    hours = (hours + extraHoursCount) % 24;
    
    const newMeridiem = hours >= 12 ? 'PM' : 'AM';
    let displayHour = hours % 12;
    if (displayHour === 0) displayHour = 12;
    const paddedHour = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
    
    const newEndTime = `${paddedHour}:${minutes} ${newMeridiem}`;
    return `${startStr} – ${newEndTime} (${2 + extraHoursCount} Hours Total)`;
  };

  // Current selected slot details
  const currentSlot = allBranchSlots.find(s => s.id === slotId);
  const baseSlotTime = currentSlot ? (currentSlot.time || `${currentSlot.start_time} - ${currentSlot.end_time}`) : 'Showtime';
  const currentSlotTime = extendSlotTime(baseSlotTime, extraHours);
  const currentTheatreName = activeTheatreData?.name || (branchId === 2 ? (theatreId === 5 ? 'Lavender Mist' : theatreId === 6 ? 'Scarlet Red' : theatreId === 7 ? 'Shadow Suit' : 'Butterfly Blush') : (theatreId === 2 ? 'Celebration Theater' : theatreId === 3 ? 'Family Theater' : 'Couple Theater'));

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
    setNameError('');
    setPhoneError('');
    setEmailError('');

    let hasValidationError = false;

    // 1. Full name validation (min 2 chars, letters and spaces only)
    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Please enter your full name (at least 2 characters).');
      hasValidationError = true;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      setNameError('Name should contain only letters and spaces.');
      hasValidationError = true;
    }

    // 2. WhatsApp Phone validation (Indian 10-digit mobile starting with 6, 7, 8, or 9)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      setPhoneError('Please enter your 10-digit WhatsApp mobile number.');
      hasValidationError = true;
    } else if (cleanPhone.length !== 10) {
      setPhoneError(`Mobile number must be exactly 10 digits (currently ${cleanPhone.length}).`);
      hasValidationError = true;
    } else if (!/^[6-9]/.test(cleanPhone)) {
      setPhoneError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.');
      hasValidationError = true;
    }

    // 3. Email validation (if provided)
    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        setEmailError('Please enter a valid email address (e.g. name@example.com).');
        hasValidationError = true;
      }
    }

    // 4. Showtime slot check
    if (!slotId) {
      setErrorMessage('Please select an available showtime slot before proceeding.');
      setCurrentStep(1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (hasValidationError) {
      setErrorMessage('Please correct the highlighted errors in your details.');
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
          slot_time: currentSlotTime,
          booking_date: bookingDate,
          package_type: packageType,
          cake_flavor: packageType === 'custom' && !customHasCake ? '' : selectedCakeFlavor,
          extra_hours: extraHours,
          guests: guestsCount,
          customer_name: trimmedName,
          special_person_name: specialPersonName.trim(),
          customer_phone: cleanPhone,
          whatsapp_number: cleanPhone,
          customer_email: customerEmail.trim(),
          screen_name: screenName + (ledNumberText ? ` | LED: ${ledNumberText}` : '') + (cakeMessage ? ` | Cake: ${cakeMessage}` : ''),
          occasion_id: occasionId,
          addons: computedAddonsPayload.map(a => ({ addon_id: a.addon_id, quantity: a.quantity })),
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount: discountAmount,
          payment_mode: 'upi_advance',
          notes: notes,
          utr_number: utrNumber.trim()
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

      {/* Top Banner */}
      <div className="mb-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 font-bold text-xs mb-2.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#f39a4b] animate-ping" />
          <span>Movie Bash — {branchId === 2 ? 'BTM 2nd Stage' : 'Electronic City'} Celebration Packages</span>
        </div>
        <h1 className="font-interTight text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
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
                  ? 'bg-[#00A2E4] text-white shadow-md shadow-[#00A2E4]/25 ring-2 ring-[#00A2E4]/30 scale-105'
                  : currentStep > st.num
                  ? 'bg-[#E6F3FB] text-[#0B2238] cursor-pointer hover:bg-[#ffe8df]'
                  : 'bg-white/80 text-slate-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep > st.num ? 'bg-[#0B2238] text-white' : currentStep === st.num ? 'bg-white text-[#00A2E4]' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > st.num ? '✓' : st.num}
              </span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Venue / Branch Switcher */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-white border border-stone-200 p-1 shadow-sm">
          <span className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Venue
          </span>
          {[
            { id: 1, label: 'Electronic City' },
            { id: 2, label: 'BTM 2nd Stage' }
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={branchId === b.id}
              onClick={() => switchBranch(b.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                branchId === b.id
                  ? 'bg-[#00A2E4] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Slot Sticky Context Banner (Visible from Step 2 onwards) */}
      {currentStep > 1 && slotId && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0B2238] via-[#2a2220] to-[#0B2238] text-white shadow-md flex flex-wrap items-center justify-between gap-3 border border-[#00A2E4]/20/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-white/10">{isCoupleRoom ? '💑' : isCelebrationRoom ? '🎁' : '🧑‍🧑‍🧒‍🧒'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#ffd46e] tracking-wider">{branchId === 2 ? 'BTM 2nd Stage Branch' : 'Electronic City Branch'}</span>
                <span className="text-white/40">&bull;</span>
                <span className="text-xs font-black text-white">{currentTheatreName}</span>
              </div>
              <div className="text-sm font-black flex items-center gap-2 mt-0.5">
                <span>{bookingDate}</span>
                <span className="text-amber-200">@</span>
                <span className="text-white font-extrabold">{currentSlotTime}</span>
                {extraHours > 0 && <span className="text-xs bg-[#f39a4b] text-white px-2 py-0.5 rounded-full font-black">+{extraHours} Hr{extraHours > 1 ? 's' : ''} ({2 + extraHours} Hrs Total)</span>}
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
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#00A2E4] text-white font-black text-sm flex items-center justify-center shadow-xs">1</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">Select Date &amp; Showtime</h2>
                    <p className="text-xs text-slate-600 font-semibold">Click any timing below to choose your package</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3FB] border border-[#00A2E4]/30 text-[#00A2E4] text-xs font-black uppercase tracking-wider">
                    <span>✨ {packageType.toUpperCase()} PACKAGE</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-time Live Availability</span>
                  </div>
                </div>
              </div>

              {/* Branch Indicator */}
              <div className="p-3.5 rounded-2xl bg-[#F6FAFD] border border-[#00A2E4]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#00A2E4] shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B2238] block">Current Venue</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {branchId === 2
                        ? 'Movie Bash – BTM 2nd Stage (16th Main Road)'
                        : 'Movie Bash – Electronic City (Nagananthapura Main Road)'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-[#00A2E4] text-white shrink-0">
                  {currentBranchTheatres.length} Screen Suites
                </span>
              </div>

              {/* 7-Day Date Ribbon */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                  1. Pick Celebration Date
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dateStr = getDaysAgoIST(-i);
                    const [y, m, dayNum] = dateStr.split('-');
                    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const monthName = monthNames[parseInt(m, 10) - 1];
                    const dayObj = new Date(`${dateStr}T12:00:00+05:30`);
                    const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TOM' : dayObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const isSelected = bookingDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setBookingDate(dateStr)}
                        className={`px-3 py-2.5 rounded-2xl flex flex-col items-center min-w-[66px] border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-md scale-105 ring-2 ring-orange-300'
                            : 'border-[#00A2E4]/20 bg-white text-slate-800 hover:border-[#00A2E4]'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider opacity-80">{dayName}</span>
                        <span className="text-base font-black leading-none my-0.5">{dayNum}</span>
                        <span className="text-[9px] font-bold tracking-tight opacity-75">{monthName}</span>
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-2 rounded-2xl shrink-0 h-[62px]">
                    <Calendar className="w-4 h-4 text-[#00A2E4]" />
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

              {/* 3 Clean Showcase Theatre Cards matching moviebash.in/book-now */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Choose Your Theatre Show ({bookingDate})
                  </label>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Select a theatre show below to view available showtimes
                  </span>
                </div>

                {/* Clean 3-Column Theatre Cards Grid (Clean 3 in Row 1, and 4th card centered in Next Row) */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-5 sm:gap-6 pt-1">
                  {currentBranchTheatres.map((th, idx) => {
                    const isSelected = theatreId === th.id;
                    const currentMedia = theatreMediaMap[th.id] || 'photo1';
                    const branchLocationLabel = branchId === 2 ? 'BTM 2nd Stage, Bengaluru' : 'Electronic City, Bengaluru';
                    const isFourthCard = currentBranchTheatres.length === 4 && idx === 3;

                    return (
                      <div
                        key={th.id}
                        onClick={() => setTheatreId(th.id)}
                        className={`h-full rounded-3xl border-2 transition-all duration-300 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer group ${
                          isFourthCard ? 'md:col-start-2' : ''
                        } ${
                          isSelected 
                            ? 'border-[#00A2E4] ring-4 ring-[#00A2E4]/15 shadow-xl' 
                            : 'border-slate-200/90 hover:border-[#00A2E4]/60'
                        }`}
                      >
                        <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
                          {currentMedia === 'video' ? (
                            <video
                              key={th.video}
                              src={th.video}
                              poster={th.images?.[0]}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={currentMedia === 'photo2' ? th.images[1] : th.images[0]}
                              alt={th.name}
                              fill
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          )}

                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm border border-white/20 whitespace-nowrap">
                              {th.capacity}
                            </span>
                          </div>

                          <div
                            className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md p-1 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              aria-label={`Show photo 1 of ${th.name}`}
                              title="Photo 1"
                              onClick={() => setTheatreMediaMap(prev => ({ ...prev, [th.id]: 'photo1' }))}
                              className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-black transition-all cursor-pointer ${
                                currentMedia === 'photo1' ? 'bg-[#00A2E4] text-white' : 'text-white/85 hover:bg-white/15'
                              }`}
                            >
                              1
                            </button>
                            <button
                              type="button"
                              aria-label={`Show photo 2 of ${th.name}`}
                              title="Photo 2"
                              onClick={() => setTheatreMediaMap(prev => ({ ...prev, [th.id]: 'photo2' }))}
                              className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-black transition-all cursor-pointer ${
                                currentMedia === 'photo2' ? 'bg-[#00A2E4] text-white' : 'text-white/85 hover:bg-white/15'
                              }`}
                            >
                              2
                            </button>
                            <button
                              type="button"
                              aria-label={`Play walkthrough video of ${th.name}`}
                              title="Walkthrough video"
                              onClick={() => setTheatreMediaMap(prev => ({ ...prev, [th.id]: 'video' }))}
                              className={`w-6 h-6 rounded-full grid place-items-center text-[9px] transition-all cursor-pointer ${
                                currentMedia === 'video' ? 'bg-[#00A2E4] text-white' : 'text-white/85 hover:bg-white/15'
                              }`}
                            >
                              <span aria-hidden="true">▶</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2.5">
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                              {th.name}
                            </h3>
                            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#00A2E4] shrink-0" />
                              <span>{branchLocationLabel}</span>
                            </div>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                            {th.spec}
                          </p>

                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[15px] font-black text-[#082052]">Starts @ {th.startPrice}</span>
                            <span className="text-[10px] font-bold text-emerald-700">· ₹500 advance</span>
                          </div>

                          <div className="w-full mt-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTheatreId(th.id);
                              }}
                              className={`w-full min-h-[40px] py-2 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#082052] text-white shadow-md'
                                  : 'bg-[#00A2E4] hover:bg-[#0072AE] text-white'
                              }`}
                            >
                              <span>{isSelected ? '✓ Selected' : 'Select theatre'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Showtime Slots for Currently Selected Theatre */}
                {(() => {
                  const selectedTheatre = currentBranchTheatres.find(t => t.id === theatreId) || currentBranchTheatres[0];
                  if (!selectedTheatre) return null;
                  const theatreSlots = allBranchSlots.filter((s: any) => s.theatre_id === selectedTheatre.id);

                  return (
                    <div className="p-5 sm:p-6 rounded-3xl border-2 border-[#00A2E4]/30 bg-gradient-to-br from-[#F8F0E5]/40/50 via-white to-amber-50/40 shadow-sm space-y-3.5 mt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#00A2E4]" />
                                                      <h4 className="text-sm sm:text-base font-black text-slate-900">
                            Available Showtimes for <span className="text-[#00A2E4]">{selectedTheatre.name}</span> ({bookingDate})
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          Slot duration: <strong>2 Hours Private Cinema (+1 Hr Optional Extension)</strong>
                        </span>
                      </div>

                      {loadingSlots ? (
                        <div className="p-6 text-center text-xs text-[#00A2E4] font-bold animate-pulse">
                          Loading real-time showtimes...
                        </div>
                      ) : theatreSlots.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-600 font-semibold">
                          No showtimes configured for this date. Please choose another date above.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {theatreSlots.map((s: any) => {
                            const isBooked = s.is_booked;
                            const isSelected = slotId === s.id && theatreId === selectedTheatre.id;
                            const rawTime = s.time || (s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : 'Showtime');
                            const slotTime = rawTime.replace(/[–—]/g, '-');

                            if (isBooked) {
                              return (
                                <div
                                  key={s.id}
                                  className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center cursor-not-allowed opacity-55 flex flex-col items-center justify-center select-none min-h-[72px]"
                                  title="Already booked"
                                >
                                  <span className="text-xs font-bold text-slate-600 line-through truncate">{slotTime}</span>
                                  <span className="text-[10px] font-black uppercase text-rose-700 mt-1">Sold Out</span>
                                </div>
                              );
                            }

                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleSlotSelect(selectedTheatre.id, s.id)}
                                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-xs active:scale-95 group min-h-[72px] ${
                                  isSelected
                                    ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-md ring-2 ring-orange-300 scale-[1.02]'
                                    : 'border-slate-200/90 hover:border-[#00A2E4] bg-white hover:bg-slate-50 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-[#00A2E4]'}`} />
                                  <span className={`text-[11px] sm:text-[13px] font-black whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                    {slotTime}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1.5 shadow-2xs ${
                                  isSelected
                                    ? 'bg-white text-[#00A2E4]'
                                    : 'bg-[#E6F3FB] text-[#082052] group-hover:bg-[#00A2E4] group-hover:text-white'
                                }`}>
                                  {isSelected ? '✓ Selected Slot' : 'Reserve Slot'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CHOOSE PACKAGE (STANDARD, PREMIUM, CUSTOM)                        */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#0B2238] text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">2</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">Select Celebration Package</h2>
                    <p className="text-xs text-slate-600 font-semibold">Hover over any package to inspect all included amenities</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0B2238] bg-[#F6FAFD] border border-[#00A2E4]/20 px-3 py-1 rounded-full">
                  For {currentTheatreName}
                </span>
              </div>

              {/* Selected Theatre Showcase with Walkthrough Sample Video */}
              {(() => {
                const selectedTh = currentBranchTheatres.find(t => t.id === theatreId) || currentBranchTheatres[0];
                const thVideo = selectedTh?.video || (branchId === 2 ? '/videos/btm-butterfly-blush.mp4' : '/videos/video_1.mp4');
                const branchLabel = branchId === 2 ? 'BTM 2nd Stage' : 'Electronic City';

                return (
                  <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white p-4 sm:p-5 shadow-lg border border-stone-800">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                      
                      {/* Sample Walkthrough Video Player */}
                      <div className="relative w-full md:w-80 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 shadow-inner group">
                        <video
                          ref={(el) => {
                            if (el) {
                              el.muted = true;
                              el.defaultMuted = true;
                              el.play().catch(() => {});
                            }
                          }}
                          key={thVideo}
                          poster={selectedTh?.images?.[0]}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          <source src={thVideo} type="video/mp4" />
                        </video>
                        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                          <span className="px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Sample Video
                          </span>
                        </div>
                      </div>

                      {/* Selected Theatre Context & Package Guide */}
                      <div className="flex-1 space-y-2 text-center md:text-left w-full">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#00A2E4]/20 text-[#f39a4b] text-xs font-black border border-[#00A2E4]/30">
                            {selectedTh?.emoji} {selectedTh?.name}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold">
                            👥 {selectedTh?.capacity}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold">
                            🔊 {selectedTh?.spec}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold">
                            📍 {branchLabel}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                          {selectedTh?.name} — Live Celebration Setup
                        </h3>
                        <p className="text-xs text-stone-300 font-medium leading-relaxed">
                          {selectedTh?.description || 'Authentic walkthrough of room ambience, screen projection, and celebration decor.'}
                        </p>

                        <div className="pt-1 flex items-center justify-center md:justify-start gap-2 text-[11px] text-amber-300 font-bold bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                          <span>✨</span>
                          <span>Compare packages below for this theatre. Standard &amp; Premium include cake, fog entry &amp; celebration décor!</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* 3 Package Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Standard Package */}
                <div
                  onMouseEnter={() => setHoveredPackage('standard')}
                  onMouseLeave={() => setHoveredPackage(null)}
                  onClick={() => setPackageType('standard')}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    packageType === 'standard'
                      ? 'border-[#00A2E4] bg-[#F6FAFD]/60 shadow-lg ring-2 ring-[#00A2E4]/30 scale-[1.02]'
                      : 'border-[#00A2E4]/20 bg-white hover:border-[#00A2E4] hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-[#00A2E4] text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Most Popular &bull; Full Setup
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#0B2238] uppercase tracking-wider">Standard</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'standard' ? 'border-[#0B2238] bg-[#0B2238] text-white' : 'border-[#00A2E4]/20'
                      }`}>
                        {packageType === 'standard' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#0B2238]">₹{standardPrice}</span>
                        <span className="text-xs text-slate-400 line-through font-bold">₹{standardOriginalPrice}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-extrabold block">Save ₹{standardOriginalPrice - standardPrice}!</span>
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
                        ? 'bg-[#0B2238] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-[#E6F3FB]'
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
                      ? 'border-[#f39a4b] bg-gradient-to-b from-[#fffaf0] to-white shadow-lg ring-2 ring-[#f39a4b]/40 scale-[1.02]'
                      : 'border-[#00A2E4]/20 bg-white hover:border-amber-500 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#f39a4b] to-[#e6832e] text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Grand VIP Celebration</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Premium VIP</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'premium' ? 'border-amber-600 bg-amber-600 text-white' : 'border-[#00A2E4]/20'
                      }`}>
                        {packageType === 'premium' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-950">₹{premiumPrice}</span>
                        <span className="text-xs text-slate-400 line-through font-bold">₹{premiumOriginalPrice}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-extrabold block">Save ₹{premiumOriginalPrice - premiumPrice}!</span>
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
                        ? 'bg-[#f39a4b] text-white shadow-xs'
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
                      : 'border-[#00A2E4]/20 bg-white hover:border-indigo-600 hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-indigo-800 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Room Only &bull; Build Your Own
                  </div>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Custom Package</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        packageType === 'custom' ? 'border-indigo-800 bg-indigo-800 text-white' : 'border-[#00A2E4]/20'
                      }`}>
                        {packageType === 'custom' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-indigo-950">₹{customBasePrice}</span>
                        <span className="text-xs text-slate-500 font-bold">Room Only</span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-semibold block">Private Screening &amp; Hall Setup</span>
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
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
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
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white text-xs font-black hover:opacity-95 shadow-md flex items-center gap-2 active:scale-95"
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
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#0B2238] text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">3</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">Cake &amp; Celebration Add-ons</h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      {packageType !== 'custom' 
                        ? '500g celebratory cake is included in your package (₹0)! Customize flavor below.' 
                        : 'Choose your desired cake, surprise fog entry, cold pyro, and memories.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* CAKE SECTION WITH ULTRA-LUXURY GLASSMORPHISM & REAL ICONS         */}
              {/* ----------------------------------------------------------------- */}
              <div
                      style={{ display: addonActive(1) ? undefined : 'none' }}
                      className="p-5 sm:p-6 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-amber-50/90 via-white/80 to-[#E6F3FB]/40/70 border-2 border-amber-300/80 shadow-[0_16px_40px_rgba(245,158,11,0.08)] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl backdrop-blur-md bg-amber-100/80 border border-amber-300/70 shadow-xs flex items-center justify-center text-3xl">
                      🎂
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-ink">Celebration Pastry Cake</h3>
                      <span className="text-xs text-slate-700 font-semibold block">
                        {packageType !== 'custom' ? (
                          <strong className="text-emerald-800">500g Cake Included in {packageType.toUpperCase()} Package (₹0)</strong>
                        ) : (
                          'A-la-carte for Custom Package (From ₹499)'
                        )}
                      </span>
                    </div>
                  </div>

                  {packageType === 'custom' && (
                    <button
                      type="button"
                      onClick={() => setCustomHasCake(!customHasCake)}
                      className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95 ${
                        customHasCake
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/90 backdrop-blur-md border-2 border-amber-300 text-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      {customHasCake ? '✓ Cake Added (+₹499)' : '+ Add Cake (+₹499)'}
                    </button>
                  )}
                </div>

                {/* Flavor selector (always shown for Standard/Premium, or when customHasCake is true) */}
                {(packageType !== 'custom' || customHasCake) && (
                  <div className="pt-2 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                        Choose Cake Flavor:
                      </label>
                      <span className="text-[11px] font-bold text-slate-500">Freshly baked locally</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {cakeFlavors.map((cake) => {
                        const isSelected = selectedCakeFlavor === cake.name;
                        return (
                          <button
                            key={cake.name}
                            type="button"
                            onClick={() => setSelectedCakeFlavor(cake.name)}
                            className={`p-3.5 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 cursor-pointer relative flex flex-col justify-between group hover:-translate-y-1 ${
                              isSelected
                                ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5] via-white to-[#E6F3FB] shadow-[0_14px_36px_rgba(0,162,228,0.22)] ring-2 ring-[#00A2E4]/30 scale-[1.02]'
                                : 'border-amber-200/80 bg-white/75 hover:bg-white/95 shadow-xs hover:shadow-md hover:border-[#00A2E4]/60'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300/60 p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <GrandAddonIcon name={cake.iconKey} className="w-7 h-7" />
                              </div>
                              {isSelected && (
                                <span className="text-[10px] bg-[#00A2E4] text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="mt-2.5">
                              <div className="font-black text-xs text-ink leading-tight">{cake.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{cake.desc}</div>
                              <span className="inline-block mt-2 text-[9px] font-extrabold uppercase tracking-wider text-[#0B2238] bg-[#E6F3FB] border border-slate-200 px-2 py-0.5 rounded-md">
                                {cake.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Cake Size Toggle */}
                    <div className="pt-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                        Select Cake Weight / Size:
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setCakeWeight('500g')}
                          className={`p-3.5 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                            cakeWeight === '500g'
                              ? 'border-[#00A2E4] bg-white text-ink shadow-xs ring-2 ring-[#00A2E4]/20'
                              : 'border-amber-200/80 bg-white/70 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="font-extrabold text-xs">500g (Standard Celebration)</div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {packageType !== 'custom' ? 'Included in your package (₹0)' : 'Perfect for 2-4 guests (₹499)'}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCakeWeight('1kg')}
                          className={`p-3.5 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                            cakeWeight === '1kg'
                              ? 'border-[#00A2E4] bg-white text-ink shadow-xs ring-2 ring-[#00A2E4]/20'
                              : 'border-amber-200/80 bg-white/70 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="font-extrabold text-xs text-ink flex items-center justify-between">
                            <span>1.0 Kg (Grand Party Cake)</span>
                            <span className="text-[#f39a4b] font-black">+₹400</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Generous double size for larger groups
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Cake Name Message Input */}
                    <div className="pt-1">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                        Name / Message on Cake (Optional):
                      </label>
                      <input
                        type="text"
                        value={cakeMessage}
                        onChange={(e) => setCakeMessage(e.target.value)}
                        placeholder="e.g. Happy Birthday Sneha! / Happy 3rd Anniversary!"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A2E4]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* CELEBRATION ADD-ONS & EXTRAS (ALL ADD-ONS AVAILABLE)               */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                      Celebration Add-ons &amp; Enhancements
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">Add theatrical effects, fresh blooms, photography &amp; treats</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E6F3FB] text-[#0B2238]">
                    100% Guaranteed Setup
                  </span>
                </div>

                {/* IF CUSTOM PACKAGE: Full A-la-carte Addons */}
                {packageType === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Fog Entry Multi-pot */}
                    <div
                      style={{ display: addonActive(3) ? undefined : 'none' }}
                      className="p-4 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0">
                            🌫️
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 tracking-wide">Magical Dry-Ice Fog Entry</h4>
                            <p className="text-[11px] text-slate-600 font-medium">Dramatic dense dry-ice smoke effect billowing at your feet</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#00A2E4] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 shadow-2xs">
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
                            className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer backdrop-blur-md ${
                              customFogPots === tier.pots
                                ? 'border-[#00A2E4] bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white font-black shadow-md scale-[1.02]'
                                : 'border-slate-200/80 bg-white/80 text-slate-800 font-bold hover:border-[#00A2E4]/60 hover:bg-white text-xs'
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
                      style={{ display: addonActive(4) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customColdPyro
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          ✨
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Cold Pyro Sparkler Entry (2 Pots)</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Indoor-safe cold golden spark fountains during hero entry</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹799</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customColdPyro ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customColdPyro && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Rose Petal Table Decor */}
                    <button
                      type="button"
                      onClick={() => setCustomRosePetals(!customRosePetals)}
                      style={{ display: addonActive(9) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customRosePetals
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🌹
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Romantic Rose Petal &amp; Candle Decor</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Heart-shape setup on celebration table with fairy candles</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹250</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customRosePetals ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customRosePetals && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Bouquet */}
                    <button
                      type="button"
                      onClick={() => setCustomBouquet(!customBouquet)}
                      style={{ display: addonActive(7) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customBouquet
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          💐
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Fresh Dutch Red Rose Bouquet</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">15 hand-tied fragrant roses with greeting card</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹399</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customBouquet ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customBouquet && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Personalized LED Name */}
                    <button
                      type="button"
                      onClick={() => setCustomLedName(!customLedName)}
                      style={{ display: addonActive(5) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customLedName
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🅰️
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Personalized LED Name Letters</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">1-foot glowing LED letter display of your partner's name</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹250</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customLedName ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customLedName && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Bubble Machine Entry */}
                    <button
                      type="button"
                      onClick={() => setCustomBubbleEntry(!customBubbleEntry)}
                      style={{ display: addonActive(11) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customBubbleEntry
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🫧
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Grand Bubble Machine Walk-in</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Thousands of floating celebration bubbles welcoming your entry</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹199</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customBubbleEntry ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customBubbleEntry && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                                        {/* DSLR Photography */}
                    <div
                      style={{ display: addonActive(8) ? undefined : 'none' }}
                      className="p-4 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0">
                          📸
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 tracking-wide">DSLR Photography</h4>
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
                            className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer backdrop-blur-md ${
                              customPhotography === p.key
                                ? 'border-[#00A2E4] bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white font-black shadow-md text-xs scale-[1.02]'
                                : 'border-slate-200/80 bg-white/80 text-slate-800 font-bold hover:border-[#00A2E4]/60 hover:bg-white text-xs'
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
                      style={{ display: addonActive(8) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customIphoneReel
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          📱
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">iPhone Cinematic 4K Reel</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">1-minute trending 4K reel edited with your favorite music</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹500</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customIphoneReel ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customIphoneReel && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Teddy Mascot */}
                    <button
                      type="button"
                      onClick={() => setCustomTeddyMascot(!customTeddyMascot)}
                      style={{ display: addonActive(10) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        customTeddyMascot
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🧸
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Dancing Teddy Mascot Surprise</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">30 mins live dancing giant Teddy mascot surprise</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹500</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        customTeddyMascot ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {customTeddyMascot && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                  </div>
                )}

                {/* IF STANDARD OR PREMIUM: Full Selection of Add-ons */}
                {packageType !== 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Cold Pyro Sparkle */}
                    <button
                      type="button"
                      onClick={() => setPkgColdPyro(!pkgColdPyro)}
                      style={{ display: addonActive(4) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgColdPyro
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          ✨
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Cold Pyro Sparkler Entry (2 Pots)</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Indoor-safe cold golden spark fountains shooting 6ft</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹799</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgColdPyro ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgColdPyro && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Extra Fog Pot */}
                    <button
                      type="button"
                      onClick={() => setPkgExtraFogPot(!pkgExtraFogPot)}
                      style={{ display: addonActive(3) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgExtraFogPot
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🌫️
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Extra Fog Pot (Total 2 Pots)</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">1 pot included; add extra pot for ultra-dense billowing clouds</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹399</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgExtraFogPot ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgExtraFogPot && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Bouquet */}
                    <button
                      type="button"
                      onClick={() => setPkgBouquet(!pkgBouquet)}
                      style={{ display: addonActive(7) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgBouquet
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          💐
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Fresh Dutch Red Rose Bouquet</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">15 hand-tied fragrant roses with greeting card</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹399</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgBouquet ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgBouquet && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Rose Petals & Candles */}
                    <button
                      type="button"
                      onClick={() => setPkgRosePetals(!pkgRosePetals)}
                      style={{ display: addonActive(9) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgRosePetals
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🌹
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Rose Petal Table Decor with Candles</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Heart-shape setup on celebration table with fairy candles</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹250</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgRosePetals ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgRosePetals && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Bubble Machine Entry */}
                    <button
                      type="button"
                      onClick={() => setPkgBubbleEntry(!pkgBubbleEntry)}
                      style={{ display: addonActive(11) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgBubbleEntry
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🫧
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Grand Bubble Machine Walk-in</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Floating bubbles welcoming your entry through the doors</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹199</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgBubbleEntry ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgBubbleEntry && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                                        {/* DSLR Photography */}
                    <div
                      style={{ display: addonActive(8) ? undefined : 'none' }}
                      className="p-4 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0">
                          📸
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 tracking-wide">DSLR Photography</h4>
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
                            className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer backdrop-blur-md ${
                              pkgPhotography === p.key
                                ? 'border-[#00A2E4] bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white font-black shadow-md text-xs scale-[1.02]'
                                : 'border-slate-200/80 bg-white/80 text-slate-800 font-bold hover:border-[#00A2E4]/60 hover:bg-white text-xs'
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
                      style={{ display: addonActive(8) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgIphoneReel
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          📱
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">iPhone Cinematic 4K Reel</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">1-minute trending 4K reel edited with your song</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹500</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgIphoneReel ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgIphoneReel && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Teddy Mascot */}
                    <button
                      type="button"
                      onClick={() => setPkgTeddyMascot(!pkgTeddyMascot)}
                      style={{ display: addonActive(10) ? undefined : 'none' }}
                      className={`p-4 rounded-2xl backdrop-blur-xl border-2 text-left transition-all duration-300 flex items-start justify-between cursor-pointer group hover:-translate-y-0.5 ${
                        pkgTeddyMascot
                          ? 'border-[#00A2E4] bg-gradient-to-br from-[#F8F0E5]/90 via-white/90 to-[#E6F3FB]/90 shadow-[0_12px_32px_rgba(0,162,228,0.18)] ring-2 ring-[#00A2E4]/25'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white/95 shadow-xs hover:shadow-lg hover:border-[#00A2E4]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl backdrop-blur-md bg-white/90 border border-white/90 shadow-2xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🧸
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Dancing Teddy Mascot Surprise</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">30 mins live dancing giant Teddy mascot surprise</p>
                          <span className="text-xs font-black text-[#00A2E4] mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">+₹500</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        pkgTeddyMascot ? 'border-[#00A2E4] bg-[#00A2E4] text-white shadow-xs' : 'border-slate-300 bg-white/60'
                      }`}>
                        {pkgTeddyMascot && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                  </div>
                )}

                {/* Extra Duration Extension (0, +1 hr, or +2 hrs max allowed) */}
                <div className="pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00A2E4]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Extend Showtime Duration (Max 2 Extra Hours Allowed)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E6F3FB] text-[#00A2E4]">
                      Max Limit: 2 Extra Hours
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option 0: Standard Slot (Included) */}
                    <button
                      type="button"
                      onClick={() => setExtraHours(0)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        extraHours === 0
                          ? 'border-[#0B2238] bg-[#FFF8F5] shadow-xs ring-2 ring-[#0B2238]/20'
                          : 'border-slate-200 bg-white hover:border-[#00A2E4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">Standard Slot (Included)</span>
                          {extraHours === 0 && <span className="text-[10px] font-bold text-emerald-700">✓ Active</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Default celebration slot</p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 mt-2">Included (₹0)</span>
                    </button>

                    {/* Option 1: +1 Hour Extension */}
                    <button
                      type="button"
                      disabled={currentSlot?.can_add_extra_hour === false}
                      onClick={() => setExtraHours(1)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        currentSlot?.can_add_extra_hour === false
                          ? 'opacity-45 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : extraHours === 1
                          ? 'border-[#00A2E4] bg-[#FFF8F5] shadow-xs ring-2 ring-[#00A2E4]/30 cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-[#00A2E4] cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#0B2238]">+1 Hour Extra</span>
                          {extraHours === 1 && <span className="text-[10px] font-bold text-[#00A2E4]">✓ Selected</span>}
                          {currentSlot?.can_add_extra_hour === false && (
                            <span className="text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-1 rounded-xs">
                              Next Slot Booked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          {currentSlot?.can_add_extra_hour === false ? 'Cannot extend due to next confirmed booking' : 'Total 3 Hours duration'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#00A2E4] mt-2">+₹{extraHourRate}</span>
                    </button>

                    {/* Option 2: +2 Hours Extension (Max Limit Allowed) */}
                    <button
                      type="button"
                      onClick={() => setExtraHours(2)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        extraHours === 2
                          ? 'border-[#00A2E4] bg-[#FFF8F5] shadow-xs ring-2 ring-[#00A2E4]/30'
                          : 'border-slate-200 bg-white hover:border-[#00A2E4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#0B2238]">+2 Hours Extra</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                            Max Limit
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Total 4 Hours duration</p>
                      </div>
                      <span className="text-xs font-black text-[#00A2E4] mt-2">+₹{extraHourRate * 2}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
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
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white text-xs font-black hover:opacity-95 shadow-md flex items-center gap-2 active:scale-95"
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
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#0B2238] text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">4</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">Celebration &amp; Guest Details</h2>
                    <p className="text-xs text-slate-600 font-semibold">Customize your screen presentation and guest count</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Special Person's Name */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Special Person’s Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sneha / Arjun"
                    value={specialPersonName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecialPersonName(val);
                      if (!screenName || screenName.startsWith('Celebration for')) {
                        setScreenName(val ? `Celebration for ${val} ❤️` : '');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-stone-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00A2E4] focus:bg-white shadow-xs transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Name for welcome board, LED marquee &amp; greeting
                  </span>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Celebration Occasion <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={occasionId}
                    onChange={(e) => setOccasionId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-stone-200 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:border-[#00A2E4] focus:bg-white cursor-pointer shadow-xs transition-colors"
                  >
                    {occasions.map(o => (
                      <option key={o.id} value={o.id}>{o.icon} {o.name}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Total People Attending
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-stone-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A2E4] focus:bg-white shadow-xs transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-stone-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A2E4] focus:bg-white shadow-xs transition-colors"
                  />
                </div>

              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
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
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00A2E4] to-[#0072AE] text-white text-xs font-black hover:opacity-95 shadow-md flex items-center gap-2 active:scale-95"
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
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#0B2238] text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">5</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">Your Details (For WhatsApp Confirmation)</h2>
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
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="e.g. Karthik Sharma"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white shadow-xs transition-colors ${
                      nameError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-200 focus:border-[#00A2E4]'
                    }`}
                  />
                  {nameError && (
                    <p className="text-rose-600 text-[11px] font-extrabold mt-1 flex items-center gap-1">
                      <span>⚠ {nameError}</span>
                    </p>
                  )}
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
                    onChange={(e) => {
                      setCustomerPhone(e.target.value.replace(/\D/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="e.g. 9902923656"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white shadow-xs transition-colors ${
                      phoneError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-200 focus:border-[#00A2E4]'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-rose-600 text-[11px] font-extrabold mt-1 flex items-center gap-1">
                      <span>⚠ {phoneError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="e.g. karthik@example.com"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white shadow-xs transition-colors ${
                      emailError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-200 focus:border-[#00A2E4]'
                    }`}
                  />
                  {emailError && (
                    <p className="text-rose-600 text-[11px] font-extrabold mt-1 flex items-center gap-1">
                      <span>⚠ {emailError}</span>
                    </p>
                  )}
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-stone-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A2E4] focus:bg-white shadow-xs transition-colors"
                  />
                </div>

              </div>

              {/* Dedicated UPI Advance Scanner & Mobile Payment Card */}
              <UpiPaymentCard
                bookingRef={bookingDate ? `MB${bookingDate.replace(/-/g, '')}` : 'MB-CONFIRM'}
                advanceAmount={advanceAmount}
                customerName={customerName}
                utrValue={utrNumber}
                onUtrChange={(val) => setUtrNumber(val)}
              />

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
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 flex items-center gap-1.5"
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
        <div className="lg:col-span-4 sticky top-24 space-y-4 z-20">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-3">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-playfair text-lg font-black text-ink">Celebration Bill</h3>
              <span className="text-xs font-extrabold text-[#0B2238] px-2.5 py-1 rounded-full bg-[#E6F3FB] border border-[#00A2E4]/20">
                Live Pricing
              </span>
            </div>

            {/* Selected Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-stone-200 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Venue:</span>
                <span className="font-extrabold text-slate-950">{branchId === 2 ? 'BTM 2nd Stage' : 'Electronic City'}</span>
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
                <span className={`text-xs ${slotId ? 'font-black text-[#0B2238]' : 'font-bold text-amber-700'}`}>
                  {slotId ? currentSlotTime : 'Select a timing slot'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Package:</span>
                <span className="font-black text-[#0B2238] capitalize">{packageType} Package</span>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-1.5 text-xs text-slate-800 pt-1">
              <div className="flex justify-between items-start gap-2">
                <span className="min-w-0 break-words">{packageType === 'custom' ? 'Room Only' : `${packageType.toUpperCase()} Package`} ({baseCapacity} Guests)</span>
                <span className="font-bold text-slate-900 shrink-0 text-right whitespace-nowrap">₹{selectedBasePrice}</span>
              </div>

              {packageType !== 'custom' ? (
                <div className="flex justify-between items-start gap-2 text-emerald-800 font-bold">
                  <span className="min-w-0 break-words">🎂 500g Cake ({selectedCakeFlavor})</span>
                  <span className="shrink-0 text-right whitespace-nowrap">Included (₹0)</span>
                </div>
              ) : customHasCake ? (
                <div className="flex justify-between items-start gap-2">
                  <span className="min-w-0 break-words">🎂 500g Cake ({selectedCakeFlavor})</span>
                  <span className="font-bold text-slate-900 shrink-0 text-right whitespace-nowrap">₹499</span>
                </div>
              ) : null}

              {extraGuestsCount > 0 && (
                <div className="flex justify-between items-start gap-2">
                  <span className="min-w-0 break-words">Extra Guests ({extraGuestsCount} @ ₹{extraPersonRate})</span>
                  <span className="font-bold text-slate-900 shrink-0 text-right whitespace-nowrap">₹{extraGuestsCost}</span>
                </div>
              )}

              {extraHours > 0 && (
                <div className="flex justify-between items-start gap-2">
                  <span className="min-w-0 break-words">Extra {extraHours} Hour{extraHours > 1 ? 's' : ''} Extension ({2 + extraHours} Hrs Total)</span>
                  <span className="font-bold text-slate-900 shrink-0 text-right whitespace-nowrap">₹{extraHoursCost}</span>
                </div>
              )}

              {computedAddonsPayload
                .filter(a => !(packageType === 'custom' && a.addon_id === 1)) // cake already listed
                .map((a, i) => (
                  <div key={i} className="flex justify-between items-start gap-2 text-slate-700">
                    <span className="min-w-0 break-words">{a.name}</span>
                    <span className="font-bold text-slate-900 shrink-0 text-right whitespace-nowrap">₹{a.total}</span>
                  </div>
                ))}

              {discountAmount > 0 && (
                <div className="flex justify-between items-start gap-2 text-emerald-700 font-bold">
                  <span className="min-w-0 break-words">Coupon ({appliedCoupon?.code})</span>
                  <span className="shrink-0 text-right whitespace-nowrap">-₹{discountAmount}</span>
                </div>
              )}
            </div>

            {/* Coupon Box — hidden automatically when no coupon is active */}
            {activeCoupon && (
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-[#00A2E4]/20 text-xs font-bold text-slate-900 uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
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
            )}

            {/* Total Section */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center text-slate-900">
                <span className="text-sm font-bold text-slate-800">Grand Total:</span>
                <span className="font-sans text-2xl font-black text-[#00A2E4] tracking-tight tabular-nums inline-flex items-baseline gap-0.5">
                  <span className="text-xl font-bold">₹</span>
                  <span>{grandTotal}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800 pt-0.5">
                <span>Advance to Lock Slot:</span>
                <span className="text-sm font-black font-sans tabular-nums inline-flex items-baseline gap-0.5">
                  <span className="text-xs font-bold">₹</span>
                  <span>{advanceAmount}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block text-right font-medium">
                Balance <strong className="text-slate-900 font-black font-sans">₹{balanceAmount}</strong> payable upon arrival at venue
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
                className="w-full py-3.5 px-6 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#f39a4b] via-[#f5a75f] to-[#e6832e] hover:shadow-[0_8px_25px_rgba(243,154,75,0.35)] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#f39a4b] via-[#f5a75f] to-[#e6832e] hover:shadow-[0_8px_25px_rgba(243,154,75,0.35)] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                <span>{isSubmitting ? 'Reserving Screen...' : `Confirm & Lock Screen (₹${advanceAmount} Advance)`}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            )}

            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant automated WhatsApp confirmation to your phone</span>
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
