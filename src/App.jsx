import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';

// Static imports for instant route transitions (no network delay on click)
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import CustomCalculator from './pages/CustomCalculator';
import Reviews from './pages/Reviews';
import Faq from './pages/Faq';
import ContactUs from './pages/ContactUs';
import TrackOrder from './pages/TrackOrder';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsRefunds from './pages/ReturnsRefunds';
import OurStory from './pages/OurStory';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow pt-[120px] md:pt-[160px]">
            <RouteErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:deptSlug" element={<Shop />} />
                <Route path="/shop/:deptSlug/:categorySlug" element={<Shop />} />
                <Route path="/product/:name" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/calculator" element={<CustomCalculator />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/faq" element={<Faq />} />
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
