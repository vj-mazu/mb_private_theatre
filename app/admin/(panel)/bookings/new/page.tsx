import { PageHeader } from '@/components/admin/AdminShell';
import { BookingForm } from '@/components/admin/BookingForm';

export default function NewBookingPage() {
  return (
    <>
      <PageHeader title="New booking" subtitle="Walk-in, WhatsApp or phone booking — confirmed immediately" />
      <BookingForm />
    </>
  );
}
