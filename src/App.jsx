import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import CustomCalculator from './pages/CustomCalculator';
import Reviews from './pages/Reviews';
import Preloader from './components/Preloader';

function App() {
  return (
    <Router>
      <Preloader />
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:name" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/calculator" element={<CustomCalculator />} />
            <Route path="/reviews" element={<Reviews />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
