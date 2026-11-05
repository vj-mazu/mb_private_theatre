'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const faqs = [
    {
      q: 'How many screens do you have?',
      a: 'Movie Bash consists of 3 dedicated private screens per branch: Couple Theater (up to 2 guests), Celebration Theater (up to 6 guests), and Family Theater (up to 12-20 guests). Each screen has its own private room and entrance.',
    },
    {
      q: 'What if we book and postpone the event date?',
      a: 'Any postponement or reschedule must be informed at least 72 hours before your scheduled time slot to reschedule with zero penalty fee.',
    },
    {
      q: 'Is alcohol served / smoking permitted?',
      a: 'No, alcohol consumption and smoking (including vapes) are strictly prohibited across all Movie Bash premises.',
    },
    {
      q: 'Age restrictions?',
      a: 'Guests must be 18 and above for couple bookings. Guests below 18 are warmly allowed when accompanied by family members or guardians.',
    },
    {
      q: 'Is outside food allowed?',
      a: 'Yes! Outside food and beverages are completely permitted. You can also order your favorite food from Swiggy or Zomato directly to our branch address.',
    },
    {
      q: 'Is 2-wheeler & 4-wheeler parking available?',
      a: 'Yes, ample dedicated parking space for both two-wheelers and four-wheelers is readily available at both Electronic City and BTM branches.',
    },
    {
      q: 'Can we bring pets?',
      a: 'No, pets are not permitted inside the private screening rooms to maintain allergen-free hygiene standards for all guests.',
    },
    {
      q: 'What if a technical issue occurs during the event?',
      a: 'In the extremely rare event of an unresolved technical disruption, a partial refund or priority free slot reschedule is provided as per our terms and conditions.',
    },
    {
      q: 'What decorations do you have?',
      a: 'We offer Love, Birthday, Anniversary, and Celebration themes, along with Neon LED milestone numbers, metallic balloon arches, and custom decorations tailored to your needs.',
    },
    {
      q: 'What add-ons do you have?',
      a: 'We offer Fresh Cakes, Buttery Popcorn & Snacks, Magical Fog Entry, Cold Fire Pyro Sparklers, Special Decor, Baby Cart Entry, Photography Sessions, and Dutch Rose Bouquets.',
    },
    {
      q: 'When can we book add-ons?',
      a: 'You can book add-ons directly while reserving your room online, or anytime up to 24 hours before your scheduled show by contacting our support team.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-10 sm:py-24 bg-sand-50" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-100 text-royal-700 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-ink/75">
            Everything you need to know about booking, policies, and special celebration setups at Movie Bash.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-sand-200 bg-white shadow-soft overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-royal-900 hover:text-royal-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-royal-700 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-ink/80 leading-relaxed border-t border-sand-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
