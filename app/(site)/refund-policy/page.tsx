
export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Understand Movie Bash cancellation deadlines, refund terms, and rescheduling guidelines.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <div>

      <div className="container-page max-w-3xl py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy mb-6">
          Refund &amp; Cancellation Policy
        </h1>

        <div className="bg-cream-card p-8 sm:p-10 rounded-3xl border border-line shadow-card text-navy-soft text-sm leading-relaxed space-y-6">
          <p>
            Because our private theatre slots are exclusively blocked for your party and cannot be double-booked, we operate under clear cancellation and rescheduling parameters.
          </p>

          <h2 className="font-bold text-base text-navy">1. Cancellations 72+ Hours Before Event</h2>
          <p>
            If you cancel or request a reschedule at least 72 hours before your booked time slot, you are eligible for 100% free rescheduling to another date or a full refund of your advance deposit.
          </p>

          <h2 className="font-bold text-base text-navy">2. Cancellations Within 72 Hours</h2>
          <p>
            Cancellations made within 72 hours of the scheduled slot cannot be refunded, as preparations (cakes, balloons, floral arrangements) are already initiated and the slot cannot be re-sold on short notice. Rescheduling may be offered at the discretion of the branch manager depending on slot availability.
          </p>

          <h2 className="font-bold text-base text-navy">3. Technical Disruptions</h2>
          <p>
            In the event of an unavoidable technical failure or power disruption on our part that cannot be resolved within 20 minutes, a prorated refund or a complimentary rescheduled slot will be provided.
          </p>

          <h2 className="font-bold text-base text-navy">4. Refund Processing Time</h2>
          <p>
            Approved refunds will be processed back to the original mode of payment (UPI or bank account) within 5 to 7 business days.
          </p>
        </div>
      </div>

      
      
    </div>
  );
}
