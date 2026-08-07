import { useState } from 'react';
import './DonateBookToggle.css';

function DonateBookToggle({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="donate-toggle-wrap">
      <button
        className="donate-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="donate-toggle-icon">{isOpen ? '−' : '+'}</span>
        {isOpen ? 'Close' : 'Donate a Book'}
      </button>

      <div className={`donate-panel ${isOpen ? 'donate-panel-open' : ''}`}>
        <div className="donate-panel-inner">{children}</div>
      </div>
    </div>
  );
}

export default DonateBookToggle;