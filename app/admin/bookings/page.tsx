'use client';

import React, { useState, useEffect } from 'react';
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ totalPages: 1, total: 0 });

  // Modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentAddAmount, setPaymentAddAmount] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Manual phone booking form state
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    branch_id: 1,
    theatre_id: 1,
    slot_id: 1,
    booking_date: new Date().toISOString().split('T')[0],
    screen_name: '',
    occasion_id: 2, // Birthday default
    guests: 2,
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (branchFilter !== 'all') q.set('branch', branchFilter);
      if (statusFilter !== 'all') q.set('status', statusFilter);
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
  }, [search, branchFilter, statusFilter, page]);

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
      `📅 *Date:* ${b.booking_date}\n` +
      `⏰ *Showtime Slot:* ${b.slot_time || 'Scheduled Slot'}\n` +
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
    if (!manualForm.customer_name || !manualForm.customer_phone) {
      alert('Please fill in customer name and phone number.');
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
          <span className="text-xs font-bold uppercase tracking-wider text-royal-700">Reservation Desk</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
            All Bookings ({meta.total})
          </h1>
          <p className="text-xs text-ink/70 mt-0.5">
            Manage web bookings, handle customer phone calls, dispatch WhatsApp confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/bookings/export"
            download
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-royal-900 bg-sand-100 hover:bg-sand-200 border border-sand-300 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-royal-700" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setManualForm(prev => ({ ...prev, source: 'phone' }));
              setShowManualModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Phone Call Booking</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-sand-200 shadow-soft flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, email, or booking ref..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-royal-900 focus:outline-none focus:border-royal-700"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs font-bold text-royal-900 focus:outline-none"
          >
            <option value="all">All Branches</option>
            <option value="1">Electronic City</option>
            <option value="2">BTM 2nd Stage</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-2.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs font-bold text-royal-900 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Bookings', value: 'all' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-royal-800 text-white shadow-sm'
                : 'bg-white border border-sand-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Table / Cards on mobile */}
      <div className="bg-white rounded-3xl border border-sand-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-royal-900">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink/60">No bookings found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50/50 text-[11px] font-bold text-ink/60 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref &amp; Customer</th>
                  <th className="py-3 px-4">Venue &amp; Theatre</th>
                  <th className="py-3 px-4">Date &amp; Slot</th>
                  <th className="py-3 px-4">Pricing &amp; Balance</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-sand-50/60 transition-colors">
                    
                    {/* Ref & Customer */}
                    <td className="py-3 px-4">
                      <strong className="block text-royal-900 font-bold">{b.customer_name}</strong>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink/60">
                        <span className="font-mono text-royal-700 font-semibold">{b.booking_ref}</span>
                        <span>&bull;</span>
                        <a href={`tel:${b.customer_phone}`} className="hover:underline flex items-center gap-0.5">
                          <Phone className="w-3 h-3 text-royal-700" />
                          <span>{b.customer_phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Venue & Theatre */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-royal-900 flex items-center gap-1">
                        <span>{b.theatre_emoji || '🎬'}</span>
                        <span>{b.theatre_name || 'Screen'}</span>
                      </div>
                      <span className="text-[11px] text-ink/60 block">{b.branch_name}</span>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3 px-4">
                      <strong className="block text-royal-900">{b.booking_date}</strong>
                      <span className="text-[11px] text-royal-700 font-semibold">{b.slot_time}</span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <strong className="block text-royal-900 font-black">₹{b.total}</strong>
                      <div className="text-[10px] space-x-1">
                        <span className="text-emerald-700 font-bold">Adv: ₹{b.advance_paid || 0}</span>
                        {b.balance > 0 ? (
                          <span className="text-amber-700 font-bold">&bull; Due: ₹{b.balance}</span>
                        ) : (
                          <span className="text-slate-500">&bull; Paid</span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.source === 'phone' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : b.source === 'walk_in'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {b.source === 'phone' ? '📞 Phone' : b.source === 'walk_in' ? '🚶 Walk-in' : '🌐 Web'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'completed' ? 'bg-royal-100 text-royal-800' :
                        b.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 1-CLICK WHATSAPP BUTTON */}
                        <button
                          onClick={() => sendCustomerWhatsApp(b)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          title="Send reservation confirmation to customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        {/* View / Manage Details */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-royal-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Soft Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Move booking #${b.booking_ref} to Trash?`)) {
                              handleAction(b.id, 'soft_delete');
                            }
                          }}
                          className="p-1.5 rounded-xl bg-sand-100 hover:bg-rose-100 text-rose-600"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-royal-700 block">Reservation Details</span>
                <h3 className="font-playfair text-xl font-bold text-royal-900">
                  {selectedBooking.customer_name} ({selectedBooking.booking_ref})
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-sand-50 border border-sand-200">
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <a href={`tel:${selectedBooking.customer_phone}`} className="font-bold text-royal-700 hover:underline">
                    +91 {selectedBooking.customer_phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-bold uppercase text-emerald-700">{selectedBooking.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Theatre &amp; Branch</span>
                  <span className="font-bold text-royal-900">{selectedBooking.theatre_name} &bull; {selectedBooking.branch_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date &amp; Slot</span>
                  <span className="font-bold text-royal-900">{selectedBooking.booking_date} ({selectedBooking.slot_time})</span>
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
              <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
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
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-royal-100 text-royal-800 hover:bg-royal-200 transition-colors"
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

              {selectedBooking.screen_name && (
                <div className="p-3 rounded-xl bg-sand-100">
                  <span className="text-[10px] text-ink/60 uppercase font-bold block">Screen Title Display</span>
                  <span className="font-semibold text-royal-900">&ldquo;{selectedBooking.screen_name}&rdquo;</span>
                </div>
              )}

              {/* Add Payment Field */}
              {selectedBooking.balance > 0 && (
                <div className="pt-3 border-t border-sand-200">
                  <label className="block text-[11px] font-bold text-royal-900 mb-1">
                    Collect Payment (Remaining Balance: ₹{selectedBooking.balance})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paymentAddAmount}
                      onChange={(e) => setPaymentAddAmount(e.target.value)}
                      placeholder={`e.g. ${selectedBooking.balance}`}
                      className="px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 text-xs font-bold"
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

            <div className="flex justify-between items-center pt-4 border-t border-sand-200">
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
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-royal-700 text-white"
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
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border-2 border-slate-200 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <PhoneCall className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-playfair text-xl font-bold text-royal-900">
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
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Phone Number (10 digits) *</label>
                  <div className="flex">
                    <span className="px-3 py-2 rounded-l-xl bg-slate-200 border border-r-0 border-sand-300 font-bold text-slate-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={manualForm.customer_phone}
                      onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-2 rounded-r-xl bg-sand-50 border border-sand-300 font-bold text-slate-900"
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
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-medium"
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
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold"
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

              {/* Date & Showtime Slots Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Screening Date &amp; Showtime Slot *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.booking_date}
                    onChange={(e) => setManualForm({ ...manualForm, booking_date: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-sand-50 border border-sand-300 font-bold"
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
                      const slotTime = s.time || `${s.start_time} - ${s.end_time}`;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          disabled={isBooked}
                          onClick={() => setManualForm(prev => ({ ...prev, slot_id: s.id }))}
                          className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-royal-800 bg-royal-800 text-white font-black shadow-sm'
                              : isBooked
                              ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed line-through'
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
              <div className="p-3.5 rounded-2xl bg-sand-100 border border-sand-300 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total (₹)</label>
                    <input
                      type="number"
                      required
                      value={manualForm.total}
                      onChange={(e) => setManualForm({ ...manualForm, total: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sand-300 font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Advance (₹)</label>
                    <input
                      type="number"
                      required
                      value={manualForm.advance_paid}
                      onChange={(e) => setManualForm({ ...manualForm, advance_paid: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sand-300 font-black text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Balance Due</label>
                    <div className="px-2.5 py-1.5 rounded-xl bg-white border border-sand-300 font-black text-amber-700">
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
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-sand-200 font-bold text-slate-700 hover:bg-sand-300"
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
                className="w-full py-2.5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
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

    </div>
  );
}
