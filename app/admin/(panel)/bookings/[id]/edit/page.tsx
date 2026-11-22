'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import { BookingForm } from '@/components/admin/BookingForm';
import { api } from '@/components/ui';

export default function EditBookingPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { api(`/api/admin/bookings/${params.id}`).then(setData).catch((e) => setError(e.message)); }, [params.id]);

  return (
    <>
      <PageHeader title={data ? `Edit ${data.booking.ref}` : 'Edit booking'} subtitle="Change date or slot here to reschedule — the guest is notified on WhatsApp" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data ? <BookingForm bookingId={data.booking.id} initial={data.input} amountPaid={data.booking.amount_paid} /> : !error && <div className="skeleton h-96" />}
    </>
  );
}
