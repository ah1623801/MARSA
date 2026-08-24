'use client';

export default function MenuModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal open" aria-hidden="false">
      <div className="modal-back" onClick={onClose}></div>
      <div className="modal-panel">
        <button className="modal-x" onClick={onClose} aria-label="close">✕</button>
        <h3>MENU</h3>
        <p className="m-sub">THIS WEEK'S TIDE</p>
        <div className="m-sec">FROM THE RAW</div>
        <div className="m-row"><div className="m-top"><span className="m-name">Gillardeau Oysters</span><span className="m-dots"></span><span className="m-price">28</span></div><span className="m-desc">sea foam pearls, green apple snow</span></div>
        <div className="m-row"><div className="m-top"><span className="m-name">Amberjack Crudo</span><span className="m-dots"></span><span className="m-price">26</span></div><span className="m-desc">green mandarin, wild fennel pollen</span></div>
        <div className="m-sec">FROM THE FIRE</div>
        <div className="m-row"><div className="m-top"><span className="m-name">Whole Sea Bream</span><span className="m-dots"></span><span className="m-price">42</span></div><span className="m-desc">salt crust, ember oil, charred lemon</span></div>
        <div className="m-row"><div className="m-top"><span className="m-name">Octopus</span><span className="m-dots"></span><span className="m-price">36</span></div><span className="m-desc">black lemon coal, smoked paprika</span></div>
        <div className="m-row"><div className="m-top"><span className="m-name">Lobster</span><span className="m-dots"></span><span className="m-price">58</span></div><span className="m-desc">burnt butter, nori glaze</span></div>
        <div className="m-row"><div className="m-top"><span className="m-name">Catch of the Day</span><span className="m-dots"></span><span className="m-price">MKT</span></div><span className="m-desc">whole, over oak fire — ask what came in</span></div>
        <div className="m-sec">TO FINISH</div>
        <div className="m-row"><div className="m-top"><span className="m-name">Smoked Chocolate</span><span className="m-dots"></span><span className="m-price">14</span></div><span className="m-desc">sea salt, olive oil, burnt honey</span></div>
        <p className="m-note">— the menu changes with the tide —</p>
        <p className="m-addr">HARBOR QUAY 7 · OPEN 18:00 — 01:00</p>
      </div>
    </div>
  );
}