import { useEffect, useRef } from 'react';
import './ActionDialog.css';

function ActionDialog({ type, message, onConfirm, onCancel, autoDismissDelay = 2000, confirmText = 'Ja', cancelText = 'Nee' }) {
  const dialogRef = useRef(null);

  // Focus management and ESC key listener
  useEffect(() => {
    // Focus the dialog container on mount
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (type === 'confirm' && onCancel) {
          onCancel();
        } else if (type === 'error' && onConfirm) {
          onConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onCancel, onConfirm]);

  // Handle auto-dismiss for success dialog
  useEffect(() => {
    if (type === 'success' && onConfirm) {
      const timer = setTimeout(() => {
        onConfirm();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [type, onConfirm, autoDismissDelay]);

  return (
    <div className="dialog-overlay">
      <div 
        className="dialog-content" 
        role="dialog" 
        aria-modal="true" 
        tabIndex="-1" 
        ref={dialogRef}
      >
        {type === 'success' ? (
          <div className="dialog-success-icon-container">
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        ) : (
          <div className="dialog-warning-icon-container">
            <span className="dialog-warning-icon">⚠️</span>
          </div>
        )}
        
        {type === 'confirm' && message === 'Weet je zeker dat je deze pakbon wilt verwijderen?' ? (
          <h3 className="dialog-title" style={{ marginTop: 0, marginBottom: '10px' }}>Pakbon verwijderen</h3>
        ) : null}
        <p className="dialog-message">{message}</p>
        
        {type === 'confirm' && (
          <div className="dialog-actions">
            <button className="dialog-btn cancel-btn" onClick={onCancel}>
              {cancelText}
            </button>
            <button className="dialog-btn confirm-btn" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        )}

        {type === 'error' && (
          <div className="dialog-actions">
            <button className="dialog-btn confirm-btn" onClick={onConfirm}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionDialog;
