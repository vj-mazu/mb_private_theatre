'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Check, 
  Copy, 
  Smartphone, 
  QrCode, 
  MessageSquare, 
  ShieldCheck, 
  IndianRupee,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Clock,
  RotateCw
} from 'lucide-react';

interface UpiPaymentCardProps {
  bookingRef?: string;
  advanceAmount?: number;
  customerName?: string;
  onUtrChange?: (utr: string) => void;
  utrValue?: string;
  compact?: boolean;
}

export default function UpiPaymentCard({
  bookingRef = 'NEW-RESERVATION',
  advanceAmount = 500,
  customerName = '',
  onUtrChange,
  utrValue = '',
  compact = false
}: UpiPaymentCardProps) {
  const upiId = '9902923656@upi';
  const upiPhone = '+91 99029 23656';
  const payeeName = 'Movie Bash Private Theatre';
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'qr'>('mobile');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // 90-Second Dynamic Scanner Session Timer
  const [secondsLeft, setSecondsLeft] = useState(90);
  const isExpired = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleRefreshTimer = () => {
    setSecondsLeft(90);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  const upiTransactionNote = `Movie Bash Adv ${bookingRef}`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;

  // Direct app deep-links for mobile handsets
  const gpayUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;
  const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;

  // Construct WhatsApp screenshot share URL
  const whatsappShareText = encodeURIComponent(
    `🎬 *MOVIE BASH ADVANCE PAYMENT* 🍿\n\n` +
    `*Booking Ref:* ${bookingRef}\n` +
    `*Name:* ${customerName || 'Guest'}\n` +
    `*Advance Paid:* ₹${advanceAmount}\n\n` +
    `Hi Movie Bash team, I have completed the advance payment of ₹${advanceAmount}. Here is my payment screenshot for instant slot confirmation! 🎉`
  );
  const whatsappUrl = `https://wa.me/919902923656?text=${whatsappShareText}`;

  // Generate crisp QR code offline
  useEffect(() => {
    QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0B2238',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [upiUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('9902923656');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2200);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 border-2 border-[#00A2E4]/30 shadow-[0_16px_40px_rgba(239,74,35,0.08)] p-5 sm:p-6 space-y-5">
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-orange-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00A2E4] to-[#ff7a59] text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-playfair text-lg font-black text-slate-900 leading-tight">
              UPI Advance Payment Desk
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Lock your private cinema suite instantly with zero gateway fees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Advance ₹{advanceAmount}</span>
        </div>
      </div>

      {/* Official Mandatory Terms & Conditions Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fff7f2] via-white to-[#E6F3FB] border-2 border-orange-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00A2E4]">
          <Sparkles className="w-4 h-4 text-[#00A2E4]" />
          <span>Booking Terms &amp; Conditions</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-800 font-semibold pl-1">
          <li className="flex items-start gap-2">
            <span className="text-[#00A2E4] font-black text-sm leading-none mt-0.5">•</span>
            <span>
              <strong>Kindly send an advance of ₹{advanceAmount} to book the slot.</strong> The remaining amount can be paid after the event.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A2E4] font-black text-sm leading-none mt-0.5">•</span>
            <span>
              <strong>Please share a screenshot once the advance payment is completed</strong> on our official Movie Bash WhatsApp (+91 99029 23656).
            </span>
          </li>
        </ul>
      </div>

      {/* Payment Mode Selector Tabs (Mobile 1-Tap vs QR Scanner) */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'mobile'
              ? 'bg-[#00A2E4] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Pay on this Mobile (1-Tap UPI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-[#00A2E4] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scan UPI QR Code</span>
        </button>
      </div>

      {/* TAB 1: MOBILE DIRECT 1-TAP UPI APP INTENT */}
      {activeTab === 'mobile' && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-slate-700 block">
              Browsing on your phone? Tap any app below to pay ₹{advanceAmount} directly without scanning:
            </span>
          </div>

          {/* Native UPI Intent App Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* Google Pay */}
            <a
              href={gpayUrl}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#00A2E4] shadow-xs flex flex-col items-center justify-center text-center transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg font-black text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                G
              </div>
              <span className="text-xs font-black text-slate-900">Google Pay</span>
              <span className="text-[10px] text-slate-500 font-medium">1-Tap Open</span>
            </a>

            {/* PhonePe */}
            <a
              href={phonepeUrl}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#00A2E4] shadow-xs flex flex-col items-center justify-center text-center transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-lg font-black text-purple-600 mb-1 group-hover:scale-110 transition-transform">
                Pe
              </div>
              <span className="text-xs font-black text-slate-900">PhonePe</span>
              <span className="text-[10px] text-slate-500 font-medium">1-Tap Open</span>
            </a>

            {/* Paytm */}
            <a
              href={paytmUrl}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#00A2E4] shadow-xs flex flex-col items-center justify-center text-center transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-lg font-black text-sky-600 mb-1 group-hover:scale-110 transition-transform">
                Pay
              </div>
              <span className="text-xs font-black text-slate-900">Paytm</span>
              <span className="text-[10px] text-slate-500 font-medium">1-Tap Open</span>
            </a>

            {/* Any UPI App */}
            <a
              href={upiUrl}
              className="p-3 rounded-2xl bg-gradient-to-br from-[#E6F3FB] to-white hover:bg-[#ffe6db] border-2 border-[#00A2E4]/40 shadow-xs flex flex-col items-center justify-center text-center transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00A2E4] text-white flex items-center justify-center text-lg font-black mb-1 group-hover:scale-110 transition-transform shadow-xs">
                UPI
              </div>
              <span className="text-xs font-black text-[#00A2E4]">Any UPI App</span>
              <span className="text-[10px] text-slate-600 font-medium">BHIM / Cred</span>
            </a>

          </div>

          {/* Quick Copy UPI ID / Phone Option */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold block text-[11px]">Official Movie Bash UPI ID:</span>
              <span className="font-mono font-black text-slate-900 text-sm">{upiId}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 font-extrabold text-slate-800 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 font-extrabold text-slate-800 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span>{copiedPhone ? 'Copied!' : 'Copy Number'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCAN UPI QR CODE (DESKTOP OR SECOND PHONE) */}
      {activeTab === 'qr' && (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
          
          {/* 90-Second Dynamic Scanner Session Timer Banner */}
          <div className="w-full max-w-sm space-y-2">
            <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
              isExpired 
                ? 'bg-red-50 border-red-300 text-red-900 shadow-xs' 
                : secondsLeft <= 25 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : 'bg-gradient-to-r from-orange-50 via-white to-amber-50 border-orange-200/90 text-orange-950 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 text-left">
                <Clock className={`w-4 h-4 shrink-0 ${isExpired ? 'text-red-600' : 'text-[#00A2E4]'}`} />
                <div>
                  <span className="text-xs font-black block leading-tight">
                    {isExpired ? 'QR Code Expired for Security' : 'Active Scanner Session'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    {isExpired ? 'Click refresh to create new 90s code' : 'Scan within 90s to hold your slot'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-2xs border ${
                  isExpired 
                    ? 'bg-red-100 text-red-700 border-red-200' 
                    : 'bg-white text-[#00A2E4] border-orange-200'
                }`}>
                  {formattedTime}
                </span>
                {isExpired && (
                  <button
                    type="button"
                    onClick={handleRefreshTimer}
                    className="p-1.5 rounded-xl bg-[#00A2E4] text-white hover:bg-[#0072AE] shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1 text-[11px] font-black"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Progress Indicator (90 seconds drain) */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  isExpired 
                    ? 'bg-red-500 w-0' 
                    : secondsLeft <= 25 
                      ? 'bg-amber-500' 
                      : 'bg-gradient-to-r from-[#00A2E4] to-[#ff7a59]'
                }`}
                style={{ width: `${(secondsLeft / 90) * 100}%` }}
              />
            </div>
          </div>

          {/* QR Code Container with Expiry Overlay */}
          <div className="relative p-4 rounded-3xl bg-white border-2 border-slate-300 shadow-md">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Movie Bash UPI QR Scanner"
                className={`w-52 h-52 sm:w-60 sm:h-60 rounded-xl transition-all duration-300 ${
                  isExpired ? 'blur-sm opacity-40 grayscale' : 'opacity-100'
                }`}
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-xl text-xs text-slate-500 font-bold">
                Generating Dynamic UPI QR Code...
              </div>
            )}

            {/* Expired State Overlay */}
            {isExpired ? (
              <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs text-white text-center space-y-2">
                <Clock className="w-8 h-8 text-amber-300 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-wider">
                  QR Session Expired (90s)
                </span>
                <p className="text-[11px] text-slate-200 font-medium">
                  To prevent double-booking, UPI QR codes refresh every 90 seconds.
                </p>
                <button
                  type="button"
                  onClick={handleRefreshTimer}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#00A2E4] hover:bg-[#0072AE] text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Refresh QR Scanner</span>
                </button>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-950/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20">
                  Scan &amp; Pay ₹{advanceAmount}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-xs text-slate-800 block">
              Scan with GPay, PhonePe, Paytm, BHIM or any UPI banking app
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              Payee: <strong>{payeeName}</strong> &bull; UPI: <strong>{upiId}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Step 2 Actions: Share Screenshot on WhatsApp & Enter UTR Reference */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        
        {/* Share Screenshot WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-[#25D366]/30 transition-all flex items-center justify-center gap-2 cursor-pointer ring-4 ring-[#25D366]/20"
        >
          <MessageSquare className="w-4 h-4 fill-white shrink-0" />
          <span>Share Advance Screenshot on WhatsApp (+91 99029 23656)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        {/* Optional UTR / Transaction No. Input */}
        {onUtrChange && (
          <div className="pt-1">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              UPI Reference / 12-Digit UTR Number (Optional):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={utrValue}
                onChange={(e) => onUtrChange(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                placeholder="e.g. 431289123456 (from your payment receipt)"
                maxLength={20}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A2E4] focus:bg-white transition-colors"
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              Entering your UPI reference number helps our venue team instantly match your payment.
            </span>
          </div>
        )}

      </div>

    </div>
  );
}
