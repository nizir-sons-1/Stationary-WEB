import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShoppingCart, Menu, X, ChevronRight, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { categoryPath } from '../lib/site';
import SearchModal from './SearchModal';

const LEFT_LINKS = [
  { label: 'Shop', path: '/shop' },
  { label: 'Paper & Canvas', path: categoryPath('Paper & Canvas') },
  { label: 'Fine Arts', path: categoryPath('Fine Arts') },
];

const RIGHT_LINKS = [
  { label: 'Calculator', path: '/calculator' },
  { label: 'Track Order', path: '/track-order' },
];

const DEPARTMENTS = [
  { label: 'Shop All Departments', path: '/shop' },
  { label: 'Paper & Canvas', path: categoryPath('Paper & Canvas') },
  { label: 'Fine Arts', path: categoryPath('Fine Arts') },
  { label: 'Stationery', path: categoryPath('Stationery') },
  { label: 'Notebooks', path: categoryPath('Notebooks') },
  { label: 'Accessories', path: categoryPath('Accessories') },
];

const getNavLinkClass = (active, isTransparent) => {
  if (active) {
    return 'text-[#0f172a] font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]';
  }
  if (isTransparent) {
    return 'text-[#0f172a] font-semibold hover:text-primary drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]';
  }
  return 'text-[#0f172a] font-semibold hover:text-primary';
};

