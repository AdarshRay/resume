import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed inside error boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '32px 20px',
            background: 'linear-gradient(180deg, #f6f1e8 0%, #eef2f8 100%)',
            color: '#182235',
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          <div
            style={{
              width: 'min(560px, 100%)',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(24,34,53,0.08)',
              borderRadius: '24px',
              boxShadow: '0 24px 70px rgba(24,34,53,0.14)',
              padding: '28px',
            }}
          >
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.68 }}>
              CV Craft
            </div>
            <h1 style={{ margin: '10px 0 12px', fontSize: '32px', lineHeight: 1.05 }}>
              Something went wrong.
            </h1>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#42506a' }}>
              The app hit an unexpected error. Your last local changes may still be available after a reload.
            </p>
            {this.state.error?.message ? (
              <pre
                style={{
                  margin: '18px 0 0',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  overflowX: 'auto',
                  background: '#f7f8fb',
                  color: '#5f2d2d',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error.message}
              </pre>
            ) : null}
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                marginTop: '20px',
                border: 0,
                borderRadius: '999px',
                padding: '12px 18px',
                background: '#1b2a4a',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
