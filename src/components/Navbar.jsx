import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Phone, Palette, BookOpen, Layers, PenTool } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// The search modal pulls in framer-motion and the full product catalog. Neither
// belongs in the first paint, so the chunk is fetched the moment it's opened.
const SearchModal = lazy(() => import('./SearchModal'));

const CATEGORY_LINKS = [
  { label: 'Fine Arts', icon: Palette },
  { label: 'Stationery', icon: BookOpen },
  { label: 'Paper & Canvas', icon: Layers },
  { label: 'Accessories', icon: PenTool },
];

// The marquee translates by -50%, so the list is rendered twice over to make the
// wrap seamless; two more passes keep it wide enough for large viewports.
const MARQUEE_PASSES = [0, 1, 2, 3];

const Navbar = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const isActive = (path) => location.pathname === path;

  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Stays true after the first open so closing doesn't unmount (and re-fetch) it.
  const [searchMounted, setSearchMounted] = useState(false);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      // Coalesce bursts of scroll events into one state update per frame.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const openSearch = () => {
    setSearchMounted(true);
    setIsSearchOpen(true);
  };

  return (
    <header
      className={`w-full z-50 fixed top-0 left-0 flex justify-center pointer-events-none font-sans animate-slide-down transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'pt-4 px-4 md:pt-6 md:px-6' : 'pt-0 px-0'}`}
    >
      <div className={`w-full pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${scrolled ? 'max-w-6xl rounded-[32px] glass-pill overflow-hidden border border-white/40 shadow-glass' : 'bg-white shadow-sm'}`}>
      
      {/* Top Banner (Info) */}
      <div className="bg-secondary text-white text-[12px] font-medium py-2 px-margin-mobile md:px-gutter flex justify-between items-center hidden md:flex">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <a href="tel:+923202220001" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone size={14} className="text-orange-400" /> Call: +92 320 2220001
            </a>
            <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
            </a>
          </div>
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
      <div className={`w-full px-margin-mobile md:px-gutter flex justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'py-3 bg-transparent' : 'py-5 border-b border-gray-100 bg-white/95'}`}>
        
        {/* Left Links */}
        <div className="hidden md:flex gap-8 flex-1">
          <Link to="/" className={`text-[14px] font-bold relative group ${isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Home
            {isActive('/') && <span className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
          </Link>
          <Link to="/shop" className={`text-[14px] font-bold relative group ${isActive('/shop') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Shop with Trust
            {isActive('/shop') && <span className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
          </Link>
          <Link to="/calculator" className={`text-[14px] font-bold relative group ${isActive('/calculator') ? 'text-primary' : 'text-gray-600 hover:text-secondary transition-colors'}`}>
            Calculator
            {isActive('/calculator') && <span className="absolute -bottom-6 left-0 w-full h-[3px] bg-primary rounded-t-md" />}
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
          <button onClick={openSearch} aria-label="search" className="hover:text-primary transition-colors p-2 hover:bg-orange-50 rounded-full">
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

      {/*
        Collapses via a grid-row transition — the browser animates it off the
        main thread, where the old height:auto tween forced a layout every frame.
      */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}
      >
        <div className="overflow-hidden">
          <div className="bg-secondary text-white py-3 border-b border-white/10 overflow-hidden w-full flex">
            <div className="flex items-center gap-10 md:gap-16 w-max px-4 animate-marquee-slow motion-reduce:animate-none">
              {MARQUEE_PASSES.map((pass) => (
                <React.Fragment key={pass}>
                  {CATEGORY_LINKS.map(({ label, icon: Icon }) => (
                    <Link
                      key={`${pass}-${label}`}
                      to="/shop"
                      state={{ mainCategory: label }}
                      className="flex items-center gap-2 text-[12px] font-bold text-white/80 hover:text-white transition-colors whitespace-nowrap uppercase tracking-[0.1em]"
                    >
                      <Icon size={14} className="text-orange-400" /> {label}
                    </Link>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {searchMounted && (
        <Suspense fallback={null}>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </Suspense>
      )}
    </header>
  );
};

export default Navbar;
