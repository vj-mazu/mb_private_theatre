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
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
          Soft Deleted &amp; Cancelled Bookings
        </h1>
        <p className="text-xs text-ink/70 mt-1">
          Review cancelled or removed bookings. Revenue from deleted records is excluded from active financials.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-sand-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-royal-900">Loading ledger...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink/60">
            No soft-deleted or cancelled bookings found. All records active.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-[11px] font-bold uppercase tracking-wider text-royal-900">
                  <th className="py-3.5 px-4">Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Branch &amp; Date</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Refund Amount</th>
                  <th className="py-3.5 px-4">Deleted By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-sand-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-royal-700 whitespace-nowrap">
                      {b.booking_ref}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="block text-royal-900">{b.customer_name}</strong>
                      <span className="text-[11px] text-ink/60">{b.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span>{b.branch_name}</span>
                      <span className="text-[10px] text-ink/60 block">{b.booking_date}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-ink/80 truncate">
                      {b.cancelled_reason || b.notes || 'User/Admin requested removal'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-royal-900">
                      ₹{b.refund_amount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-ink/60 whitespace-nowrap">
                      {b.deleted_by || 'Staff Operator'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleRestore(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
