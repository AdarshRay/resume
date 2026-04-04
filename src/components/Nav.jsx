import { useState } from 'react';

const TEMPLATE_NAMES = {
  'designer-slate': 'Designer Slate',
  'executive-navy': 'Executive Navy',
  'bold-coral': 'Bold Coral',
  'dev-terminal': 'Dev Terminal',
  'strategist-gold': 'Strategist Gold',
  'clean-slate': 'Clean Slate',
};

export default function Nav({ onGoHome, theme, onToggleTheme, step, templateName }) {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [user, setUser] = useState(null);

  const handleGoogleLogin = () => {
    setUser({
      name: 'User',
      avatar: null,
      email: 'user@gmail.com',
    });
    setShowLoginMenu(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLoginMenu(false);
  };

  const isDark = theme === 'dark';
  const activeTemplate = TEMPLATE_NAMES[templateName] || 'CV Craft Studio';
  const isPreview = step === 'preview';
  const statusLabel = step === 'generating' ? 'Generating' : step === 'upload' ? 'Upload' : step === 'preview' ? 'Editing' : 'Ready';

  return (
    <nav className="nav-bar">
      <div className="nav-glow nav-glow-left" aria-hidden="true" />
      <div className="nav-glow nav-glow-right" aria-hidden="true" />

      <button onClick={onGoHome} className="nav-logo group">
        <div className="nav-logo-icon">
          <img src="/cv-craft-logo.svg" alt="CV Craft" className="nav-logo-image" />
        </div>
        <div className="nav-brand-copy">
          <span className="nav-logo-text">
            <span className="nav-logo-text-accent">CV</span>
            <span className="nav-logo-text-main">Craft</span>
          </span>
          <span className="nav-logo-subtext">cvcraft.co.in</span>
        </div>
      </button>

      <div className="nav-centerpiece" aria-hidden="true">
        <div className="nav-centerpiece-pill">
          <span className="nav-centerpiece-dot" />
          <div className="nav-centerpiece-copy">
            <span className="nav-centerpiece-label">{isPreview ? activeTemplate : 'CV Craft Studio'}</span>
            <span className="nav-centerpiece-sub">{isPreview ? 'Current live template' : 'Craft polished resumes with premium templates'}</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {isPreview && (
          <div className="nav-info-chip nav-info-chip--template">
            <span className="nav-info-chip-label">Template</span>
            <span className="nav-info-chip-value">{activeTemplate}</span>
          </div>
        )}

        {isPreview && (
          <div className="nav-info-chip">
            <span className="nav-info-chip-dot" />
            <span className="nav-info-chip-value">Saved locally</span>
          </div>
        )}

        <div className="nav-status-chip">
          <span className="nav-status-chip-dot" />
          <span>{statusLabel}</span>
        </div>

        {isPreview && (
          <button onClick={onGoHome} className="nav-primary-btn">
            New Resume
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className="nav-icon-btn"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="nav-divider" />

        <div className="relative">
          <button
            onClick={() => setShowLoginMenu(!showLoginMenu)}
            className={`nav-avatar-btn ${user ? 'nav-avatar-btn--active' : ''}`}
          >
            {user ? (
              <span className="nav-avatar-letter">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>

          {showLoginMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLoginMenu(false)}
              />
              <div className="nav-dropdown">
                {user ? (
                  <div>
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-avatar">
                        <span className="nav-avatar-letter">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="nav-dropdown-name">{user.name}</p>
                        <p className="nav-dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-signout"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="nav-dropdown-login">
                    <p className="nav-dropdown-hint">Sign in to save your work</p>
                    <button
                      onClick={handleGoogleLogin}
                      className="nav-google-btn"
                      style={{
                        background: isDark ? '#ffffff' : '#1a1a2e',
                        color: isDark ? '#333' : '#ffffff',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
