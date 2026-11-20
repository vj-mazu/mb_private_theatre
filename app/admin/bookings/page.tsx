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
  ExternalLink,
  Ticket,
  MapPin,
  ChevronRight
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
  const [copiedLiveTicket, setCopiedLiveTicket] = useState(false);

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

  // Manual booking form state (Full 18 Operational Fields with Cake Weight & Packages)
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_phone: '',
    whatsapp_number: '',
    special_person_name: '',
    customer_email: '',
    occasion: 'Birthday Party',
    occasion_id: 2,
    branch_id: 1,
    theatre_id: 1,
    slot_id: 1,
    slot_time: '10:00 AM - 12:00 PM',
    booking_date: getTodayIST(),
    screen_name: '',
    package_type: 'standard', // 'standard' (Included Decor + Cake + Fog) | 'premium' (VIP Upgrade) | 'custom' (Room Only)
    guests: 2,
    extra_persons: 0,
    extra_hours: 0,
    cake_flavor: 'Chocolate Truffle',
    cake_weight: '500g', // '500g' | '1kg' | '1.5kg' | '2kg' | 'None'
    addons: [] as string[],
    custom_item_name: '',
    custom_item_amount: 0,
    discount: 0,
    total: 1499,
    advance_paid: 500,
    payment_type: 'UPI', // 'UPI' | 'Cash' | 'Card' | 'Net Banking'
    source: 'phone_call', // 'whatsapp' | 'phone_call' | 'walkin' | 'instagram' | 'website'
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
      q.set('limit', '25');

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
          const currentValid = json.data.find((s: any) => s.id === manualForm.slot_id && !s.is_booked);
          if (!currentValid) {
            const firstAvail = json.data.find((s: any) => !s.is_booked);
            if (firstAvail) {
              const timeStr = firstAvail.time || `${firstAvail.start_time} - ${firstAvail.end_time}`;
              setManualForm(prev => ({ 
                ...prev, 
                slot_id: firstAvail.id,
                slot_time: timeStr
              }));
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

  // Addons catalog for operational booking (all active celebration enhancements)
  const ADDONS_CATALOG: Record<string, { label: string; price: number; icon: string }> = {
    fog: { label: 'Dramatic Fog Entry', price: 499, icon: '🌫️' },
    pyro: { label: 'Cold Pyro Sparklers (2 Shots)', price: 399, icon: '🎆' },
    marquee: { label: 'LED Marquee Name Letters', price: 299, icon: '💡' },
    bouquet: { label: 'Fresh Red Rose Bouquet', price: 499, icon: '💐' },
    photo: { label: 'Pro Photography & 4K Video', price: 999, icon: '📸' },
    reel: { label: '4K Cinematic iPhone Reel', price: 799, icon: '📱' },
    bubble: { label: 'Romantic Bubble Entry', price: 399, icon: '🫧' },
    teddy: { label: 'Giant Teddy Mascot Surprise', price: 699, icon: '🧸' },
    petals: { label: 'Red Rose Petals Pathway', price: 399, icon: '🌹' },
  };

  // Recompute total cleanly based on theatre, package, cake weight, extra persons, addons, and custom items
  const recomputeManualTotal = (draft: typeof manualForm) => {
    // 1. Base Theatre Cost
    let base = 899;
    if (draft.theatre_id === 1 || draft.theatre_id === 4) base = 899;
    else if (draft.theatre_id === 2 || draft.theatre_id === 5) base = 1499;
    else if (draft.theatre_id === 3 || draft.theatre_id === 6) base = 1699;
    else if (draft.theatre_id === 7) base = 1599;

    // 2. Package Additions (Standard: +₹600 for Décor+Cake+Fog, Premium: +₹1,500 VIP, Custom: ₹0)
    let pkgAdd = 600;
    if (draft.package_type === 'custom') pkgAdd = 0;
    else if (draft.package_type === 'premium') pkgAdd = 1500;
    else if (draft.package_type === 'standard') pkgAdd = 600;

    // 3. Extra Persons (+₹150/person)
    const extraPersonsCost = Math.max(0, Number(draft.extra_persons || 0)) * 150;

    // 4. Extra Hours
    const hourlyRate = (draft.theatre_id === 1 || draft.theatre_id === 4) ? 400 : 750;
    const extraHoursCost = Math.max(0, Number(draft.extra_hours || 0)) * hourlyRate;

    // 5. Cake Weight Cost (500g is included in standard/premium or base; 1kg is +₹400, 1.5kg +₹800, 2kg +₹1200)
    let cakeCost = 0;
    if (draft.cake_weight === '1kg') cakeCost = 400;
    else if (draft.cake_weight === '1.5kg') cakeCost = 800;
    else if (draft.cake_weight === '2kg') cakeCost = 1200;
    else if (draft.cake_weight === 'None') cakeCost = 0;

    // 6. Celebration Add-ons Total
    let addonsTotal = 0;
    if (Array.isArray(draft.addons)) {
      draft.addons.forEach(key => {
        if (ADDONS_CATALOG[key]) addonsTotal += ADDONS_CATALOG[key].price;
      });
    }

    // 7. Extra Custom Item Amount
    const customCost = Math.max(0, Number(draft.custom_item_amount || 0));

    // 8. Discount
    const discountVal = Math.max(0, Number(draft.discount || 0));

    return Math.max(0, base + pkgAdd + extraPersonsCost + extraHoursCost + cakeCost + addonsTotal + customCost - discountVal);
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
      if (['theatre_id', 'package_type', 'cake_weight', 'extra_persons', 'extra_hours', 'custom_item_amount', 'discount'].includes(field)) {
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

  // Helper to resolve theatre name from id
  const getTheatreDisplayName = (theatreId: number, branchId: number) => {
    if (branchId === 1) {
      if (theatreId === 1) return 'Couple Theater (Screen 1)';
      if (theatreId === 2) return 'Celebration Theater (Screen 2)';
      if (theatreId === 3) return 'Family Theater (Screen 3)';
      return 'Private Theater';
    } else {
      if (theatreId === 4) return 'Butterfly Blush (Screen 1)';
      if (theatreId === 5) return 'Lavender Mist (Screen 2)';
      if (theatreId === 6) return 'Scarlet Red (Screen 3)';
      if (theatreId === 7) return 'Shadow Suit (Screen 4)';
      return 'Private Theater';
    }
  };

  // Exact WhatsApp confirmation ticket format as requested by user
  const generateWhatsAppMessage = (b: any) => {
    const branchName = b.branch_name || (b.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage');
    const branchAddress = b.branch_id === 1 
      ? '4th Floor, Srinivasam, Beside Sri Vishnu Grand, Electronic City, Bengaluru 560100'
      : '2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076';
    const mapsLink = b.branch_id === 1
      ? 'https://maps.app.goo.gl/MovieBashElectronicCity'
      : 'https://maps.app.goo.gl/MovieBashBTM';

    const specialName = b.special_person_name || b.customer_name || 'Special Guest';
    const phone = b.whatsapp_number || b.customer_phone || '';
    const occ = b.occasion || b.occasion_name || 'Celebration';
    const theatreName = b.theatre_name || getTheatreDisplayName(b.theatre_id, b.branch_id);
    const timing = `${b.booking_date} | ${b.slot_time || 'Showtime Slot'}`;
    const pkg = b.package_type === 'custom' 
      ? 'Custom (Room Only)' 
      : b.package_type === 'premium' 
      ? 'Premium VIP Celebration Package' 
      : 'Standard Celebration Package';
    
    const extraP = Number(b.extra_persons || 0) > 0 ? `${b.extra_persons} Guests (+₹${b.extra_persons * 150})` : '0';
    
    let cakeStr = b.cake_flavor || 'None';
    if (b.cake_weight && b.cake_weight !== 'None' && !cakeStr.includes(b.cake_weight)) {
      cakeStr = `${cakeStr} (${b.cake_weight})`;
    }
    if (cakeStr === 'None (Bringing Own Cake / ₹0)' || cakeStr === 'None') {
      cakeStr = 'None (Customer bringing own cake)';
    }

    let addonsStr = 'None';
    if (Array.isArray(b.addons) && b.addons.length > 0) {
      addonsStr = b.addons.map((k: any) => {
        const key = typeof k === 'string' ? k : k.addon_name || k.name;
        return ADDONS_CATALOG[key]?.label || key;
      }).join(', ');
    }

    const customFieldStr = b.custom_item_name 
      ? `${b.custom_item_name} (₹${b.custom_item_amount || 0})` 
      : 'None';
    
    const discountStr = Number(b.discount || 0) > 0 ? `₹${b.discount}` : '₹0';
    const totalStr = `₹${b.total || 0}`;
    const advanceStr = `₹${b.advance_paid || 0}`;
    const balanceStr = `₹${Math.max(0, (b.total || 0) - (b.advance_paid || 0))}`;
    const paymentTypeStr = b.payment_type || 'UPI';
    const bookingSourceStr = b.source === 'phone_call' ? 'Phone Call' : b.source === 'whatsapp' ? 'WhatsApp' : b.source === 'walkin' ? 'Walk-in' : b.source === 'instagram' ? 'Instagram' : 'Website';
    const ticketCode = b.booking_ref || `MB-${Date.now().toString().slice(-6)}`;

    return (
`🎟️ *MOVIE BASH CELEBRATION TICKET* 🎟️
*Ticket Code:* ${ticketCode}

*Special person’s Name:* ${specialName}
*Whatsapp number:* +91 ${phone}
*Occasion:* ${occ}
*Branch:* ${branchName}
*Private theater:* ${theatreName}
*Timings:* ${timing}
*Package or Custom:* ${pkg}
*Extra persons:* ${extraP}
*Cake flavour:* ${cakeStr}
*Addons:* ${addonsStr}
*Extra custom field:* ${customFieldStr}
*Discount:* ${discountStr}

*Total amount:* ${totalStr}
*Advance:* ${advanceStr}
*Balance:* ${balanceStr}

*Payment type:* ${paymentTypeStr}

*Booking:* ${bookingSourceStr}

📍 *Location:* ${branchAddress}
🗺️ *Google Maps:* ${mapsLink}
🍿 *Amenities:* 4K Laser Cinema Screening, Dolby Sound, 100% Soundproof Private Lounge!

🎉 *We look forward to hosting your celebration!*
📞 Desk Helpline: +91 99029 23656`
    );
  };

  const sendCustomerWhatsApp = (b: any) => {
    const phone = String(b.whatsapp_number || b.customer_phone).replace(/\D/g, '').slice(-10);
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

    // Format cake description with weight
    const formattedCake = manualForm.cake_weight === 'None' 
      ? 'None' 
      : `${manualForm.cake_flavor} (${manualForm.cake_weight})`;

    const payload = {
      ...manualForm,
      customer_name: manualForm.customer_name.trim() || finalName,
      customer_phone: cleanPhone,
      whatsapp_number: cleanPhone,
      cake_flavor: formattedCake,
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

  const copyLiveTicketText = () => {
    const liveDraft = {
      ...manualForm,
      booking_ref: 'MB-DRAFT',
      theatre_name: getTheatreDisplayName(manualForm.theatre_id, manualForm.branch_id),
      branch_name: manualForm.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'
    };
    const text = generateWhatsAppMessage(liveDraft);
    navigator.clipboard.writeText(text);
    setCopiedLiveTicket(true);
    setTimeout(() => setCopiedLiveTicket(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A2E4]">Reservation Desk</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#0B2238]">
            All Bookings ({meta.total})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quick manual booking for phone calls &amp; WhatsApp, instant ticket code generation, and 1-click WhatsApp voucher dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {!isStaff && (
            <div className="flex items-center gap-2">
              <a
                href={`/api/admin/bookings/export?format=xlsx&${dateFilter ? `date=${dateFilter}&` : ''}${branchFilter !== 'all' ? `branch=${branchFilter}&` : ''}`}
                download
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Download formatted Excel spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export Excel</span>
              </a>

              <a
                href={`/api/admin/bookings/export?format=csv&${dateFilter ? `date=${dateFilter}&` : ''}${branchFilter !== 'all' ? `branch=${branchFilter}&` : ''}`}
                download
                className="px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download CSV"
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
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#00A2E4] hover:bg-[#0072AE] shadow-lg shadow-[#00A2E4]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book Showtime</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket code (e.g. MBEC...), celebrant name, or phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#00A2E4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#00A2E4] shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter('');
                  setPage(1);
                }}
                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center text-[10px] ml-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {isStaff ? (
            <div className="flex-1 md:flex-initial px-3.5 py-2 rounded-2xl bg-[#082052]/10 border border-[#082052]/30 text-xs font-black text-[#082052] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#082052]" />
              <span>{currentUser?.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'} (Assigned)</span>
            </div>
          ) : (
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
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
            className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No bookings found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Ticket &amp; Celebrant</th>
                  <th className="py-3 px-4">Venue &amp; Theatre</th>
                  <th className="py-3 px-4">Showtime</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-3 text-center">Source</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-sky-50/50 transition-colors">
                    
                    {/* Ticket & Celebrant */}
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-slate-900 font-extrabold text-[13px]">
                          {b.special_person_name || b.customer_name}
                        </strong>
                        {b.special_person_name && b.customer_name && b.special_person_name !== b.customer_name && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            (By: {b.customer_name})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="font-mono text-[#0072AE] font-black text-[10.5px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {b.booking_ref}
                        </span>
                        <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#00A2E4]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{b.customer_phone}</span>
                        </a>
                        {b.occasion && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {b.occasion}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Venue & Theatre */}
                    <td className="py-3 px-4 align-middle">
                      <div className="font-black text-slate-900 text-xs flex items-center gap-1">
                        <span>{b.theatre_emoji || '🎬'}</span>
                        <span>{b.theatre_name || 'Screen'}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-500 block mt-0.5">{b.branch_name}</span>
                    </td>

                    {/* Showtime */}
                    <td className="py-3 px-4 align-middle">
                      <strong className="block text-slate-900 text-xs font-black">{b.booking_date}</strong>
                      <div className="text-[10.5px] text-[#0072AE] font-bold mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-600 shrink-0" />
                        <span>{b.slot_time}</span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4 align-middle">
                      <strong className="block text-slate-900 font-black text-xs">₹{b.total}</strong>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1">
                        <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Adv: ₹{b.advance_paid || 0}</span>
                        {b.balance > 0 ? (
                          <span className="text-amber-900 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Due: ₹{b.balance}</span>
                        ) : (
                          <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Paid</span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 align-middle text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.source === 'phone_call' || b.source === 'phone'
                          ? 'bg-amber-50 text-amber-900 border-amber-200' 
                          : b.source === 'whatsapp'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : b.source === 'walkin' || b.source === 'walk_in'
                          ? 'bg-purple-50 text-purple-900 border-purple-200'
                          : b.source === 'instagram'
                          ? 'bg-pink-50 text-pink-900 border-pink-200'
                          : 'bg-sky-50 text-sky-900 border-sky-200'
                      }`}>
                        {b.source === 'phone_call' || b.source === 'phone' ? '📞 Call' :
                         b.source === 'whatsapp' ? '💬 WhatsApp' :
                         b.source === 'walkin' || b.source === 'walk_in' ? '🚶 Walk-in' :
                         b.source === 'instagram' ? '📸 Insta' : '🌐 Web'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 align-middle text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        b.status === 'completed' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                        b.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                        'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 1-CLICK WHATSAPP TICKET BUTTON */}
                        <button
                          onClick={() => sendCustomerWhatsApp(b)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                          title="1-Click: Send formatted confirmation ticket on WhatsApp"
                        >
                          <Ticket className="w-3.5 h-3.5 text-white" />
                          <span>WhatsApp Ticket</span>
                        </button>

                        {/* View Ticket / Details */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Reschedule */}
                        <button
                          onClick={() => openRescheduleModal(b)}
                          className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                          title="Reschedule Slot"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* Soft Delete (Admin Only) */}
                        {!isStaff && (
                          <button
                            onClick={() => {
                              if (confirm(`Move booking #${b.booking_ref} to Trash?`)) {
                                handleAction(b.id, 'soft_delete');
                              }
                            }}
                            className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-100 text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Delete Booking"
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

      {/* ─── FULL-PAGE SPACIOUS MANUAL BOOKING WORKSPACE MODAL ─── */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-[#082052]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[95vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Workspace Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A2E4] text-white flex items-center justify-center shadow-md shadow-[#00A2E4]/20">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-playfair text-xl font-black text-[#0B2238] flex items-center gap-2">
                    <span>Create Showtime Booking</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-[#0072AE] font-bold">
                      Staff Workspace
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter details while on call &bull; Live WhatsApp ticket auto-formats on right pane &bull; 1-click dispatch
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  <span>📅 {manualForm.booking_date}</span>
                  <span>&bull;</span>
                  <span>📍 {manualForm.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'}</span>
                </div>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Workspace Body: Left Form (60%) + Right Live Ticket (40%) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* LEFT COLUMN: Input Fields (Smooth Scroll) */}
              <div className="lg:w-7/12 xl:w-3/5 overflow-y-auto p-5 sm:p-6 space-y-5 border-r border-slate-100">
                
                {/* 1. Celebrant & Customer Contact */}
                <div className="p-4 rounded-2xl bg-[#F6FAFD] border border-sky-100 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0072AE] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 1. Celebrant &amp; Contact Details
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-black text-[#0B2238] mb-1">
                        Special person’s Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sneha / Arjun"
                        value={manualForm.special_person_name}
                        onChange={(e) => updateManualField('special_person_name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#0B2238] mb-1">
                        Whatsapp number (10 digits) *
                      </label>
                      <div className="flex">
                        <span className="px-3 py-2.5 rounded-l-xl bg-slate-200 border border-r-0 border-sky-200 font-bold text-xs text-slate-700">
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
                          className="w-full px-3.5 py-2.5 rounded-r-xl bg-white border border-sky-200 font-black text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Booked By / Customer Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Babu (if different)"
                        value={manualForm.customer_name}
                        onChange={(e) => updateManualField('customer_name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-slate-800 focus:border-[#00A2E4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#0B2238] mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
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

                {/* 2. Branch & Private Theatre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black text-[#0B2238] mb-1">Branch *</label>
                    <select
                      value={manualForm.branch_id}
                      onChange={(e) => {
                        const newBranch = Number(e.target.value);
                        const defaultTheatre = newBranch === 1 ? 1 : 4;
                        updateManualField('branch_id', newBranch);
                        handleTheatreChange(defaultTheatre);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6FAFD] border border-sky-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    >
                      <option value={1}>📍 Electronic City (3 Screens)</option>
                      <option value={2}>📍 BTM 2nd Stage (4 Screens)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#0B2238] mb-1">Private Theatre *</label>
                    <select
                      value={manualForm.theatre_id}
                      onChange={(e) => handleTheatreChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6FAFD] border border-sky-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
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

                {/* 3. Showtime Date & Slot Selection */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black text-[#0B2238] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00A2E4]" />
                      <span>Showtime Date &amp; Slot *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={manualForm.booking_date}
                      onChange={(e) => updateManualField('booking_date', e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-[#0B2238] text-xs focus:outline-none"
                    />
                  </div>

                  {loadingManualSlots ? (
                    <div className="p-4 text-center text-xs text-slate-500 animate-pulse bg-slate-50 rounded-xl">
                      Checking live slot availability...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
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

                  {/* Extend Duration */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

                {/* 4. Package or Custom (Matching Frontend Exactly) */}
                <div>
                  <label className="block text-xs font-black text-[#0B2238] mb-1.5">
                    Package or Custom *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { 
                        key: 'standard', 
                        label: 'Standard Celebration', 
                        badge: 'Most Popular',
                        desc: 'Décor + 500g Cake + Fog Entry Included (+₹600)' 
                      },
                      { 
                        key: 'premium', 
                        label: 'Premium VIP', 
                        badge: 'All-In Grand',
                        desc: 'Themed Décor + Cake + Fog + Cold Pyro (+₹1,500)' 
                      },
                      { 
                        key: 'custom', 
                        label: 'Custom (Room Only)', 
                        badge: 'Build Your Own',
                        desc: 'Base screen only, pick add-ons as needed (+₹0)' 
                      },
                    ].map((pkg) => {
                      const isSel = manualForm.package_type === pkg.key;
                      return (
                        <button
                          key={pkg.key}
                          type="button"
                          onClick={() => updateManualField('package_type', pkg.key)}
                          className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSel 
                              ? 'border-[#00A2E4] bg-sky-50/80 ring-2 ring-[#00A2E4]/40 shadow-xs' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#0072AE]">
                                {pkg.badge}
                              </span>
                              {isSel && <span className="w-2 h-2 rounded-full bg-[#00A2E4]" />}
                            </div>
                            <strong className="block text-xs font-extrabold text-[#0B2238]">{pkg.label}</strong>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">{pkg.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Extra Persons & LED Screen Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black text-[#0B2238] mb-1">
                      Extra persons (+₹150/guest)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={manualForm.extra_persons}
                        onChange={(e) => updateManualField('extra_persons', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 shrink-0 font-bold">
                        +₹{manualForm.extra_persons * 150}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Screen Title Display (LED Screen)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Happy 25th Birthday Sneha ❤️"
                      value={manualForm.screen_name}
                      onChange={(e) => updateManualField('screen_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 text-xs font-medium text-slate-800 focus:border-[#00A2E4] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 6. Cake Flavour & Cake Weight (500g, 1kg, 1.5kg, 2kg, None) */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      🎂 Cake Flavour &amp; Weight Options
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {manualForm.cake_weight === 'None' ? 'No Cake' : manualForm.cake_weight}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2238] mb-1">
                        Cake Flavour *
                      </label>
                      <select
                        value={manualForm.cake_flavor}
                        onChange={(e) => updateManualField('cake_flavor', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-bold text-xs text-[#0B2238] focus:border-amber-400 focus:outline-none"
                      >
                        <option value="Chocolate Truffle">🍫 Chocolate Truffle</option>
                        <option value="Dutch Dark Chocolate">🍫 Dutch Dark Chocolate</option>
                        <option value="Red Velvet">❤️ Red Velvet</option>
                        <option value="Black Forest">🍒 Black Forest</option>
                        <option value="Butterscotch">🍯 Butterscotch</option>
                        <option value="Fresh Pineapple">🍍 Fresh Pineapple</option>
                        <option value="Alphonso Mango">🥭 Alphonso Mango</option>
                        <option value="Blueberry Bliss">🫐 Blueberry Bliss</option>
                        <option value="None">🚫 None (Bringing Own Cake / ₹0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B2238] mb-1">
                        Cake Weight *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {[
                          { key: '500g', label: '500 gm', cost: 'Included' },
                          { key: '1kg', label: '1 kg', cost: '+₹400' },
                          { key: '1.5kg', label: '1.5 kg', cost: '+₹800' },
                          { key: '2kg', label: '2 kg', cost: '+₹1,200' },
                          { key: 'None', label: 'None', cost: '₹0' },
                        ].map((w) => {
                          const isSel = manualForm.cake_weight === w.key;
                          return (
                            <button
                              key={w.key}
                              type="button"
                              onClick={() => updateManualField('cake_weight', w.key)}
                              className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#0B2238] text-white border-[#0B2238] font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-amber-200 hover:border-amber-300'
                              }`}
                            >
                              <span className="block text-[11px] font-bold">{w.label}</span>
                              <span className={`block text-[9px] ${isSel ? 'text-amber-300' : 'text-slate-500'}`}>{w.cost}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Celebration Add-ons (Horizontal Quick Chips) */}
                <div className="space-y-2 p-4 rounded-2xl bg-[#F6FAFD] border border-sky-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0B2238] block text-[11px] uppercase tracking-wider">
                      🎁 Celebration Add-ons (Quick Chips)
                    </span>
                    <span className="text-[10px] font-bold text-[#0072AE] bg-sky-100 px-2 py-0.5 rounded-full">
                      {manualForm.addons.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(ADDONS_CATALOG).map(([key, item]) => {
                      const isSelected = manualForm.addons.includes(key);
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => toggleManualAddon(key)}
                          className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            isSelected
                              ? 'border-[#00A2E4] bg-[#00A2E4] text-white font-black shadow-xs'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-[#00A2E4]/60'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate font-bold text-[11px]">{item.label}</span>
                          </span>
                          <span className={`text-[10.5px] shrink-0 font-extrabold ${isSelected ? 'text-white' : 'text-[#0072AE]'}`}>
                            ₹{item.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 8. Extra Custom Field (Name & Amount) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FFFDF9] border border-amber-200/70">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0B2238] mb-1">
                      Extra custom field (Item Name)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Balloon Arch / Rose Petals / Flower Crown"
                      value={manualForm.custom_item_name}
                      onChange={(e) => updateManualField('custom_item_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium text-slate-800 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2238] mb-1">
                      Custom Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={manualForm.custom_item_amount || ''}
                      onChange={(e) => updateManualField('custom_item_amount', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-black text-xs text-[#0B2238] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 9. Discount, Payment Type & Booking Source */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={manualForm.discount || ''}
                      onChange={(e) => updateManualField('discount', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-black text-xs text-rose-600 focus:border-[#00A2E4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2238] mb-1">
                      Payment type *
                    </label>
                    <select
                      value={manualForm.payment_type}
                      onChange={(e) => updateManualField('payment_type', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    >
                      <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Cash">💵 Cash</option>
                      <option value="Card">💳 Credit / Debit Card</option>
                      <option value="Net Banking">🏦 Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2238] mb-1">
                      Booking Source *
                    </label>
                    <select
                      value={manualForm.source}
                      onChange={(e) => updateManualField('source', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-[#0B2238] focus:border-[#00A2E4] focus:outline-none"
                    >
                      <option value="phone_call">📞 Phone Call</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="walkin">🚶 Walk-in</option>
                      <option value="instagram">📸 Instagram</option>
                      <option value="website">🌐 Website</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests / Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Requests / Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Surprise entrance with favorite Spotify playlist"
                    value={manualForm.notes}
                    onChange={(e) => updateManualField('notes', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

              </div>

              {/* RIGHT COLUMN: Live Ticket & Financial Breakdown (Pinned / High Visibility) */}
              <div className="lg:w-5/12 xl:w-2/5 overflow-y-auto p-5 sm:p-6 bg-[#F8FBFD] flex flex-col justify-between space-y-4">
                
                {/* Live Ticket Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B2238] flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-[#00A2E4]" />
                      <span>Live WhatsApp Ticket Preview</span>
                    </span>
                    <button
                      type="button"
                      onClick={copyLiveTicketText}
                      className="text-[11px] font-bold text-[#0072AE] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLiveTicket ? '✓ Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Formatted Live Ticket Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-mono space-y-2 text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {generateWhatsAppMessage({
                      ...manualForm,
                      booking_ref: 'MB-TICKET',
                      theatre_name: getTheatreDisplayName(manualForm.theatre_id, manualForm.branch_id),
                      branch_name: manualForm.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'
                    })}
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="p-4 rounded-2xl bg-[#082052] text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-bold text-white/70 uppercase">Bill Summary</span>
                    <span className="text-sky-300 font-bold">
                      {manualForm.theatre_id === 1 || manualForm.theatre_id === 4 ? 'Couple Theatre' : 'Celebration Theatre'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-[10px] text-white/70 block font-bold">Total Amount</span>
                      <strong className="text-base font-black text-white">₹{manualForm.total}</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400">
                      <span className="text-[10px] text-emerald-200 block font-bold">Advance (₹)</span>
                      <input
                        type="number"
                        min={0}
                        value={manualForm.advance_paid}
                        onChange={(e) => updateManualField('advance_paid', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-center bg-transparent text-emerald-300 font-black text-base focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50">
                      <span className="text-[10px] text-amber-200 block font-bold">Balance Due</span>
                      <strong className="text-base font-black text-amber-300">
                        ₹{Math.max(0, manualForm.total - manualForm.advance_paid)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] pt-1 border-t border-white/10">
                    <span className="text-white/60 font-medium">Quick Advance:</span>
                    {[500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => updateManualField('advance_paid', amt)}
                        className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition-colors cursor-pointer"
                      >
                        ₹{amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateManualField('advance_paid', manualForm.total)}
                      className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition-colors cursor-pointer"
                    >
                      Full (₹{manualForm.total})
                    </button>
                  </div>
                </div>

                {/* Big Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => handleCreateManualBooking(e, true)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Book Showtime &amp; Send WhatsApp Ticket</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCreateManualBooking(e, false)}
                      className="py-2.5 px-4 rounded-xl bg-[#0B2238] hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Save Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualModal(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ─── POST-BOOKING SUCCESS & WHATSAPP MODAL ─── */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border-2 border-emerald-500 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                Booking Confirmed &amp; Ticket Generated
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
                <span className="text-slate-600">Customer Name:</span>
                <strong className="text-slate-900">{bookingSuccessData.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">WhatsApp / Phone:</span>
                <strong className="text-emerald-800 font-mono">+91 {bookingSuccessData.whatsapp_number || bookingSuccessData.customer_phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Theatre &amp; Slot:</span>
                <strong className="text-slate-900">{bookingSuccessData.theatre_name} &bull; {bookingSuccessData.slot_time}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Advance Paid:</span>
                <strong className="text-emerald-700">₹{bookingSuccessData.advance_paid} ({bookingSuccessData.payment_type || 'UPI'})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Balance Due:</span>
                <strong className="text-amber-700">₹{bookingSuccessData.balance}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              WhatsApp was opened with the customer ticket voucher. You can re-send or copy the message anytime.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => sendCustomerWhatsApp(bookingSuccessData)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open Customer WhatsApp Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => copyConfirmationText(bookingSuccessData)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedText ? '✓ Copied to Clipboard!' : 'Copy Ticket Message'}</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close &amp; Back to Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOOKING DETAIL / TICKET INSPECT MODAL ─── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-[#082052]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#00A2E4] block">Reservation Voucher</span>
                <h3 className="font-playfair text-xl font-bold text-[#0B2238]">
                  {selectedBooking.special_person_name || selectedBooking.customer_name} ({selectedBooking.booking_ref})
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formatted Ticket Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 max-h-80 overflow-y-auto">
              {generateWhatsAppMessage(selectedBooking)}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => sendCustomerWhatsApp(selectedBooking)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Send Ticket on WhatsApp (+91 {selectedBooking.whatsapp_number || selectedBooking.customer_phone})</span>
              </button>

              <button
                type="button"
                onClick={() => copyConfirmationText(selectedBooking)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedText ? '✓ Copied Ticket!' : 'Copy Ticket Message'}</span>
              </button>
            </div>

            {/* Status Change */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Update Status:</span>
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
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 hover:bg-sky-200 transition-colors"
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

            {/* Collect Balance Payment */}
            {selectedBooking.balance > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 block">
                  Collect Remaining Balance: <strong>₹{selectedBooking.balance}</strong>
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paymentAddAmount}
                    onChange={(e) => setPaymentAddAmount(e.target.value)}
                    placeholder={`e.g. ${selectedBooking.balance}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      if (paymentAddAmount) {
                        handleAction(selectedBooking.id, 'add_payment', { payment_add: paymentAddAmount });
                        setPaymentAddAmount('');
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Record Payment
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESCHEDULE SLOT MODAL ─── */}
      {showRescheduleModal && rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082052]/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
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
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Current Reservation:</span>
                <p className="text-slate-700">
                  📅 <strong>{rescheduleBooking.booking_date}</strong> &bull; ⏰ <strong>{rescheduleBooking.slot_time || 'Standard Slot'}</strong>
                </p>
                <p className="text-slate-600">
                  📍 {rescheduleBooking.branch_name || (rescheduleBooking.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage')} &bull; 🎭 {rescheduleBooking.theatre_name || 'Standard Screen'}
                </p>
              </div>

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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#00A2E4]"
                >
                  <option value={1}>Electronic City Branch</option>
                  <option value={2}>BTM 2nd Stage Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Theatre</label>
                <select
                  value={rescheduleForm.theatre_id}
                  onChange={(e) => {
                    const tId = Number(e.target.value);
                    setRescheduleForm(prev => ({ ...prev, theatre_id: tId }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#00A2E4]"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.booking_date}
                  onChange={(e) => setRescheduleForm(prev => ({ ...prev, booking_date: e.target.value }))}
                  min={getTodayIST()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#00A2E4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Available Slot {loadingRescheduleSlots && '(Loading...)'}
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
                              ? 'bg-[#00A2E4] text-white border-[#00A2E4] shadow-sm font-bold'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="font-mono font-bold">{slot.start_time} - {slot.end_time}</span>
                          <span className="text-[10px] mt-1 font-medium">
                            {isBooked ? '❌ Booked' : isSelected ? '✓ Selected' : '🟢 Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                    No slot data found for this date.
                  </div>
                )}
              </div>

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
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#0B2238] hover:bg-[#00A2E4] text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
