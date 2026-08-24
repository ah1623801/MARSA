'use client';
import { useState } from 'react';

export default function BookModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="modal open" aria-hidden="false">
      <div className="modal-back" onClick={onClose}></div>
      <div className="modal-panel">
        <button className="modal-x" onClick={onClose} aria-label="close">✕</button>
        <h3>BOOK A TABLE</h3>
        <p className="m-sub">ONE EVENING · ONE FIRE · ONE CATCH</p>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="f-grid">
              <div className="f-field full"><label>NAME</label><input type="text" required placeholder="Your name"/></div>
              <div className="f-field"><label>DATE</label><input type="date" required/></div>
              <div className="f-field"><label>TIME</label><select defaultValue="20:30"><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option><option>21:00</option><option>21:30</option></select></div>
              <div className="f-field full"><label>GUESTS</label><select defaultValue="2 guests"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6 guests</option></select></div>
            </div>
            <button className="btn btn-solid f-submit" type="submit"><span>CONFIRM RESERVATION</span></button>
          </form>
        ) : (
          <div className="f-ok" style={{ display: 'block' }}>
            <h4>YOUR TABLE IS SET</h4>
            <p>WE SAVED YOU A SEAT BY THE FIRE.<br/>SEE YOU AT THE HARBOR.</p>
          </div>
        )}
      </div>
    </div>
  );
}