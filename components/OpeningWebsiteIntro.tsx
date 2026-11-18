'use client';

import React, { useEffect, useState } from 'react';
import MovieBashLogo from './MovieBashLogo';

export default function OpeningWebsiteIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const dismissIntro = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('mb_intro_seen', 'true');
      } catch (_) {}
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasSeen = sessionStorage.getItem('mb_intro_seen');
        if (hasSeen) {
          setIsVisible(false);
          return;
        }
      } catch (_) {}
    }

    // 2.2s display duration for fast, crisp user experience
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    const finishTimer = setTimeout(() => {
      dismissIntro();
    }, 2600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      onClick={dismissIntro}
      role="banner"
      aria-label="Movie Bash Intro"
      className="fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center pointer-events-auto cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at center, #FFE6D9 0%, #FAF3E4 75%)',
        backgroundColor: '#FAF3E4',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Skip button for instant navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          dismissIntro();
        }}
        className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#141110] text-xs font-semibold backdrop-blur-sm transition-all"
        aria-label="Skip intro"
      >
        Skip ✕
      </button>

      {/* Logo Container */}
      <div
        className="flex flex-col items-center px-4"
        style={{
          animation: 'logoReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div className="w-[280px] sm:w-[350px] drop-shadow-[0_4px_24px_rgba(20,17,16,0.14)]">
          <MovieBashLogo className="w-full h-auto" />
        </div>
      </div>

      <style jsx>{`
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
