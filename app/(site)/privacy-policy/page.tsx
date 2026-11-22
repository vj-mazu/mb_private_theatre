
export const metadata = {
  title: 'Privacy Policy',
  description: 'How Movie Bash handles your customer information, booking data, and communication preferences.',
};

export default function PrivacyPolicyPage() {
  return (
    <main>

      <div className="container-page max-w-3xl py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy mb-6">
          Privacy Policy
        </h1>

        <div className="bg-cream-card p-8 sm:p-10 rounded-3xl border border-line shadow-card text-navy-soft text-sm leading-relaxed space-y-6">
          <p>
            At Movie Bash, we respect your privacy and are committed to protecting the personal information you share with us when booking our private theatre facilities in Bengaluru.
          </p>

          <h2 className="font-bold text-base text-navy">1. Information We Collect</h2>
          <p>
            We collect information provided directly by you, including your name, WhatsApp phone number, email address, occasion preference, and any custom screen text or add-on requests.
          </p>

          <h2 className="font-bold text-base text-navy">2. How We Use Your Data</h2>
          <p>
            Your information is used solely to process your booking, dispatch WhatsApp directions and confirmation tokens, coordinate customized decorations and cakes, and offer customer support.
          </p>

          <h2 className="font-bold text-base text-navy">3. In-Theatre Privacy</h2>
          <p>
            Our screening halls offer 100% private viewing. There are strictly no cameras inside the private theatre rooms, ensuring complete comfort, security, and peace of mind for you and your guests.
          </p>

          <h2 className="font-bold text-base text-navy">4. Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or lease your personal contact details to any third-party marketing companies. Data is processed securely for UPI and direct venue reservation transactions.
          </p>
        </div>
      </div>

      
      
    </main>
  );
}
