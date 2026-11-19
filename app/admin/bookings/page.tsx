'use client';

import React, { useState, useEffect } from 'react';
import { getTodayIST, getTomorrowIST } from '@/lib/time';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  RotateCcw, 
  CreditCard, 
  Eye, 
  Edit,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
  PhoneCall,
  Sparkles,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatBookingSlotTime } from '@/lib/slot-engine';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ totalPages: 1, total: 0 });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentAddAmount, setPaymentAddAmount] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Reschedule modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    booking_date: getTodayIST(),
    branch_id: 1,
    theatre_id: 1,
    slot_id: 1,
    slot_time: '',
    screen_name: '',
  });
  const [rescheduleSlots, setRescheduleSlots] = useState<Array<any>>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  // Manual phone / operational booking form state (Full 17 Fields)
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_phone: '',
    whatsapp_number: '',
    special_person_name: '',
    customer_email: '',
    occasion: 'Birthday Party',
    occasion_id: 2, // Birthday default
    branch_id: 1,
    theatre_id: 1,
    slot_id: 1,
    slot_time: '',
    booking_date: getTodayIST(),
    screen_name: '',
    package_type: 'standard', // 'standard' | 'custom' | 'premium'
    guests: 2,
    extra_persons: 0,
    extra_hours: 0,
    cake_flavor: 'Chocolate Truffle (500g)',
    addons: [] as string[],
    custom_item_name: '',
    custom_item_amount: 0,
    discount: 0,
    total: 899,
    advance_paid: 500,
    payment_type: 'UPI', // 'UPI' | 'Cash' | 'Card' | 'Net Banking'
    source: 'whatsapp', // 'whatsapp' | 'walkin' | 'phone_call' | 'instagram' | 'website'
    notes: ''
  });

  // Dynamic available slots for the manual modal
  const [manualSlots, setManualSlots] = useState<Array<any>>([]);
  const [loadingManualSlots, setLoadingManualSlots] = useState(false);

  // Auto-open modal if URL has ?action=new
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('action=new')) {
      setShowManualModal(true);
    }
  }, []);

  // Fetch current logged-in role & lock branch if staff
  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setCurrentUser(d.data);
          if (d.data.role === 'staff' && d.data.branch_id) {
            const staffBranch = String(d.data.branch_id);
            setBranchFilter(staffBranch);
            setManualForm(prev => ({ 
              ...prev, 
              branch_id: d.data.branch_id,
              theatre_id: d.data.branch_id === 2 ? 4 : 1
            }));
            setRescheduleForm(prev => ({ 
              ...prev, 
              branch_id: d.data.branch_id,
              theatre_id: d.data.branch_id === 2 ? 4 : 1
            }));
          }
        }
      })
      .catch(console.error);
  }, []);

  const isStaff = currentUser?.role === 'staff';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (branchFilter !== 'all') q.set('branch', branchFilter);
      if (statusFilter !== 'all') q.set('status', statusFilter);
      if (dateFilter) q.set('date', dateFilter);
      q.set('page', String(page));
      q.set('limit', '20');

      const res = await fetch(`/api/admin/bookings?${q.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
        setMeta(json.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, branchFilter, statusFilter, dateFilter, page]);

  // Dynamic slots loading for manual modal
  useEffect(() => {
    if (!showManualModal) return;
    async function loadSlots() {
      setLoadingManualSlots(true);
      try {
        const res = await fetch(`/api/availability?theatre=${manualForm.theatre_id}&date=${manualForm.booking_date}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setManualSlots(json.data);
          // auto-select first available slot if current is invalid
          const currentValid = json.data.find((s: any) => s.id === manualForm.slot_id && !s.is_booked);
          if (!currentValid) {
            const firstAvail = json.data.find((s: any) => !s.is_booked);
            if (firstAvail) {
              setManualForm(prev => ({ ...prev, slot_id: firstAvail.id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load slots for manual booking:', err);
      } finally {
        setLoadingManualSlots(false);
      }
    }
    loadSlots();
  }, [showManualModal, manualForm.theatre_id, manualForm.booking_date]);

  // Addons catalog for operational booking
  const ADDONS_CATALOG: Record<string, { label: string; price: number }> = {
    fog: { label: 'Dramatic Fog Entry', price: 499 },
    pyro: { label: 'Cold Pyro Sparklers (2 Shots)', price: 399 },
    marquee: { label: 'LED Marquee Name Letters', price: 299 },
    bouquet: { label: 'Fresh Red Rose Bouquet', price: 499 },
    photo: { label: 'Pro Photography & 4K Video', price: 999 },
  };

  const recomputeManualTotal = (draft: typeof manualForm) => {
    let base = 899;
    if (draft.theatre_id === 1 || draft.theatre_id === 4) base = 899;
    else if (draft.theatre_id === 2 || draft.theatre_id === 5) base = 1499;
    else if (draft.theatre_id === 3 || draft.theatre_id === 6) base = 1699;
    else if (draft.theatre_id === 7) base = 1599;

    const pkgAdd = draft.package_type === 'premium' ? 1000 : draft.package_type === 'custom' ? 500 : 0;
    const extraPersonsCost = Math.max(0, Number(draft.extra_persons || 0)) * 150;
    const hourlyRate = (draft.theatre_id === 1 || draft.theatre_id === 4) ? 400 : 750;
    const extraHoursCost = Math.max(0, Number(draft.extra_hours || 0)) * hourlyRate;
    
    let addonsTotal = 0;
    if (Array.isArray(draft.addons)) {
      draft.addons.forEach(key => {
        if (ADDONS_CATALOG[key]) addonsTotal += ADDONS_CATALOG[key].price;
      });
    }

    const customCost = Math.max(0, Number(draft.custom_item_amount || 0));
    const discountVal = Math.max(0, Number(draft.discount || 0));

    return Math.max(0, base + pkgAdd + extraPersonsCost + extraHoursCost + addonsTotal + customCost - discountVal);
  };

  const updateManualField = (field: string, value: any) => {
    setManualForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'special_person_name' && value && (!prev.screen_name || prev.screen_name.startsWith('Celebration for '))) {
        next.screen_name = `Celebration for ${value} ❤️`;
      }
      if (field === 'whatsapp_number' && !prev.customer_phone) {
        next.customer_phone = value;
      }
      if (['theatre_id', 'package_type', 'extra_persons', 'extra_hours', 'custom_item_amount', 'discount'].includes(field)) {
        next.total = recomputeManualTotal(next);
      }
      return next;
    });
  };

  const toggleManualAddon = (addonKey: string) => {
    setManualForm(prev => {
      const current = Array.isArray(prev.addons) ? prev.addons : [];
      const exists = current.includes(addonKey);
      const updated = exists ? current.filter(k => k !== addonKey) : [...current, addonKey];
      const next = { ...prev, addons: updated };
      next.total = recomputeManualTotal(next);
      return next;
    });
  };

  // Handle theatre presets
  const handleTheatreChange = (theatreId: number) => {
    let defaultGuests = 2;
    if (theatreId === 1 || theatreId === 4) defaultGuests = 2;
    else if (theatreId === 2 || theatreId === 5) defaultGuests = 6;
    else if (theatreId === 3 || theatreId === 6) defaultGuests = 12;
    else if (theatreId === 7) defaultGuests = 8;

    setManualForm(prev => {
      const next = {
        ...prev,
        theatre_id: theatreId,
        guests: defaultGuests,
      };
      next.total = recomputeManualTotal(next);
      return next;
    });
  };

  // Dynamic slots loading for reschedule modal
  useEffect(() => {
    if (!showRescheduleModal) return;
    async function loadRescheduleSlots() {
      setLoadingRescheduleSlots(true);
      try {
        const res = await fetch(`/api/availability?theatre=${rescheduleForm.theatre_id}&date=${rescheduleForm.booking_date}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRescheduleSlots(json.data);
          const currentValid = json.data.find((s: any) => s.id === rescheduleForm.slot_id && !s.is_booked);
          if (!currentValid) {
            const firstAvail = json.data.find((s: any) => !s.is_booked);
            if (firstAvail) {
              setRescheduleForm(prev => ({ 
                ...prev, 
                slot_id: firstAvail.id,
                slot_time: `${firstAvail.start_time} - ${firstAvail.end_time}` 
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load slots for reschedule:', err);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    }
    loadRescheduleSlots();
  }, [showRescheduleModal, rescheduleForm.theatre_id, rescheduleForm.booking_date]);

  const openRescheduleModal = (booking: any) => {
    setRescheduleBooking(booking);
    setRescheduleForm({
      booking_date: booking.booking_date || getTodayIST(),
      branch_id: booking.branch_id || 1,
      theatre_id: booking.theatre_id || (booking.branch_id === 2 ? 4 : 1),
      slot_id: booking.slot_id || 1,
      slot_time: booking.slot_time || '',
      screen_name: booking.screen_name || '',
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;
    
    const branchName = rescheduleForm.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage';
    let screenName = rescheduleForm.screen_name;
    if (!screenName) {
      if (rescheduleForm.theatre_id === 1) screenName = 'Couple Theater (2 guests)';
      else if (rescheduleForm.theatre_id === 2) screenName = 'Celebration Theater (6 guests)';
      else if (rescheduleForm.theatre_id === 3) screenName = 'Family Theater (12 guests)';
      else if (rescheduleForm.theatre_id === 4) screenName = 'Butterfly Blush (2 guests)';
      else if (rescheduleForm.theatre_id === 5) screenName = 'Lavender Mist (6 guests)';
      else if (rescheduleForm.theatre_id === 6) screenName = 'Scarlet Red (12 guests)';
      else if (rescheduleForm.theatre_id === 7) screenName = 'Shadow Suit (8 guests)';
      else screenName = 'Private Screen';
    }

    await handleAction(rescheduleBooking.id, 'reschedule', {
      ...rescheduleForm,
      branch_name: branchName,
      screen_name: screenName
    });

    setShowRescheduleModal(false);
    setRescheduleBooking(null);
  };

  // Actions
  const handleAction = async (id: number, action: string, payload: any = {}) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
        if (selectedBooking?.id === id) {
          setSelectedBooking(null);
        }
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (e) {
      alert('Error updating booking');
    }
  };

  // Generate WhatsApp confirmation text
  const generateWhatsAppMessage = (b: any) => {
    const branchName = b.branch_name || (b.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage');
    const branchAddress = b.branch_id === 1 
      ? '4th Floor, Srinivasam, Beside Sri Vishnu Grand, Electronic City, Bengaluru 560100'
      : '2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076';
    
    let statusText = 'CONFIRMED';
    if (b.status === 'cancelled') statusText = 'CANCELLED';
    else if (b.status === 'completed') statusText = 'COMPLETED';

    return (
      `🎬 *Movie Bash Private Theatre — Reservation Confirmed* 🍿\n\n` +
      `Dear *${b.customer_name}*,\n` +
      `Your private theatre reservation is *${statusText}*!\n\n` +
      `🎟️ *Booking Ref:* ${b.booking_ref}\n` +
      (b.special_person_name ? `🌟 *Celebrant / Special Person:* ${b.special_person_name}\n` : '') +
      (b.occasion || b.occasion_name ? `🎉 *Occasion:* ${b.occasion || b.occasion_name}\n` : '') +
      `📍 *Venue:* Movie Bash (${branchName})\n` +
      `🎭 *Theatre:* ${b.theatre_name || 'Private Screen'}\n` +
      `📦 *Package:* ${String(b.package_type || 'standard').toUpperCase()}\n` +
      (b.cake_flavor && b.cake_flavor !== 'None' ? `🎂 *Cake:* ${b.cake_flavor}\n` : '') +
      `📅 *Date:* ${b.booking_date}\n` +
      `⏰ *Showtime Slot:* ${b.slot_time || 'Scheduled Slot'}\n` +
      (b.extra_hours > 0 ? `⏳ *Extended Duration:* +${b.extra_hours} Hour Extra Showtime (${2 + Number(b.extra_hours)} Hours Total)\n` : `⏳ *Duration:* 2 Hours Standard Showtime\n`) +
      `👥 *Guests:* ${b.guests} ${b.extra_persons > 0 ? `(+${b.extra_persons} extra)` : ''}\n` +
      (b.screen_name ? `✨ *LED Screen Title:* "${b.screen_name}"\n` : '') +
      (b.custom_item_name ? `🎁 *Custom Request:* ${b.custom_item_name} (+₹${b.custom_item_amount})\n` : '') +
      (b.discount > 0 ? `🏷️ *Discount Applied:* -₹${b.discount}\n` : '') +
      `💰 *Total Amount:* ₹${b.total}\n` +
      `✅ *Advance Paid:* ₹${b.advance_paid || 0}\n` +
      `💵 *Balance Due at Venue:* ₹${b.balance || 0}\n` +
      `💳 *Payment Type:* ${b.payment_type || 'UPI'}\n` +
      `📍 *Location:* ${branchAddress}\n` +
      `🗺️ *Google Maps:* https://maps.google.com/?q=Movie+Bash+${encodeURIComponent(branchName)}\n\n` +
      `🍿 *Amenities Included:* 4K Laser Projection, Dolby Surround, Luxury Recliners, Full Privacy & Soundproofing, OTT / Music streaming setup.\n\n` +
      `For any special requests, call or WhatsApp our desk at *+91 99029 23656*.\n\n` +
      `We look forward to hosting your grand celebration! 🎉`
    );
  };

  // Send personalized WhatsApp confirmation to customer
  const sendCustomerWhatsApp = (b: any) => {
    const phone = String(b.customer_phone).replace(/\D/g, '');
    const msg = encodeURIComponent(generateWhatsAppMessage(b));
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  };

  const handleCreateManualBooking = async (e: React.FormEvent, dispatchWhatsApp: boolean) => {
    e.preventDefault();
    const finalName = manualForm.customer_name.trim() || manualForm.special_person_name.trim();
    if (!finalName) {
      alert('Please enter the Special Person’s Name or Customer Name.');
      return;
    }

    const cleanPhone = (manualForm.whatsapp_number || manualForm.customer_phone).replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert('Please enter a valid 10-digit Indian WhatsApp / mobile number (e.g. 9876543210 starting with 6, 7, 8, or 9).');
      return;
    }

    const payload = {
      ...manualForm,
      customer_name: manualForm.customer_name.trim() || finalName,
      customer_phone: cleanPhone,
      whatsapp_number: cleanPhone,
      screen_name: manualForm.screen_name || (manualForm.special_person_name ? `Celebration for ${manualForm.special_person_name} ❤️` : `Celebration for ${finalName}`),
      balance: Math.max(0, manualForm.total - manualForm.advance_paid)
    };

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowManualModal(false);
        fetchBookings();

        if (dispatchWhatsApp) {
          sendCustomerWhatsApp(data.data);
        }

        // Open success confirmation popup
        setBookingSuccessData(data.data);
      } else {
        alert(data.error || 'Failed to create booking');
      }
    } catch (err) {
      alert('Error creating booking');
    }
  };

  const copyConfirmationText = (b: any) => {
    const text = generateWhatsAppMessage(b);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#237eea]">Reservation Desk</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink">
            All Bookings ({meta.total})
          </h1>
          <p className="text-xs text-ink/70 mt-0.5">
            Manage web bookings, handle customer phone calls, dispatch WhatsApp confirmations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {!isStaff && (
            <div className="flex items-center gap-2">
              <a
                href={`/api/admin/bookings/export?format=xlsx&${dateFilter ? `date=${dateFilter}&` : ''}${branchFilter !== 'all' ? `branch=${branchFilter}&` : ''}`}
                download
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Download formatted Excel (.xlsx) spreadsheet with colors, alignment & formulas"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export Excel (.xlsx)</span>
              </a>

              <a
                href={`/api/admin/bookings/export?format=csv&${dateFilter ? `date=${dateFilter}&` : ''}${branchFilter !== 'all' ? `branch=${branchFilter}&` : ''}`}
                download
                className="px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download CSV file (with phone formatting)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </a>
            </div>
          )}

          <button
            onClick={() => {
              setManualForm(prev => ({ 
                ...prev, 
                source: 'phone_call',
                branch_id: isStaff && currentUser?.branch_id ? currentUser.branch_id : prev.branch_id,
                theatre_id: isStaff && currentUser?.branch_id === 2 ? 4 : (isStaff ? 1 : prev.theatre_id)
              }));
              setShowManualModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#00A2E4] hover:bg-[#0072AE] shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref (e.g. MBEC202601), customer name, or phone..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#fffdf9] border border-sky-100 text-xs text-ink focus:outline-none focus:border-royal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#fffdf9] border border-sky-100 text-xs font-bold text-ink shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#237eea] shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-extrabold text-ink focus:outline-none cursor-pointer"
              title="Select specific date to filter"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter('');
                  setPage(1);
                }}
                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center text-[10px] ml-1 cursor-pointer font-bold"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {isStaff ? (
            <div className="flex-1 md:flex-initial px-3.5 py-2 rounded-2xl bg-[#fff0ea] border border-[#ef4a23]/30 text-xs font-black text-[#ef4a23] flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ef4a23]" />
              <span>{currentUser?.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'} (Assigned)</span>
            </div>
          ) : (
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-[#fffdf9] border border-sky-100 text-xs font-bold text-ink focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="1">Electronic City</option>
              <option value="2">BTM 2nd Stage</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-[#fffdf9] border border-sky-100 text-xs font-bold text-ink focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Quick Status Tabs & Date Quick Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Bookings', value: 'all' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-[#155fbd] text-white shadow-sm'
                  : 'bg-white border border-sky-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">Date:</span>
          <button
            type="button"
            onClick={() => {
              setDateFilter('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !dateFilter
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-sky-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Dates
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilter(getTodayIST());
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              dateFilter === getTodayIST()
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-sky-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilter(getTomorrowIST());
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              dateFilter === getTomorrowIST()
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-sky-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tomorrow
          </button>
          {dateFilter && dateFilter !== getTodayIST() && dateFilter !== getTomorrowIST() && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
              <span>📅 {dateFilter}</span>
              <button
                type="button"
                onClick={() => {
                  setDateFilter('');
                  setPage(1);
                }}
                className="w-3.5 h-3.5 rounded-full bg-emerald-200 hover:bg-rose-100 hover:text-rose-600 text-emerald-900 flex items-center justify-center text-[9px] font-black cursor-pointer"
                title="Clear date"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Bookings Table / Cards on mobile */}
      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-ink">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink/60">No bookings found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto lg:overflow-x-hidden">
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  <th className="py-2.5 px-3 border border-slate-300 w-[22%]">Ref &amp; Customer</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-[17%]">Venue &amp; Theatre</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-[16%]">Date &amp; Slot</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-[16%]">Pricing &amp; Balance</th>
                  <th className="py-2.5 px-2 border border-slate-300 text-center w-[7%]">Source</th>
                  <th className="py-2.5 px-2 border border-slate-300 text-center w-[8%]">Status</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right w-[14%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="even:bg-slate-50/70 hover:bg-sky-50/70 transition-colors">
                    
                    {/* Ref & Customer */}
                    <td className="py-2.5 px-3 border border-slate-300 align-middle">
                      <strong className="block text-slate-900 font-extrabold text-[12.5px] truncate">{b.customer_name}</strong>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[#155fbd] font-bold text-[10.5px] bg-sky-50 px-1 py-0.5 rounded border border-sky-300 shrink-0">
                          {b.booking_ref}
                        </span>
                        <a href={`tel:${b.customer_phone}`} className="hover:underline flex items-center gap-1 text-[11px] font-semibold text-slate-700 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{b.customer_phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Venue & Theatre */}
                    <td className="py-2.5 px-3 border border-slate-300 align-middle">
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                        <span className="text-sm shrink-0">{b.theatre_emoji || '🎬'}</span>
                        <span className="truncate">{b.theatre_name || 'Screen'}</span>
                      </div>
                      <span className="text-[10.5px] font-medium text-slate-500 block mt-0.5 truncate">{b.branch_name}</span>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-2.5 px-3 border border-slate-300 align-middle">
                      <strong className="block text-slate-900 text-xs font-black">{b.booking_date}</strong>
                      <div className="text-[10.5px] text-[#155fbd] font-bold mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="truncate">{b.slot_time}</span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-2.5 px-3 border border-slate-300 align-middle">
                      <strong className="block text-slate-900 font-black text-xs">₹{b.total}</strong>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1">
                        <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 whitespace-nowrap">Adv: ₹{b.advance_paid || 0}</span>
                        {b.balance > 0 ? (
                          <span className="text-amber-900 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 whitespace-nowrap">Due: ₹{b.balance}</span>
                        ) : (
                          <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">Paid</span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-2 border border-slate-300 align-middle text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase border whitespace-nowrap ${
                        b.source === 'phone' 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : b.source === 'walk_in'
                          ? 'bg-purple-50 text-purple-900 border-purple-300'
                          : 'bg-sky-50 text-sky-900 border-sky-300'
                      }`}>
                        {b.source === 'phone' ? '📞 Phone' : b.source === 'walk_in' ? '🚶 Walk-in' : '🌐 Web'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2 border border-slate-300 align-middle text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border whitespace-nowrap ${
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        b.status === 'completed' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                        b.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                        'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 border border-slate-300 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* 1-CLICK WHATSAPP BUTTON */}
                        <button
                          onClick={() => sendCustomerWhatsApp(b)}
                          className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Send reservation confirmation to customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Reschedule Slot */}
                        <button
                          onClick={() => openRescheduleModal(b)}
                          className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                          title="Reschedule Slot"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* View / Manage Details */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1 rounded-lg bg-[#f0f7ff] hover:bg-[#d9ebff]/50 text-[#155fbd] border border-sky-200 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel Booking Quick Action */}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              const reason = prompt(`Cancel reservation #${b.booking_ref} for ${b.customer_name}?\nEnter cancellation reason:`, 'Cancelled by guest request');
                              if (reason) {
                                handleAction(b.id, 'cancel', { cancelled_reason: reason });
                              }
                            }}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Soft Delete (Admin Only) */}
                        {!isStaff && (
                          <button
                            onClick={() => {
                              if (confirm(`Move booking #${b.booking_ref} to Trash?`)) {
                                handleAction(b.id, 'soft_delete');
                              }
                            }}
                            className="p-1 rounded-lg bg-slate-50 hover:bg-rose-100 text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer"
                            title="Delete Booking (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border border-sky-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#237eea] block">Reservation Details</span>
                <h3 className="font-playfair text-xl font-bold text-ink">
                  {selectedBooking.customer_name} ({selectedBooking.booking_ref})
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#fffdf9] border border-sky-100">
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <a href={`tel:${selectedBooking.customer_phone}`} className="font-bold text-[#237eea] hover:underline">
                    +91 {selectedBooking.customer_phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-bold uppercase text-emerald-700">{selectedBooking.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Theatre &amp; Branch</span>
                  <span className="font-bold text-ink">{selectedBooking.theatre_name} &bull; {selectedBooking.branch_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date &amp; Slot</span>
                  <span className="font-bold text-ink">{selectedBooking.booking_date} ({selectedBooking.slot_time})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Amount</span>
                  <span className="font-bold text-base text-slate-900">₹{selectedBooking.total}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Advance / Balance</span>
                  <span className="font-bold text-emerald-700">₹{selectedBooking.advance_paid || 0}</span> / <span className="font-bold text-amber-700">₹{selectedBooking.balance || 0}</span>
                </div>
              </div>

              {/* WHATSAPP DISPATCH */}
              <button
                type="button"
                onClick={() => sendCustomerWhatsApp(selectedBooking)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Dispatch Customer WhatsApp Message</span>
              </button>

              {/* Status Action Buttons */}
              <div className="p-3 rounded-2xl bg-[#fffdf9] border border-sky-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Change Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(selectedBooking.id, 'update_status', { status: 'confirmed' })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedBooking.id, 'update_status', { status: 'completed' })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-royal-100 text-[#155fbd] hover:bg-royal-200 transition-colors"
                  >
                    ★ Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Enter cancellation reason:') || 'Client cancelled';
                      const refund = prompt('Enter refund amount (if any):', '0') || '0';
                      handleAction(selectedBooking.id, 'cancel', { cancelled_reason: reason, refund_amount: refund });
                    }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>

              {/* RESCHEDULE SLOT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  openRescheduleModal(selectedBooking);
                  setSelectedBooking(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-[#141110] bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Reschedule Date / Time Slot</span>
              </button>

              {selectedBooking.screen_name && (
                <div className="p-3 rounded-xl bg-[#f0f7ff]">
                  <span className="text-[10px] text-ink/60 uppercase font-bold block">Screen Title Display</span>
                  <span className="font-semibold text-ink">&ldquo;{selectedBooking.screen_name}&rdquo;</span>
                </div>
              )}

              {/* Add Payment Field */}
              {selectedBooking.balance > 0 && (
                <div className="pt-3 border-t border-sky-100">
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Collect Payment (Remaining Balance: ₹{selectedBooking.balance})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paymentAddAmount}
                      onChange={(e) => setPaymentAddAmount(e.target.value)}
                      placeholder={`e.g. ${selectedBooking.balance}`}
                      className="px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 text-xs font-bold"
                    />
                    <button
                      onClick={() => {
                        if (paymentAddAmount) {
                          handleAction(selectedBooking.id, 'add_payment', { payment_add: paymentAddAmount });
                          setPaymentAddAmount('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-sky-100">
              <button
                onClick={() => {
                  const reason = prompt('Enter cancellation reason:') || 'Client cancelled';
                  const refund = prompt('Enter refund amount (if any):', '0') || '0';
                  handleAction(selectedBooking.id, 'cancel', { cancelled_reason: reason, refund_amount: refund });
                }}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#237eea] text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL (FULL 17 OPERATIONAL FIELDS) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2238]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-5 sm:p-7 space-y-4 shadow-elevated border border-[#00A2E4]/20 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-[#00A2E4]/10 text-[#00A2E4] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#00A2E4]" />
                </span>
                <div>
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#0B2238]">
                    Book Showtime
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Create private theatre reservation &amp; dispatch customer WhatsApp voucher
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateManualBooking(e, true)} className="space-y-4 text-xs">
              
              {/* SECTION 1: Celebrant & Contact (Fields 1, 2, + Contact Name) */}
              <div className="p-3.5 rounded-2xl bg-[#F6FAFD] border border-sky-100/80 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0072AE] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 1. Celebrant &amp; Contact Details
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0B2238] mb-1">
                      Special person’s Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sneha / Arjun"
                      value={manualForm.special_person_name}
                      onChange={(e) => updateManualField('special_person_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B2238] mb-1">
                      Whatsapp number (10 digits) *
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2 rounded-l-xl bg-slate-200 border border-r-0 border-sky-200 font-bold text-slate-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={manualForm.whatsapp_number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          updateManualField('whatsapp_number', val);
                        }}
                        className="w-full px-3 py-2 rounded-r-xl bg-white border border-sky-200 font-black text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Customer / Booked By (Name)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Babu"
                      value={manualForm.customer_name}
                      onChange={(e) => updateManualField('customer_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-semibold text-slate-800 focus:border-[#00A2E4] focus:outline-none"
                    />
                  </div>

                  {/* FIELD 3: Occasion */}
                  <div>
                    <label className="block font-bold text-[#0B2238] mb-1">
                      Occasion *
                    </label>
                    <select
                      value={manualForm.occasion}
                      onChange={(e) => {
                        const occ = e.target.value;
                        let occId = 1;
                        if (occ.includes('Birthday')) occId = 2;
                        else if (occ.includes('Proposal') || occ.includes('Date')) occId = 1;
                        else if (occ.includes('Anniversary')) occId = 3;
                        else if (occ.includes('Bride')) occId = 4;
                        else if (occ.includes('Family')) occId = 5;
                        updateManualField('occasion', occ);
                        updateManualField('occasion_id', occId);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    >
                      <option value="Birthday Party">🎂 Birthday Party</option>
                      <option value="Romantic Proposal / Date">💍 Romantic Proposal / Date</option>
                      <option value="Anniversary Celebration">💖 Anniversary Celebration</option>
                      <option value="Bride-to-Be / Bachelorette">👰 Bride-to-Be / Bachelorette</option>
                      <option value="Groom-to-Be">🤵 Groom-to-Be</option>
                      <option value="Family & Friends Movie Night">🍿 Family &amp; Friends Movie Night</option>
                      <option value="Surprise Celebration">✨ Surprise Celebration</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Branch & Theatre (Fields 4, 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">Branch *</label>
                  <select
                    value={manualForm.branch_id}
                    onChange={(e) => {
                      const newBranch = Number(e.target.value);
                      const defaultTheatre = newBranch === 1 ? 1 : 4;
                      updateManualField('branch_id', newBranch);
                      handleTheatreChange(defaultTheatre);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAFD] border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                  >
                    <option value={1}>Electronic City (3 Screens)</option>
                    <option value={2}>BTM 2nd Stage (4 Screens)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">Private Theatre *</label>
                  <select
                    value={manualForm.theatre_id}
                    onChange={(e) => handleTheatreChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAFD] border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                  >
                    {manualForm.branch_id === 1 ? (
                      <>
                        <option value={1}>🎬 Couple Theater (₹899 • 2 Guests)</option>
                        <option value={2}>🎉 Celebration Theater (₹1499 • 6 Guests)</option>
                        <option value={3}>👨‍👩‍👧‍👦 Family Theater (₹1699 • 12-20 Guests)</option>
                      </>
                    ) : (
                      <>
                        <option value={4}>🦋 Butterfly Blush (₹899 • 2 Guests)</option>
                        <option value={5}>🪻 Lavender Mist (₹1499 • 6 Guests)</option>
                        <option value={6}>🌹 Scarlet Red (₹1699 • 12 Guests)</option>
                        <option value={7}>🖤 Shadow Suit (₹1599 • 8 Guests)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* SECTION 3: Timings & Slot Selection (Field 6) */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-[#0B2238] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00A2E4]" />
                    <span>Timings / Showtime Slot *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.booking_date}
                    onChange={(e) => updateManualField('booking_date', e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#F6FAFD] border border-sky-200 font-bold text-[#0B2238] text-xs focus:outline-none"
                  />
                </div>

                {loadingManualSlots ? (
                  <div className="p-3 text-center text-slate-500 animate-pulse bg-slate-50 rounded-xl">
                    Checking slot availability...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                    {manualSlots.map((s) => {
                      const isSelected = manualForm.slot_id === s.id;
                      const isBooked = s.is_booked;
                      let slotTime = s.time || `${s.start_time} - ${s.end_time}`;
                      if (manualForm.extra_hours > 0) {
                        slotTime = formatBookingSlotTime(s.dynamic_start_time || s.start_time, s.dynamic_end_time || s.end_time, manualForm.extra_hours);
                      }
                      return (
                        <button
                          type="button"
                          key={s.id}
                          disabled={isBooked}
                          onClick={() => {
                            updateManualField('slot_id', s.id);
                            updateManualField('slot_time', slotTime);
                          }}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#00A2E4] bg-[#00A2E4] text-white font-black shadow-xs'
                              : isBooked
                              ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed line-through'
                              : 'border-slate-200 bg-white hover:border-[#00A2E4] text-slate-800 font-bold'
                          }`}
                        >
                          <span className="block text-xs">{slotTime}</span>
                          <span className="block text-[10px] mt-0.5">
                            {isSelected ? '✓ Selected' : isBooked ? 'Booked' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Extra Hours Extension */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    Extend Duration:
                  </span>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((extra) => {
                      const isSelected = manualForm.extra_hours === extra;
                      const hourlyRate = (manualForm.theatre_id === 1 || manualForm.theatre_id === 4) ? 400 : 750;
                      return (
                        <button
                          key={extra}
                          type="button"
                          onClick={() => updateManualField('extra_hours', extra)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#0B2238] text-white shadow-xs' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {extra === 0 ? 'Standard 2h' : `+${extra}h (+₹${extra * hourlyRate})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Package or Custom (Field 7) & Extra Persons (Field 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Package or Custom *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'standard', label: 'Standard', sub: 'Base setup' },
                      { key: 'custom', label: 'Custom', sub: '+₹500 theme' },
                      { key: 'premium', label: 'VIP Suite', sub: '+₹1,000 all-in' },
                    ].map((pkg) => {
                      const isSel = manualForm.package_type === pkg.key;
                      return (
                        <button
                          key={pkg.key}
                          type="button"
                          onClick={() => updateManualField('package_type', pkg.key)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isSel 
                              ? 'border-[#00A2E4] bg-[#00A2E4]/10 text-[#0072AE] font-black' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-xs font-bold">{pkg.label}</span>
                          <span className="block text-[9px] text-slate-500">{pkg.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Extra persons (+₹150/guest)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={manualForm.extra_persons}
                      onChange={(e) => updateManualField('extra_persons', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                      +₹{manualForm.extra_persons * 150}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Cake Flavour (Field 9) & LED Screen Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Cake flavour *
                  </label>
                  <select
                    value={manualForm.cake_flavor}
                    onChange={(e) => updateManualField('cake_flavor', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                  >
                    <option value="Chocolate Truffle (500g)">🍫 Chocolate Truffle (500g)</option>
                    <option value="Dutch Dark Chocolate (500g)">🍫 Dutch Dark Chocolate (500g)</option>
                    <option value="Red Velvet (500g)">❤️ Red Velvet (500g)</option>
                    <option value="Black Forest (500g)">🍒 Black Forest (500g)</option>
                    <option value="Butterscotch (500g)">🍯 Butterscotch (500g)</option>
                    <option value="Fresh Pineapple (500g)">🍍 Fresh Pineapple (500g)</option>
                    <option value="None">🚫 None (Bringing Own Cake / ₹0)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Screen Title Display (LED Screen)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Happy 25th Birthday Sneha ❤️"
                    value={manualForm.screen_name}
                    onChange={(e) => updateManualField('screen_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-medium text-slate-800 focus:border-[#00A2E4] focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 6: Addons (Field 10) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#F6FAFD] border border-sky-100">
                <span className="font-bold text-[#0B2238] block text-[11px]">
                  Celebration Add-ons (Tap to select)
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ADDONS_CATALOG).map(([key, item]) => {
                    const isSelected = manualForm.addons.includes(key);
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => toggleManualAddon(key)}
                        className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#00A2E4] bg-[#00A2E4] text-white font-bold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{item.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                          ₹{item.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: Extra custom field (Field 11: Name & Amount) & Discount (Field 12) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FFFDF9] border border-amber-200/70">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Extra custom field (Item Name)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Balloon Arch / Flower Crown / Gift Hamper"
                    value={manualForm.custom_item_name}
                    onChange={(e) => updateManualField('custom_item_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-slate-800 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Custom Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={manualForm.custom_item_amount || ''}
                    onChange={(e) => updateManualField('custom_item_amount', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-black text-[#0B2238] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 8: Discount, Payment Type (Field 16) & Booking Source (Field 17) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={manualForm.discount || ''}
                    onChange={(e) => updateManualField('discount', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-black text-rose-600 focus:border-[#00A2E4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Payment type *
                  </label>
                  <select
                    value={manualForm.payment_type}
                    onChange={(e) => updateManualField('payment_type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                  >
                    <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="Card">💳 Credit / Debit Card</option>
                    <option value="Net Banking">🏦 Net Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B2238] mb-1">
                    Booking Source *
                  </label>
                  <select
                    value={manualForm.source}
                    onChange={(e) => updateManualField('source', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-bold text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                  >
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="phone_call">📞 Phone Call</option>
                    <option value="walkin">🚶 Walk-in</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="website">🌐 Website</option>
                  </select>
                </div>
              </div>

              {/* SECTION 9: Financial Calculation Card (Fields 13, 14, 15) */}
              <div className="p-4 rounded-2xl bg-[#0B2238] text-white space-y-3 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Total amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={manualForm.total}
                      onChange={(e) => updateManualField('total', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 font-black text-white text-base focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Advance (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={manualForm.advance_paid}
                      onChange={(e) => updateManualField('advance_paid', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 font-black text-emerald-300 text-base focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Balance Due (₹)
                    </label>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 font-black text-amber-300 text-base flex items-center">
                      ₹{Math.max(0, manualForm.total - manualForm.advance_paid)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-white/10">
                  <span className="text-white/60 font-medium">Quick Advance:</span>
                  {[500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => updateManualField('advance_paid', amt)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateManualField('advance_paid', manualForm.total)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
                  >
                    Full (₹{manualForm.total})
                  </button>
                </div>
              </div>

              {/* Notes / Special Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Special Requests / Internal Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Preferred red heart backdrop, playing favorite Spotify playlist"
                  value={manualForm.notes}
                  onChange={(e) => updateManualField('notes', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAFD] border border-sky-100 font-medium text-slate-800"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateManualBooking(e, false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Save Only
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book &amp; Dispatch WhatsApp</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* POST-BOOKING SUCCESS & WHATSAPP MODAL */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border-2 border-emerald-500 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                Booking Successfully Confirmed
              </span>
              <h3 className="font-playfair text-2xl font-black text-slate-900 mt-1">
                Ref #{bookingSuccessData.booking_ref}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-1.5">
              {bookingSuccessData.special_person_name && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Celebrant:</span>
                  <strong className="text-emerald-900 font-bold">{bookingSuccessData.special_person_name}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Guest Name:</span>
                <strong className="text-slate-900">{bookingSuccessData.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">WhatsApp / Phone:</span>
                <strong className="text-emerald-800 font-mono">+91 {bookingSuccessData.whatsapp_number || bookingSuccessData.customer_phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Screen &amp; Slot:</span>
                <strong className="text-slate-900">{bookingSuccessData.theatre_name} &bull; {bookingSuccessData.slot_time}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Advance Collected:</span>
                <strong className="text-emerald-700">₹{bookingSuccessData.advance_paid} ({bookingSuccessData.payment_type || 'UPI'})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Remaining Balance:</span>
                <strong className="text-amber-700">₹{bookingSuccessData.balance}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              WhatsApp Web / App was opened for the customer. If you need to re-send or copy the confirmation voucher, use the options below:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => sendCustomerWhatsApp(bookingSuccessData)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Re-send WhatsApp Confirmation</span>
              </button>

              <button
                type="button"
                onClick={() => copyConfirmationText(bookingSuccessData)}
                className="w-full py-2.5 rounded-2xl bg-[#f0f7ff] hover:bg-[#d9ebff]/50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedText ? '✓ Copied to Clipboard!' : 'Copy Confirmation Message'}</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close &amp; Back to Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE SLOT MODAL */}
      {showRescheduleModal && rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-orange-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Reschedule Booking</h3>
                  <p className="text-xs text-slate-500 font-mono">Ref: #{rescheduleBooking.booking_ref} &bull; {rescheduleBooking.customer_name}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleBooking(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 pt-4">
              {/* Current Slot Info */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Current Reservation:</span>
                <p className="text-slate-700">
                  📅 <strong>{rescheduleBooking.booking_date}</strong> &bull; ⏰ <strong>{rescheduleBooking.slot_time || 'Standard Slot'}</strong>
                </p>
                <p className="text-slate-600">
                  📍 {rescheduleBooking.branch_name || (rescheduleBooking.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage')} &bull; 🎭 {rescheduleBooking.theatre_name || rescheduleBooking.screen_name || 'Standard Screen'}
                </p>
              </div>

              {/* Select Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Branch</label>
                <select
                  value={rescheduleForm.branch_id}
                  onChange={(e) => {
                    const newBranchId = Number(e.target.value);
                    const defaultTheatre = newBranchId === 1 ? 1 : 4;
                    setRescheduleForm(prev => ({
                      ...prev,
                      branch_id: newBranchId,
                      theatre_id: defaultTheatre
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#ef4a23]"
                >
                  <option value={1}>Electronic City Branch</option>
                  <option value={2}>BTM 2nd Stage Branch</option>
                </select>
              </div>

              {/* Select Theatre / Suite */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Theatre / Suite</label>
                <select
                  value={rescheduleForm.theatre_id}
                  onChange={(e) => {
                    const tId = Number(e.target.value);
                    setRescheduleForm(prev => ({ ...prev, theatre_id: tId }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#ef4a23]"
                >
                  {rescheduleForm.branch_id === 1 ? (
                    <>
                      <option value={1}>🎬 Couple Theater (Screen 1 &bull; 2 Guests)</option>
                      <option value={2}>🎉 Celebration Theater (Screen 2 &bull; 6 Guests)</option>
                      <option value={3}>👨‍👩‍👧‍👦 Family Theater (Screen 3 &bull; 12 Guests)</option>
                    </>
                  ) : (
                    <>
                      <option value={4}>🦋 Butterfly Blush (Screen 1 &bull; 2 Guests)</option>
                      <option value={5}>🪻 Lavender Mist (Screen 2 &bull; 6 Guests)</option>
                      <option value={6}>🌹 Scarlet Red (Screen 3 &bull; 12 Guests)</option>
                      <option value={7}>🖤 Shadow Suit (Screen 4 &bull; 8 Guests)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Select New Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.booking_date}
                  onChange={(e) => setRescheduleForm(prev => ({ ...prev, booking_date: e.target.value }))}
                  min={getTodayIST()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#ef4a23]"
                  required
                />
              </div>

              {/* Live Slot Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Available Time Slot {loadingRescheduleSlots && '(Checking slots...)'}
                </label>
                {loadingRescheduleSlots ? (
                  <div className="py-4 text-center text-xs text-slate-500 animate-pulse">
                    Checking slot availability...
                  </div>
                ) : rescheduleSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {rescheduleSlots.map((slot) => {
                      const isSelected = rescheduleForm.slot_id === slot.id;
                      const isBooked = slot.is_booked;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            const extraHours = Number(rescheduleBooking?.extra_hours || 0);
                            const formattedTime = formatBookingSlotTime(slot.dynamic_start_time || slot.start_time, slot.dynamic_end_time || slot.end_time, extraHours);
                            setRescheduleForm(prev => ({
                              ...prev,
                              slot_id: slot.id,
                              slot_time: formattedTime
                            }));
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                            isBooked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#141110] text-[#ffd46e] border-[#141110] shadow-sm font-bold scale-[1.02]'
                              : 'bg-white hover:bg-orange-50/50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="font-mono font-bold">{slot.start_time} - {slot.end_time}</span>
                          <span className="text-[10px] mt-1 font-medium">
                            {isBooked ? '❌ Booked' : isSelected ? '✓ Selected Slot' : '🟢 Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                    No slot data found for this date. Defaulting to standard time slots.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleBooking(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#ef4a23] hover:bg-[#ff5d38] text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
