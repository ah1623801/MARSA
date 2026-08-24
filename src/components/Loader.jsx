'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Loader({ onLoaded }) {
  const loaderRef = useRef(null);
  const fillRef = useRef(null);
  const numRef = useRef(null);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    const loaderEl = loaderRef.current;
    const ldNum = numRef.current;
    const ldFill = fillRef.current;
    if (!loaderEl || !ldNum || !ldFill) return;

    let introStarted = false;
    document.documentElement.classList.add("lock");

    // تفعيل رسم الـ SVG بعد فريمين كما في الأصل
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        loaderEl.classList.add("drawn");
      });
    });

    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // أنيميشن النصوص بـ GSAP
    const ctx = gsap.context(() => {
      if (!RM) {
        gsap.from(".ld-name span", {
          yPercent: 120,
          opacity: 0,
          rotateX: -45,
          stagger: 0.09,
          duration: 1,
          ease: "power4.out",
          delay: 0.5,
        });
        gsap.from(".ld-line", {
          autoAlpha: 0,
          scaleX: 0.5,
          duration: 1,
          delay: 0.8,
          ease: "power3.out",
        });
        gsap.from(".ld-num", {
          autoAlpha: 0,
          y: 12,
          duration: 0.9,
          delay: 1,
          ease: "power2.out",
        });
      }
    }, loaderRef);

    function startIntro() {
      if (introStarted) return;
      introStarted = true;
      document.documentElement.classList.remove("lock");
      document.getElementById("stage")?.classList.add("ui-in");

      gsap.to(loaderEl, {
        yPercent: -101,
        duration: RM ? 0.3 : 1.15,
        ease: "power4.inOut",
        onComplete: () => {
          setIsRemoved(true);
          if (onLoaded) onLoaded();
        },
      });
    }

    let fontsReady = false;
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
      });
    } else {
      fontsReady = true;
    }

    const safetyTimer = setTimeout(() => {
      fontsReady = true;
    }, 6000);

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ldT0 = performance.now();
    const LD_MIN = RM ? 350 : 2300;
    let animId;

    function ldTick(now) {
      if (introStarted) return;
      const t = now - ldT0;
      const k = clamp(t / LD_MIN, 0, 1);
      const e = 1 - Math.pow(1 - k, 2.8);
      let v = fontsReady ? e : Math.min(e, 0.9);
      if (t > LD_MIN && fontsReady) v = clamp(e + (t - LD_MIN) / 500, 0, 1);

      ldNum.textContent = String(Math.round(v * 100)).padStart(3, "0");
      ldFill.style.transform = `scaleX(${v})`;

      if (v >= 1) {
        clearTimeout(safetyTimer);
        startIntro();
      } else {
        animId = requestAnimationFrame(ldTick);
      }
    }

    animId = requestAnimationFrame(ldTick);

    return () => {
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animId);
      cancelAnimationFrame(r1);
      ctx.revert();
      document.documentElement.classList.remove("lock");
    };
  }, [onLoaded]);

  if (isRemoved) return null;

  return (
    <>
      <div id="loader" ref={loaderRef} suppressHydrationWarning>
        <svg className="ld-fishmark" viewBox="0 0 132 82" fill="none">
          <path
            pathLength={1}
            d="M8 41 C 26 18, 62 12, 84 26 C 94 32, 100 36, 104 41 C 100 46, 94 50, 84 56 C 62 70, 26 64, 8 41 Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            pathLength={1}
            d="M104 41 L 126 24 L 118 41 L 126 58 Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <g className="ld-eye">
            <circle cx="26" cy="37" r="2.6" stroke="currentColor" strokeWidth="1.4" />
            <circle className="eye-p" cx="26" cy="37" r="1" fill="currentColor" />
          </g>
        </svg>

        <span className="ld-name">
          <span>M</span>
          <span>A</span>
          <span>R</span>
          <span>S</span>
          <span>A</span>
        </span>

        <div className="ld-line">
          <i id="ldFill" ref={fillRef}></i>
        </div>

        <span className="ld-num" id="ldNum" ref={numRef}>
          000
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond@5/400.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/400.css');

        html.lock,
        html.lock body {
          overflow: hidden !important;
        }

        #loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #04080c;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.3rem;
          user-select: none;
        }

        .ld-fishmark {
          width: 150px;
          height: 94px;
          color: #d9c08c;
          overflow: visible;
          animation: ldFloat 3.4s ease-in-out infinite;
        }

        @keyframes ldFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .ld-fishmark path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }

        #loader.drawn .ld-fishmark path {
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
        }

        .ld-eye {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          transition: opacity 0.7s ease 1.5s;
          animation: ldBlink 4.6s infinite 2.2s;
        }

        #loader.drawn .ld-eye {
          opacity: 1;
        }

        .eye-p {
          transform-box: fill-box;
          transform-origin: center;
          animation: ldLook 6.5s ease-in-out infinite 2.2s;
        }

        @keyframes ldBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          94% { transform: scaleY(0.08); }
        }

        @keyframes ldLook {
          0%, 16% { transform: translateX(0); }
          26%, 44% { transform: translateX(1.9px); }
          54%, 74% { transform: translateX(-1.5px); }
          86%, 100% { transform: translateX(0); }
        }

        .ld-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: clamp(1.5rem, 4vw, 2.1rem);
          letter-spacing: 0.72em;
          padding-left: 0.72em;
          color: #f2ecd9;
          perspective: 500px;
        }

        .ld-name span {
          display: inline-block;
          will-change: transform;
        }

        .ld-line {
          width: min(340px, 70vw);
          height: 1px;
          background: rgba(236, 229, 214, 0.12);
          overflow: hidden;
        }

        .ld-line i {
          display: block;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #8a6a2f, #e9c46a);
          transform-origin: left;
          transform: scaleX(0);
        }

        .ld-num {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.6em;
          padding-left: 0.6em;
          color: rgba(233, 196, 106, 0.75);
          font-variant-numeric: tabular-nums;
        }

        @media (prefers-reduced-motion: reduce) {
          .ld-fishmark,
          .ld-eye,
          .eye-p {
            animation: none !important;
          }
        }
      ` }} />
    </>
  );
}