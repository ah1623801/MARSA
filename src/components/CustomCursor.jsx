'use client';
import { useEffect, useRef } from 'react';

export default function CustomCursor({ mousePosRef }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rxRef = useRef(0);
  const ryRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      rxRef.current = window.innerWidth / 2;
      ryRef.current = window.innerHeight / 2;
    }

    let animId;
    const updateCursor = () => {
      const x = mousePosRef?.current?.x ?? rxRef.current;
      const y = mousePosRef?.current?.y ?? ryRef.current;

      if (dotRef.current && ringRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        rxRef.current += (x - rxRef.current) * 0.16;
        ryRef.current += (y - ryRef.current) * 0.16;
        ringRef.current.style.transform = `translate(${rxRef.current}px, ${ryRef.current}px) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(updateCursor);
    };

    animId = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(animId);
  }, [mousePosRef]);

  useEffect(() => {
    const handleOver = (e) => {
      if (e.target.closest && e.target.closest("button, a")) {
        ringRef.current?.classList.add("hov");
      }
    };
    const handleOut = (e) => {
      if (e.target.closest && e.target.closest("button, a")) {
        ringRef.current?.classList.remove("hov");
      }
    };
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  return (
    <>
      <div id="cRing" ref={ringRef}></div>
      <div id="cDot" ref={dotRef}></div>
    </>
  );
}