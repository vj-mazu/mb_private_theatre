import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingWizard from '@/components/BookingWizard';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata = {
  title: 'Book Private Theatre in Electronic City | Movie Bash Bengaluru',
  description: 'Book private screen celebrations in Electronic City. Couple, Celebration, and Family 4K screens near Sri Vishnu Grand.',
};

export default function ElectronicCityBookingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />
      <div className="flex-1 py-8 sm:py-12">
        <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-royal-900">Loading Electronic City Booking...</div>}>
          <BookingWizard initialBranch="electronic-city" />
        </Suspense>
      </div>
      <Footer />
      <FloatingContact />
    </main>
  );
}
