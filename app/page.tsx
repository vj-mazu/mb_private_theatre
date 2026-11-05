import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BranchMarquee from '@/components/BranchMarquee';
import HomeIntro from '@/components/HomeIntro';
import HomeStats from '@/components/HomeStats';
import WhyChooseUs from '@/components/WhyChooseUs';
import VenuesSection from '@/components/VenuesSection';
import TheatresSlotsSection from '@/components/TheatresSlotsSection';
import OccasionsSection from '@/components/OccasionsSection';
import WhatWeProvideSection from '@/components/WhatWeProvideSection';
import AddonsStrip from '@/components/AddonsStrip';
import TestimonialsSection from '@/components/TestimonialsSection';
import SocialHighlights from '@/components/SocialHighlights';
import FaqSection from '@/components/FaqSection';
import FinalCtaBanner from '@/components/FinalCtaBanner';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navbar */}
      <Navbar />

      {/* 3. Hero Section (Reelmark arched video carousel + Gala Town booking bar) */}
      <HeroSection />

      {/* 4. Branch Marquee Strip */}
      <BranchMarquee />

      {/* 5. Intro / About */}
      <HomeIntro />

      {/* 6. Animated Stats Row */}
      <HomeStats />

      {/* 7. Why Choose Us (01-05 cards) */}
      <WhyChooseUs />

      {/* 8. Our Venues (Electronic City & BTM) */}
      <VenuesSection />

      {/* 9. Theatres & Time Slots (Per branch tabs & slots) */}
      <TheatresSlotsSection />

      {/* 10. Celebrate Occasions Grid */}
      <OccasionsSection />

      {/* 11. What We Provide / Celebration Needs (01-06) */}
      <WhatWeProvideSection />

      {/* 12. Add-ons Strip */}
      <AddonsStrip />

      {/* 13. Trusted By Our Guests (Testimonials) */}
      <TestimonialsSection />

      {/* 14. Social Highlights / Instagram */}
      <SocialHighlights />

      {/* 15. FAQ Accordion */}
      <FaqSection />

      {/* 16. Final CTA Banner */}
      <FinalCtaBanner />

      {/* 17. Footer */}
      <Footer />

      {/* 18. Global Floating Contact Widgets */}
      <FloatingContact />
    </main>
  );
}
