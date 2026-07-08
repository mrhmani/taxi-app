import { useState } from 'react';
import './Navigation.css';

const HouseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
    <path d="M9 8h6" />
  </svg>
);

function Navigation({ currentView, onViewChange, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="main-navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <img src="/taxi-livo-logo.png" alt="Taxi Livo" className="nav-logo" />
          </div>
          
          <div className="nav-links">
            <button 
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => onViewChange('home')}
            >
              <span className="nav-icon"><HouseIcon /></span> Home
            </button>
            <button 
              className={`nav-link ${currentView === 'logs' ? 'active' : ''}`}
              onClick={() => onViewChange('logs')}
            >
              <span className="nav-icon"><ClipboardListIcon /></span> Mijn Rittenstaten
            </button>
          </div>

          <div className="nav-right">
            <button className="logout-btn" onClick={handleLogoutClick}>
              Uitloggen
            </button>
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-warning-icon-container">
              <span className="modal-warning-icon">⚠️</span>
            </div>
            <p className="modal-message">Weet u zeker dat u wilt uitloggen?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelLogout}>
                Nee
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmLogout}>
                Ja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
