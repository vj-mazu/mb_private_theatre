'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch_name: 'Electronic City',
    preferred_date: '',
    guests: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill all required fields (Name, Phone, Message).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit enquiry.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-royal-950 to-royal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Get in Touch</span>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight">
            Contact Movie Bash
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-normal">
            Have questions about group bookings, custom decoration themes, or booking a special slot? We&apos;re here to assist.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-soft">
              <h2 className="font-playfair text-2xl font-bold text-royal-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs text-ink/70 mb-6">
                Fill out the form below and our celebration manager will call you within 30 minutes.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-lg text-emerald-900">Enquiry Submitted!</h3>
                  <p className="text-xs text-emerald-800">
                    Thank you! Our event manager will contact you on your mobile number shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Aditi Rao"
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aditi@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Preferred Branch
                      </label>
                      <select
                        value={formData.branch_name}
                        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                      >
                        <option value="Electronic City">Electronic City Branch</option>
                        <option value="BTM 2nd Stage">BTM 2nd Stage Branch</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Tentative Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                        Estimated Guests
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="e.g. 6"
                        className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-royal-900 uppercase tracking-wider mb-1">
                      Your Message / Enquiry *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you're planning: birthday, anniversary, special themes, or specific timing requirements..."
                      className="w-full px-4 py-2.5 rounded-xl bg-sand-50 border border-sand-300 text-xs font-medium text-royal-900 focus:outline-none focus:border-royal-700"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Enquiry...' : 'Submit Enquiry'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right: Branch Info Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Branch 1 */}
              <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-soft space-y-4">
                <span className="px-3 py-1 rounded-full bg-royal-100 text-royal-700 text-[10px] font-black uppercase">
                  Flagship Branch
                </span>
                <h3 className="font-playfair text-xl font-bold text-royal-900">
                  Movie Bash – Electronic City
                </h3>
                <p className="text-xs text-ink/75 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-royal-700 shrink-0 mt-0.5" />
                  <span>MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100</span>
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                  <a href="tel:+919902923656" className="text-royal-700 flex items-center gap-1.5 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> +91 99029 23656
                  </a>
                  <a
                    href="https://maps.google.com/?q=Movie+Bash+Electronic+City"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-600 hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-soft space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                  Newly Launched
                </span>
                <h3 className="font-playfair text-xl font-bold text-royal-900">
                  Movie Bash – BTM 2nd Stage
                </h3>
                <p className="text-xs text-ink/75 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-royal-700 shrink-0 mt-0.5" />
                  <span>MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076</span>
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                  <a href="tel:+919902923656" className="text-royal-700 flex items-center gap-1.5 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> +91 99029 23656
                  </a>
                  <a
                    href="https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-600 hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Instant WhatsApp Support Box */}
              <div className="p-6 rounded-3xl bg-emerald-900 text-white shadow-elevated space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm">Need Instant Confirmation?</h4>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Chat directly with our Bangalore venue manager on WhatsApp for fast availability and special package quotes.
                </p>
                <a
                  href="https://wa.me/919902923656?text=Hi%20Movie%20Bash!%20I%20have%20an%20enquiry%20regarding%20booking%20a%20private%20screening."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-royal-950 font-bold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp +91 99029 23656</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
      <FloatingContact />
    </main>
  );
}
