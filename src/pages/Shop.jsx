import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, ArrowLeft, FileText, Package, BookOpen, Newspaper, Tag, Box, CreditCard, Sparkles, Feather, Archive, Palette, PenTool, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts, useCategoryCounts } from '../hooks/useSupabase';
import TermsModal from '../components/TermsModal';
import gsap from 'gsap';

const MAIN_CATEGORIES = [
  { name: 'Paper & Canvas', icon: Layers, bg: 'bg-emerald-50', color: 'text-emerald-600', image: 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&w=600&q=80', count: '16 Categories' },
  { name: 'Fine Arts', icon: Palette, bg: 'bg-orange-50', color: 'text-orange-600', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', count: 'Coming Soon' },
  { name: 'Stationery', icon: PenTool, bg: 'bg-blue-50', color: 'text-blue-600', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', count: 'Coming Soon' },
  { name: 'Notebooks', icon: BookOpen, bg: 'bg-yellow-50', color: 'text-yellow-600', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80', count: 'Coming Soon' },
  { name: 'Accessories', icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600', image: 'https://images.unsplash.com/photo-1522881118552-6d1ff8f8dc05?auto=format&fit=crop&w=400&q=80', count: 'Coming Soon' }
];

const PAPER_CATEGORIES = [
  { name: 'Bleach Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'group-hover:bg-blue-600 group-hover:text-white', image: '/images/white_paper.png' },
  { name: 'Art Card', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', hover: 'group-hover:bg-purple-600 group-hover:text-white', image: '/images/art_card.png' },
  { name: 'Art Paper', icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50', hover: 'group-hover:bg-pink-600 group-hover:text-white', image: '/images/art_paper.png' },
  { name: 'Matte Paper', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50', hover: 'group-hover:bg-amber-600 group-hover:text-white', image: '/images/matte_paper.png' },
  { name: 'Copy Paper', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-600 group-hover:text-white', image: '/images/copy_paper.png' },
  { name: 'Offset Paper', icon: Archive, color: 'text-cyan-600', bg: 'bg-cyan-50', hover: 'group-hover:bg-cyan-600 group-hover:text-white', image: '/images/offset_paper.png' },
  { name: 'Ivory Card', icon: CreditCard, color: 'text-stone-600', bg: 'bg-stone-50', hover: 'group-hover:bg-stone-600 group-hover:text-white', image: '/images/ivory_card.png' },
  { name: 'Color Card', icon: Layers, color: 'text-rose-600', bg: 'bg-rose-50', hover: 'group-hover:bg-rose-600 group-hover:text-white', image: '/images/color_card.png' },
  { name: 'Carbonless', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'group-hover:bg-indigo-600 group-hover:text-white', image: '/images/carbonless.png' },
  { name: 'Stickers', icon: Tag, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', hover: 'group-hover:bg-fuchsia-600 group-hover:text-white', image: '/images/stickers.png' },
  { name: 'Local Paper', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50', hover: 'group-hover:bg-teal-600 group-hover:text-white', image: '/images/local_paper.png' },
  { name: 'BoxBoard', icon: Box, color: 'text-orange-600', bg: 'bg-orange-50', hover: 'group-hover:bg-orange-600 group-hover:text-white', image: '/images/kraft.png' },
  { name: 'News', icon: Newspaper, color: 'text-slate-600', bg: 'bg-slate-50', hover: 'group-hover:bg-slate-600 group-hover:text-white', image: '/images/news_paper.png' },
  { name: 'Butter Paper', icon: Feather, color: 'text-sky-600', bg: 'bg-sky-50', hover: 'group-hover:bg-sky-600 group-hover:text-white', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'Kraft Card', icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-50', hover: 'group-hover:bg-yellow-600 group-hover:text-white', image: 'https://images.unsplash.com/photo-1518707399587-25e243dbf152?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { name: 'Book Paper', icon: BookOpen, color: 'text-lime-600', bg: 'bg-lime-50', hover: 'group-hover:bg-lime-600 group-hover:text-white', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
];

const formatPrice = (priceStr) => {
  const num = Number(priceStr);
  return isNaN(num) ? priceStr : num.toLocaleString();
};

const ProductGroupCard = ({ productName, variations }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGsm, setSelectedGsm] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Extract all unique Sizes for this product group
  const availableSizes = useMemo(() => {
    const sizes = variations
      .map(p => p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A'))
      .filter(Boolean);
    return [...new Set(sizes)];
  }, [variations]);

  // Initialize Size on mount
  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Extract available GSMs based on the selected Size
  const availableGsms = useMemo(() => {
    if (!selectedSize) return [];
    const gsms = variations.filter(p => {
      const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A');
      return pSize === selectedSize;
    }).map(p => p.GSM).filter(Boolean);
    return [...new Set(gsms)].sort((a, b) => Number(a) - Number(b));
  }, [variations, selectedSize]);

  // Initialize/Update GSM when Size changes
  useEffect(() => {
    if (availableGsms.length > 0) {
      if (!availableGsms.includes(selectedGsm)) {
        setSelectedGsm(availableGsms[0]);
      }
    } else {
      setSelectedGsm('');
    }
  }, [availableGsms, selectedGsm]);

  // Get the precise product variation based on selections
  const currentVariation = useMemo(() => {
    if (!selectedGsm || !selectedSize) return variations[0];
    return variations.find(p => {
      const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A');
      return p.GSM === selectedGsm && pSize === selectedSize;
    }) || variations[0];
  }, [variations, selectedGsm, selectedSize]);

  const inStock = Number(currentVariation.Stock) > 0;

  return (
    <article className="product-card w-full h-full group bg-white border border-white/60 shadow-glass glass-panel flex flex-col rounded-2xl hover:shadow-antigravity hover:-translate-y-2 transition-all duration-500 overflow-hidden">
      {/* Product Image Link */}
      <Link to={`/product/${encodeURIComponent(productName)}`} className="aspect-[5/4] bg-surface-variant overflow-hidden relative border-b border-gray-100 p-2 md:p-4 flex items-center justify-center cursor-pointer">
        {inStock ? (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[#111111] text-[7px] md:text-[9px] uppercase font-bold px-1.5 py-0.5 md:px-2 md:py-1 tracking-wider border border-gray-200 rounded-sm md:rounded-md shadow-sm z-10">In Stock</div>
        ) : (
          <div className="absolute top-2 left-2 bg-red-50/90 backdrop-blur text-red-600 text-[7px] md:text-[9px] uppercase font-bold px-1.5 py-0.5 md:px-2 md:py-1 tracking-wider border border-red-100 rounded-sm md:rounded-md shadow-sm z-10">Out of Stock</div>
        )}
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out absolute inset-0 mix-blend-multiply"
          src={currentVariation.IMAGE_URL || "https://images.unsplash.com/photo-1596484552993-9c878e11a37c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={productName}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596484552993-9c878e11a37c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }}
        />
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-1 bg-white">
        <Link to={`/product/${encodeURIComponent(productName)}`} className="hover:text-primary transition-colors">
          <h3 className="text-[13px] sm:text-[15px] md:text-[20px] text-[#111111] font-bold leading-tight line-clamp-1">{productName}</h3>
        </Link>
        <p className="text-[9px] md:text-[13px] text-gray-500 mt-0.5 md:mt-1 mb-2 md:mb-4 line-clamp-1">{currentVariation?.Description || 'Premium High Quality Stock'}</p>

        {/* Dynamic Selectors */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col bg-gray-50/80 rounded-lg p-1.5 border border-gray-100">
            <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest px-1">Size</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-transparent text-[#111111] text-[10px] md:text-[11px] font-bold px-1 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:12px]"
            >
              {availableSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col bg-gray-50/80 rounded-lg p-1.5 border border-gray-100">
            <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest px-1">GSM</span>
            <select
              value={selectedGsm}
              onChange={(e) => setSelectedGsm(e.target.value)}
              className="w-full bg-transparent text-[#111111] text-[10px] md:text-[11px] font-bold px-1 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:12px]"
            >
              {availableGsms.map(gsm => (
                <option key={gsm} value={gsm}>{gsm}g</option>
              ))}
            </select>
          </div>
        </div>

        {/* Installment Toggle */}
        {PAPER_CATEGORIES.map(c => c.name.toLowerCase()).includes((currentVariation?.Category || '').toLowerCase()) && (
          <div className="flex items-center gap-1.5 mb-3 -mt-1 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100">
            <input 
              type="checkbox" 
              checked={isInstallment}
              onChange={(e) => setIsInstallment(e.target.checked)}
              className="w-3 h-3 text-indigo-600 bg-white border-indigo-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer shadow-sm"
            />
            <span 
              className="text-[8px] md:text-[9px] text-indigo-700 font-bold uppercase tracking-widest cursor-pointer"
              onClick={() => setIsInstallment(!isInstallment)}
            >
              Request Installment (3M)
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-0.5 line-clamp-1">Rs / {currentVariation?.PACKING_TYPE || 'ream'}</span>
            <span className="font-price-display text-[#111111] font-black text-[15px] md:text-[18px] leading-none whitespace-nowrap">Rs. {formatPrice(currentVariation?.CALCULATED_PRICE_RS || 0)}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (inStock) {
                if (isInstallment) {
                  setShowTerms(true);
                } else {
                  addToCart({
                    id: currentVariation.ProductID || `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
                    name: currentVariation.PRODUCT_NAME,
                    gsm: currentVariation.GSM,
                    size: selectedSize,
                    price: Number(currentVariation.CALCULATED_PRICE_RS) || 0,
                    image: currentVariation.IMAGE_URL || "https://images.unsplash.com/photo-1596484552993-9c878e11a37c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    packingType: currentVariation.PACKING_TYPE || 'ream'
                  }, 1, false, null, false, null);
                }
              }
            }}
            className={`${inStock ? 'bg-[#111111] text-white hover:bg-primary shadow-[0_4px_14px_rgba(17,17,17,0.2)] hover:shadow-[0_4px_14px_rgba(234,88,12,0.3)]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 hover:-translate-y-1`}
          >
            {inStock ? <ShoppingBag size={16} className="md:w-5 md:h-5 w-4 h-4" /> : <span className="text-[8px] font-bold">OUT</span>}
          </button>
        </div>
      </div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onAgree={() => {
          setShowTerms(false);
          addToCart({
            id: currentVariation.ProductID || `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
            name: currentVariation.PRODUCT_NAME,
            gsm: currentVariation.GSM,
            size: selectedSize,
            price: Number(currentVariation.CALCULATED_PRICE_RS) || 0,
            image: currentVariation.IMAGE_URL || "https://images.unsplash.com/photo-1596484552993-9c878e11a37c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            packingType: currentVariation.PACKING_TYPE || 'ream'
          }, 1, false, null, true, '3 Months');
        }} 
      />
    </article>
  );
};

const Shop = () => {
  const location = useLocation();
  const [selectedMainCategory, setSelectedMainCategory] = useState(location.state?.mainCategory || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(location.state?.subCategory || null);
  const categoriesGridRef = useRef(null);
  const productsGridRef = useRef(null);

  useEffect(() => {
    if (location.state?.mainCategory) {
      setSelectedMainCategory(location.state.mainCategory);
    }
    if (location.state?.subCategory) {
      setSelectedSubCategory(location.state.subCategory);
    }
  }, [location.state]);

  // Stagger categories on mount
  useEffect(() => {
    if ((!selectedMainCategory || !selectedSubCategory) && categoriesGridRef.current) {
      gsap.fromTo('.category-card', 
        { y: 50, opacity: 0, scale: 0.9, rotateX: 20 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)', clearProps: 'all' }
      );
    }
  }, [selectedMainCategory, selectedSubCategory]);

  // Stagger products when selected category changes
  useEffect(() => {
    if (selectedSubCategory && productsGridRef.current) {
      gsap.fromTo('.product-card', 
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'all' }
      );
    }
  }, [selectedSubCategory]);

  const { products: dbProducts, loading: productsLoading } = useProducts(selectedSubCategory);
  const { counts: categoryCounts, loading: countsLoading } = useCategoryCounts();

  // Group products by PRODUCT_NAME mapping Supabase data to existing format
  const groupedProducts = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map(p => {
      const variations = p.product_variations.map(v => ({
        PRODUCT_NAME: p.product_name,
        Description: p.description,
        Category: p.category,
        ProductID: v.id,
        Display_Size: v.size,
        GSM: String(v.gsm),
        CALCULATED_PRICE_RS: v.price,
        PACKING_TYPE: v.packing_type,
        Stock: v.stock,
        IMAGE_URL: v.image_url || p.image_url
      }));
      return { name: p.product_name, variations };
    }).filter(group => group.variations.length > 0);
  }, [dbProducts]);

  // Create dynamic categories from counts
  const dynamicCategories = useMemo(() => {
    const paperCatNames = PAPER_CATEGORIES.map(c => c.name.toLowerCase());
    
    let filteredKeys = Object.keys(categoryCounts);
    
    if (selectedMainCategory === 'Paper & Canvas') {
      // Only show paper categories
      filteredKeys = filteredKeys.filter(catName => paperCatNames.includes(catName.toLowerCase()));
    } else if (selectedMainCategory) {
      // For other departments (which are mostly placeholders from scraped data), show non-paper categories
      filteredKeys = filteredKeys.filter(catName => !paperCatNames.includes(catName.toLowerCase()));
    }

    return filteredKeys.map((catName, idx) => {
      const staticCat = PAPER_CATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (staticCat) return { ...staticCat, count: categoryCounts[catName] };
      
      const colors = [
        { color: 'text-blue-600', bg: 'bg-blue-50', hover: 'group-hover:bg-blue-600 group-hover:text-white' },
        { color: 'text-purple-600', bg: 'bg-purple-50', hover: 'group-hover:bg-purple-600 group-hover:text-white' },
        { color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-600 group-hover:text-white' },
        { color: 'text-amber-600', bg: 'bg-amber-50', hover: 'group-hover:bg-amber-600 group-hover:text-white' },
        { color: 'text-rose-600', bg: 'bg-rose-50', hover: 'group-hover:bg-rose-600 group-hover:text-white' },
      ];
      const style = colors[idx % colors.length];
      
      return {
        name: catName,
        icon: Box,
        ...style,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        count: categoryCounts[catName]
      };
    }).sort((a, b) => b.count - a.count);
  }, [categoryCounts, selectedMainCategory]);

  if (!selectedMainCategory) {
    return (
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full flex flex-col pt-16 md:pt-20 pb-stack-lg">
        <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex justify-between items-end">
          <div>
            <h1 className="font-headline-xl text-[28px] md:text-headline-xl text-on-surface">Shop Departments</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Select a department to view available categories.</p>
          </div>
        </div>

        <div ref={categoriesGridRef} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6 auto-rows-[120px] sm:auto-rows-[140px] md:auto-rows-[200px]">
          {MAIN_CATEGORIES.map((cat, idx) => {
            const isFeatured = cat.name === 'Paper & Canvas';
            return (
              <div
                key={idx}
                role="button"
                onClick={() => setSelectedMainCategory(cat.name)}
                className={`category-card cursor-pointer w-full h-full flex flex-col items-center justify-center p-0 glass-panel border border-white/60 rounded-[16px] md:rounded-[24px] shadow-glass hover:shadow-antigravity hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden preserve-3d perspective-1000 ${isFeatured ? 'col-span-2 row-span-1 md:row-span-2' : 'col-span-1 row-span-1'}`}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${cat.image})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/40 to-transparent group-hover:from-primary/90 transition-colors duration-500"></div>
                <div className={`relative z-10 flex flex-col items-center justify-end h-full w-full ${isFeatured ? 'p-4 md:p-6' : 'p-2 sm:p-3 md:p-5'}`}>
                  <span className={`font-bold text-center text-white drop-shadow-md leading-tight ${isFeatured ? 'font-headline-xl text-[24px] sm:text-[28px] md:text-[36px]' : 'font-headline-md text-[13px] sm:text-[15px] md:text-[20px]'}`}>{cat.name}</span>
                  <span className={`text-white/90 mt-1.5 md:mt-2 uppercase tracking-widest font-bold bg-white/20 rounded-full backdrop-blur-sm border border-white/20 ${isFeatured ? 'text-[10px] md:text-[12px] px-3 py-1 md:px-4 md:py-1.5' : 'text-[7px] sm:text-[8px] md:text-[10px] px-2 py-0.5 md:px-3 md:py-1'}`}>{cat.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  if (selectedMainCategory && !selectedSubCategory) {


    return (
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full flex flex-col pt-16 md:pt-20 pb-stack-lg">
        <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex flex-col gap-4">
          <button onClick={() => setSelectedMainCategory(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#111111] font-label-caps font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-fit text-[10px] transition-colors">
            <ArrowLeft size={14} /> Back to Departments
          </button>
          <div>
            <h1 className="font-headline-xl text-[28px] md:text-headline-xl text-on-surface">Shop by Category</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Select a category to view available stock and pricing.</p>
          </div>
        </div>

        <div ref={categoriesGridRef} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-5 auto-rows-[100px] sm:auto-rows-[120px] md:auto-rows-[160px] grid-flow-dense">
          {dynamicCategories.map((cat, idx) => {
            const count = cat.count || 0;
            // Feature some cards to create a bento box layout
            const isFeatured = idx === 0 || idx === 5 || idx === 10 || idx === 14;
            
            return (
              <div
                key={idx}
                role="button"
                onClick={() => setSelectedSubCategory(cat.name)}
                className={`category-card cursor-pointer w-full h-full flex flex-col items-center justify-center p-0 glass-panel border border-white/60 rounded-[12px] md:rounded-[20px] shadow-glass hover:shadow-antigravity hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden preserve-3d perspective-1000 ${isFeatured ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${cat.image})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/50 to-transparent group-hover:from-primary/90 transition-colors duration-500"></div>
                <div className={`relative z-10 flex flex-col items-center justify-end h-full w-full ${isFeatured ? 'p-3 md:p-6' : 'p-1.5 md:p-3'}`}>
                  <span className={`font-bold text-center text-white drop-shadow-md leading-tight ${isFeatured ? 'font-headline-lg text-[18px] sm:text-[22px] md:text-[28px]' : 'font-headline-sm text-[10px] sm:text-[12px] md:text-[15px]'}`}>{cat.name}</span>
                  <span className={`text-white/90 mt-1 md:mt-1.5 uppercase tracking-widest font-bold bg-white/20 rounded-full backdrop-blur-sm border border-white/20 ${isFeatured ? 'text-[9px] md:text-[11px] px-2 py-0.5 md:px-3 md:py-1' : 'text-[6px] sm:text-[7px] md:text-[9px] px-1.5 py-0.5'}`}>
                    {countsLoading ? '...' : (count > 0 ? `${count} Items` : 'Soon')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-1 w-full max-w-container-max mx-auto pt-8">
      {/* SideNavBar - Desktop Only */}
      <aside className="hidden md:flex flex-col py-stack-md px-margin-mobile h-full w-[280px] border-r border-gray-100 bg-white shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="mb-stack-md pl-2">
          <button onClick={() => setSelectedSubCategory(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#111111] font-label-caps font-bold tracking-widest uppercase mb-4 text-[11px] transition-colors">
            <ArrowLeft size={16} /> All Categories
          </button>
          <h2 className="font-headline-md text-[22px] font-bold text-[#111111] tracking-tight">{selectedMainCategory}</h2>
          <p className="font-body-sm text-gray-500 mt-1">Premium Stock Catalog</p>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1 pr-2">
          {dynamicCategories.map((cat, idx) => {
            const isSelected = selectedSubCategory === cat.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSubCategory(cat.name)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ease-in-out ${isSelected ? 'bg-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100' : 'hover:bg-gray-50/50 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? cat.bg + ' ' + cat.color : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                  <cat.icon size={18} strokeWidth={2.5} />
                </div>
                <span className={`font-body-sm font-bold text-[14px] ${isSelected ? 'text-[#111111]' : 'text-gray-500'}`}>{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Canvas */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 md:gap-8 pb-stack-lg bg-[#fcfcfc]">
        {/* Back Button (Mobile) */}
        <div className="md:hidden">
          <button onClick={() => setSelectedSubCategory(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#111111] font-label-caps font-bold tracking-widest uppercase bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm w-fit text-[11px] transition-colors">
            <ArrowLeft size={16} /> Back to Categories
          </button>
        </div>

        {/* Header Bar */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <h1 className="font-headline-xl text-[28px] md:text-[36px] font-extrabold text-[#111111] flex items-center gap-3 tracking-tight">
            {(() => {
              const activeCat = dynamicCategories.find(c => c.name === selectedSubCategory);
              return activeCat ? (
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${activeCat.bg} ${activeCat.color} shadow-sm`}>
                  <activeCat.icon size={24} strokeWidth={2.5} className="md:w-8 md:h-8 w-5 h-5" />
                </div>
              ) : null;
            })()}
            {selectedSubCategory}
            <span className="text-[16px] md:text-[20px] text-gray-400 font-medium ml-2">({groupedProducts.length} Products)</span>
          </h1>
        </section>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        ) : groupedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <Package size={56} className="text-gray-300 mb-5" />
            <h3 className="font-headline-md text-gray-800 font-bold text-[20px]">No products available</h3>
            <p className="text-gray-500 font-body-sm mt-2 text-[14px]">This category is currently empty.</p>
          </div>
        ) : (
          <section ref={productsGridRef} className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6 perspective-1000">
            {groupedProducts.map((group, idx) => (
              <ProductGroupCard key={idx} productName={group.name} variations={group.variations} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Shop;

