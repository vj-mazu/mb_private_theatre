import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import FloatingContact from '@/components/FloatingContact';

export const metadata = {
  title: 'Privacy Policy | Movie Bash Private Theatre',
  description: 'How Movie Bash handles your customer information, booking data, and communication preferences.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-playfair text-3xl sm:text-4xl font-black text-royal-900 mb-6">
          Privacy Policy
        </h1>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-soft text-ink/80 text-sm leading-relaxed space-y-6">
          <p>
            At Movie Bash, we respect your privacy and are committed to protecting the personal information you share with us when booking our private theatre facilities in Bengaluru.
          </p>

          <h2 className="font-bold text-base text-royal-900">1. Information We Collect</h2>
          <p>
            We collect information provided directly by you, including your name, WhatsApp phone number, email address, occasion preference, and any custom screen text or add-on requests.
          </p>

          <h2 className="font-bold text-base text-royal-900">2. How We Use Your Data</h2>
          <p>
            Your information is used solely to process your booking, dispatch WhatsApp directions and confirmation tokens, coordinate customized decorations and cakes, and offer customer support.
          </p>

          <h2 className="font-bold text-base text-royal-900">3. In-Theatre Privacy</h2>
          <p>
            Our screening halls offer 100% private viewing. There are strictly no cameras inside the private theatre rooms, ensuring complete comfort, security, and peace of mind for you and your guests.
          </p>

          <h2 className="font-bold text-base text-royal-900">4. Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or lease your personal contact details to any third-party marketing companies. Data is shared only with secure payment gateways (e.g. Razorpay) when online payments are made.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingContact />
    </main>
  );
}
