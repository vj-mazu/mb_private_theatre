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
  CheckCircle2,
  UploadCloud,
  Camera,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { initialMockStore } from '@/lib/mock-data';

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<'branches' | 'theatres' | 'addons' | 'coupons' | 'customers' | 'enquiries' | 'settings'>('coupons');

  // Local state initialized safely
  const [branches, setBranches] = useState(initialMockStore.branches);
  const [theatres, setTheatres] = useState(initialMockStore.theatres);
  const [addons, setAddons] = useState(initialMockStore.addons);
  const [coupons, setCoupons] = useState(initialMockStore.coupons);
  const [customers, setCustomers] = useState(initialMockStore.customers);
  const [enquiries, setEnquiries] = useState(initialMockStore.enquiries);
  const [siteSettings, setSiteSettings] = useState(initialMockStore.siteSettings);

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

  // Theatre & Package Modal with Photo Upload & Compression State
  const [theatreModalOpen, setTheatreModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<any>(null);
  const [theatreForm, setTheatreForm] = useState({
    id: 0,
    name: '',
    branch_id: 1,
    capacity: 2,
    base_price: 899,
    standard_price: 1499,
    custom_price: 899,
    premium_price: 2800,
    extra_hour_rate: 400,
    extra_person_price: 150,
    amenities: '',
    image_url: '',
    images: [] as string[]
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);

  // Client-side image compression using HTML5 canvas
  const compressImage = (file: File, maxWidth = 1600, quality = 0.82): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', quality);
          const originalSizeKb = Math.round(file.size / 1024);
          const compressedSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
          resolve({ dataUrl, originalSizeKb, compressedSizeKb });
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setCompressionStats(null);
    try {
      const { dataUrl, originalSizeKb, compressedSizeKb } = await compressImage(file);
      const ratio = Math.max(0, Math.round((1 - compressedSizeKb / Math.max(1, originalSizeKb)) * 100));
      setCompressionStats(`⚡ Compressed: ${originalSizeKb} KB ➔ ${compressedSizeKb} KB (-${ratio}%)`);

      const res = await fetch('/api/admin/cms/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          theatre_id: theatreForm.id,
          filename: file.name
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        setTheatreForm(prev => {
          const newImages = [...(prev.images || []), data.url];
          return {
            ...prev,
            images: newImages,
            image_url: prev.image_url || data.url
          };
        });
        triggerSuccess(`Compressed & attached photo (${data.size_kb} KB) successfully!`);
        loadCmsData();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Failed to compress or upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditTheatreModal = (t: any) => {
    const isCouple = t.id === 1 || t.id === 4;
    setEditingTheatre(t);
    setTheatreForm({
      id: t.id,
      name: t.name,
      branch_id: t.branch_id,
      capacity: t.capacity,
      base_price: t.base_price || (isCouple ? 899 : 1499),
      standard_price: (t as any).standard_price || (isCouple ? 1499 : 2200),
      custom_price: (t as any).custom_price || (isCouple ? 899 : 1699),
      premium_price: (t as any).premium_price || (isCouple ? 2800 : 3500),
      extra_hour_rate: (t as any).extra_hour_rate || (isCouple ? 400 : 750),
      extra_person_price: t.extra_person_price || (isCouple ? 99 : 149),
      amenities: t.amenities || '',
      image_url: t.image_url || '',
      images: Array.isArray((t as any).images) && (t as any).images.length > 0 ? (t as any).images : [t.image_url].filter(Boolean)
    });
    setCompressionStats(null);
    setTheatreModalOpen(true);
  };

  const handleSetCover = async (imgUrl: string) => {
    setTheatreForm(prev => ({ ...prev, image_url: imgUrl }));
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_theatre',
          id: theatreForm.id,
          image_url: imgUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('✅ Primary cover photo updated & saved instantly!');
        loadCmsData();
      }
    } catch (err) {
      console.error('Error saving cover:', err);
    }
  };

  const handleDeletePhoto = async (imgUrl: string) => {
    const updatedImages = (theatreForm.images || []).filter(x => x !== imgUrl);
    const newCover = theatreForm.image_url === imgUrl ? (updatedImages[0] || '') : theatreForm.image_url;
    setTheatreForm(prev => ({
      ...prev,
      images: updatedImages,
      image_url: newCover
    }));

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_theatre',
          id: theatreForm.id,
          images: updatedImages,
          image_url: newCover,
          remove_image: imgUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Photo deleted and package updated!');
        loadCmsData();
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const handleTheatreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_theatre',
          ...theatreForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setTheatreModalOpen(false);
        triggerSuccess(`Updated pricing & photos for ${theatreForm.name}!`);
        loadCmsData();
      } else {
        alert(data.error || 'Failed to update package');
      }
    } catch (err) {
      alert('Error updating package');
    }
  };

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
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ef4a23]">Content Management System</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink">
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
      <div className="flex gap-2 border-b border-sky-200 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white border-t-2 border-x border-sky-200 text-[#141110] shadow-sm'
                  : 'text-ink/60 hover:text-ink hover:bg-[#fff8f5]'
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
            <div>
              <h3 className="font-playfair text-xl font-bold text-ink">
                Promotional Discount Coupons ({coupons.length})
              </h3>
              <span className="text-xs text-ink/60">
                Customers can apply these active coupon codes during booking checkout for instant discounts.
              </span>
            </div>

            <button
              type="button"
              onClick={openNewCouponModal}
              className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#ef4a23] hover:bg-royal-600 shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
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
                      ? 'bg-[#fffdf9] border-sky-200 hover:border-royal-500 shadow-xs' 
                      : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-black text-ink tracking-wider">
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
                      className="p-1 rounded-xl text-[#ef4a23] hover:bg-[#fff0ea]/50 transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-ink/75 pt-2 border-t border-sky-100 flex items-center justify-between">
                    <span>Min Booking Amount: <strong>₹{c.min_booking_amount || 0}</strong></span>
                    <span className="text-[11px] text-ink/60">ID #{c.id}</span>
                  </div>

                  {/* EDIT & DELETE ACTION BUTTONS */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-sky-100">
                    <button
                      type="button"
                      onClick={() => openEditCouponModal(c)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 hover:border-royal-700 text-[#141110] font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#ef4a23]" />
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
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-ink">Global Website Configuration</h3>
              <span className="text-xs text-ink/60">Updates announcement banners, contact details, and advance deposit policies.</span>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#ef4a23] text-white hover:bg-royal-600 transition-colors shadow-md active:scale-95 cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffdf9] border border-sky-200 font-medium text-slate-900"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Support Email</label>
                <input
                  type="email"
                  value={siteSettings.business_email || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, business_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-semibold text-slate-900"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Cancellation / Reschedule Notice (Hours)</label>
                <input
                  type="number"
                  value={siteSettings.cancellation_window_hours || 72}
                  onChange={(e) => setSiteSettings({ ...siteSettings, cancellation_window_hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold text-ink"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#ef4a23] text-white hover:bg-royal-600 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              Save All Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: THEATRES & PRICING */}
      {activeTab === 'theatres' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-6">
          <div className="flex justify-between items-center border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-ink">Private Screening Suites &amp; Package Rates ({theatres.length})</h3>
              <span className="text-xs text-ink/60">Manage package prices (Standard, Custom, Premium, Extra 1hr rate) and upload compressed room photos.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {theatres.map((t) => {
              const isCouple = t.id === 1 || t.id === 4;
              const photoCount = Array.isArray((t as any).images) ? (t as any).images.length : (t.image_url ? 1 : 0);
              const extraHrRate = (t as any).extra_hour_rate || (isCouple ? 400 : 750);
              const stdPrice = (t as any).standard_price || (isCouple ? 1499 : 2200);
              const customPrice = (t as any).custom_price || t.base_price || (isCouple ? 899 : 1499);
              const premPrice = (t as any).premium_price || (isCouple ? 2800 : 3500);

              return (
                <div key={t.id} className="p-5 rounded-2xl bg-[#fffdf9] border border-sky-100 space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Room Cover Photo Preview */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {t.image_url ? (
                        <img 
                          src={t.image_url} 
                          alt={t.name}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-black text-amber-400">
                        {t.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                          <span>{t.emoji}</span>
                          <span>{t.name}</span>
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">Capacity: up to {t.capacity} Guests</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Standard</span>
                        <span className="text-base font-black text-[#ef4a23]">₹{stdPrice}</span>
                      </div>
                    </div>

                    {/* Rates Grid */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white border border-sky-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Custom Starting:</span>
                        <strong className="text-slate-900 font-bold">₹{customPrice}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Premium Package:</span>
                        <strong className="text-slate-900 font-bold">₹{premPrice}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Extra 1 Hr:</span>
                        <strong className="text-emerald-700 font-bold">+₹{extraHrRate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Extra Person:</span>
                        <strong className="text-slate-900 font-bold">+₹{t.extra_person_price}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">{t.amenities}</p>
                  </div>

                  <div className="pt-2 border-t border-sky-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openEditTheatreModal(t)}
                      className="w-full py-2 px-3 rounded-xl bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Manage Photos &amp; Pricing</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ADDONS */}
      {activeTab === 'addons' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-6">
          <div className="flex justify-between items-center border-b border-sky-100 pb-3">
            <div>
              <h3 className="font-playfair text-xl font-bold text-ink">Add-ons &amp; Celebration Specials ({addons.length})</h3>
              <span className="text-xs text-ink/60">Cakes, Fog entries, Cold pyrotechnics, Decor items</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {addons.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-[#fffdf9] border border-sky-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#ef4a23] block">{a.category}</span>
                  <strong className="text-ink block leading-tight">{a.name}</strong>
                  <span className="text-ink/60 text-[11px] line-clamp-1">{a.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="font-playfair text-base font-bold text-[#ef4a23] block">₹{a.price}</span>
                  <button
                    type="button"
                    onClick={() => handleEditAddon(a.id, a.price)}
                    className="text-[10px] font-bold text-[#ef4a23] hover:underline mt-1"
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-6">
          <div className="flex justify-between items-center border-b border-sky-100 pb-3">
            <h3 className="font-playfair text-xl font-bold text-ink">Bengaluru Locations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((b) => (
              <div key={b.id} className="p-6 rounded-2xl bg-[#fffdf9] border border-sky-100 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-ink">{b.name}</h4>
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-playfair text-xl font-bold text-ink">Customer Roster</h3>
            <span className="text-xs font-bold text-slate-500">{customers.length} registered customers</span>
          </div>
          <div className="overflow-x-auto rounded-xl border-2 border-slate-300 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4 border border-slate-300 whitespace-nowrap">Name</th>
                  <th className="py-3 px-4 border border-slate-300 whitespace-nowrap">Phone</th>
                  <th className="py-3 px-4 border border-slate-300 whitespace-nowrap">Total Bookings</th>
                  <th className="py-3 px-4 border border-slate-300 whitespace-nowrap">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="even:bg-slate-50/70 hover:bg-sky-50/70 transition-colors">
                    <td className="py-3 px-4 border border-slate-300 font-extrabold text-slate-900 align-middle">{c.name}</td>
                    <td className="py-3 px-4 border border-slate-300 font-mono font-semibold text-slate-700 align-middle">+91 {c.phone}</td>
                    <td className="py-3 px-4 border border-slate-300 align-middle">
                      <span className="bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full font-bold text-slate-800 text-[11px]">
                        {c.total_bookings} bookings
                      </span>
                    </td>
                    <td className="py-3 px-4 border border-slate-300 font-black text-[#ef4a23] align-middle">₹{c.lifetime_spend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-4">
          <h3 className="font-playfair text-xl font-bold text-ink">Website Enquiries &amp; Leads</h3>
          {enquiries.length === 0 ? (
            <p className="text-xs text-ink/60">No pending enquiries. Test submissions appear here in real-time.</p>
          ) : (
            <div className="space-y-3">
              {enquiries.map((e: any) => (
                <div key={e.id} className="p-4 rounded-2xl bg-[#fffdf9] border border-sky-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-ink">{e.name} (+91 {e.phone})</strong>
                    <span className="text-[10px] text-ink/60">{e.created_at}</span>
                  </div>
                  <p className="text-ink/80">{e.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COUPON CREATE / EDIT MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-elevated border-2 border-sky-100">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-playfair text-xl font-bold text-ink">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-black text-emerald-700"
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
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Coupon Status</label>
                  <select
                    value={couponForm.is_active}
                    onChange={(e) => setCouponForm({ ...couponForm, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
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
                  className="px-4 py-2 rounded-xl bg-[#fff0ea]/50 font-bold text-slate-700 hover:bg-sand-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#ef4a23] hover:bg-royal-600 text-white font-black shadow-md cursor-pointer active:scale-95"
                >
                  {couponForm.id ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THEATRE / PACKAGE EDITING & PHOTO UPLOAD MODAL */}
      {theatreModalOpen && editingTheatre && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-sky-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <span className="text-[10px] text-[#ef4a23] font-black uppercase tracking-wider block">
                  Package Pricing &amp; Media CMS
                </span>
                <h3 className="font-playfair text-xl sm:text-2xl font-black text-ink">
                  {theatreForm.name} ({theatreForm.branch_id === 1 ? 'Electronic City' : 'BTM 2nd Stage'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTheatreModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTheatreSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1: PHOTO MANAGEMENT WITH COMPRESSION */}
              <div className="p-4 rounded-2xl bg-[#fffdf9] border border-sky-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-ink flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#ef4a23]" />
                      <span>Room &amp; Suite Photos ({theatreForm.images?.length || 0})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Uploaded photos are automatically compressed (under 250 KB) via browser canvas before uploading.
                    </p>
                  </div>

                  <label className={`px-4 py-2 rounded-xl bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 shrink-0 ${uploadingImage ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingImage ? 'Compressing & Uploading...' : '+ Upload New Photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploadingImage}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Compression Live Stats Notification */}
                {compressionStats && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{compressionStats}</span>
                  </div>
                )}

                {/* Photo Gallery Grid */}
                {theatreForm.images && theatreForm.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {theatreForm.images.map((imgUrl, idx) => {
                      const isCover = theatreForm.image_url === imgUrl;
                      return (
                        <div key={idx} className="relative rounded-xl overflow-hidden border-2 group bg-slate-100 aspect-video shadow-xs" style={{ borderColor: isCover ? '#ef4a23' : '#e2e8f0' }}>
                          <img 
                            src={imgUrl} 
                            alt={`Photo ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                          />

                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#ef4a23] text-white text-[9px] font-black uppercase flex items-center gap-1 shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Primary Cover</span>
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(imgUrl)}
                                className="px-2.5 py-1 rounded-md bg-white text-[10px] font-black text-slate-800 hover:bg-amber-300 shadow-sm transition-all"
                                title="Set as primary cover"
                              >
                                ★ Set Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(imgUrl)}
                              className="p-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <ImageIcon className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <span>No extra photos uploaded yet. Click &quot;+ Upload New Photo&quot; to add.</span>
                  </div>
                )}
              </div>

              {/* SECTION 2: PACKAGE PRICING */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-ink flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-[#ef4a23]" />
                  <span>Package Pricing Configurations</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Standard Package */}
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200">
                    <label className="block font-bold text-slate-900 mb-1">Standard Package (₹)</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.standard_price}
                      onChange={(e) => setTheatreForm({ ...theatreForm, standard_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-extrabold text-[#ef4a23]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Full celebration with decor &amp; cake</span>
                  </div>

                  {/* Custom Package */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block font-bold text-slate-900 mb-1">Custom Starting (₹)</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.custom_price}
                      onChange={(e) => setTheatreForm({ ...theatreForm, custom_price: Number(e.target.value), base_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-extrabold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Room-only starting price</span>
                  </div>

                  {/* Premium Package */}
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                    <label className="block font-bold text-slate-900 mb-1">Premium VIP (₹)</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.premium_price}
                      onChange={(e) => setTheatreForm({ ...theatreForm, premium_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-extrabold text-amber-700"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Luxury fog walk-in + cake + decor</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Extra 1hr Rate */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <label className="block font-bold text-slate-900 mb-1">Extra 1 Hour Rate (₹)</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.extra_hour_rate}
                      onChange={(e) => setTheatreForm({ ...theatreForm, extra_hour_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-extrabold text-emerald-800"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">₹400 (Couple) / ₹750 (Celebration/Family)</span>
                  </div>

                  {/* Extra Person Price */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Extra Person Fee (₹)</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.extra_person_price}
                      onChange={(e) => setTheatreForm({ ...theatreForm, extra_person_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Per additional person charge</span>
                  </div>

                  {/* Seating Capacity */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Base Seating Capacity</label>
                    <input
                      type="number"
                      required
                      value={theatreForm.capacity}
                      onChange={(e) => setTheatreForm({ ...theatreForm, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Maximum guests before extra fee</span>
                  </div>
                </div>

                {/* Amenities text */}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Screen Features &amp; Amenities Specification</label>
                  <textarea
                    rows={2}
                    value={theatreForm.amenities}
                    onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdf9] border border-sky-200 font-medium"
                    placeholder="e.g. Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-sky-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTheatreModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-black shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
