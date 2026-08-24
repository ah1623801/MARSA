'use client';

export default function FinalReveal({ onOpenBooking, onOpenMenu, onResetScroll }) {
  return (
    <div className="reveal" id="reveal">
      <svg className="r-mark" viewBox="0 0 132 82" fill="none">
        <path pathLength="1" d="M8 41 C 26 18, 62 12, 84 26 C 94 32, 100 36, 104 41 C 100 46, 94 50, 84 56 C 62 70, 26 64, 8 41 Z" stroke="currentColor" strokeWidth="1.6"/>
        <path pathLength="1" d="M104 41 L 126 24 L 118 41 L 126 58 Z" stroke="currentColor" strokeWidth="1.6"/>
        <circle pathLength="1" cx="26" cy="37" r="2.6" stroke="currentColor" strokeWidth="1.6"/>
        <path pathLength="1" d="M52 22 C 58 34, 58 48, 52 60" stroke="currentColor" strokeWidth="1.2" opacity=".6"/>
      </svg>
      <h1 className="r-name" id="rName">
        {"MARSA".split("").map((c, i) => <span key={i}>{c}</span>)}
      </h1>
      <p className="r-tag" id="rTag">
        {"FROM THE SEA TO YOUR TABLE".split(" ").map((w, i) => (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.4em' }}>{w}</span>
        ))}
      </p>
      <div className="r-cta" id="rCta">
        <button className="btn btn-solid magnetic" onClick={onOpenBooking}><span>BOOK A TABLE</span></button>
        <button className="btn magnetic" onClick={onOpenMenu}><span>VIEW MENU</span></button>
      </div>
      <div className="r-again" id="rAgain">
        
        <button className="again-link" onClick={onResetScroll}>
          <svg viewBox="0 0 64 40" fill="currentColor">
            <path d="M4 20c8-9 22-12 32-8 6 2.4 10 5.4 12 8-2 2.6-6 5.6-12 8-10 4-24 1-32-8z"/>
            <path d="M48 20l13-9.5-3.6 9.5L61 29.5z"/>
          </svg>
          FISH AGAIN
        </button>
      </div>
      <div style={{ position: 'fixed', bottom: '1.2rem', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.58rem', letterSpacing: '0.22em', color: '#8a6a2f', pointerEvents: 'auto', whiteSpace: 'nowrap', zIndex: 10 }}>
        <span>© {new Date().getFullYear()} MARSA. ALL RIGHTS RESERVED</span>
        <a href="https://wa.me/+201060496321" target="_blank" rel="noopener noreferrer" style={{ color: '#8a6a2f', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e)=>{e.currentTarget.style.transform='scale(1.2)'; e.currentTarget.style.color='#e9c46a';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.color='#8a6a2f';}}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.112.551 4.095 1.517 5.819l-1.525 5.581 5.711-1.498c1.701.93 3.646 1.463 5.717 1.463 6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 22c-1.848 0-3.568-.53-5.022-1.442l-.36-.226-3.376.885.901-3.292-.248-.395c-.99-1.574-1.515-3.39-1.515-5.26 0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
        </a>
      </div>
    </div>
  );
}