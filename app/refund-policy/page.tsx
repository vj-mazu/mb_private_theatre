import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import FloatingContact from '@/components/FloatingContact';

export const metadata = {
  title: 'Refund & Cancellation Policy | Movie Bash Private Theatre',
  description: 'Understand Movie Bash cancellation deadlines, refund terms, and rescheduling guidelines.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-playfair text-3xl sm:text-4xl font-black text-royal-900 mb-6">
          Refund &amp; Cancellation Policy
        </h1>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-soft text-ink/80 text-sm leading-relaxed space-y-6">
          <p>
            Because our private theatre slots are exclusively blocked for your party and cannot be double-booked, we operate under clear cancellation and rescheduling parameters.
          </p>

          <h2 className="font-bold text-base text-royal-900">1. Cancellations 72+ Hours Before Event</h2>
          <p>
            If you cancel or request a reschedule at least 72 hours before your booked time slot, you are eligible for 100% free rescheduling to another date or a full refund of your advance deposit.
          </p>

          <h2 className="font-bold text-base text-royal-900">2. Cancellations Within 72 Hours</h2>
          <p>
            Cancellations made within 72 hours of the scheduled slot cannot be refunded, as preparations (cakes, balloons, floral arrangements) are already initiated and the slot cannot be re-sold on short notice. Rescheduling may be offered at the discretion of the branch manager depending on slot availability.
          </p>

          <h2 className="font-bold text-base text-royal-900">3. Technical Disruptions</h2>
          <p>
            In the event of an unavoidable technical failure or power disruption on our part that cannot be resolved within 20 minutes, a prorated refund or a complimentary rescheduled slot will be provided.
          </p>

          <h2 className="font-bold text-base text-royal-900">4. Refund Processing Time</h2>
          <p>
            Approved refunds will be processed back to the original mode of payment (UPI or bank account) within 5 to 7 business days.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingContact />
    </main>
  );
}
