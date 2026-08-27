'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Loader from '../components/Loader';
import CustomCursor from '../components/CustomCursor';
import Navigation from '../components/Navigation';
import RailNavigation from '../components/RailNavigation';
import DepthMeter from '../components/DepthMeter';
import ExperienceCanvas from '../components/ExperienceCanvas';
import Captions from '../components/Captions';
import FinalReveal from '../components/FinalReveal';
import MenuModal from '../components/modals/MenuModal';
import BookModal from '../components/modals/BookModal';


import { useAudioEngine } from '../hooks/useAudioEngine';


gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const progressRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lenisRef = useRef(null);

  const { isAudioOn, toggleSound, updateAudio } = useAudioEngine();

  const handleMouseMove = (e) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    const FINE = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (FINE && !RM) {
      lookRef.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      lookRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }
  };

  const handleScrollTo = (p) => {
    const SCROLL_LEN = typeof window !== 'undefined' && window.innerWidth < 768 ? 9000 : 12000;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenisRef.current) lenisRef.current.scrollTo(p * SCROLL_LEN, { duration: RM ? 0.1 : 2.2 });
  };

  const handleResetScroll = () => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: RM ? 0.1 : 2.6 });
  };

  useEffect(() => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: 1.35,
      easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const SCROLL_LEN = window.innerWidth < 768 ? 9000 : 12000;
    const DUR = 130;
    const T = (p) => p * DUR;

    const state = { p: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".experience",
        start: "top top",
        end: `+=${SCROLL_LEN}`,
        scrub: RM ? 0.4 : 1.2,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
onUpdate: (self) => {
  progressRef.current = self.progress;const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const MOBILE = window.innerWidth < 768;
const LOW_FX = MOBILE || TOUCH || RM;

let lenis = null;

if (!RM && !TOUCH) {
  lenis = new Lenis({
    duration: 1.35,
    easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
    smoothWheel: true
  });

  lenisRef.current = lenis;
  lenis.on('scroll', ScrollTrigger.update);
}
  const p = self.progress;
  setCurrentScene(p < 0.2 ? 0 : p < 0.45 ? 1 : p < 0.65 ? 2 : p < 0.82 ? 3 : 4);
  updateAudio(p, performance.now() / 1000);
}
      }
    });

    tl.to(state, { p: 1, duration: DUR, ease: "none" }, 0);

    const capTween = (id, a, b, c, d) => {
      const el = document.getElementById(id);
      if (!el) return;
      const chars = el.querySelectorAll(".cap-t span");
      const sub = el.querySelector(".cap-s");
      const eye = el.querySelector(".cap-i");
      tl.set(el, { autoAlpha: 1 }, T(a));
      if (eye) tl.fromTo(eye, { autoAlpha: 0, y: -14, letterSpacing: "0.9em" }, { autoAlpha: 1, y: 0, letterSpacing: "0.55em", duration: (b - a) * DUR * 0.7, ease: "power3.out" }, T(a));
      tl.fromTo(chars, { yPercent: 130, opacity: 0, rotateX: -55, filter: "blur(12px)" }, { yPercent: 0, opacity: 1, rotateX: 0, filter: "blur(0px)", duration: (b - a) * DUR, stagger: 0.09, ease: "power4.out" }, T(a));
      if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 16, letterSpacing: "0.55em" }, { autoAlpha: 1, y: 0, letterSpacing: "0.28em", duration: (b - a) * DUR * 0.9, ease: "power3.out" }, T(a + (b - a) * 0.35));
      tl.to(el, { autoAlpha: 0, y: -30, filter: "blur(8px)", duration: (d - c) * DUR, ease: "power2.in" }, T(c));
    };

    capTween("capSea", 0.045, 0.078, 0.13, 0.165);
    capTween("capCatch", 0.475, 0.5, 0.53, 0.56);
    capTween("capFire", 0.7, 0.726, 0.775, 0.8);
    capTween("capRest", 0.855, 0.872, 0.892, 0.905);
    capTween("capTable", 0.9, 0.916, 0.93, 0.942);

    tl.to("#opening", { autoAlpha: 0, duration: T(0.045) - T(0.008), ease: "power1.in" }, T(0.008));
    tl.to("#scrollInd", { autoAlpha: 0, duration: T(0.035) - T(0.005), ease: "power1.in" }, T(0.005));

    tl.to("#reveal", { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, T(0.942));
    tl.to("#reveal .r-mark path, #reveal .r-mark circle", { strokeDashoffset: 0, duration: T(0.966) - T(0.942), ease: "power2.inOut", stagger: 0.35 }, T(0.942));
    tl.fromTo("#rName span", { yPercent: 125, opacity: 0, rotateX: -60, filter: "blur(14px)" }, { yPercent: 0, opacity: 1, rotateX: 0, filter: "blur(0px)", stagger: 0.1, duration: T(0.978) - T(0.952), ease: "power4.out" }, T(0.952));
    tl.fromTo("#rTag span", { y: 20, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.07, duration: 0.5, ease: "power3.out" }, T(0.964));
    tl.fromTo("#rTagAr", { autoAlpha: 0, y: 12, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, T(0.972));
    tl.fromTo("#rCta .btn", { y: 40, opacity: 0, scale: 0.92, rotate: -1.5 }, { y: 0, opacity: 1, scale: 1, rotate: 0, stagger: 0.14, duration: 0.65, ease: "back.out(1.8)" }, T(0.976));
    tl.fromTo("#rAgain", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, T(0.988));

    let reqId;
    function raf(time) {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    }
    reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [updateAudio]);

const handleLoaded = () => {
  setLoaded(true);
  document.getElementById("stage")?.classList.add("ui-in");
  gsap.fromTo("#opening .o-name span", { yPercent: 125, opacity: 0, rotateX: -50, filter: "blur(8px)" }, { yPercent: 0, opacity: 1, rotateX: 0, filter: "blur(0px)", stagger: 0.08, duration: 0.8, ease: "power4.out", delay: 0.55 });
  gsap.fromTo("#opening .o-tag", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 1.05, ease: "power2.out" });
  gsap.fromTo(".ui-fade", { y: 8 }, { y: 0, duration: 0.9, stagger: 0.08, delay: 0.5, ease: "power2.out" });

  // تحديث الحسابات بعد اختفاء الـ Loader
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
};
  return (
    <main onMouseMove={handleMouseMove}>
      {!loaded && <Loader onLoaded={handleLoaded} />}
      <CustomCursor mousePosRef={mousePosRef} />



      <div className="experience">
        <div className="stage" id="stage">
          <ExperienceCanvas progressRef={progressRef} mousePosRef={mousePosRef} lookRef={lookRef} />
          <div className="grain"></div>
  

          <Captions />
          <FinalReveal
            onOpenBooking={() => setBookOpen(true)}
            onOpenMenu={() => setMenuOpen(true)}
            onResetScroll={handleResetScroll}
          />

          <Navigation
            onOpenMenu={() => setMenuOpen(true)}
            isAudioOn={isAudioOn}
            onToggleSound={toggleSound}
            onHomeClick={handleResetScroll}
          />

          <DepthMeter currentScene={currentScene} progress={progressRef.current} />
          <RailNavigation currentScene={currentScene} progress={progressRef.current} onScrollTo={handleScrollTo} />

          <div className="scroll-ind ui-fade" id="scrollInd">
            <span className="si-line"></span>
            <span className="si-txt">SCROLL TO DIVE</span>
          </div>
        </div>
      </div>
      <MenuModal isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <BookModal isOpen={bookOpen} onClose={() => setBookOpen(false)} />
    </main>
  );
}