const Navbar = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const isActive = (path) => location.pathname === path;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  // Track scroll position for transparent -> white glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search and mobile drawer when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 h-[64px] md:h-[68px] flex items-center font-sans transition-all duration-300 antialiased ${
          isTransparent
            ? 'bg-gradient-to-b from-[#faf9f6]/50 via-[#faf9f6]/20 to-transparent border-b border-transparent shadow-none'
            : 'bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e5e1d7]/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="relative w-full max-w-container-max mx-auto px-4 md:px-gutter flex items-center justify-between">
          
          {/* Left Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {LEFT_LINKS.map(({ label, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={label}
                  to={path}
                  className={`text-[13.5px] xl:text-[14px] tracking-wide transition-all duration-200 py-1 relative select-none ${getNavLinkClass(
                    active,
                    isTransparent
                  )}`}
                >
                  {label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Left: Menu Button */}
          <div className="flex lg:hidden items-center z-10">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex items-center gap-1.5 text-[#0f172a] hover:text-primary transition-colors cursor-pointer select-none py-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
            >
              <Menu size={18} strokeWidth={2} />
              <span className="text-[12px] font-medium tracking-wide">Menu</span>
            </button>
          </div>

          {/* Absolute Dead-Center Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
            <Link className="flex items-baseline gap-1 sm:gap-1.5 group select-none" to="/">
              <span className="font-serif text-[19px] xs:text-[21px] sm:text-[25px] md:text-[27px] font-bold text-[#0f172a] tracking-[0.16em] leading-none group-hover:text-primary transition-colors duration-300 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                NAZIR
              </span>
              <span className="font-serif text-[17px] xs:text-[19px] sm:text-[23px] md:text-[25px] font-bold text-[#e65100] italic leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                &amp; SONS
              </span>
            </Link>
          </div>

          {/* Mobile Right: Search Icon & Shopping Bag */}
          <div className="flex lg:hidden items-center gap-3 sm:gap-4 z-10 ml-auto">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search catalog"
              className="text-[#0f172a] hover:text-primary transition-colors cursor-pointer select-none p-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
            >
              <Search size={19} strokeWidth={2} />
            </button>

            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative text-[#0f172a] hover:text-primary transition-colors p-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
            >
              <ShoppingBag size={19} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[9px] font-bold min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full border border-white shadow-sm leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Right Navigation & Action Area (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3.5 ml-auto">
            
            {/* Right Links (Desktop) */}
            <nav className="flex items-center gap-6 xl:gap-8 mr-2">
              {RIGHT_LINKS.map(({ label, path }) => {
                const active = isActive(path);
                return (
                  <Link
                    key={label}
                    to={path}
                    className={`text-[13.5px] xl:text-[14px] tracking-wide transition-all duration-200 py-1 relative select-none ${getNavLinkClass(
                      active,
                      isTransparent
                    )}`}
                  >
                    {label}
                    {active && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Luxury Search Pill Trigger Button (Desktop) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search supplies"
              className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/85 hover:bg-white border border-[#ded9ce] text-[#0f172a] hover:text-primary transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer group"
            >
              <Search size={17} strokeWidth={2.2} className="group-hover:scale-105 transition-transform" />
              <span className="hidden xl:inline text-[13px] text-[#64748b] group-hover:text-[#0f172a] font-normal pr-1">
                Search...
              </span>
              <kbd className="hidden xl:inline text-[10px] bg-[#ece8df] text-[#64748b] px-1.5 py-0.5 rounded font-mono font-medium">
                ⌘K
              </kbd>
            </button>

            {/* Cart Icon Button (Desktop) */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/85 hover:bg-white border border-[#ded9ce] text-[#0f172a] hover:text-primary transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] group"
            >
              <ShoppingCart
                size={18}
                strokeWidth={2.2}
                className="group-hover:scale-105 transition-transform"
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>

        </div>
      </header>

      {/* ── Luxury Top-Down Animated Search Takeover (LV Style) ── */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Drawer (Louis Vuitton Luxury Style) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <aside
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] bg-[#faf8f5] shadow-2xl flex flex-col z-10 transition-transform duration-300 overflow-y-auto"
            aria-label="Navigation Menu"
          >
            {/* Header of Drawer */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#e5e1d7]/70 bg-white sticky top-0 z-10">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-baseline gap-1"
              >
                <span className="font-serif text-[19px] font-bold text-[#0f172a] tracking-[0.16em]">
                  NAZIR
                </span>
                <span className="font-serif text-[17px] font-bold text-[#e65100] italic">
                  &amp; SONS
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 text-[#0f172a] hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="p-4 border-b border-[#e5e1d7]/50 bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-[3px] bg-[#f5f3ee] border border-[#e5e1d7] flex items-center gap-2 text-[12.5px] text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
              >
                <Search size={15} />
                <span>Search 500+ paper &amp; art supplies...</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-4 space-y-5">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8892a0] mb-2 px-1">
                  DEPARTMENTS
                </p>
                <div className="space-y-1">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.label}
                      to={dept.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-[3px] font-serif text-[14.5px] font-medium text-[#0f172a] hover:bg-white hover:text-primary transition-all"
                    >
                      <span>{dept.label}</span>
                      <ChevronRight size={15} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8892a0] mb-2 px-1">
                  SERVICES &amp; TOOLS
                </p>
                <div className="space-y-1">
                  <Link
                    to="/calculator"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-[3px] text-[13.5px] font-medium text-[#0f172a] hover:bg-white hover:text-primary transition-all"
                  >
                    <span>Custom Paper Calculator</span>
                    <ChevronRight size={15} className="text-gray-400" />
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-[3px] text-[13.5px] font-medium text-[#0f172a] hover:bg-white hover:text-primary transition-all"
                  >
                    <span>Track Your Order</span>
                    <ChevronRight size={15} className="text-gray-400" />
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-[3px] text-[13.5px] font-medium text-[#0f172a] hover:bg-white hover:text-primary transition-all"
                  >
                    <span>Wholesale &amp; Bulk Orders</span>
                    <ChevronRight size={15} className="text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Quick WhatsApp Contact */}
            <div className="p-4 bg-white border-t border-[#e5e1d7]/70 mt-auto">
              <a
                href="https://wa.me/923202220001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-[3px] bg-[#112338] text-white text-[12.5px] font-semibold hover:bg-[#1a3654] transition-colors shadow-sm"
              >
                <Phone size={14} />
                <span>WhatsApp: 0320 2220001</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
