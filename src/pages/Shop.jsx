import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts, useCategoryCounts, useTaxonomyImages } from '../hooks/useSupabase';
import {
  DEPARTMENTS,
  PAPER_AND_CANVAS,
  PAPER_CATEGORY_NAMES,
  dbNamesFor,
  categoryFromSlug,
  departmentFromSlug,
  departmentOf,
  displayNameOf,
  groupCategories,
} from '../data/categories';
import { PLACEHOLDER_IMAGE, fallbackOnError, thumb, thumbSrcSet } from '../lib/images';
import TermsModal from '../components/TermsModal';
import { usePageSeo } from '../lib/seo';
import { itemListSchema } from '../lib/schema';
import { categoryPath, productPath, slugify, titleFromSlug } from '../lib/site';
import { ROUTES } from '../data/seo-content';
import gsap from 'gsap';

/*
 * Department artwork.
 *
 * Only Paper & Canvas is pinned — it is the flagship and its photograph is
 * deliberate. The other four take the photo of their busiest category, which
 * means the tile always shows something the department genuinely stocks and
 * updates itself as the catalogue changes.
 */
const PAPER_DEPARTMENT_IMAGE =
  'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&w=600&q=80';

const DEPARTMENT_FALLBACK_IMAGES = {
  [PAPER_AND_CANVAS]: 'https://ygfcoasnftbzavefmqmt.supabase.co/storage/v1/object/public/product-images/taxonomy/1791795813243-810a5aa4.webp',
  'Fine Arts': 'https://i.postimg.cc/CxwwZt2n/image.webp',
  'Stationery': 'https://i.postimg.cc/pL3kcbtY/image-(2).webp',
  'Notebooks': 'https://i.postimg.cc/tJbMS0WM/image-(1).webp',
  'Accessories': 'https://ygfcoasnftbzavefmqmt.supabase.co/storage/v1/object/public/product-images/taxonomy/1791702902134-b5347c6a.webp',
};


const formatPrice = (priceStr) => {
  const num = Number(priceStr);
  return isNaN(num) ? priceStr : num.toLocaleString();
};

/*
 * Category art used to be a CSS `background-image`, which the browser always
 * downloads eagerly — 16 categories meant 16 full-size fetches before anything
 * below the fold was even visible. A real <img> gets native lazy loading.
 *
 * The source is now a genuine product photo from inside the category, served
 * at tile size rather than at the 2000 px the catalogue stores, and any image
 * that fails falls back to artwork that ships with the site.
 */
const CardArt = ({ src, alt, eager, width = 400, sizes }) => (
  <img
    src={thumb(src, width)}
    srcSet={thumbSrcSet(src)}
    sizes={sizes}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    fetchPriority={eager ? 'high' : 'low'}
    onError={fallbackOnError}
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />
);

/*
 * How wide each tile actually renders, mirroring the grid definitions below.
 * These are what let the browser pick the right candidate from the srcset —
 * without them it assumes the image fills the viewport and always takes the
 * largest one.
 */
const DEPARTMENT_SIZES = { featured: '(min-width: 768px) 50vw, 100vw', normal: '(min-width: 768px) 25vw, 50vw' };
const CATEGORY_SIZES = {
  featured: '(min-width: 1024px) 480px, (min-width: 768px) 380px, 66vw',
  normal: '(min-width: 1024px) 240px, (min-width: 768px) 190px, 33vw',
};

