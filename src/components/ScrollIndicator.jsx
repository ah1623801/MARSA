"use client";
import React from 'react';

export default function ScrollIndicator({ currentScene }) {
  // إخفاء المؤشر تلقائياً بعد ما المستخدم يبدأ يسكرول (مثلاً بعد السكشن الأول)
  const isHidden = currentScene > 0;

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none transition-all duration-500 ${
        isHidden ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {/* 1. نسخة الشاشات الكبيرة / الكمبيوتر (Mouse Scroll) */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <div className="w-5 h-9 border-2 border-white/40 rounded-full p-1 flex justify-center backdrop-blur-md bg-black/20 shadow-lg">
          {/* النقطة المتحركة داخل الماوس */}
          <div className="w-1 h-2 bg-white rounded-full animate-[scroll_1.6s_ease-in-out_infinite]" />
        </div>
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 font-mono">
          Scroll
        </span>
      </div>

      {/* 2. نسخة الموبايل (Swipe Up / Touch Indicator) */}
      <div className="flex md:hidden flex-col items-center gap-1.5">
        <div className="relative flex items-center justify-center w-8 h-8">
          {/* سهم متحرك لأعلى مع لمسة إبهام */}
          <svg 
            className="w-6 h-6 text-white/80 animate-bounce" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-mono bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
          Swipe Up
        </span>
      </div>
    </div>
  );
}