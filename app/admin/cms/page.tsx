'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Film, 
  Clock, 
  Gift, 
  Tag, 
  Users, 
  Inbox, 
  Sliders, 
  Shield, 
  Check, 
  Plus, 
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  IndianRupee,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { initialMockStore } from '@/lib/mock-data';

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<'branches' | 'theatres' | 'addons' | 'coupons' | 'customers' | 'enquiries' | 'settings' | 'audit'>('coupons');

  // Local state initialized safely
  const [branches, setBranches] = useState(initialMockStore.branches);
  const [theatres, setTheatres] = useState(initialMockStore.theatres);
  const [addons, setAddons] = useState(initialMockStore.addons);
  const [coupons, setCoupons] = useState(initialMockStore.coupons);
  const [customers, setCustomers] = useState(initialMockStore.customers);
  const [enquiries, setEnquiries] = useState(initialMockStore.enquiries);
  const [siteSettings, setSiteSettings] = useState(initialMockStore.siteSettings);
  const [auditLogs, setAuditLogs] = useState(initialMockStore.auditLogs);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    id: 0,
    code: '',
    discount_type: 'flat' as 'flat' | 'percentage',
    discount_value: 200,
    min_booking_amount: 899,
    is_active: 1
  });

  const loadCmsData = () => {
    fetch('/api/admin/cms')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          if (json.data.branches) setBranches(json.data.branches);
          if (json.data.theatres) setTheatres(json.data.theatres);
          if (json.data.addons) setAddons(json.data.addons);
          if (json.data.coupons) setCoupons(json.data.coupons);
          if (json.data.customers) setCustomers(json.data.customers);
          if (json.data.enquiries) setEnquiries(json.data.enquiries);
          if (json.data.siteSettings) setSiteSettings(json.data.siteSettings);
          if (json.data.auditLogs) setAuditLogs(json.data.auditLogs);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  // 1. SAVE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', siteSettings })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Site settings updated & saved successfully!');
        loadCmsData();
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (e) {
      alert('Error saving settings');
    }
  };

  // 2. OPEN COUPON MODAL (New or Edit)
  const openNewCouponModal = () => {
    setCouponForm({
      id: 0,
      code: '',
      discount_type: 'flat',
      discount_value: 200,
      min_booking_amount: 899,
      is_active: 1
    });
    setCouponModalOpen(true);
  };

  const openEditCouponModal = (c: any) => {
    setCouponForm({
      id: c.id,
      code: c.code,
      discount_type: c.discount_type || 'flat',
      discount_value: c.discount_value,
      min_booking_amount: c.min_booking_amount || 0,
      is_active: c.is_active ?? 1
    });
    setCouponModalOpen(true);
  };

  // 3. SUBMIT COUPON (ADD OR EDIT)
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = couponForm.id ? 'edit_coupon' : 'add_coupon';
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...couponForm })
      });
      const data = await res.json();
      if (data.success) {
        setCouponModalOpen(false);
        triggerSuccess(couponForm.id ? `Coupon ${couponForm.code} updated!` : `Coupon ${couponForm.code} created!`);
        loadCmsData();
      } else {
        alert(data.error || 'Failed to save coupon');
      }
    } catch (err) {
      alert('Error saving coupon');
    }
  };

  // 4. DELETE COUPON
  const handleDeleteCoupon = async (c: any) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${c.code}"?`)) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_coupon', id: c.id })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess(`Coupon ${c.code} deleted.`);
        loadCmsData();
      } else {
        alert(data.error || 'Failed to delete coupon');
      }
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  // 5. TOGGLE COUPON STATUS
  const handleToggleCoupon = async (c: any) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_coupon', id: c.id })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess(`Coupon ${c.code} status updated.`);
        loadCmsData();
      }
    } catch (err) {
      alert('Error toggling coupon status');
    }
  };

  // 6. QUICK UPDATE THEATRE PRICE
  const handleEditTheatre = async (id: number, currentBase: number, currentExtra: number) => {
    const newBase = prompt('Enter new base price (₹):', String(currentBase));
    if (newBase === null) return;
    const newExtra = prompt('Enter new extra person price (₹):', String(currentExtra));
    if (newExtra === null) return;

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_theatre',
          id,
          base_price: Number(newBase),
          extra_person_price: Number(newExtra)
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Theatre pricing updated!');
        loadCmsData();
      }
    } catch (e) {
      alert('Error updating theatre');
    }
  };

  // 7. QUICK UPDATE ADDON PRICE
  const handleEditAddon = async (id: number, currentPrice: number) => {
    const newPrice = prompt('Enter new add-on price (₹):', String(currentPrice));
    if (newPrice === null) return;

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_addon',
          id,
          price: Number(newPrice)
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Add-on price updated!');
        loadCmsData();
      }
    } catch (e) {
      alert('Error updating add-on');
    }
  };

  const tabs = [
    { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
    { id: 'settings', label: 'Site Settings', icon: Sliders },
    { id: 'theatres', label: `Theatres (${theatres.length})`, icon: Film },
    { id: 'addons', label: `Add-ons (${addons.length})`, icon: Gift },
    { id: 'branches', label: `Branches (${branches.length})`, icon: Building2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-royal-700">Content Management System</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
            Coupons, Pricing &amp; Site Settings
          </h1>
          <p className="text-xs text-ink/70 mt-0.5">
            Create, edit and delete discount coupons, modify theatre rates, and update announcement messages.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-sand-300 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white border-t-2 border-x border-sand-300 text-royal-800 shadow-sm'
                  : 'text-ink/60 hover:text-royal-900 hover:bg-sand-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-royal-600" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COUPONS (FULL CRUD: ADD, EDIT, DELETE, TOGGLE) */}
      {activeTab === 'coupons' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
            <div>
              <h3 className="font-playfair text-xl font-bold text-royal-900">
                Promotional Discount Coupons ({coupons.length})
              </h3>
              <span className="text-xs text-ink/60">
                Customers can apply these active coupon codes during booking checkout for instant discounts.
              </span>
            </div>

            <button
              type="button"
              onClick={openNewCouponModal}
              className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-royal-700 hover:bg-royal-600 shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => {
              const isActive = c.is_active === 1;
              return (
                <div 
                  key={c.id} 
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                    isActive 
                      ? 'bg-sand-50 border-sand-300 hover:border-royal-500 shadow-xs' 
                      : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-black text-royal-900 tracking-wider">
                          {c.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 block mt-1">
                        {c.discount_type === 'flat' ? `Flat ₹${c.discount_value} OFF` : `${c.discount_value}% Percentage OFF`}
                      </span>
                    </div>

                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(c)}
                      title={isActive ? 'Click to deactivate coupon' : 'Click to activate coupon'}
                      className="p-1 rounded-xl text-royal-700 hover:bg-sand-200 transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-ink/75 pt-2 border-t border-sand-200 flex items-center justify-between">
                    <span>Min Booking Amount: <strong>₹{c.min_booking_amount || 0}</strong></span>
                    <span className="text-[11px] text-ink/60">ID #{c.id}</span>
                  </div>

                  {/* EDIT & DELETE ACTION BUTTONS */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-sand-200">
                    <button
                      type="button"
                      onClick={() => openEditCouponModal(c)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-sand-300 hover:border-royal-700 text-royal-800 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-royal-700" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-royal-900">Global Website Configuration</h3>
              <span className="text-xs text-ink/60">Updates announcement banners, contact details, and advance deposit policies.</span>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-royal-700 text-white hover:bg-royal-600 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              Save Settings
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Announcement Banner */}
            <div>
              <label className="block font-bold text-slate-900 mb-1">Top Announcement Strip Text</label>
              <input
                type="text"
                value={siteSettings.announcement_text || ''}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-sand-50 border border-sand-300 font-medium text-slate-900"
              />
              <span className="text-[11px] text-ink/60 mt-1 block">Displayed on the top-most bar across all pages.</span>
            </div>

            {/* Business Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Business Phone / WhatsApp</label>
                <input
                  type="text"
                  value={siteSettings.business_phone || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, business_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Support Email</label>
                <input
                  type="email"
                  value={siteSettings.business_email || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, business_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Advance Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Flat Advance to Lock Slot (₹)</label>
                <input
                  type="number"
                  value={siteSettings.advance_amount_flat || 500}
                  onChange={(e) => setSiteSettings({ ...siteSettings, advance_amount_flat: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Cancellation / Reschedule Notice (Hours)</label>
                <input
                  type="number"
                  value={siteSettings.cancellation_window_hours || 72}
                  onChange={(e) => setSiteSettings({ ...siteSettings, cancellation_window_hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold text-royal-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-royal-700 text-white hover:bg-royal-600 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              Save All Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: THEATRES & PRICING */}
      {activeTab === 'theatres' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-6">
          <div className="flex justify-between items-center border-b border-sand-200 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-royal-900">Private Theatres &amp; Rates ({theatres.length})</h3>
              <span className="text-xs text-ink/60">Manage base screening prices and extra guest fees across branches.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {theatres.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-royal-900 flex items-center gap-1.5">
                    <span>{t.emoji}</span>
                    <span>{t.name}</span>
                  </h4>
                  <span className="text-base font-black text-royal-700">₹{t.base_price}</span>
                </div>
                <div className="space-y-1 text-xs text-ink/75">
                  <p>Branch: <strong>{t.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'}</strong></p>
                  <p>Capacity: {t.capacity} Guests &bull; Extra Person: ₹{t.extra_person_price}</p>
                  <p className="text-[11px] text-ink/60 italic truncate">{t.amenities}</p>
                </div>
                <div className="pt-2 border-t border-sand-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEditTheatre(t.id, t.base_price, t.extra_person_price)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-sand-300 hover:border-royal-700 text-royal-800 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-royal-700" />
                    <span>Edit Price</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ADDONS */}
      {activeTab === 'addons' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-6">
          <div className="flex justify-between items-center border-b border-sand-200 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-royal-900">Add-ons &amp; Celebration Specials ({addons.length})</h3>
              <span className="text-xs text-ink/60">Cakes, Fog entries, Cold pyrotechnics, Decor items</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {addons.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-royal-700 block">{a.category}</span>
                  <strong className="text-royal-900 block leading-tight">{a.name}</strong>
                  <span className="text-ink/60 text-[11px] line-clamp-1">{a.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="font-playfair text-base font-bold text-royal-700 block">₹{a.price}</span>
                  <button
                    type="button"
                    onClick={() => handleEditAddon(a.id, a.price)}
                    className="text-[10px] font-bold text-royal-700 hover:underline mt-1"
                  >
                    Edit Price
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BRANCHES */}
      {activeTab === 'branches' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-6">
          <div className="flex justify-between items-center border-b border-sand-200 pb-3">
            <h3 className="font-playfair text-xl font-bold text-royal-900">Bengaluru Locations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((b) => (
              <div key={b.id} className="p-6 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-royal-900">{b.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-ink/75"><strong>Address:</strong> {b.address}</p>
                  <p className="text-ink/75"><strong>Phone:</strong> {b.phone}</p>
                  <p className="text-ink/75"><strong>Map URL:</strong> <a href={b.map_url} target="_blank" className="text-royal-600 underline">Open Map</a></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900">Customer Roster</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sand-200 text-ink/60">
                  <th className="py-2">Name</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Total Bookings</th>
                  <th className="py-2">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-bold text-royal-900">{c.name}</td>
                    <td className="py-2.5">+91 {c.phone}</td>
                    <td className="py-2.5">{c.total_bookings}</td>
                    <td className="py-2.5 font-bold text-royal-700">₹{c.lifetime_spend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900">Website Enquiries &amp; Leads</h3>
          {enquiries.length === 0 ? (
            <p className="text-xs text-ink/60">No pending enquiries. Test submissions appear here in real-time.</p>
          ) : (
            <div className="space-y-3">
              {enquiries.map((e: any) => (
                <div key={e.id} className="p-4 rounded-2xl bg-sand-50 border border-sand-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-royal-900">{e.name} (+91 {e.phone})</strong>
                    <span className="text-[10px] text-ink/60">{e.created_at}</span>
                  </div>
                  <p className="text-ink/80">{e.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900">Security &amp; Operations Audit Trail</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sand-200 text-ink/60">
                  <th className="py-2">Time</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 text-[11px] text-ink/60">{new Date(log.created_at).toLocaleTimeString()}</td>
                    <td className="py-2 font-bold text-royal-900">{log.user_email}</td>
                    <td className="py-2 font-mono text-royal-700">{log.action}</td>
                    <td className="py-2">{log.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COUPON CREATE / EDIT MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border-2 border-slate-200">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <h3 className="font-playfair text-xl font-bold text-royal-900">
                {couponForm.id ? `Edit Coupon: ${couponForm.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button onClick={() => setCouponModalOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOVIEBASH200"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold"
                  >
                    <option value="flat">Flat ₹ Amount</option>
                    <option value="percentage">Percentage %</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    {couponForm.discount_type === 'flat' ? 'Discount Value (₹) *' : 'Discount Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-black text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Min. Booking Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.min_booking_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_booking_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Coupon Status</label>
                  <select
                    value={couponForm.is_active}
                    onChange={(e) => setCouponForm({ ...couponForm, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-300 font-bold"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sand-200 font-bold text-slate-700 hover:bg-sand-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-royal-700 hover:bg-royal-600 text-white font-black shadow-md cursor-pointer active:scale-95"
                >
                  {couponForm.id ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
