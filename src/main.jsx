import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './ErrorBoundary.jsx';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <App />
      </CartProvider>
    </ErrorBoundary>
    {/* Vercel Speed Insights: injects its script after load, outside the boundary
        so a reporting failure can never take the storefront down with it. */}
    <SpeedInsights />
  </StrictMode>,
)
