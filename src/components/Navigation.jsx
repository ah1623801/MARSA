'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Navigation({ onOpenMenu, isAudioOn, onToggleSound, onHomeClick }) {
  const fishRef = useRef(null);

  useEffect(() => {
    if (!fishRef.current) return;
    gsap.set(fishRef.current, { transformOrigin: "50% 50%" });
    gsap.timeline({ repeat: -1 })
      .set(fishRef.current, { scaleX: -1 })
      .to(fishRef.current, { x: 10, duration: 2.6, ease: "sine.inOut" })
      .to(fishRef.current, { scaleX: 1, duration: 0.3, ease: "power1.inOut" }, "-=0.12")
      .to(fishRef.current, { x: -10, duration: 2.6, ease: "sine.inOut" })
      .to(fishRef.current, { scaleX: -1, duration: 0.3, ease: "power1.inOut" }, "-=0.12");

    gsap.to(fishRef.current, { rotation: 2.5, duration: 0.55, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }, []);

  return (
    <header className="chrome-top ui-fade">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onHomeClick(); }} aria-label="Marsa home">
        <span className="fish-wrap">
          <svg ref={fishRef} viewBox="0 0 64 40" fill="currentColor">
            <path d="M4 20c8-9 22-12 32-8 6 2.4 10 5.4 12 8-2 2.6-6 5.6-12 8-10 4-24 1-32-8z"/>
            <path d="M48 20l13-9.5-3.6 9.5L61 29.5z"/>
            <circle cx="14" cy="17.6" r="1.7" fill="#020509"/>
          </svg>
        </span>
        <b>MARSA</b>
      </a>
      <nav className="chrome-nav">
        <button className={`chip ${isAudioOn ? "on" : ""}`} id="soundBtn" onClick={onToggleSound} aria-pressed={isAudioOn}>
          <svg className="hp" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 15v-3a8 8 0 0 1 16 0v3"/>
            <path d="M4 14.5h3v4.6H5.2A1.2 1.2 0 0 1 4 17.9v-3.4zM20 14.5h-3v4.6h1.8a1.2 1.2 0 0 0 1.2-1.2v-3.4z" fill="currentColor" stroke="none"/>
            <path className="wv" d="M2.6 10.2A10 10 0 0 1 5.4 5.6"/>
            <path className="wv" d="M21.4 10.2A10 10 0 0 0 18.6 5.6"/>
          </svg>
          <span className="snd-txt">SOUND&nbsp;<span>{isAudioOn ? "ON" : "OFF"}</span></span>
          <span className="eq"><i></i><i></i><i></i></span>
        </button>
        <button className="chip" onClick={onOpenMenu}>MENU</button>
      </nav>
    </header>
  );
}