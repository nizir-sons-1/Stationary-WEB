import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Check,
  Truck,
  ShieldCheck,
  Headphones,
  Shuffle,
  ChevronUp,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categoryPath } from '../lib/site';
import { useProducts, useTaxonomyImages } from '../hooks/useSupabase';
import { departmentOf } from '../data/categories';
import { flyToCart } from '../lib/cartAnimation';

const DEPARTMENTS = [
  {
    name: 'Paper & Canvas',
    path: categoryPath('Paper & Canvas'),
    desc: 'Printing paper, art paper, canvas & more',
    image: 'https://ygfcoasnftbzavefmqmt.supabase.co/storage/v1/object/public/product-images/taxonomy/1791795813243-810a5aa4.webp',
  },
  {
    name: 'Fine Arts',
    path: categoryPath('Fine Arts'),
    desc: 'Paints, brushes, sketchbooks, art supplies',
    image: 'https://i.postimg.cc/CxwwZt2n/image.webp',
  },
  {
    name: 'Stationery',
    path: categoryPath('Stationery'),
    desc: 'Pens, markers, desk essentials & more',
    image: 'https://i.postimg.cc/pL3kcbtY/image-(2).webp',
  },
  {
    name: 'Notebooks',
    path: categoryPath('Notebooks'),
    desc: 'Journals, planners, sketchbooks & notebooks',
    image: 'https://i.postimg.cc/tJbMS0WM/image-(1).webp',
  },
  {
    name: 'Accessories',
    path: categoryPath('Accessories'),
    desc: 'Bags, organizers, clips, & useful extras',
    image: 'https://ygfcoasnftbzavefmqmt.supabase.co/storage/v1/object/public/product-images/taxonomy/1791702902134-b5347c6a.webp',
  },
];

const FALLBACK_POPULAR = [
  {
    id: 'fb-1',
    name: 'F4 Premium Copy Paper (80 GSM)',
    price: 1300,
    image: 'https://i.postimg.cc/BnPdYMnV/ezgif-com-video-to-gif-converter.gif',
    category: 'Copy Paper',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-2',
    name: 'Pindo Art Card (Gloss Finish)',
    price: 2390,
    image: 'https://i.postimg.cc/dtkc3mPB/image.png',
    category: 'Art Card',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-3',
    name: 'KINMARI Art Paper (Smooth White)',
    price: 7375,
    image: 'https://i.postimg.cc/jdPwNfyd/image.png',
    category: 'Art Paper',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-4',
    name: 'IK Premium Offset Paper',
    price: 7011,
    image: 'https://i.postimg.cc/76PnGnsx/23-36-70.png',
    category: 'Offset Paper',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-5',
    name: 'Al Baster Ivory Card',
    price: 2897,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf2Olx5mpxGPgRWoe2r5bQG1slsdWwIRkpHxeFA6eKfvk0Ayo1nvyyqk07alM&s',
    category: 'Ivory Card',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-6',
    name: 'Polo Heavy Duty BoxBoard',
    price: 4231,
    image: 'https://i.postimg.cc/N0NNXXRq/image.png',
    category: 'BoxBoard',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-7',
    name: 'Ningbo Premium Bleach Card',
    price: 3019,
    image: 'https://i.postimg.cc/LX10RvZM/image.png',
    category: 'Bleach Card',
    department: 'Paper & Canvas',
  },
  {
    id: 'fb-8',
    name: 'Impression Carbonless Paper Ream',
    price: 5950,
    image: 'https://i.postimg.cc/sXmdMsRW/Capture1.jpg',
    category: 'Carbonless',
    department: 'Paper & Canvas',
  },
];

const TRUST_FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Wholesale & Retail',
    subtitle: 'For individuals and businesses',
  },
  {
    icon: Truck,
    title: 'Pakistan-wide Delivery',
    subtitle: 'Fast & reliable shipping',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Materials',
    subtitle: 'Trusted brands & premium grade',
  },
  {
    icon: Headphones,
    title: 'Easy Ordering',
    subtitle: 'Simple, secure & hassle-free',
  },
];

