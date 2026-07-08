import { useState } from 'react';
import { supabase } from '../supabase';
import './Login.css';

function Login({ onLogin, isRecovering = false, onPasswordUpdated }) {
  const [view, setView] = useState(isRecovering ? 'update_password' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Local inline validation error states
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [forgotPasswordGeneralError, setForgotPasswordGeneralError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Reset error states
    setUsernameError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;
    if (!username.trim()) {
      setUsernameError("Vul uw gebruikersnaam of e-mailadres in.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Vul uw wachtwoord in.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsProcessing(true);
      await onLogin(username, password);
    } catch (error) {
      setIsProcessing(false);
      const message = error.message || '';
      const status = error.status;
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes('invalid login credentials') || 
        lowerMessage.includes('invalid_credentials') || 
        lowerMessage.includes('user not found') || 
        lowerMessage.includes('invalid email')
      ) {
        setGeneralError("Gebruikersnaam of wachtwoord is onjuist.");
      } else if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests') || status === 429) {
        setGeneralError("Te veel mislukte inlogpogingen. Probeer het later opnieuw.");
      } else if (
        lowerMessage.includes('failed to fetch') || 
        lowerMessage.includes('network') || 
        lowerMessage.includes('connection') || 
        lowerMessage.includes('load failed') ||
        !navigator.onLine
      ) {
        setGeneralError("Er is een verbindingsfout opgetreden. Probeer het opnieuw.");
      } else {
        setGeneralError("Er is een fout opgetreden tijdens het inloggen. Probeer het opnieuw.");
      }
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setEmailError('');
    setForgotPasswordGeneralError('');

    if (!email.trim()) {
      setEmailError("Vul uw e-mailadres in.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Voer een geldig e-mailadres in.");
      return;
    }

    try {
      setIsProcessing(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        throw error;
      }
      setIsProcessing(false);
      setView('email_sent');
    } catch (error) {
      setIsProcessing(false);
      const message = error.message || '';
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.includes('failed to fetch') || 
        lowerMessage.includes('network') || 
        lowerMessage.includes('connection') || 
        lowerMessage.includes('load failed') ||
        !navigator.onLine
      ) {
        setForgotPasswordGeneralError("Er is een verbindingsfout opgetreden. Probeer het opnieuw.");
      } else {
        setForgotPasswordGeneralError("Er is een fout opgetreden tijdens het versturen van de herstelmail.");
      }
    }
  };

  const handlePasswordUpdateSubmit = async (e) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');
    setForgotPasswordGeneralError('');

    let hasError = false;
    if (!newPassword) {
      setNewPasswordError("Vul uw wachtwoord in.");
      hasError = true;
    }
    if (!confirmNewPassword) {
      setConfirmPasswordError("Vul uw wachtwoord in.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("Wachtwoorden komen niet overeen.");
      return;
    }

    try {
      setIsProcessing(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      setIsProcessing(false);
      setView('password_updated');
    } catch (error) {
      setIsProcessing(false);
      const message = error.message || '';
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.includes('failed to fetch') || 
        lowerMessage.includes('network') || 
        lowerMessage.includes('connection') || 
        lowerMessage.includes('load failed') ||
        !navigator.onLine
      ) {
        setForgotPasswordGeneralError("Er is een verbindingsfout opgetreden. Probeer het opnieuw.");
      } else {
        setForgotPasswordGeneralError(
          "Wachtwoord bijwerken mislukt. Zorg ervoor dat u bent ingelogd of een herstellink heeft gebruikt."
        );
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/taxi-livo-logo.png" alt="Taxi Livo Logo" className="login-logo" />
        </div>

        {view === 'login' ? (
          <>
            <div className="welcome-header">
              <h2 className="login-title">Welkom</h2>
              <p className="welcome-subtitle">Log in met uw gebruikersnaam en wachtwoord om door te gaan.</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="username">Gebruiksnaam</label>
                <input
                  type="text"
                  id="username"
                  className={usernameError ? 'input-error' : ''}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError('');
                    if (generalError) setGeneralError('');
                  }}
                  disabled={isProcessing}
                  required
                  placeholder="Voer uw gebruiksnaam in"
                />
                {usernameError && <span className="error-message">{usernameError}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Wachtwoord</label>
                <input
                  type="password"
                  id="password"
                  className={passwordError || generalError ? 'input-error' : ''}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (generalError) setGeneralError('');
                  }}
                  disabled={isProcessing}
                  required
                  placeholder="Voer uw wachtwoord in"
                />
                {passwordError && <span className="error-message">{passwordError}</span>}
                {generalError && <span className="error-message">{generalError}</span>}
              </div>
              
              <button type="submit" className="login-btn" disabled={isProcessing}>
                {isProcessing ? <span className="spinner"></span> : 'Inloggen'}
              </button>
              
              <div className="contact-dispatch">
                <button 
                  type="button" 
                  className="forgot-password-link" 
                  onClick={() => {
                    setView('forgot_password');
                    setUsernameError('');
                    setPasswordError('');
                    setGeneralError('');
                  }}
                  disabled={isProcessing}
                >
                  Wachtwoord vergeten?
                </button>
                <p className="contact-dispatch-text">Je gebruiksnaam vergeten? Neem contact op met de Taxi Livo Centrale.</p>
              </div>
            </form>
          </>
        ) : view === 'forgot_password' ? (
          <>
            <div className="welcome-header">
              <h2 className="login-title">Wachtwoord vergeten</h2>
              <p className="welcome-subtitle">Voer uw e-mailadres in om uw wachtwoord te herstellen.</p>
            </div>
            
            <form onSubmit={handleForgotPasswordRequest} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="email">E-mailadres</label>
                <input
                  type="email"
                  id="email"
                  className={emailError || forgotPasswordGeneralError ? 'input-error' : ''}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                    if (forgotPasswordGeneralError) setForgotPasswordGeneralError('');
                  }}
                  disabled={isProcessing}
                  required
                  placeholder="Voer uw e-mailadres in"
                />
                {emailError && <span className="error-message">{emailError}</span>}
                {forgotPasswordGeneralError && <span className="error-message">{forgotPasswordGeneralError}</span>}
              </div>
              
              <button type="submit" className="login-btn" disabled={isProcessing}>
                {isProcessing ? <span className="spinner"></span> : 'Wachtwoord herstellen'}
              </button>
              
              <button 
                type="button" 
                className="back-to-login-btn" 
                onClick={() => {
                  setView('login');
                  setEmail('');
                  setEmailError('');
                  setForgotPasswordGeneralError('');
                }}
                disabled={isProcessing}
              >
                Terug naar login
              </button>
            </form>
          </>
        ) : view === 'email_sent' ? (
          <>
            <div className="welcome-header text-center">
              <div className="success-icon-container">
                <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h2 className="login-title">E-mail verzonden</h2>
              <p className="welcome-subtitle">We hebben een link naar uw e-mailadres gestuurd om uw wachtwoord te herstellen.</p>
            </div>
            <div className="login-form">
              <button 
                type="button" 
                className="back-to-login-btn" 
                onClick={() => {
                  setView('login');
                  setEmail('');
                }}
              >
                Terug naar login
              </button>
            </div>
          </>
        ) : view === 'update_password' ? (
          <>
            <div className="welcome-header">
              <h2 className="login-title">Wachtwoord instellen</h2>
              <p className="welcome-subtitle">Voer uw nieuwe wachtwoord in.</p>
            </div>
            
            <form onSubmit={handlePasswordUpdateSubmit} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="new-password">Nieuw wachtwoord</label>
                <input
                  type="password"
                  id="new-password"
                  className={newPasswordError || forgotPasswordGeneralError ? 'input-error' : ''}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (newPasswordError) setNewPasswordError('');
                    if (forgotPasswordGeneralError) setForgotPasswordGeneralError('');
                  }}
                  disabled={isProcessing}
                  required
                  placeholder="Voer uw nieuwe wachtwoord in"
                />
                {newPasswordError && <span className="error-message">{newPasswordError}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirm-new-password">Bevestig nieuw wachtwoord</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  className={confirmPasswordError || forgotPasswordGeneralError ? 'input-error' : ''}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                    if (forgotPasswordGeneralError) setForgotPasswordGeneralError('');
                  }}
                  disabled={isProcessing}
                  required
                  placeholder="Bevestig uw nieuwe wachtwoord"
                />
                {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
                {forgotPasswordGeneralError && <span className="error-message">{forgotPasswordGeneralError}</span>}
              </div>
              
              <button type="submit" className="login-btn" disabled={isProcessing}>
                {isProcessing ? <span className="spinner"></span> : 'Wachtwoord bijwerken'}
              </button>
              
              <button 
                type="button" 
                className="back-to-login-btn" 
                onClick={async () => {
                  if (onPasswordUpdated) {
                    await onPasswordUpdated();
                  } else {
                    setView('login');
                  }
                }}
                disabled={isProcessing}
              >
                Terug naar login
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="welcome-header text-center">
              <div className="success-icon-container">
                <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h2 className="login-title">Wachtwoord bijgewerkt</h2>
              <p className="welcome-subtitle">Uw wachtwoord is succesvol bijgewerkt. U kunt nu inloggen met uw nieuwe wachtwoord.</p>
            </div>
            <div className="login-form">
              <button 
                type="button" 
                className="back-to-login-btn" 
                onClick={async () => {
                  if (onPasswordUpdated) {
                    await onPasswordUpdated();
                  } else {
                    setView('login');
                  }
                }}
              >
                Terug naar login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