// Memoised: a grid can hold dozens of these, and without it every one of them
// re-rendered whenever the cart changed.
const ProductGroupCard = React.memo(function ProductGroupCard({ productName, installmentHidden, isCategoryInstallmentDisabled, variations }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGsm, setSelectedGsm] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const btnRef = useRef(null);

  const triggerAddAnimation = () => {
    setIsAdded(true);
    // Flying dot animation toward the cart tab
    if (btnRef.current) {
      const dot = document.createElement('span');
      const btnRect = btnRef.current.getBoundingClientRect();
      const cartEl = document.querySelector('[data-cart-tab]');
      const targetX = cartEl ? cartEl.getBoundingClientRect().left + cartEl.offsetWidth / 2 - btnRect.left - btnRect.width / 2 : 0;
      const targetY = cartEl ? cartEl.getBoundingClientRect().top - btnRect.top : -80;
      dot.style.cssText = `
        position:fixed;
        left:${btnRect.left + btnRect.width / 2}px;
        top:${btnRect.top + btnRect.height / 2}px;
        width:10px;height:10px;
        border-radius:50%;
        background:rgb(234 88 12);
        pointer-events:none;
        z-index:9999;
        transform:translate(-50%,-50%);
      `;
      document.body.appendChild(dot);
      dot.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(0.3)`, opacity: 0 }
      ], { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' })
        .onfinish = () => dot.remove();
    }
    setTimeout(() => setIsAdded(false), 1500);
  };

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
    <article className="product-card w-full h-full group bg-white border border-[#e5e1d7] hover:border-[#112338]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col rounded-[3px] overflow-hidden">
      {/* Product Image Link */}
      <Link to={`/product/${encodeURIComponent(productName)}`} className="aspect-[4/3] bg-[#fbfaf8] overflow-hidden relative border-b border-[#e5e1d7]/70 p-3 flex items-center justify-center cursor-pointer">
        {inStock ? (
          <div className="absolute top-2 left-2 bg-white/95 text-emerald-700 text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider border border-emerald-200/60 rounded-[2px] shadow-sm z-10 backdrop-blur-xs">In Stock</div>
        ) : (
          <div className="absolute top-2 left-2 bg-rose-50/95 text-rose-600 text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider border border-rose-200/60 rounded-[2px] shadow-sm z-10 backdrop-blur-xs">Out of Stock</div>
        )}
        <img
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          src={thumb(currentVariation.IMAGE_URL, 400)}
          srcSet={thumbSrcSet(currentVariation.IMAGE_URL)}
          sizes="(min-width: 1536px) 300px, (min-width: 1024px) 340px, 50vw"
          alt={productName}
          loading="lazy"
          decoding="async"
          onError={fallbackOnError}
        />
      </Link>

      <div className="p-3 sm:p-3.5 flex flex-col flex-1 bg-white">
        <Link to={`/product/${encodeURIComponent(productName)}`} className="hover:text-primary transition-colors">
          <h3 className="font-serif text-[13px] sm:text-[14.5px] md:text-[16px] font-medium text-[#112338] leading-snug line-clamp-1">{productName}</h3>
        </Link>
        <p className="text-[10px] sm:text-[11.5px] text-[#64748b] mt-0.5 mb-2.5 line-clamp-1">{currentVariation?.Description || 'Premium High Quality Stock'}</p>

        {/* Dynamic Selectors */}
        <div className={`grid ${departmentOf(currentVariation?.Category) === PAPER_AND_CANVAS ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 mb-2.5`}>
          <div className="flex flex-col bg-[#faf8f5] rounded-[3px] p-1.5 border border-[#e5e1d7]">
            <span className="text-[7.5px] md:text-[8.5px] text-[#8892a0] font-bold uppercase tracking-wider px-0.5">Size</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-transparent text-[#112338] text-[10px] sm:text-[11px] font-semibold px-0.5 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:10px]"
            >
              {availableSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          {departmentOf(currentVariation?.Category) === PAPER_AND_CANVAS && (
            <div className="flex flex-col bg-[#faf8f5] rounded-[3px] p-1.5 border border-[#e5e1d7]">
              <span className="text-[7.5px] md:text-[8.5px] text-[#8892a0] font-bold uppercase tracking-wider px-0.5">GSM</span>
              <select
                value={selectedGsm}
                onChange={(e) => setSelectedGsm(e.target.value)}
                className="w-full bg-transparent text-[#112338] text-[10px] sm:text-[11px] font-semibold px-0.5 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:10px]"
              >
                {availableGsms.map(gsm => (
                  <option key={gsm} value={gsm}>{gsm}g</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Installment Toggle */}
        {!installmentHidden && !isCategoryInstallmentDisabled && PAPER_CATEGORY_NAMES.has((currentVariation?.Category || '').toLowerCase()) && (
          <div className="flex items-center gap-1.5 mb-2.5 bg-indigo-50/60 p-1.5 rounded-[3px] border border-indigo-100">
            <input 
              type="checkbox" 
              checked={isInstallment}
              onChange={(e) => setIsInstallment(e.target.checked)}
              className="w-3 h-3 text-indigo-600 bg-white border-indigo-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer shadow-sm"
            />
            <span 
              className="text-[8px] md:text-[8.5px] text-indigo-700 font-bold uppercase tracking-wider cursor-pointer"
              onClick={() => setIsInstallment(!isInstallment)}
            >
              Request Installment (3M)
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-auto pt-2.5 border-t border-[#e5e1d7]/70 flex justify-between items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-semibold tracking-wider text-[#64748b] uppercase mb-0.5 line-clamp-1">Rs / {currentVariation?.PACKING_TYPE || 'ream'}</span>
            <span className="font-serif font-bold text-[#112338] text-[15px] sm:text-[17px] leading-tight whitespace-nowrap">Rs. {formatPrice(currentVariation?.CALCULATED_PRICE_RS || 0)}</span>
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
                    image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
                    packingType: currentVariation.PACKING_TYPE || 'ream',
                    category: currentVariation.Category
                  }, 1, false, null, false, null);
                  triggerAddAnimation();
                }
              }
            }}
            ref={btnRef}
            className={`${
              isAdded
                ? 'bg-emerald-600 text-white'
                : inStock
                  ? 'bg-[#112338] text-white hover:bg-[#1a3654] active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } h-8 md:h-9 px-2.5 sm:px-3 rounded-[3px] font-semibold text-[11px] sm:text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 shadow-sm`}
          >
            {isAdded ? (
              <>
                <Check size={13} className="stroke-[2.5]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : inStock ? (
              <>
                <ShoppingBag size={13} />
                <span className="hidden sm:inline">Add</span>
              </>
            ) : (
              <span className="text-[9px] font-bold uppercase">Out</span>
            )}
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
            image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
            packingType: currentVariation.PACKING_TYPE || 'ream',
            category: currentVariation.Category
          }, 1, false, null, true, '3 Months');
        }} 
      />
    </article>
  );
});

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /*
   * ───────────────────────────────────────────────────────────────────────────
   * WHICH SHELF IS OPEN LIVES IN THE URL, NOT IN COMPONENT STATE
   * ───────────────────────────────────────────────────────────────────────────
   *
   * This used to be two useState values. That made the entire catalogue — five
   * departments and around 170 categories — reachable only by clicking: every
   * one of those views was served at the single URL /shop, so there was nothing
   * for a search engine to index, nothing to link to, nothing to put in a
   * sitemap, and no way for a customer to send someone "the ivory card page".
   * The browser's back button did not work through the drill-down either.
   *
   * /shop/paper-and-canvas/art-card is now a real page: it has its own title,
   * its own description, its own structured data, and a static HTML file
   * written for it at build time.
   */
  const { deptSlug, categorySlug } = useParams();
  const requestedMainCategory = deptSlug ? departmentFromSlug(deptSlug) : null;

  const categoriesGridRef = useRef(null);
  const productsGridRef = useRef(null);

  /*
   * Anything still navigating the old way — `<Link to="/shop" state={{...}}>` —
   * is redirected to the addressable URL on arrival, and the history entry
   * replaced, so a shared or bookmarked link is always the canonical form.
   */
  useEffect(() => {
    const sub = location.state?.subCategory;
    const main = location.state?.mainCategory;
    if (!sub && !main) return;

    const dept = main || departmentOf(sub);
    navigate(categoryPath(dept, sub ? displayNameOf(sub) : null), { replace: true });
  }, [location.state, navigate]);

  const { counts: categoryCounts, images: categoryImages, loading: countsLoading } = useCategoryCounts();

  // Artwork set from the admin panel. Absent until someone sets one, at which
  // point it takes precedence over both the bundled art and the borrowed photo.
  // `hidden*` are the shelves an admin has taken off the shop entirely.
  const {
    departmentImages: adminDepartmentImages,
    categoryImages: adminCategoryImages,
    hiddenDepartments,
    hiddenCategories,
    hiddenInstallmentDepartments,
    hiddenInstallmentCategories,
    loading: taxonomyLoading,
  } = useTaxonomyImages();

  /*
   * Hiding a department has to close its URL too, not just remove its tile.
   *
   * /shop/stationery stays in Google's index and in customers' history long
   * after the shelf comes off the shop, and a filter applied only to the grid
   * would leave that link serving the full category list — the one thing hiding
   * it was meant to prevent. Treating the slug as unresolved routes the visitor
   * to the department index, which is already what an unknown slug does.
   *
   * Gated on the flag having actually arrived: until then nothing is hidden, so
   * a slow request cannot bounce someone off a page that is perfectly visible.
   */
  const selectedMainCategory =
    !taxonomyLoading && requestedMainCategory && hiddenDepartments[requestedMainCategory]
      ? null
      : requestedMainCategory;

  /*
   * One pass folds the raw Supabase tallies into the cards the shop shows:
   * spellings of the same shelf are merged, each card is handed a photo of
   * something actually inside it, and anything unrecognised still surfaces.
   */
  const cardsByDepartment = useMemo(
    () => groupCategories(categoryCounts, categoryImages, adminCategoryImages),
    [categoryCounts, categoryImages, adminCategoryImages]
  );

  const dynamicCategories = useMemo(
    () =>
      selectedMainCategory
        ? (cardsByDepartment[selectedMainCategory] || []).filter((c) => !hiddenCategories[c.name])
        : [],
    [cardsByDepartment, selectedMainCategory, hiddenCategories]
  );

  /*
   * The slug in the URL, turned back into the name the catalogue uses.
   *
   * Most shelves are in the static map in src/data/categories.js and resolve
   * immediately. A shelf the database has grown since that file was last
   * touched is not there, so it is matched against the live category list once
   * the tally lands — which is why new stock is never a dead URL.
   */
  const selectedSubCategory = useMemo(() => {
    if (!categorySlug) return null;
    const known = categoryFromSlug(categorySlug);
    // A hidden category has to fail to resolve for the same reason a hidden
    // department does — otherwise its old URL keeps serving the product list.
    // `dynamicCategories` is already filtered, so only the static map needs the
    // extra check.
    if (known) return !taxonomyLoading && hiddenCategories[known] ? null : known;
    const hit = dynamicCategories.find((c) => slugify(c.name) === categorySlug);
    return hit ? hit.name : null;
  }, [categorySlug, dynamicCategories, hiddenCategories, taxonomyLoading]);

  // Which of the three views to render is decided by the URL alone, not by
  // whether the name has resolved yet — otherwise a slug awaiting the live
  // category list would flash the category grid before the product list.
  const showingProducts = Boolean(categorySlug);
  const categoryHeading = selectedSubCategory || titleFromSlug(categorySlug);

  // Stagger categories on mount
  useEffect(() => {
    if (!showingProducts && categoriesGridRef.current) {
      gsap.fromTo('.category-card',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [selectedMainCategory, showingProducts]);

  // Stagger products when selected category changes
  useEffect(() => {
    if (selectedSubCategory && productsGridRef.current) {
      gsap.fromTo('.product-card',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [selectedSubCategory]);

  // A card can stand for several raw category strings (see src/data/categories.js),
  // so ask for all of them — otherwise a merged card would show only part of
  // the stock its badge promises.
  const activeDbCategories = useMemo(
    () => (selectedSubCategory ? dbNamesFor(selectedSubCategory) : null),
    [selectedSubCategory]
  );

  /*
   * Only ask for products once a category is actually open. Passing a null
   * category made this fall through to "fetch the entire catalogue" — roughly
   * a megabyte of variations pulled down on the department and category
   * screens, neither of which renders a single product.
   */
  const { products: dbProducts, loading: productsLoading } = useProducts(
    activeDbCategories,
    Boolean(selectedSubCategory)
  );

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
      return { name: p.product_name, installmentHidden: p.installment_hidden, variations };
    }).filter(group => group.variations.length > 0);
  }, [dbProducts]);

  // Department tiles: how many categories each holds, and the artwork to use.
  // A department an admin has hidden is dropped here, which is what takes it off
  // the index; its own hidden categories are dropped from the tally too, so the
  // "N Categories" badge never promises shelves the visitor cannot open.
  const departments = useMemo(
    () =>
      DEPARTMENTS.filter((dept) => !hiddenDepartments[dept.name]).map((dept) => {
        const cards = (cardsByDepartment[dept.name] || []).filter((c) => !hiddenCategories[c.name])
        return {
          ...dept,
          categoryCount: cards.length,
          // A picture chosen in the admin panel wins over everything else,
          // including the flagship's pinned photograph — the whole point of
          // setting one is that it is meant to replace the default.
          image:
            adminDepartmentImages[dept.name] ||
            (dept.name === 'Notebooks'
              ? DEPARTMENT_FALLBACK_IMAGES['Notebooks']
              : dept.name === PAPER_AND_CANVAS
                ? (DEPARTMENT_FALLBACK_IMAGES[PAPER_AND_CANVAS] || PAPER_DEPARTMENT_IMAGE)
                : cards.find((c) => c.image)?.image || DEPARTMENT_FALLBACK_IMAGES[dept.name] || PLACEHOLDER_IMAGE),
        };
      }),
    [cardsByDepartment, adminDepartmentImages, hiddenDepartments, hiddenCategories]
  );

  /*
   * One shop component serves three different kinds of page — the department
   * index, a department's category index, and a category's product list — so
   * it has to describe whichever one it is currently rendering. Sharing /shop's
   * title across all ~175 of them is what would make them duplicates.
   *
   * Computed before the early returns below because it feeds a hook.
   */
  const canonicalPath = showingProducts
    ? `/shop/${deptSlug}/${categorySlug}`
    : selectedMainCategory
      ? categoryPath(selectedMainCategory)
      : '/shop';

  const seo = useMemo(() => {
    if (showingProducts) {
      const count = groupedProducts.length;
      return {
        title: `${categoryHeading} — Price & Sizes in Lahore | Nazir & Sons`,
        description: `Buy ${categoryHeading} from Nazir & Sons, Lahore. ${
          count ? `${count} products` : 'Stock'
        } listed by size and GSM with live prices in PKR — wholesale and retail, delivered across Pakistan.`,
        trail: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: selectedMainCategory || 'Catalogue', path: categoryPath(selectedMainCategory) },
          { name: categoryHeading, path: canonicalPath },
        ],
        extraNodes: groupedProducts.length
          ? [
              itemListSchema({
                name: categoryHeading,
                path: canonicalPath,
                items: groupedProducts.map((g) => ({ name: g.name, path: productPath(g.name) })),
              }),
            ]
          : [],
      };
    }

    if (selectedMainCategory) {
      return {
        title: `${selectedMainCategory} — Buy Online in Pakistan | Nazir & Sons`,
        description: `Browse ${
          dynamicCategories.length ? `${dynamicCategories.length} categories of ` : ''
        }${selectedMainCategory} at Nazir & Sons, Lahore. Live prices in PKR, wholesale and retail, delivered nationwide.`,
        trail: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: selectedMainCategory, path: canonicalPath },
        ],
        extraNodes: dynamicCategories.length
          ? [
              itemListSchema({
                name: selectedMainCategory,
                path: canonicalPath,
                items: dynamicCategories.map((c) => ({
                  name: c.name,
                  path: categoryPath(selectedMainCategory, c.name),
                })),
              }),
            ]
          : [],
      };
    }

    return {
      title: ROUTES['/shop'].title,
      description: ROUTES['/shop'].description,
      trail: undefined,
      extraNodes: [
        itemListSchema({
          name: 'Departments',
          path: '/shop',
          items: departments.map((d) => ({ name: d.name, path: categoryPath(d.name) })),
        }),
      ],
    };
  }, [selectedMainCategory, showingProducts, categoryHeading, canonicalPath, groupedProducts, dynamicCategories, departments]);

  usePageSeo('/shop', {
    title: seo.title,
    description: seo.description,
    canonicalPath,
    trail: seo.trail,
    pageType: 'CollectionPage',
    extraNodes: seo.extraNodes,
  });

  if (!selectedMainCategory && !showingProducts) {
    return (
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full flex flex-col pt-16 md:pt-20 pb-stack-lg">
        <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex justify-between items-end">
          <div>
            <h1 className="font-headline-xl text-[28px] md:text-headline-xl text-on-surface">Shop Departments</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Select a department to view available categories.</p>
          </div>
        </div>

        <div ref={categoriesGridRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 auto-rows-[170px] sm:auto-rows-[190px] md:auto-rows-[220px]">
          {departments.map((cat, idx) => {
            const isFeatured = cat.name === PAPER_AND_CANVAS;
            return (
              <Link
                key={cat.name}
                to={categoryPath(cat.name)}
                aria-label={`${cat.name} — ${cat.categoryCount} categories`}
                className={`group cursor-pointer w-full h-full flex flex-col bg-white rounded-[4px] border border-[#e5e1d7] hover:border-[#112338]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                  isFeatured ? 'col-span-2 row-span-1 md:row-span-2' : 'col-span-1 row-span-1'
                }`}
              >
                {/* Clean Image Area without Dark Overlays */}
                <div className="w-full flex-1 relative overflow-hidden bg-[#fbfaf8]">
                  <CardArt
                    src={cat.image}
                    alt={cat.name}
                    eager={idx < 3}
                    width={isFeatured ? 800 : 400}
                    sizes={isFeatured ? DEPARTMENT_SIZES.featured : DEPARTMENT_SIZES.normal}
                  />
                </div>

                {/* Bottom Panel with Title & Next Arrow */}
                <div className="w-full bg-white p-3 sm:p-3.5 border-t border-[#e5e1d7]/70 flex items-center justify-between gap-2 z-10 shrink-0">
                  <h3 className={`font-serif font-medium text-[#112338] group-hover:text-primary transition-colors flex items-center gap-1.5 ${
                    isFeatured ? 'text-[16px] sm:text-[18px] md:text-[22px]' : 'text-[13px] sm:text-[14px] md:text-[15px]'
                  }`}>
                    <span>{cat.name}</span>
                    <span className="text-[13px] md:text-[14px] text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      &rarr;
                    </span>
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-medium text-[#64748b] bg-[#f5f3ee] px-2.5 py-1 rounded-[3px] border border-[#e5e1d7]/60 whitespace-nowrap shrink-0 tracking-normal">
                    {countsLoading ? '...' : cat.categoryCount > 0 ? `${cat.categoryCount} Categories` : 'Coming Soon'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    );
  }

  if (!showingProducts) {
    return (
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full flex flex-col pt-16 md:pt-20 pb-stack-lg">
        <div className="mb-stack-lg border-b border-[#e5e1d7]/80 pb-stack-sm flex flex-col gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors"
          >
            <ArrowLeft size={13} /> Back to Departments
          </Link>
          <div>
            <h1 className="font-serif text-[28px] md:text-[36px] font-normal text-[#112338] tracking-tight">
              {selectedMainCategory}
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#64748b] mt-1">
              Select a category to view available stock and live pricing.
            </p>
          </div>
        </div>

        <div
          ref={categoriesGridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5"
        >
          {dynamicCategories.map((cat, idx) => {
            const count = cat.count || 0;
            return (
              <Link
                key={cat.name}
                to={categoryPath(selectedMainCategory, cat.name)}
                aria-label={`${cat.name} — ${count} items`}
                className="category-card group cursor-pointer w-full flex flex-col bg-white rounded-[4px] border border-[#e5e1d7] hover:border-[#112338]/40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Clean Image Area without Dark Overlays */}
                <div className="w-full aspect-[4/3] bg-[#fbfaf8] relative overflow-hidden">
                  <CardArt
                    src={cat.image}
                    alt={cat.name}
                    eager={idx < 6}
                    width={400}
                    sizes={CATEGORY_SIZES.normal}
                  />
                </div>

                {/* Bottom Panel with Title & Next Arrow matching Department Cards */}
                <div className="w-full bg-white p-2.5 sm:p-3 border-t border-[#e5e1d7]/70 flex items-center justify-between gap-1.5 z-10 shrink-0 flex-1">
                  <h3 className="font-serif text-[13px] sm:text-[14px] md:text-[15px] font-medium text-[#112338] group-hover:text-primary transition-colors flex items-center gap-1 line-clamp-1">
                    <span>{cat.name}</span>
                    <span className="text-[12px] text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0">
                      &rarr;
                    </span>
                  </h3>
                  <span className="text-[9.5px] sm:text-[10.5px] font-medium text-[#64748b] bg-[#f5f3ee] px-2 py-0.5 rounded-[3px] border border-[#e5e1d7]/60 whitespace-nowrap shrink-0">
                    {countsLoading ? '...' : (count > 0 ? `${count} Items` : 'Available')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-1 w-full max-w-container-max mx-auto pt-8">
      {/* SideNavBar - Desktop Only */}
      <aside className="hidden md:flex flex-col py-stack-md px-margin-mobile h-full w-[280px] border-r border-[#e5e1d7]/70 bg-white shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="mb-stack-md pl-2">
          <Link to={categoryPath(selectedMainCategory)} className="flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase mb-4 text-[10px] transition-colors">
            <ArrowLeft size={14} /> All Categories
          </Link>
          <h2 className="font-serif text-[22px] font-normal text-[#112338] tracking-tight">{selectedMainCategory}</h2>
          <p className="text-[12px] text-[#64748b] mt-0.5">Premium Stock Catalog</p>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1 pr-2">
          {dynamicCategories.map((cat) => {
            const isSelected = selectedSubCategory === cat.name;
            return (
              <Link
                key={cat.name}
                to={categoryPath(selectedMainCategory, cat.name)}
                aria-current={isSelected ? 'page' : undefined}
                className={`flex items-center gap-3 p-2.5 rounded-[3px] text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#faf8f5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-[#e5e1d7]'
                    : 'hover:bg-gray-50/70 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center transition-colors duration-200 ${
                  isSelected ? 'bg-[#112338] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                }`}>
                  <cat.icon size={15} strokeWidth={2} />
                </div>
                <span className={`text-[13px] font-medium ${isSelected ? 'text-[#112338] font-semibold' : 'text-[#64748b]'}`}>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Canvas */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-5 md:gap-6 pb-stack-lg bg-[#fbfaf8]">
        {/* Back Button (Mobile) */}
        <div className="md:hidden">
          <Link to={categoryPath(selectedMainCategory)} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10.5px] transition-colors">
            <ArrowLeft size={14} /> Back to Categories
          </Link>
        </div>

        {/* Header Bar */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#e5e1d7]/80 pb-5">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-serif text-[26px] md:text-[32px] font-normal text-[#112338] flex items-center gap-2.5 tracking-tight">
              {(() => {
                const activeCat = dynamicCategories.find(c => c.name === selectedSubCategory);
                return activeCat ? (
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-[3px] flex items-center justify-center bg-[#faf8f5] text-[#112338] border border-[#e5e1d7]">
                    <activeCat.icon size={18} strokeWidth={2} />
                  </div>
                ) : null;
              })()}
              <span>{categoryHeading}</span>
              <span className="font-sans text-[13px] md:text-[14px] text-[#64748b] font-normal">
                ({groupedProducts.length} Products)
              </span>
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#64748b]">
              Live pricing & stock in PKR — wholesale and retail
            </p>
          </div>
        </section>

        {/* Product Grid */}
        {productsLoading || (!selectedSubCategory && countsLoading) ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-[4px] border border-[#e5e1d7] shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-3.5 bg-gray-200 rounded w-56"></div>
          </div>
        ) : groupedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-[4px] border border-dashed border-[#e5e1d7] shadow-sm">
            <Package size={48} className="text-gray-300 mb-4" />
            <h3 className="font-serif text-[#112338] font-medium text-[19px]">No products available</h3>
            <p className="text-[#64748b] text-[13px] mt-1">This category is currently being updated with new stock.</p>
          </div>
        ) : (
          <section ref={productsGridRef} className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-5">
            {groupedProducts.map((group) => (
              <ProductGroupCard 
                key={group.name} 
                productName={group.name} 
                installmentHidden={group.installmentHidden}
                isCategoryInstallmentDisabled={hiddenInstallmentCategories[selectedSubCategory]}
                variations={group.variations} 
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Shop;

