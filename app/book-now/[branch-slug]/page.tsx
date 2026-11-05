import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingWizard from '@/components/BookingWizard';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';

export default function BranchBookNowPage({ params }: { params: { 'branch-slug': string } }) {
  const slug = params['branch-slug'];
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />
      
      <div className="flex-1 py-8 sm:py-12">
        <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-royal-900">Loading Booking Wizard...</div>}>
          <BookingWizard initialBranch={slug} />
        </Suspense>
      </div>

      <Footer />
      <FloatingContact />
    </main>
  );
}
