import React from 'react';

/**
 * Global error boundary — catches any unhandled React render error and shows a
 * clean, branded fallback instead of the raw red React error overlay.
 *
 * Class component is required because React doesn't expose error boundaries
 * via hooks (as of React 18).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log to console so devs can still debug, but users never see the red screen.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 40%, #f1f5f9 100%)',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              animation: 'errorFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(234, 88, 12, 0.12)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#0f172a',
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              Something went wrong
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '15px',
                color: '#64748b',
                margin: '0 0 32px',
                lineHeight: '1.6',
              }}
            >
              We're sorry for the inconvenience. The page ran into an unexpected issue. Please try refreshing or go back to the homepage.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '14px 28px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#ea580c';
                  e.currentTarget.style.color = '#ea580c';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '14px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.2)',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ea580c';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(234, 88, 12, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#0f172a';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.2)';
                }}
              >
                Go to Homepage
              </button>
            </div>

            {/* Branding */}
            <p
              style={{
                marginTop: '48px',
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Nazir & Sons
            </p>
          </div>

          {/* Inline keyframes — no CSS file dependency so it works even if styles fail to load */}
          <style>{`
            @keyframes errorFadeIn {
              0% { opacity: 0; transform: translateY(20px) scale(0.97); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
