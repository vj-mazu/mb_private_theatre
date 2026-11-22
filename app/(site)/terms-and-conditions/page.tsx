
export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for booking private theatre screens at Movie Bash Bengaluru (Electronic City & BTM 2nd Stage).',
};

export default function TermsPage() {
  return (
    <main>

      <div className="container-page max-w-3xl py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy mb-6">
          Terms &amp; Conditions
        </h1>

        <div className="bg-cream-card p-8 sm:p-10 rounded-3xl border border-line shadow-card text-navy-soft text-sm leading-relaxed space-y-6">
          <p>
            Welcome to Movie Bash Private Theatre (&ldquo;Movie Bash&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By reserving a screening slot or using our services at our Electronic City or BTM 2nd Stage branches in Bengaluru, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="font-bold text-base text-navy">1. Booking &amp; Slot Confirmation</h2>
          <p>
            All bookings are for private, exclusive use of the designated theatre for the duration of the scheduled time slot (typically 2 hours). Advance payment of ₹500 or full online payment is required to lock in your slot.
          </p>

          <h2 className="font-bold text-base text-navy">2. Rescheduling &amp; Cancellation (72-Hour Rule)</h2>
          <p>
            Any reschedule request must be communicated at least <strong>72 hours prior</strong> to the scheduled slot start time. Rescheduling requested within 72 hours of the slot is subject to availability and may incur a slot retention fee.
          </p>

          <h2 className="font-bold text-base text-navy">3. Prohibited Activities</h2>
          <p>
            Alcohol consumption, smoking (including e-cigarettes and vapes), and illicit substances are strictly prohibited across all Movie Bash properties. Violators will be evicted immediately without refund and reported to local authorities.
          </p>

          <h2 className="font-bold text-base text-navy">4. Age Restrictions</h2>
          <p>
            Guests booking Couple Show slots must be 18 years of age or older. Minors below 18 years are welcome when accompanied by parents or adult family members for Family Show bookings.
          </p>

          <h2 className="font-bold text-base text-navy">5. Outside Food Policy</h2>
          <p>
            Outside food and non-alcoholic beverages are warmly permitted. Guests are expected to maintain general cleanliness. We also permit Swiggy/Zomato deliveries to our reception.
          </p>

          <h2 className="font-bold text-base text-navy">6. Technical &amp; Safety Compliance</h2>
          <p>
            In the rare event of an unforeseen power failure or technical disruption, our team will provide a priority reschedule or partial refund proportionate to the lost screening time.
          </p>

          <h2 className="font-bold text-base text-navy">7. Jurisdiction</h2>
          <p>
            These terms are governed by the laws of India and subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
          </p>
        </div>
      </div>

      
      
    </main>
  );
}
