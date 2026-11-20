'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  // Official Movie Bash FAQ (copied from moviebash.in)
  const faqs = [
    {
      q: 'How many screens do you have in Movie Bash?',
      a: 'Movie Bash has three private screens at Electronic City — Couple, Celebration and Family — and four themed private theatres at BTM 2nd Stage.',
    },
    {
      q: 'What if we book and postpone the date of the event? What is the procedure?',
      a: 'Any postponement must be informed at least 72 hours before your scheduled slot. We will move your booking to another available date and time.',
    },
    {
      q: 'Is alcohol served at Movie Bash, and is smoking permitted?',
      a: 'No. Alcohol consumption and smoking, including vapes, are strictly prohibited across all Movie Bash premises.',
    },
    {
      q: 'Is there any specific age restriction for booking at Movie Bash?',
      a: 'Yes, guests must be 18 and above. Guests below 18 are allowed when accompanied by their family members or guardians.',
    },
    {
      q: 'Is outside food allowed?',
      a: 'Yes. Outside food and beverages are allowed, and you can also order from Swiggy or Zomato directly to either branch.',
    },
    {
      q: 'Is 2-wheeler and 4-wheeler parking available?',
      a: 'Yes, parking is available for both two-wheelers and four-wheelers at Electronic City and BTM 2nd Stage.',
    },
    {
      q: 'Can we bring our own pet to Movie Bash?',
      a: 'No, pets are not allowed inside the private screening rooms.',
    },
    {
      q: 'What if there is a technical issue during the event?',
      a: 'A partial refund is provided as per our terms and conditions, and our team will help you reschedule wherever possible.',
    },
    {
      q: 'What type of decorations do you have, and how often do you change them?',
      a: 'We offer Love, Birthday, Anniversary and Celebration themes, along with neon lettering and balloon setups. We also customise the décor to your requirement.',
    },
    {
      q: 'What type of add-ons do you have?',
      a: 'Cake, snacks, food, fog entry, cold fire, special decoration, baby cart entry and more. Add-ons and cake flavours are selected while booking.',
    },
    {
      q: 'When can we book the add-ons?',
      a: 'You can book add-ons while reserving the room, or a day before the event.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-cream" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold mb-3 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-ink tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600 font-medium">
            Everything you need to know about booking, policies, and special celebration setups at Movie Bash.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-sky-100 bg-white shadow-[0_4px_16px_rgba(22,48,79,0.04)] overflow-hidden transition-all hover:border-sky-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-ink hover:text-[#00A2E4] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#00A2E4] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-stone-200/60 animate-in fade-in">
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
