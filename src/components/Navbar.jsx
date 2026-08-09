import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Phone, Palette, BookOpen, Layers, PenTool } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const isActive = (path) => location.pathname === path;
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`w-full z-50 fixed top-0 left-0 flex justify-center pointer-events-none font-sans transition-all duration-500 ${scrolled ? 'pt-4 px-4' : 'pt-0 px-0'}`}
    >
      <div className={`w-full pointer-events-auto transition-all duration-500 flex flex-col ${scrolled ? 'max-w-6xl rounded-full glass-pill overflow-hidden' : 'bg-white shadow-sm'}`}>
      
      {/* Top Banner (Info) */}
      <div className="bg-secondary text-white text-[12px] font-medium py-2 px-margin-mobile md:px-gutter flex justify-between items-center hidden md:flex">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><Phone size={14} className="text-orange-400" /> Call Us: +92 300 1234567</span>
          <span className="flex items-center gap-2 text-white/90">
            Signup and get <span className="text-primary font-bold">20% OFF</span> your first order.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/about" className="hover:text-primary transition-colors">Help Center</Link>
          <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`w-full px-margin-mobile md:px-gutter flex justify-between items-center transition-all duration-500 ${scrolled ? 'py-3 bg-transparent' : 'py-5 border-b border-gray-100 bg-white/95'}`}>
        
        {/* Left Links */}
        <div className="hidden md:flex gap-8 flex-1">
          <Link to="/" className={`text-[14px] font-bold relative group ${isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Home
            {isActive('/') && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
          </Link>
          <Link to="/shop" className={`text-[14px] font-bold relative group ${isActive('/shop') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Shop with Trust
            {isActive('/shop') && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
          </Link>
          <Link to="/calculator" className={`text-[14px] font-bold relative group ${isActive('/calculator') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Calculator
            {isActive('/calculator') && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
          </Link>
        </div>

        {/* Center Logo */}
        <div className="flex-1 text-left md:text-center flex items-center justify-start md:justify-center">
          <Link className="flex items-baseline gap-1.5 group" to="/">
            <span className="font-serif text-[26px] md:text-[32px] font-bold text-secondary tracking-widest leading-none group-hover:text-primary transition-colors duration-500">
              NAZIR
            </span>
            <span className="font-serif text-[24px] md:text-[30px] font-medium text-primary italic leading-none">
              & SONS
            </span>
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end text-secondary">
          <button aria-label="search" className="hover:text-primary transition-colors p-2 hover:bg-orange-50 rounded-full">
            <Search size={22} strokeWidth={2} />
          </button>
          <Link to="/profile" aria-label="user" className="hover:text-primary transition-colors hidden sm:block p-2 hover:bg-orange-50 rounded-full">
            <User size={22} strokeWidth={2} />
          </Link>
          <Link to="/cart" aria-label="shopping_cart" className="hover:text-primary transition-colors relative p-2 hover:bg-orange-50 rounded-full hidden sm:block">
            <ShoppingCart size={22} strokeWidth={2} />
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Secondary Categories Bar */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-secondary text-white py-3 px-margin-mobile md:px-gutter flex justify-center items-center gap-6 md:gap-12 overflow-x-auto hide-scrollbar border-b border-white/10"
          >
            <Link to="/shop" state={{ mainCategory: 'Fine Arts' }} className="flex items-center gap-2 text-[12px] font-bold text-white/80 hover:text-white transition-colors whitespace-nowrap uppercase tracking-[0.1em]">
              <Palette size={14} className="text-orange-400" /> Fine Arts
            </Link>
            <Link to="/shop" state={{ mainCategory: 'Stationery' }} className="flex items-center gap-2 text-[12px] font-bold text-white/80 hover:text-white transition-colors whitespace-nowrap uppercase tracking-[0.1em]">
              <BookOpen size={14} className="text-orange-400" /> Stationery
            </Link>
            <Link to="/shop" state={{ mainCategory: 'Paper & Canvas' }} className="flex items-center gap-2 text-[12px] font-bold text-white/80 hover:text-white transition-colors whitespace-nowrap uppercase tracking-[0.1em]">
              <Layers size={14} className="text-orange-400" /> Paper & Canvas
            </Link>
            <Link to="/shop" state={{ mainCategory: 'Accessories' }} className="flex items-center gap-2 text-[12px] font-bold text-white/80 hover:text-white transition-colors whitespace-nowrap uppercase tracking-[0.1em]">
              <PenTool size={14} className="text-orange-400" /> Accessories
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