const VideoSection = () => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay handling
      });
    }
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      className="w-full mb-8 md:mb-10 overflow-hidden rounded-[4px] border border-[#e5e1d7] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      aria-label="Art and Paper Craft Showcase"
    >
      <div className="relative w-full aspect-[16/9] bg-[#f8f6f0] overflow-hidden">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          controls={false}
          preload="metadata"
          poster="/videos/section-video-poster.webp"
          className="w-full h-full object-cover"
        >
          {isInView && (
            <>
              <source src="/videos/section-video.webm" type="video/webm" />
              <source src="/videos/section-video.mp4" type="video/mp4" />
              <source src="/public/videos/section-video.webm" type="video/webm" />
              <source src="/public/videos/section-video.mp4" type="video/mp4" />
            </>
          )}
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

const CategoryCards = () => {
  const { addToCart } = useCart();
  const { departmentImages } = useTaxonomyImages();
  const { products: dbProducts } = useProducts(null);
  const [wishlist, setWishlist] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [shuffleOffset, setShuffleOffset] = useState(0);

  // Filter and round-robin distinct real products across all departments
  const allAvailablePicks = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) {
      return FALLBACK_POPULAR;
    }

    const valid = dbProducts
      .filter((p) => {
        const hasImg = Boolean(p.image_url || p.product_variations?.[0]?.image_url);
        const hasPrice = Number(p.product_variations?.[0]?.price) > 0;
        return hasImg && hasPrice;
      })
      .map((p) => {
        const firstVar = p.product_variations?.[0];
        const price = Number(firstVar?.price) || 0;
        const img = p.image_url || firstVar?.image_url || '/images/copy_paper.webp';
        const dept = departmentOf(p.category) || 'Stationery';
        return {
          id: p.id,
          name: p.product_name,
          price: Math.round(price),
          image: img,
          category: p.category,
          department: dept,
        };
      });

    if (valid.length === 0) return FALLBACK_POPULAR;

    // Group into department buckets so we can sample diverse products across departments
    const departmentsList = ['Paper & Canvas', 'Fine Arts', 'Stationery', 'Accessories', 'Notebooks'];
    const buckets = {};
    for (const d of departmentsList) buckets[d] = [];

    for (const item of valid) {
      const d = item.department || 'Stationery';
      if (!buckets[d]) buckets[d] = [];
      buckets[d].push(item);
    }

    // Interleave across departments so adjacent cards are always from different departments/categories
    const interleaved = [];
    let added = true;
    let index = 0;
    while (added && interleaved.length < 32) {
      added = false;
      for (const d of departmentsList) {
        if (buckets[d]?.[index]) {
          interleaved.push(buckets[d][index]);
          added = true;
        }
      }
      index++;
    }

    return interleaved.length > 0 ? interleaved : valid;
  }, [dbProducts]);

  const displayedProducts = useMemo(() => {
    const total = allAvailablePicks.length;
    if (total === 0) return [];
    
    // Rotate items by shuffleOffset
    const offset = shuffleOffset % total;
    const rotated = [
      ...allAvailablePicks.slice(offset),
      ...allAvailablePicks.slice(0, offset),
    ];

    return isExpanded ? rotated.slice(0, 12) : rotated.slice(0, 4);
  }, [allAvailablePicks, isExpanded, shuffleOffset]);

  const handleShuffle = () => {
    setShuffleOffset((prev) => prev + 4);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product, event) => {
    if (event?.currentTarget) {
      flyToCart(event.currentTarget);
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1
    );

    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section id="departments" className="scroll-mt-24 w-full py-4 md:py-6 font-sans">
      
      {/* ── 1. Compact 5-Department Showcase Grid ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-8 md:mb-10">
        {DEPARTMENTS.map((dept) => {
          const deptImage = departmentImages?.[dept.name] || dept.image;
          return (
            <Link
              key={dept.name}
              to={dept.path}
              className="group flex flex-col bg-white rounded-[3px] border border-[#e5e1d7] hover:border-[#112338]/40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
            >
              {/* Compact Image Container */}
              <div className="w-full aspect-[16/11] bg-[#f8f6f0] overflow-hidden">
                <img
                  src={deptImage}
                  alt={dept.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = dept.image;
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Compact Details Matching Reference */}
              <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                <h3 className="font-serif text-[13.5px] sm:text-[14px] font-medium text-[#112338] group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>{dept.name}</span>
                  <span className="text-[12px] text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    &rarr;
                  </span>
                </h3>
                <p className="text-[10.5px] sm:text-[11px] text-[#64748b] mt-0.5 line-clamp-2 leading-relaxed">
                  {dept.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Mid-Page Video Showcase Section ────────────────────────────── */}
      <VideoSection />

      {/* ── 2. Featured Products Section: "Popular Picks" (Compact) ─────── */}
      <div className="w-full">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 md:mb-5 pb-2.5 border-b border-gray-100 gap-2">
          <div>
            <p className="text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-[0.18em] mb-0.5">
              FEATURED PRODUCTS
            </p>
            <h2 className="font-serif text-[20px] sm:text-[25px] md:text-[27px] font-normal text-[#112338] tracking-tight leading-tight">
              Popular Picks
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Randomize / Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              title="Shuffle to see other best sellers"
              className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-gray-600 hover:text-[#112338] bg-white hover:bg-gray-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Shuffle size={11} className="text-gray-500" />
              <span className="hidden xs:inline">Randomize</span>
            </button>

            {/* View All / Toggle Button - Positioned on the Right */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-[#112338] hover:text-primary transition-colors cursor-pointer group"
            >
              <span>{isExpanded ? 'Show Less' : 'View All'}</span>
              {isExpanded ? (
                <ChevronUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 md:gap-4">
          {displayedProducts.map((product) => {
            const isLiked = wishlist[product.id];
            const isAdded = addedItems[product.id];

            return (
              <div
                key={product.id}
                className="bg-white rounded-[3px] border border-[#e5e1d7] hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-all duration-300 p-2.5 sm:p-3 flex flex-col justify-between group"
              >
                {/* Product Image & Wishlist Button */}
                <div className="relative w-full aspect-[4/3] bg-[#fbfaf8] rounded-[2px] overflow-hidden mb-2.5">
                  <Link
                    to={`/product/${encodeURIComponent(product.name)}`}
                    className="w-full h-full flex items-center justify-center p-2"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/copy_paper.webp';
                      }}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>
                  
                  {/* Heart Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Add to wishlist"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-rose-500 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                  >
                    <Heart
                      size={13}
                      className={isLiked ? 'fill-rose-500 text-rose-500' : ''}
                    />
                  </button>
                </div>

                {/* Product Title & Price */}
                <div className="flex flex-col flex-1 mb-2.5">
                  <span className="text-[9.5px] font-semibold text-[#8892a0] uppercase tracking-wider block mb-0.5 line-clamp-1">
                    {product.category || product.department}
                  </span>
                  <Link to={`/product/${encodeURIComponent(product.name)}`}>
                    <h3 className="text-[12px] sm:text-[13px] font-medium text-[#112338] hover:text-primary transition-colors line-clamp-2 min-h-[34px] leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[13px] sm:text-[14px] font-bold text-[#112338] mt-1">
                    PKR {product.price.toLocaleString()}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(product, e)}
                  className={`w-full py-1.5 sm:py-2 px-2.5 rounded-[3px] font-semibold text-[11.5px] sm:text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#112338] hover:bg-[#1a3654] text-white active:scale-[0.99] shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={13} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={13} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── 3. Trust & Service Highlights Strip ─────────────────────── */}
      <div className="w-full mt-8 md:mt-10 bg-[#faf8f5] border border-[#e8e4dc] rounded-[3px] p-1.5 sm:p-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {TRUST_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isLastColMobile = idx % 2 === 1;
            const isFirstRowMobile = idx < 2;
            const isLastDesktop = idx === TRUST_FEATURES.length - 1;

            return (
              <div
                key={feat.title}
                className={`flex flex-col items-center text-center py-3 px-2 sm:py-3.5 sm:px-3 ${
                  !isLastColMobile ? 'border-r border-[#e8e4dc]' : ''
                } ${isFirstRowMobile ? 'border-b md:border-b-0 border-[#e8e4dc]' : ''} ${
                  !isLastDesktop ? 'md:border-r md:border-[#e8e4dc]' : 'md:border-r-0'
                }`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#112338] mb-1.5">
                  <Icon size={20} strokeWidth={1.65} />
                </div>
                <h4 className="text-[12px] sm:text-[13px] font-bold text-[#112338] tracking-tight">
                  {feat.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#64748b] mt-0.5 leading-snug">
                  {feat.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Promotional & Smart Tool Banners ─────────────────────────── */}
      <div className="w-full mt-6 md:mt-8 space-y-4">
        
        {/* Banner 1: Custom Paper Size Calculator (Full HD Background) */}
        <div className="w-full bg-[#faf8f5] border border-[#e5e1d7] rounded-[3px] overflow-hidden relative shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[220px] sm:min-h-[240px] flex items-center">
          {/* Full High-Resolution Background Image */}
          <picture className="absolute inset-0 w-full h-full pointer-events-none">
            <source srcSet="/images/calculator-banner-hd.avif" type="image/avif" />
            <source srcSet="/images/calculator-banner-hd.webp" type="image/webp" />
            <img
              src="/images/calculator-banner-hd.jpg"
              alt="Paper size calculator and drafting desk"
              className="w-full h-full object-cover object-right sm:object-center"
            />
          </picture>
          
          {/* Subtle Mobile Readability Gradient (Only on small screens) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5]/95 via-[#faf8f5]/70 to-transparent sm:from-[#faf8f5]/50 sm:to-transparent pointer-events-none" />

          {/* Text Content */}
          <div className="relative z-10 py-6 sm:py-7 px-5 sm:px-8 md:px-10 max-w-[460px] md:max-w-[500px]">
            <p className="text-[10px] sm:text-[11px] font-bold text-[#64748b] uppercase tracking-[0.18em] mb-1.5">
              SMART TOOLS FOR BETTER PLANNING
            </p>
            <h3 className="font-serif text-[22px] sm:text-[26px] md:text-[28px] font-normal text-[#112338] tracking-tight leading-tight mb-2">
              Need a custom paper size?
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[#475569] leading-relaxed mb-4">
              Calculate the right size and price for your project with our paper size &amp; price calculator.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-1.5 bg-[#112338] hover:bg-[#1a3654] text-white text-[12px] sm:text-[13px] font-semibold py-2 px-4 rounded-[3px] transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Open Paper Calculator</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Banner 2: Wholesale & Bulk Buyers (High-Res) */}
        <div className="w-full bg-[#18424e] border border-[#143742] rounded-[3px] overflow-hidden flex flex-col md:flex-row items-stretch shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Left Boxes Photo */}
          <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 h-36 md:h-auto overflow-hidden">
            <picture className="w-full h-full">
              <source srcSet="/images/wholesale-boxes-hd.avif" type="image/avif" />
              <source srcSet="/images/wholesale-boxes-hd.webp" type="image/webp" />
              <img
                src="/images/wholesale-boxes-hd.jpg"
                alt="Wholesale and bulk packaging supplies"
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </div>

          {/* Right Text & CTA */}
          <div className="flex-1 py-4 sm:py-5 px-5 sm:px-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#86b3c2] uppercase tracking-[0.18em] mb-1">
                FOR BUSINESSES &amp; BULK BUYERS
              </p>
              <h3 className="font-serif text-[19px] sm:text-[22px] md:text-[24px] font-normal text-white tracking-tight leading-tight mb-1">
                Special rates for wholesale buyers.
              </h3>
              <p className="text-[11.5px] sm:text-[12.5px] text-[#b6d3dc] max-w-[560px] leading-relaxed">
                Printers, publishers, schools, offices and businesses — get the best prices on bulk orders with dedicated support.
              </p>
            </div>

            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center gap-1.5 border border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold text-[12px] sm:text-[13px] py-2 px-4 rounded-[3px] transition-colors self-start md:self-auto"
            >
              <span>Get in Touch</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
};

export default CategoryCards;
