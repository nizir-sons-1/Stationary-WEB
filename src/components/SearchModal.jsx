import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductIndex } from '../hooks/useSupabase';
import { fallbackOnError, thumb } from '../lib/images';

const TRENDING_ROW_TOP = ['art paper', 'bleach card', 'fine arts', 'a4 copier'];
const TRENDING_ROW_BOTTOM = ['watercolour', 'sketchbooks', 'kraft paper'];
const TRENDING_SEARCHES = [...TRENDING_ROW_TOP, ...TRENDING_ROW_BOTTOM];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [savedFavorites, setSavedFavorites] = useState(() => new Set());
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { products, loading } = useProductIndex(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and auto-focus search input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 140);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProductSelect = (productName) => {
    onClose();
    void navigate(`/product/${encodeURIComponent(productName)}`);
  };

  const handleNavigateToShop = (categoryFilter = null) => {
    onClose();
    if (categoryFilter) {
      void navigate(`/shop?category=${encodeURIComponent(categoryFilter)}`);
    } else {
      void navigate('/shop');
    }
  };

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    setSavedFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Live filtered catalog search
  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const hits = [];
    for (const p of products || []) {
      if (
        p.product_name?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle)
      ) {
        hits.push(p);
        if (hits.length === 24) break;
      }
    }
    return hits;
  }, [products, query]);

  // Curated collections for initial display (LV editorial grid)
  const { featuredPapers, fineArtsCollection } = useMemo(() => {
    if (!products || products.length === 0) {
      return { featuredPapers: [], fineArtsCollection: [] };
    }
    const papers = [];
    const arts = [];

    for (const p of products) {
      const cat = (p.category || '').toLowerCase();
      if (
        papers.length < 4 &&
        (cat.includes('card') || cat.includes('paper') || cat.includes('board'))
      ) {
        papers.push(p);
      } else if (
        arts.length < 4 &&
        (cat.includes('art') || cat.includes('canvas') || cat.includes('stationery'))
      ) {
        arts.push(p);
      }
      if (papers.length === 4 && arts.length === 4) break;
    }

    const fallbackList = products.slice(0, 8);
    return {
      featuredPapers: papers.length > 0 ? papers : fallbackList.slice(0, 4),
      fineArtsCollection: arts.length > 0 ? arts : fallbackList.slice(4, 8),
    };
  }, [products]);

  // Clean, high-fashion product card matching LV reference with accessible native HTML
  const renderProductCard = (product) => {
    const prices = (product.product_variations || []).map((v) => v.price).filter(Boolean);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const isFav = savedFavorites.has(product.id);

    return (
      <div
        key={product.id}
        className="group flex flex-col select-none text-left"
      >
        {/* Minimal Luxury Image Container */}
        <div className="relative aspect-square bg-[#f6f5f2] rounded-none sm:rounded-[2px] overflow-hidden flex items-center justify-center p-3 sm:p-5 transition-colors group-hover:bg-[#f0eee8]">
          {/* Subtle Heart Wishlist Icon Button */}
          <button
            type="button"
            onClick={(e) => toggleFavorite(e, product.id)}
            aria-label={`Save ${product.product_name} to wishlist`}
            className="absolute top-2.5 right-2.5 p-1 text-[#8e8e8e] hover:text-[#000000] transition-colors z-20 cursor-pointer"
          >
            <Heart
              size={15}
              strokeWidth={1.2}
              className={isFav ? 'fill-[#000000] text-[#000000]' : ''}
            />
          </button>

          {/* Product Thumbnail Click Target */}
          <button
            type="button"
            onClick={() => handleProductSelect(product.product_name)}
            aria-label={`View ${product.product_name}`}
            className="w-full h-full flex items-center justify-center cursor-pointer"
          >
            {product.image_url ? (
              <img
                src={thumb(product.image_url, 300)}
                alt={product.product_name}
                width={260}
                height={260}
                loading="lazy"
                decoding="async"
                onError={fallbackOnError}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-300"
              />
            ) : (
              <div className="text-[#c5c1b8] text-xs uppercase tracking-widest font-serif">
                Nazir &amp; Sons
              </div>
            )}
          </button>
        </div>

        {/* LV Editorial Card Typography */}
        <div className="pt-2 pb-1 flex flex-col">
          <span className="text-[11px] text-[#767676] font-normal leading-snug">
            New
          </span>
          <button
            type="button"
            onClick={() => handleProductSelect(product.product_name)}
            className="text-[13px] sm:text-[14px] font-normal text-[#111111] leading-tight group-hover:underline underline-offset-2 line-clamp-1 mt-0.5 text-left cursor-pointer"
          >
            {product.product_name}
          </button>
          {minPrice !== null && (
            <span className="text-[12px] sm:text-[13px] font-normal text-[#111111] mt-1">
              Rs. {Math.round(minPrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render search results extracted from nested ternary
  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="py-20 text-center text-[#8e8e8e] text-sm font-light">
          Loading results...
        </div>
      );
    }

    if (filteredProducts.length > 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map(renderProductCard)}
        </div>
      );
    }

    return (
      <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center">
        <h3 className="font-serif text-[18px] sm:text-[20px] font-normal text-[#000000] mb-2">
          No results found
        </h3>
        <p className="text-[#767676] text-[13px] max-w-md mb-6">
          No products matched &ldquo;{query}&rdquo;. Check spelling or explore popular
          searches below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-lg">
          {TRENDING_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-3 py-1 rounded-full border border-[#d5d0c7] text-[12px] text-[#111111] hover:border-[#000000] transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="luxury-search-takeover"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto"
        >
          {/* ── Top Bar: Clean Centered Wordmark & Minimal Close Button ── */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-transparent">
            <div className="w-8 sm:w-12" /> {/* Balance spacer */}

            {/* Timeless High-Fashion Brand Logo */}
            <div className="flex flex-col items-center justify-center select-none text-center">
              <span className="font-serif text-[18px] xs:text-[20px] sm:text-[22px] font-bold text-[#000000] tracking-[0.24em] uppercase leading-none">
                NAZIR &amp; SONS
              </span>
            </div>

            {/* Minimalist Close Icon */}
            <div className="w-8 sm:w-12 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="p-1 text-[#000000] hover:opacity-60 transition-opacity cursor-pointer"
              >
                <X size={20} strokeWidth={1.2} />
              </button>
            </div>
          </div>

          {/* ── Body Container ────────────────────────────────────────── */}
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-16 flex flex-col flex-1">
            {/* Minimal LV-Style Rounded Pill Search Input (No inner icon) */}
            <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-5">
              <div className="relative flex items-center rounded-full border border-[#d5d0c7] bg-white hover:border-[#999999] focus-within:border-[#000000] transition-colors duration-200 px-5 sm:px-6 h-11 sm:h-12">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for paper, card, GSM..."
                  className="flex-1 bg-transparent text-[14px] sm:text-[15px] font-normal text-[#000000] placeholder-[#8e8e8e] outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="p-1 text-[#8e8e8e] hover:text-[#000000] transition-colors cursor-pointer"
                  >
                    <X size={15} strokeWidth={1.4} />
                  </button>
                )}
              </div>
            </div>

            {/* TRENDING SEARCHES: 4 on top, 3 on bottom in mobile view */}
            <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-12">
              <div className="text-center text-[10.5px] font-bold tracking-[0.18em] text-[#000000] uppercase mb-2.5">
                TRENDING SEARCHES
              </div>

              {/* Mobile Layout: 4 on top, 3 on bottom */}
              <div className="flex flex-col items-center gap-1.5 sm:hidden">
                <div className="flex items-center justify-center gap-2.5 xs:gap-3.5">
                  {TRENDING_ROW_TOP.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="text-[11.5px] xs:text-[12px] text-[#222222] hover:text-[#000000] transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-4 font-normal"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 xs:gap-4">
                  {TRENDING_ROW_BOTTOM.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="text-[11.5px] xs:text-[12px] text-[#222222] hover:text-[#000000] transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-4 font-normal"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Layout: Single elegant row */}
              <div className="hidden sm:flex items-center justify-center gap-6 py-0.5">
                {TRENDING_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="text-[13px] text-[#222222] hover:text-[#000000] transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-4 font-normal"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Product Showcase Area ──────────────────────────────── */}
            {query.trim() === '' ? (
              /* LV EDITORIAL CURATED SECTIONS */
              <div className="space-y-10 sm:space-y-12">
                {/* Section 1: Featured Paper & Board */}
                {featuredPapers.length > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between mb-4 sm:mb-5">
                      <h3 className="font-serif text-[17px] sm:text-[20px] font-normal text-[#000000] tracking-wide">
                        Featured Paper &amp; Board
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleNavigateToShop()}
                        className="text-[12px] text-[#767676] hover:text-[#000000] underline-offset-2 hover:underline cursor-pointer transition-colors"
                      >
                        View all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                      {featuredPapers.map(renderProductCard)}
                    </div>
                  </div>
                )}

                {/* Section 2: Fine Arts & Supplies */}
                {fineArtsCollection.length > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between mb-4 sm:mb-5">
                      <h3 className="font-serif text-[17px] sm:text-[20px] font-normal text-[#000000] tracking-wide">
                        Fine Arts &amp; Stationery
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleNavigateToShop('Fine Arts')}
                        className="text-[12px] text-[#767676] hover:text-[#000000] underline-offset-2 hover:underline cursor-pointer transition-colors"
                      >
                        View all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                      {fineArtsCollection.map(renderProductCard)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LIVE FILTERED SEARCH RESULTS */
              <div>
                <div className="flex items-baseline justify-between mb-4 sm:mb-5 border-b border-[#e5e3dc] pb-2">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#000000]">
                    Results ({filteredProducts.length})
                  </span>
                  <span className="text-[12px] text-[#767676]">
                    Matches for &ldquo;{query}&rdquo;
                  </span>
                </div>

                {renderSearchResults()}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchModal;
