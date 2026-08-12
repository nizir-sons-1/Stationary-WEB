import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Preloader from './components/Preloader';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';

// Home ships in the entry chunk because it is the landing route. Everything
// else is fetched on demand, and prefetched on hover/idle by the router links.
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const CustomCalculator = lazy(() => import('./pages/CustomCalculator'));
const Reviews = lazy(() => import('./pages/Reviews'));

// New Footer Pages
const ContactUs = lazy(() => import('./pages/ContactUs'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnsRefunds = lazy(() => import('./pages/ReturnsRefunds'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Careers = lazy(() => import('./pages/Careers'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Reserves the viewport while a route chunk downloads so the layout doesn't jump.
const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true">
    <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-primary animate-spin" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Preloader />
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow pt-16">
            <RouteErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:name" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/calculator" element={<CustomCalculator />} />
                  <Route path="/reviews" element={<Reviews />} />
                  
                  {/* Footer Page Routes */}
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="/returns" element={<ReturnsRefunds />} />
                  <Route path="/about" element={<OurStory />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </RouteErrorBoundary>
          </main>
          <Footer />
          <FloatingWhatsApp />
          <BottomNav />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
