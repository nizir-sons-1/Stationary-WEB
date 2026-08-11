import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductIndex } from '../hooks/useSupabase';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { products, loading } = useProductIndex();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  // Memoised, and the needle is lower-cased once instead of once per row —
  // this runs over the whole catalogue on every keystroke.
  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const hits = [];
    for (const p of products) {
      if (
        p.product_name?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle)
      ) {
        hits.push(p);
        if (hits.length === 6) break; // show top 6 results
      }
    }
    return hits;
  }, [products, query]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col p-4 sm:p-6 lg:p-12 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#111111]/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col mt-4 md:mt-12"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <Search className="text-gray-400" size={24} />
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for paper, card, GSM..."
                className="flex-1 text-xl font-medium text-secondary outline-none placeholder:text-gray-300"
              />
              <button onClick={handleClose} className="p-2 bg-gray-50 text-gray-400 hover:text-[#111111] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() !== '' && (
                <div className="p-2">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm font-medium animate-pulse">Searching catalog...</div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate(`/product/${encodeURIComponent(p.product_name)}`)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover mix-blend-multiply" />
                          ) : (
                            <Package className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-secondary group-hover:text-primary transition-colors">{p.product_name}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">{p.category}</span>
                        </div>
                        <Search size={16} className="text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <Search size={28} />
                      </div>
                      <h3 className="text-gray-800 font-bold mb-1">No results found</h3>
                      <p className="text-gray-400 text-sm">We couldn't find anything matching "{query}". Try checking your spelling or use more general terms.</p>
                    </div>
                  )}
                </div>
              )}
              {query.trim() === '' && (
                <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary mb-4">
                    <Search size={28} />
                  </div>
                  <p className="text-sm font-medium">Type something to start searching</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchModal;
