'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Authentic Opening Reveal Loader in the exact signature style of https://www.thelabanspot.com/
 * 
 * Features:
 * - Solid Royal Midnight Navy (#082052) luxury cinema canvas.
 * - Centerline cursive script vector calligraphy for "Movie Bash".
 * - Glowing fountain pen nib circle (#ldNib) moving continuously along the stroke paths,
 *   tracing each letter in real-time.
 * - Dynamic SVG dashoffset interpolation driven by requestAnimationFrame.
 * - Live percentage indicator (0% to 100%) with an electric cyan (#00A2E4) track bar.
 * - Luxury serif italic tagline: "Your Moment. Your Movie. Your Theatre."
 * - Soft luminous shine (is-flowing) upon 100% completion.
 * - Smooth curtain lift-away (translateY(-101%)) with silk cubic-bezier ease.
 * - Responsive SVG scaling across all screen sizes (mobile 320px to 4K displays).
 * - Instant Skip button.
 */

const STROKES_CONFIG = [
  {
    id: 'stroke-M',
    dataA: 0.00000,
    dataB: 0.16327,
    d: 'M 75 155 C 85 135, 95 75, 115 65 C 128 58, 138 80, 145 110 C 153 140, 158 165, 162 165 C 166 165, 182 80, 200 72 C 212 68, 222 88, 228 118 C 234 148, 238 165, 242 165 C 248 165, 265 88, 280 82 C 292 78, 302 98, 305 125 C 308 150, 312 165, 320 165 C 328 165, 338 150, 350 130',
  },
  {
    id: 'stroke-ovie',
    dataA: 0.16327,
    dataB: 0.36735,
    d: 'M 350 130 C 360 115, 380 115, 392 128 C 402 140, 400 162, 386 167 C 372 172, 358 162, 360 142 C 362 122, 382 118, 396 122 C 408 125, 418 132, 424 142 C 430 152, 434 165, 440 167 C 446 167, 456 142, 464 125 C 470 120, 476 122, 482 130 C 488 138, 492 158, 496 165 C 500 167, 506 158, 512 142 C 518 128, 528 124, 534 132 C 540 140, 538 162, 528 167 C 518 171, 512 162, 518 148 C 524 136, 534 132, 546 140 C 558 150, 570 165, 584 167',
  },
  {
    id: 'stroke-idot',
    dataA: 0.36735,
    dataB: 0.38776,
    d: 'M 490 102 C 492 98, 496 98, 498 102 C 499 106, 495 109, 491 107 Z',
  },
  {
    id: 'stroke-B',
    dataA: 0.38776,
    dataB: 0.56463,
    d: 'M 625 65 C 618 95, 610 140, 605 165 C 601 172, 594 172, 590 165 C 586 158, 595 145, 604 135 C 614 120, 620 80, 630 62 C 640 48, 670 48, 680 65 C 688 78, 682 102, 662 110 C 650 114, 642 114, 652 116 C 670 118, 698 130, 694 154 C 690 170, 665 174, 646 170 C 632 166, 628 155, 640 150 C 648 146, 658 152, 668 158 C 676 162, 685 160, 696 146',
  },
  {
    id: 'stroke-ash',
    dataA: 0.56463,
    dataB: 0.76871,
    d: 'M 696 146 C 705 132, 718 120, 730 118 C 742 116, 750 126, 746 142 C 740 160, 724 168, 712 162 C 704 158, 704 144, 714 128 C 722 118, 738 118, 744 128 C 748 136, 744 158, 750 165 C 756 167, 764 150, 772 132 C 778 120, 786 122, 788 130 C 790 142, 780 156, 772 164 C 766 170, 772 174, 780 170 C 788 166, 798 154, 808 135 C 816 116, 828 72, 836 56 C 840 46, 848 50, 844 68 C 838 102, 828 142, 824 165 C 828 148, 838 126, 850 120 C 860 114, 870 122, 868 142 C 866 155, 864 165, 872 165 C 880 165, 890 155, 900 142',
  },
  {
    id: 'stroke-swoop',
    dataA: 0.76871,
    dataB: 1.00000,
    d: 'M 900 142 C 916 130, 942 138, 955 156 C 962 170, 950 186, 922 195 C 868 212, 770 222, 642 225 C 495 226, 330 220, 190 205 C 145 200, 105 192, 92 184 C 86 180, 90 172, 102 170 C 118 168, 142 174, 172 178',
  },
];

export default function OpeningWebsiteIntro() {
  const [isMounted, setIsMounted] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [pctText, setPctText] = useState('0');
  const [isWriting, setIsWriting] = useState(false);
  const [isFlowing, setIsFlowing] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const nibRef = useRef<SVGCircleElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const removeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setIsMounted(false);
      window.dispatchEvent(new Event('mb:intro-done'));
      return;
    }

    const svg = svgRef.current;
    const nib = nibRef.current;
    if (!svg || !nib) return;

    // Cache paths and calculate exact lengths
    const pathEls = Array.from(svg.querySelectorAll<SVGPathElement>('.ld__ink'));
    const strokeItems = pathEls.map((p) => {
      const a = parseFloat(p.getAttribute('data-a') || '0');
      const b = parseFloat(p.getAttribute('data-b') || '1');
      let len = 100;
      try {
        len = p.getTotalLength();
      } catch (_) {}
      p.style.strokeDasharray = `${len.toFixed(2)} ${(len + 2).toFixed(2)}`;
      p.style.strokeDashoffset = len.toFixed(2);
      p.style.visibility = 'hidden';
      return { el: p, a, b, len };
    });

    let finished = false;
    let shown = 0;
    let t0: number | null = null;
    let last = 0;
    let fullAt: number | null = null;

    const MIN_TIME = 2.4; // 2.4s of smooth drawing
    const finishIntro = () => {
      if (finished) return;
      finished = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);

      setIsDone(true);
      window.dispatchEvent(new Event('mb:intro-done'));

      removeTimer.current = setTimeout(() => {
        setIsMounted(false);
      }, 850);
    };

    const step = (now: number) => {
      if (finished) return;
      if (t0 === null) {
        t0 = now;
        last = now;
      }
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = Math.min(1, t / MIN_TIME);
      shown += (target - shown) * Math.min(1, dt * 3.4);
      if (target >= 1 && shown > 0.995) shown = 1;

      let tip: { x: number; y: number } | null = null;

      strokeItems.forEach((st) => {
        const range = Math.max(1e-6, st.b - st.a);
        const local = Math.max(0, Math.min(1, (shown - st.a) / range));

        st.el.style.strokeDashoffset = (st.len * (1 - local)).toFixed(2);
        st.el.style.visibility = local > 0 ? 'visible' : 'hidden';

        if (local > 0 && local < 1) {
          try {
            tip = st.el.getPointAtLength(local * st.len);
          } catch (_) {}
        }
      });

      if (tip) {
        nib.setAttribute('cx', (tip as { x: number; y: number }).x.toFixed(1));
        nib.setAttribute('cy', (tip as { x: number; y: number }).y.toFixed(1));
        setIsWriting(true);
      }

      const currentPct = Math.round(shown * 100);
      setPctText(String(currentPct));

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${shown})`;
      }

      if (shown >= 1 && fullAt === null) {
        fullAt = t;
        setIsWriting(false);
        setIsFlowing(true);
      }

      if (fullAt !== null && t - fullAt > 0.85) {
        finishIntro();
        return;
      }

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };
  }, []);

  const handleSkip = () => {
    setIsDone(true);
    window.dispatchEvent(new Event('mb:intro-done'));
    setTimeout(() => {
      setIsMounted(false);
    }, 400);
  };

  if (!isMounted) return null;

  return (
    <div
      className={`mb-loader ${isDone ? 'is-done' : ''}`}
      role="banner"
      aria-label="Movie Bash entrance animation"
    >
      {/* Skip button in upper right */}
      <button
        type="button"
        onClick={handleSkip}
        className="mb-loader__skip"
        aria-label="Skip introduction animation"
      >
        Skip ✕
      </button>

      {/* Main centering container */}
      <div className={`ld ${isWriting ? 'is-writing' : ''} ${isFlowing ? 'is-flowing' : ''}`}>
        
        {/* Brand Calligraphy Art Canvas */}
        <div className="ld__art">
          <svg
            ref={svgRef}
            viewBox="0 0 1000 260"
            fill="none"
            aria-hidden="true"
            className="ld__svg"
          >
            <defs>
              <filter id="mbShineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Sequential cursive strokes */}
            <g id="ldInk">
              {STROKES_CONFIG.map((stroke) => (
                <path
                  key={stroke.id}
                  className="ld__ink"
                  data-a={stroke.dataA}
                  data-b={stroke.dataB}
                  d={stroke.d}
                />
              ))}
            </g>

            {/* Glowing circular fountain pen nib following the tip */}
            <circle
              ref={nibRef}
              id="ldNib"
              className="ld__nib"
              r="6.5"
              cx="75"
              cy="155"
            />
          </svg>
        </div>

        {/* Elegant Italic Tagline */}
        <p className="ld__msg">
          Your Moment. Your Movie. Your Theatre.
        </p>

        {/* Progress Bar & Percentage */}
        <div className="ld__meta">
          <div className="ld__track">
            <div ref={barRef} className="ld__bar" />
          </div>
          <span className="ld__pct">{pctText}%</span>
        </div>

      </div>
    </div>
  );
}
