'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AdminDeletedBookingsPage() {
  const [bookings, setBookings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings?deleted=true');
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/restore`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        fetchDeleted();
      } else {
        alert(data.error || 'Failed to restore');
      }
    } catch (e) {
      alert('Error restoring booking');
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm('Permanent delete cannot be undone. Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchDeleted();
      } else {
        alert(data.error || 'Failed to permanently delete');
      }
    } catch (e) {
      alert('Error permanently deleting booking');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Audit &amp; Recovery</span>
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink">
          Soft Deleted &amp; Cancelled Bookings
        </h1>
        <p className="text-xs text-ink/70 mt-1">
          Review cancelled or removed bookings. Revenue from deleted records is excluded from active financials.
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-ink">Loading ledger...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink/60">
            No soft-deleted or cancelled bookings found. All records active.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-800">
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Ref</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Customer</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Branch &amp; Date</th>
                  <th className="py-3 px-3.5 border border-slate-300">Reason / Notes</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Refund Amount</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Deleted By</th>
                  <th className="py-3 px-3.5 border border-slate-300 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="even:bg-slate-50/70 hover:bg-sky-50/70 transition-colors">
                    <td className="py-3 px-3.5 border border-slate-300 font-mono font-bold text-[#ef4a23] whitespace-nowrap align-middle">
                      <span className="bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                        {b.booking_ref}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 align-middle">
                      <strong className="block text-slate-900 font-black">{b.customer_name}</strong>
                      <span className="text-[11px] text-slate-600 font-semibold">{b.customer_phone}</span>
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 whitespace-nowrap align-middle">
                      <span className="font-bold text-slate-800">{b.branch_name}</span>
                      <span className="text-[10.5px] text-slate-600 font-medium block mt-0.5">{b.booking_date}</span>
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 max-w-xs text-slate-700 truncate align-middle">
                      {b.cancelled_reason || b.notes || 'User/Admin requested removal'}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 whitespace-nowrap font-black text-slate-900 align-middle">
                      ₹{b.refund_amount || 0}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-slate-700 whitespace-nowrap align-middle">
                      <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                        {b.deleted_by || 'Staff Operator'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-right whitespace-nowrap space-x-2 align-middle">
                      <button
                        onClick={() => handleRestore(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Purge</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
