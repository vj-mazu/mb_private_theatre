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

  // Manual phone booking form state
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    branch_id: 1,
    theatre_id: 1,
    slot_id: 1,
    booking_date: getTodayIST(),
    screen_name: '',
    occasion_id: 2, // Birthday default
    guests: 2,
    extra_hours: 0,
    total: 899,
    advance_paid: 500,
    source: 'phone',
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

  // Handle theatre presets
  const handleTheatreChange = (theatreId: number) => {
    let basePrice = 899;
    let defaultGuests = 2;
    if (theatreId === 1 || theatreId === 4) { basePrice = 899; defaultGuests = 2; }
    else if (theatreId === 2 || theatreId === 5) { basePrice = 1499; defaultGuests = 6; }
    else if (theatreId === 3 || theatreId === 6) { basePrice = 1699; defaultGuests = 12; }
    else if (theatreId === 7) { basePrice = 1599; defaultGuests = 8; }

    setManualForm(prev => ({
      ...prev,
      theatre_id: theatreId,
      total: basePrice,
      guests: defaultGuests,
      advance_paid: Math.min(prev.advance_paid, basePrice)
    }));
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
      if (rescheduleForm.theatre_id === 1 || rescheduleForm.theatre_id === 4) screenName = 'Couple Suite (2-4 guests)';
      else if (rescheduleForm.theatre_id === 2 || rescheduleForm.theatre_id === 5) screenName = 'Celebration Suite (6-10 guests)';
      else if (rescheduleForm.theatre_id === 3 || rescheduleForm.theatre_id === 6) screenName = 'Grand Family Suite (12-16 guests)';
      else screenName = 'Celebration Lounge';
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
      `Your private theatre booking with our manager via phone is *${statusText}*!\n\n` +
      `🎟️ *Booking Ref:* ${b.booking_ref}\n` +
      `📍 *Venue:* Movie Bash (${branchName})\n` +
      `🎭 *Theatre:* ${b.theatre_name || 'Private Screen'}\n` +
      (b.package_type ? `📦 *Package:* ${String(b.package_type).toUpperCase()} PACKAGE\n` : '') +
      (b.cake_flavor ? `🎂 *Cake:* 500g ${b.cake_flavor}\n` : '') +
      `📅 *Date:* ${b.booking_date}\n` +
      `⏰ *Showtime Slot:* ${b.slot_time || 'Scheduled Slot'}\n` +
      (b.extra_hours > 0 ? `⏳ *Extended Duration:* +${b.extra_hours} Hour Extra Showtime (${2 + Number(b.extra_hours)} Hours Total)\n` : `⏳ *Duration:* 2 Hours Standard Showtime\n`) +
      `👥 *Guests:* ${b.guests}\n` +
      (b.screen_name ? `✨ *Screen Name:* "${b.screen_name}"\n` : '') +
      `💰 *Total Amount:* ₹${b.total}\n` +
      `✅ *Advance Paid:* ₹${b.advance_paid || 0}\n` +
      `💵 *Balance Due at Venue:* ₹${b.balance || 0}\n` +
      `📍 *Location:* ${branchAddress}\n` +
      `🗺️ *Google Maps:* https://maps.google.com/?q=Movie+Bash+${encodeURIComponent(branchName)}\n\n` +
      `🍿 *Amenities Included:* 4K Cinema projection, Dolby sound, recliner seating, customizable music/OTT, and celebration atmosphere.\n\n` +
      `For any special requests (cakes, decor, songs), simply reply to this WhatsApp message or call us at *+91 99029 23656*.\n\n` +
      `We look forward to hosting your celebration! 🎉`
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
    if (!manualForm.customer_name.trim()) {
      alert('Please enter the customer full name.');
      return;
    }

    const cleanPhone = manualForm.customer_phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 starting with 6, 7, 8, or 9).');
      return;
    }

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm)
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
                source: 'phone',
                branch_id: isStaff && currentUser?.branch_id ? currentUser.branch_id : prev.branch_id,
                theatre_id: isStaff && currentUser?.branch_id === 2 ? 4 : (isStaff ? 1 : prev.theatre_id)
              }));
              setShowManualModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Phone Call Booking</span>
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

      {/* PHONE CALL / MANUAL BOOKING MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border-2 border-sky-100 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <PhoneCall className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-playfair text-xl font-bold text-ink">
                    New Phone Call / Direct Booking
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Book instantly on call &amp; send WhatsApp confirmation to customer
                  </span>
                </div>
              </div>
              <button onClick={() => setShowManualModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <form onSubmit={(e) => handleCreateManualBooking(e, true)} className="space-y-4 text-xs">
              
              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Babu"
                    value={manualForm.customer_name}
                    onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Phone Number (10 digits) *</label>
                  <div className="flex">
                    <span className="px-3 py-2 rounded-l-xl bg-slate-200 border border-r-0 border-sky-200 font-bold text-slate-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={manualForm.customer_phone}
                      onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-2 rounded-r-xl bg-[#fffdf9] border border-sky-200 font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Screen Title Display (Celebrant) */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Screen Title Display (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Happy 25th Birthday Sneha ❤️"
                  value={manualForm.screen_name}
                  onChange={(e) => setManualForm({ ...manualForm, screen_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-medium"
                />
              </div>

              {/* Branch & Theatre Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Branch</label>
                  <select
                    value={manualForm.branch_id}
                    onChange={(e) => {
                      const newBranch = Number(e.target.value);
                      const defaultTheatre = newBranch === 1 ? 1 : 4;
                      setManualForm(prev => ({ ...prev, branch_id: newBranch, theatre_id: defaultTheatre }));
                      handleTheatreChange(defaultTheatre);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                  >
                    <option value={1}>Electronic City (3 Screens)</option>
                    <option value={2}>BTM 2nd Stage (4 Screens)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Select Private Theatre</label>
                  <select
                    value={manualForm.theatre_id}
                    onChange={(e) => handleTheatreChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                  >
                    {manualForm.branch_id === 1 ? (
                      <>
                        <option value={1}>🎬 Couple Theater (₹899 • 2 Guests)</option>
                        <option value={2}>🎉 Celebration Theater (₹1499 • 6 Guests)</option>
                        <option value={3}>👨‍👩‍👧‍👦 Family Theater (₹1699 • 12-20 Guests)</option>
                      </>
                    ) : (
                      <>
                        <option value={4}>🎬 Couple Theater (₹899 • 2 Guests)</option>
                        <option value={5}>🎉 Celebration Theater (₹1499 • 6 Guests)</option>
                        <option value={7}>✨ VIP Celebration Suite (₹1599 • 8 Guests)</option>
                        <option value={6}>👨‍👩‍👧‍👦 Family Theater (₹1699 • 12-20 Guests)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Extra Hours Extension */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs">
                    Extend Showtime Duration (Extra Hours)
                  </label>
                  <span className="text-[10px] font-black text-[#ef4a23]">
                    {manualForm.theatre_id === 1 || manualForm.theatre_id === 4 ? '+₹400 / Hr (Couple)' : '+₹750 / Hr (Celebration & Family)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((extra) => {
                    const isSelected = (manualForm.extra_hours || 0) === extra;
                    const hourlyRate = (manualForm.theatre_id === 1 || manualForm.theatre_id === 4) ? 400 : 750;
                    const extraCost = extra * hourlyRate;
                    return (
                      <button
                        key={extra}
                        type="button"
                        onClick={() => {
                          const currentExtra = manualForm.extra_hours || 0;
                          const currentExtraCost = currentExtra * hourlyRate;
                          const basePrice = manualForm.total - currentExtraCost;
                          const newTotal = basePrice + extraCost;
                          setManualForm(prev => ({
                            ...prev,
                            extra_hours: extra,
                            total: newTotal
                          }));
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#ef4a23] bg-[#ef4a23] text-white font-black shadow-xs'
                            : 'border-slate-300 bg-white hover:border-[#ef4a23] text-slate-800 font-bold'
                        }`}
                      >
                        <span className="block text-xs">{extra === 0 ? 'Standard 2 Hrs' : `+${extra} Hr (${2 + extra} Hrs)`}</span>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                          {extra === 0 ? 'Regular timing' : `+₹${extraCost}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Showtime Slots Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Screening Date &amp; Showtime Slot *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.booking_date}
                    onChange={(e) => setManualForm({ ...manualForm, booking_date: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                  />
                </div>

                {loadingManualSlots ? (
                  <div className="p-3 text-center text-slate-500 animate-pulse bg-slate-50 rounded-xl">
                    Loading slots for selected date...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
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
                          onClick={() => setManualForm(prev => ({ ...prev, slot_id: s.id }))}
                          className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-royal-800 bg-[#155fbd] text-white font-black shadow-sm'
                              : isBooked
                              ? 'border-sky-100 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed line-through'
                              : 'border-slate-300 bg-white hover:border-royal-600 text-slate-800 font-bold'
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
              </div>

              {/* Pricing, Advance Paid & Balance */}
              <div className="p-3.5 rounded-2xl bg-[#f0f7ff] border border-sky-200 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total (₹)</label>
                    <input
                      type="number"
                      required
                      value={manualForm.total}
                      onChange={(e) => setManualForm({ ...manualForm, total: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Advance (₹)</label>
                    <input
                      type="number"
                      required
                      value={manualForm.advance_paid}
                      onChange={(e) => setManualForm({ ...manualForm, advance_paid: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 font-black text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Balance Due</label>
                    <div className="px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 font-black text-amber-700">
                      ₹{Math.max(0, manualForm.total - manualForm.advance_paid)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-600 font-bold">Quick Advance:</span>
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, advance_paid: 500 }))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-50"
                  >
                    ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, advance_paid: 1000 }))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-50"
                  >
                    ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, advance_paid: prev.total }))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-50"
                  >
                    Full (₹{manualForm.total})
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Call Notes / Special Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Asked for red balloon decor, bringing own cake"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#d9ebff]/50 font-bold text-slate-700 hover:bg-sand-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateManualBooking(e, false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900"
                >
                  Save Only
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                Phone Booking Successfully Saved
              </span>
              <h3 className="font-playfair text-2xl font-black text-slate-900 mt-1">
                Ref #{bookingSuccessData.booking_ref}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Guest Name:</span>
                <strong className="text-slate-900">{bookingSuccessData.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Phone:</span>
                <strong className="text-emerald-800 font-mono">+91 {bookingSuccessData.customer_phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Screen &amp; Slot:</span>
                <strong className="text-slate-900">{bookingSuccessData.theatre_name} &bull; {bookingSuccessData.slot_time}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Advance Collected:</span>
                <strong className="text-emerald-700">₹{bookingSuccessData.advance_paid}</strong>
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
                      <option value={1}>Couple Suite (Screen 1 &bull; 2-4 Guests)</option>
                      <option value={2}>Celebration Suite (Screen 2 &bull; 6-10 Guests)</option>
                      <option value={3}>Grand Family Suite (Screen 3 &bull; 12-16 Guests)</option>
                    </>
                  ) : (
                    <>
                      <option value={4}>Couple Suite (Screen 1 &bull; 2-4 Guests)</option>
                      <option value={5}>Celebration Suite (Screen 2 &bull; 6-10 Guests)</option>
                      <option value={6}>Grand Family Suite (Screen 3 &bull; 12-16 Guests)</option>
                      <option value={7}>Skyline Celebration Suite (Screen 4 &bull; 8 Guests)</option>
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
