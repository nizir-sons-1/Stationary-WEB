import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Lightweight error boundary for individual route content.
 * If a single page crashes, the shell (Navbar + Footer) stays intact and the
 * user gets a friendly inline message instead of a full-screen blow-up.
 */
class RouteErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, routeKey: props.routeKey };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /*
   * Clear the error the moment the route changes.
   *
   * Without this the boundary latched: after one page threw, every subsequent
   * navigation kept rendering this same screen because `hasError` was never
   * reset. Even the "Back to Shop" button below only changed the URL — the
   * shop then rendered underneath a boundary that was still showing the error,
   * so the site looked permanently broken until a hard reload.
   */
  static getDerivedStateFromProps(props, state) {
    if (props.routeKey !== state.routeKey) {
      return { hasError: false, routeKey: props.routeKey };
    }
    return null;
  }

  componentDidCatch(error, info) {
    console.error('[RouteErrorBoundary]', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-secondary mb-2">
            This page couldn't load
          </h2>
          <p className="text-gray-500 max-w-md mb-8">
            Something unexpected happened. You can try reloading this page or head back to the shop.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-secondary font-bold text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Retry
            </button>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-primary transition-colors shadow-lg"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Boundaries have to be class components, but the route they are guarding is
// only available through a hook — hence the thin wrapper.
const RouteErrorBoundary = ({ children }) => {
  const location = useLocation();
  return (
    <RouteErrorBoundaryInner routeKey={location.pathname}>{children}</RouteErrorBoundaryInner>
  );
};

export default RouteErrorBoundary;
