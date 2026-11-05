import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingWizard from '@/components/BookingWizard';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata = {
  title: 'Book Private Theatre in BTM 2nd Stage | Movie Bash Bengaluru',
  description: 'Book private screen celebrations in BTM 2nd Stage near Udupi Garden. Couple, Celebration, and Family 4K screens.',
};

export default function BTMBookingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />
      <div className="flex-1 py-8 sm:py-12">
        <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-royal-900">Loading BTM 2nd Stage Booking...</div>}>
          <BookingWizard initialBranch="btm-stage-2" />
        </Suspense>
      </div>
      <Footer />
      <FloatingContact />
    </main>
  );
}
