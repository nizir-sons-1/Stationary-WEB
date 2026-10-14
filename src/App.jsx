import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';

// Core shopping flow — static imports for instant route transitions.
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';

// Secondary pages — lazy-loaded so the initial bundle stays under 800 kB.
// Each produces a small chunk (~5–20 kB) fetched on first navigation.
const CustomCalculator = lazy(() => import('./pages/CustomCalculator'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Faq = lazy(() => import('./pages/Faq'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnsRefunds = lazy(() => import('./pages/ReturnsRefunds'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Careers = lazy(() => import('./pages/Careers'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
import NotFound from './pages/NotFound';

import PageTransition from './components/PageTransition';

/** Minimal placeholder while a lazy chunk loads — keeps layout stable. */
const LazyFallback = () => <div className="min-h-[60vh]" aria-hidden="true" />;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow pt-[64px] md:pt-[68px]">
            <RouteErrorBoundary>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:deptSlug" element={<Shop />} />
                  <Route path="/shop/:deptSlug/:categorySlug" element={<Shop />} />
                  <Route path="/product/:name" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/calculator" element={<Suspense fallback={<LazyFallback />}><CustomCalculator /></Suspense>} />
                  <Route path="/reviews" element={<Suspense fallback={<LazyFallback />}><Reviews /></Suspense>} />
                  <Route path="/faq" element={<Suspense fallback={<LazyFallback />}><Faq /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<LazyFallback />}><ContactUs /></Suspense>} />
                  <Route path="/track-order" element={<Suspense fallback={<LazyFallback />}><TrackOrder /></Suspense>} />
                  <Route path="/shipping" element={<Suspense fallback={<LazyFallback />}><ShippingPolicy /></Suspense>} />
                  <Route path="/returns" element={<Suspense fallback={<LazyFallback />}><ReturnsRefunds /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<LazyFallback />}><OurStory /></Suspense>} />
                  <Route path="/careers" element={<Suspense fallback={<LazyFallback />}><Careers /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<LazyFallback />}><PrivacyPolicy /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={<LazyFallback />}><TermsOfService /></Suspense>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </RouteErrorBoundary>
          </main>
          <Footer />
          <FloatingWhatsApp />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
