import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Check,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProduct, useProducts, useTaxonomyImages } from '../hooks/useSupabase';
import TermsModal from '../components/TermsModal';
import { PLACEHOLDER_IMAGE, fallbackOnError, thumb, thumbSrcSet } from '../lib/images';
import { displayNameOf, departmentOf, PAPER_AND_CANVAS } from '../data/categories';
import { usePageSeo } from '../lib/seo';
import { productSchema } from '../lib/schema';
import { categoryPath, productPath } from '../lib/site';
import { flyToCart } from '../lib/cartAnimation';
import {
  getColorHex,
  determineVariationType,
  getVariationLabels,
  hasMeaningfulVariations,
} from '../lib/variations';

/*
 * Compact Product Card for Related / Relevant Products
 * Modern & Polished Style:
 * Elevated warm card border, subtle hover lift, top-right heart wishlist button,
 * 2-line title, bold PKR price typography, and compact dark navy Add to Cart button with fly-to-cart animation.
 */
const CompactProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const btnRef = useRef(null);

  const variations = product.product_variations || [];
  const firstVariation = variations[0];
  const prices = variations.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : Number(firstVariation?.price) || 0;
  const displayPrice = minPrice > 0 ? minPrice : Number(firstVariation?.price) || 0;
  const imgUrl = product.image_url || firstVariation?.image_url || PLACEHOLDER_IMAGE;
  const inStock = variations.length === 0 ? true : variations.some((v) => Number(v.stock) > 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inStock) return;

    addToCart(
      {
        id: firstVariation?.id || product.id,
        name: product.product_name,
        gsm: firstVariation?.gsm ? String(firstVariation.gsm) : 'N/A',
        size: firstVariation?.size || 'Standard',
        price: displayPrice,
        image: imgUrl,
        packingType: firstVariation?.packing_type || 'unit',
        category: product.category,
      },
      1,
      false,
      null,
      false,
      null
    );

    if (btnRef.current) {
      flyToCart(btnRef.current);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <article className="bg-white border border-[#e2ddd3] hover:border-[#112338]/40 rounded-lg p-2.5 sm:p-3 hover:shadow-[0_8px_20px_rgba(17,35,56,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group relative">
      {/* Product Image Area */}
      <div className="aspect-[4/3] sm:aspect-square bg-[#fbfaf8] rounded-md overflow-hidden relative border border-[#f0ede6] p-2 flex items-center justify-center">
        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-1.5 right-1.5 w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-white/95 border border-gray-200/90 flex items-center justify-center shadow-xs z-10 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
          aria-label={`Save ${product.product_name} to wishlist`}
        >
          <Heart
            size={13}
            className={isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400 hover:text-rose-500 transition-colors'}
          />
        </button>

        {/* Product Image Link */}
        <Link
          to={`/product/${encodeURIComponent(product.product_name)}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={thumb(imgUrl, 400)}
            srcSet={thumbSrcSet(imgUrl)}
            sizes="(min-width: 1024px) 240px, 50vw"
            alt={product.product_name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
            onError={fallbackOnError}
          />
        </Link>
      </div>

      {/* Info Area */}
      <div className="flex flex-col flex-1 mt-2.5">
        <Link
          to={`/product/${encodeURIComponent(product.product_name)}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="font-sans text-[12px] sm:text-[13px] font-bold text-[#112338] line-clamp-2 leading-snug min-h-[34px] sm:min-h-[36px] mb-1.5 group-hover:text-primary transition-colors">
            {product.product_name}
          </h3>
        </Link>

        {/* Price in PKR format */}
        <div className="font-serif text-[13px] sm:text-[14.5px] font-bold text-[#112338] mb-2.5 tracking-tight">
          PKR {displayPrice.toLocaleString()}
        </div>

        {/* Compact Add to Cart Button */}
        {(() => {
          let relBtnStyle = 'bg-gray-200 text-gray-400 cursor-not-allowed';
          if (isAdded) {
            relBtnStyle = 'bg-emerald-600 text-white';
          } else if (inStock) {
            relBtnStyle = 'bg-[#112338] hover:bg-[#1a3654] text-white active:scale-[0.98]';
          }

          return (
            <button
              type="button"
              ref={btnRef}
              disabled={!inStock}
              onClick={handleAdd}
              className={`w-full h-8 sm:h-8.5 rounded-md text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs mt-auto cursor-pointer ${relBtnStyle}`}
            >
              {isAdded ? (
                <>
                  <Check size={13} className="stroke-[2.5]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>
          );
        })()}
      </div>
    </article>
  );
};

function computeRelevantProducts(allProducts, currentProduct) {
  if (!allProducts || allProducts.length === 0 || !currentProduct) return [];
  const currentCat = (currentProduct.category || '').toLowerCase();
  const currentDept = departmentOf(currentProduct.category);

  const others = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.product_name !== currentProduct.product_name
  );

  const sameCat = others.filter((p) => (p.category || '').toLowerCase() === currentCat);
  const sameDept = others.filter(
    (p) => (p.category || '').toLowerCase() !== currentCat && departmentOf(p.category) === currentDept
  );
  const remaining = others.filter(
    (p) => (p.category || '').toLowerCase() !== currentCat && departmentOf(p.category) !== currentDept
  );

  return [...sameCat, ...sameDept, ...remaining].slice(0, 4);
}

function buildCatalogueSummary(currentProduct, productVariations, decodedName) {
  if (!currentProduct || productVariations.length === 0) return null;

  const category = currentProduct.category || '';
  const displayCategory = displayNameOf(category);
  const department = departmentOf(category);
  const sizes = [...new Set(productVariations.map((v) => v.Display_Size).filter(Boolean))];
  const gsms = [...new Set(productVariations.map((v) => v.GSM).filter((g) => g && g !== 'null'))]
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b);
  const prices = productVariations.map((v) => Number(v.CALCULATED_PRICE_RS)).filter((n) => n > 0);

  let gsmFact = null;
  if (gsms.length) {
    const minGsm = gsms[0];
    const maxGsm = gsms.at(-1);
    const gsmRange = minGsm === maxGsm ? String(minGsm) : `${minGsm}–${maxGsm}`;
    gsmFact = `GSM: ${gsmRange}`;
  }

  const facts = [
    sizes.length ? `Sizes: ${sizes.slice(0, 4).join(', ')}` : null,
    gsmFact,
    prices.length ? `From Rs. ${Math.min(...prices).toLocaleString()}` : null,
  ].filter(Boolean);

  const categorySuffix = displayCategory ? ` — ${displayCategory}` : '';
  const categoryParenthesis = displayCategory ? ` (${displayCategory})` : '';

  return {
    displayCategory,
    department,
    title: `${decodedName}${categorySuffix} | Nazir & Sons`,
    description: [
      `Buy ${decodedName}${categoryParenthesis} from Nazir & Sons, Lahore.`,
      facts.join('. ') + (facts.length ? '.' : ''),
      'Wholesale and retail, delivered across Pakistan.',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 300),
    image: currentProduct.image_url || productVariations[0]?.IMAGE_URL,
  };
}

function getBulkPlaceholder(category, department) {
  const cat = (category || '').toLowerCase();
  const dept = (department || '').toLowerCase();

  if (
    dept === 'paper & canvas' ||
    cat.includes('paper') ||
    cat.includes('card') ||
    cat.includes('board') ||
    cat.includes('ream')
  ) {
    return 'E.g., Need 200 reams for printing press or 500 sheets of custom cut size...';
  }
  if (
    dept === 'fine arts' ||
    cat.includes('paint') ||
    cat.includes('canvas') ||
    cat.includes('brush') ||
    cat.includes('acrylic') ||
    cat.includes('oil')
  ) {
    return 'E.g., Need 50 stretched canvases or 100 acrylic paint tubes for studio/workshop batch...';
  }
  if (
    dept === 'accessories' ||
    cat.includes('craft') ||
    cat.includes('bead') ||
    cat.includes('resin') ||
    cat.includes('glitter') ||
    cat.includes('clay') ||
    cat.includes('tool')
  ) {
    return 'E.g., Need 100 packets or 50 boxes for jewelry workshop or manufacturing batch...';
  }
  if (
    dept === 'notebooks & stationary' ||
    cat.includes('notebook') ||
    cat.includes('diary') ||
    cat.includes('pen') ||
    cat.includes('file') ||
    cat.includes('folder')
  ) {
    return 'E.g., Need 200 spiral notebooks or stationery packages for school/office supply...';
  }
  return 'E.g., Need 50+ units with custom wholesale requirements or packaging...';
}

function extractQuantityFromNote(text) {
  if (!text) return 1;
  const match = text.match(/\b([1-9]\d{0,6})\b/);
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }
  return 1;
}

function cleanDescriptionText(raw) {
  if (!raw) return '';
  return raw
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .trim();
}

const INSTALLMENT_CATEGORIES = new Set([
  'bleach card',
  'art card',
  'art paper',
  'matte paper',
  'copy paper',
  'offset paper',
  'ivory card',
  'color card',
  'carbonless',
  'stickers',
  'local paper',
  'boxboard',
  'news',
  'butter paper',
  'kraft card',
  'book paper',
]);

function isEligibleForInstallments(product, category, hiddenTaxonomy) {
  if (product?.installment_hidden) return false;
  if (hiddenTaxonomy?.[product?.category]) return false;
  return INSTALLMENT_CATEGORIES.has((category || '').toLowerCase());
}

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 aspect-[4/3] bg-gray-100 rounded-2xl"></div>
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-5 bg-gray-200 w-24 rounded-full"></div>
          <div className="h-8 bg-gray-200 w-3/4 rounded-lg"></div>
          <div className="h-4 bg-gray-100 w-full rounded"></div>
          <div className="h-36 bg-gray-50 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
      <Link to="/shop" className="mt-4 text-primary font-bold hover:underline">
        Back to Shop
      </Link>
    </div>
  );
}

function VariationSelectors({
  variationType,
  variationLabels,
  selectedSize,
  setSelectedSize,
  availableSizes,
  hasMultipleVariations,
  department,
  selectedGsm,
  setSelectedGsm,
  availableGsms,
}) {
  const isPaper = department === PAPER_AND_CANVAS;
  if (!hasMultipleVariations && !isPaper) {
    return null;
  }

  return (
    <div className={`grid ${isPaper ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5 sm:gap-3 mb-3 sm:mb-3.5`}>
      {variationType === 'color' ? (
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#112338] uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-gray-400 font-semibold">{variationLabels.shortLabel}:</span>
              <span className="text-[#112338] font-black">{selectedSize}</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium bg-[#f8fafc] px-2 py-0.5 rounded-full border border-gray-200">
              {availableSizes.length} {availableSizes.length === 1 ? 'shade' : 'shades'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableSizes.map((opt) => {
              const hex = getColorHex(opt);
              const isSelected = selectedSize === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedSize(opt)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-[#112338] bg-[#112338] text-white shadow-xs'
                      : 'border-[#e2ddd3] bg-white text-[#112338] hover:border-[#112338]/40 hover:bg-[#faf9f6]'
                  }`}
                  title={opt}
                >
                  {hex && (
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 transition-transform ${
                        isSelected ? 'border border-white/60 ring-1 ring-white/30' : 'border border-black/15'
                      }`}
                      style={{ background: hex }}
                    />
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        hasMultipleVariations && (
          <div className="flex flex-col">
            <label htmlFor="pdp-size" className="text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {variationLabels.selectLabel}
            </label>
            <select
              id="pdp-size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-white border border-[#dcd7cb] text-[#112338] text-[12px] sm:text-[13px] font-semibold h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-[#112338] shadow-2xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:12px] cursor-pointer hover:border-gray-400 transition-colors"
            >
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )
      )}

      {isPaper && (
        <div className="flex flex-col">
          <label htmlFor="pdp-gsm" className="text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Select GSM
          </label>
          <select
            id="pdp-gsm"
            value={selectedGsm}
            onChange={(e) => setSelectedGsm(e.target.value)}
            className="w-full bg-white border border-[#dcd7cb] text-[#112338] text-[12px] sm:text-[13px] font-semibold h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-[#112338] shadow-2xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:12px] cursor-pointer hover:border-gray-400 transition-colors"
          >
            {availableGsms.map((g) => (
              <option key={g} value={g}>
                {g}g
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function InstallmentPlanBox({ isInstallment, setIsInstallment, installmentPlan, setInstallmentPlan }) {
  return (
    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200/70 mb-2.5">
      <label htmlFor="installment-toggle" className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          id="installment-toggle"
          checked={isInstallment}
          onChange={(e) => setIsInstallment(e.target.checked)}
          className="w-3.5 h-3.5 text-indigo-600 bg-white border-indigo-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer shrink-0"
        />
        <span className="text-xs sm:text-[12.5px] font-bold text-[#112338]">Request Installment Plan</span>
      </label>
      <p className="text-[10px] sm:text-[11px] text-indigo-700/80 mt-0.5 pl-5.5">
        T&C apply. Requires physical bank cheques. Approval via WhatsApp.
      </p>
      {isInstallment && (
        <div className="mt-2 pl-5.5">
          <select
            value={installmentPlan}
            onChange={(e) => setInstallmentPlan(e.target.value)}
            className="w-full bg-white border border-indigo-200 text-[#112338] text-xs font-bold h-8 px-2 rounded-md outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="3 Months">3 Months (0% Markup)</option>
            <option value="6 Months">6 Months</option>
          </select>
        </div>
      )}
    </div>
  );
}

const ProductDetails = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const { addToCart } = useCart();

  const { product: currentProduct, loading } = useProduct(decodedName);
  const { products: allProducts } = useProducts(null);
  const { hiddenInstallmentCategories } = useTaxonomyImages();

  const mainBtnRef = useRef(null);
  const [isMainAdded, setIsMainAdded] = useState(false);
  const [isMainLiked, setIsMainLiked] = useState(false);

  // Map Supabase product_variations to the expected format
  const productVariations = useMemo(() => {
    if (!currentProduct?.product_variations) return [];
    return currentProduct.product_variations.map((v) => ({
      PRODUCT_NAME: currentProduct.product_name,
      Description: currentProduct.description,
      Category: currentProduct.category,
      ProductID: v.id,
      Display_Size: v.size,
      GSM: String(v.gsm),
      CALCULATED_PRICE_RS: v.price,
      PACKING_TYPE: v.packing_type,
      Stock: v.stock,
      IMAGE_URL: v.image_url || currentProduct.image_url,
    }));
  }, [currentProduct]);

  const [selectedSize, setSelectedSize] = useState('');

  // Extract all distinct available options/sizes for this product
  const availableSizes = useMemo(() => {
    return [
      ...new Set(
        productVariations.map((p) =>
          p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : p.Display_Size || 'N/A'
        )
      ),
    ].filter(Boolean);
  }, [productVariations]);

  const variationType = useMemo(() => {
    const cat = currentProduct?.category || productVariations[0]?.Category || '';
    const dept = departmentOf(cat);
    return determineVariationType(availableSizes, cat, dept);
  }, [availableSizes, currentProduct, productVariations]);

  const variationLabels = useMemo(() => {
    return getVariationLabels(variationType);
  }, [variationType]);

  const hasMultipleVariations = useMemo(() => {
    return hasMeaningfulVariations(availableSizes);
  }, [availableSizes]);

  // Initialize Size when product loads
  React.useEffect(() => {
    if (productVariations.length > 0 && !selectedSize) {
      const p = productVariations[0];
      setSelectedSize(p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : p.Display_Size || 'N/A');
    }
  }, [productVariations, selectedSize]);

  const availableGsms = useMemo(() => {
    if (!selectedSize || productVariations.length === 0) return [];
    const gsms = productVariations
      .filter((p) => {
        const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : p.Display_Size || 'N/A';
        return pSize === selectedSize;
      })
      .map((p) => p.GSM)
      .filter(Boolean);
    return [...new Set(gsms)].sort((a, b) => Number(a) - Number(b));
  }, [productVariations, selectedSize]);

  const [selectedGsm, setSelectedGsm] = useState(() => availableGsms[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkNote, setBulkNote] = useState('');
  const [isBulkAdded, setIsBulkAdded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState('3 Months');
  const [showTerms, setShowTerms] = useState(false);

  // Handle GSM auto-select when size changes
  React.useEffect(() => {
    if (availableGsms.length > 0 && !availableGsms.includes(selectedGsm)) {
      setSelectedGsm(availableGsms[0]);
    }
  }, [availableGsms, selectedGsm]);

  // Dynamic View All target URL pointing directly to this product's category
  const categoryTargetUrl = useMemo(() => {
    const cat = currentProduct?.category || productVariations[0]?.Category;
    if (!cat) return '/shop';
    const dept = departmentOf(cat);
    const display = displayNameOf(cat);
    return categoryPath(dept, display);
  }, [currentProduct, productVariations]);

  // Relevant products list (up to 4 items)
  const relevantProducts = useMemo(() => {
    return computeRelevantProducts(allProducts, currentProduct);
  }, [allProducts, currentProduct]);

  const catalogue = useMemo(() => {
    return buildCatalogueSummary(currentProduct, productVariations, decodedName);
  }, [currentProduct, productVariations, decodedName]);

  usePageSeo('/product', {
    title: catalogue?.title || `${decodedName} | Nazir & Sons`,
    description:
      catalogue?.description ||
      `${decodedName} from Nazir & Sons — premium paper, fine arts and stationery in Lahore, delivered across Pakistan.`,
    canonicalPath: productPath(decodedName),
    image: catalogue?.image,
    imageAlt: decodedName,
    type: 'product',
    pageType: 'ItemPage',
    noindex: !catalogue,
    trail: [
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      ...(catalogue
        ? [
            { name: catalogue.department, path: categoryPath(catalogue.department) },
            {
              name: catalogue.displayCategory,
              path: categoryPath(catalogue.department, catalogue.displayCategory),
            },
          ]
        : []),
      { name: decodedName, path: productPath(decodedName) },
    ],
    extraNodes: catalogue
      ? [
          productSchema({
            name: decodedName,
            description: currentProduct.description,
            category: catalogue.displayCategory,
            image: catalogue.image,
            path: productPath(decodedName),
            variations: productVariations.map((v) => ({
              sku: v.ProductID,
              size: v.Display_Size,
              gsm: v.GSM,
              price: Number(v.CALCULATED_PRICE_RS),
              stock: Number(v.Stock),
              packingType: v.PACKING_TYPE,
            })),
          }),
        ]
      : [],
  });

  if (loading) return <ProductDetailsSkeleton />;
  if (productVariations.length === 0 || !currentProduct) return <ProductNotFound />;

  const currentVariation =
    productVariations.find((p) => {
      const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : p.Display_Size || 'N/A';
      return p.GSM === selectedGsm && pSize === selectedSize;
    }) || productVariations[0];

  const formattedDescription = cleanDescriptionText(
    currentVariation?.Description ||
    currentProduct?.description ||
    'Premium High Quality Stock for professional printing and arts.'
  );

  const isLongDescription = formattedDescription.length > 130;

  const detectedBulkQty = extractQuantityFromNote(bulkNote);
  const hasDetectedBulkQty = Boolean(bulkNote && /\b([1-9]\d{0,6})\b/.test(bulkNote));
  const effectiveQty = isBulk ? detectedBulkQty : quantity;

  const inStock = Number(currentVariation.Stock) > 0;
  const price = Number(currentVariation.CALCULATED_PRICE_RS) || 0;
  const totalPrice = price * effectiveQty;

  const handleAddBulkToCart = () => {
    const qtyNum = detectedBulkQty;
    const packing = currentVariation.PACKING_TYPE || 'unit';
    const formattedNote = bulkNote.trim()
      ? `Bulk Order: ${qtyNum} ${packing}. Requirements: ${bulkNote.trim()}`
      : `Bulk Order: ${qtyNum} ${packing} requested.`;

    const item = {
      id: currentVariation.ProductID || `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
      name: currentVariation.PRODUCT_NAME,
      gsm: currentVariation.GSM,
      size: selectedSize,
      price: price,
      image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
      packingType: packing,
      category: currentVariation.Category,
      department: departmentOf(currentVariation.Category),
    };

    addToCart(item, qtyNum, true, formattedNote, false, null);

    if (mainBtnRef.current) {
      flyToCart(mainBtnRef.current);
    }
    setIsBulkAdded(true);
    setTimeout(() => {
      setIsBulkAdded(false);
      void navigate('/cart');
    }, 400);
  };

  const handleAddToCart = () => {
    if (isInstallment) {
      setShowTerms(true);
      return;
    }
    executeAddToCart();
  };

  const executeAddToCart = () => {
    const item = {
      id: currentVariation.ProductID || `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
      name: currentVariation.PRODUCT_NAME,
      gsm: currentVariation.GSM,
      size: selectedSize,
      price: price,
      image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
      packingType: currentVariation.PACKING_TYPE || 'ream',
      category: currentVariation.Category,
      department: departmentOf(currentVariation.Category),
    };

    addToCart(item, quantity, false, null, isInstallment, isInstallment ? installmentPlan : null);

    if (mainBtnRef.current) {
      flyToCart(mainBtnRef.current);
    }
    setIsMainAdded(true);
    setTimeout(() => setIsMainAdded(false), 1600);
  };

  const showInstallments =
    !isBulk &&
    isEligibleForInstallments(currentProduct, currentVariation.Category, hiddenInstallmentCategories);

  const isAdded = isMainAdded || isBulkAdded;

  let mainButtonClass = 'bg-[#112338] hover:bg-[#1a3654] active:scale-[0.99] text-white hover:shadow-lg';
  if (!inStock) {
    mainButtonClass = 'bg-gray-200 text-gray-400 cursor-not-allowed';
  } else if (isAdded) {
    mainButtonClass = 'bg-emerald-600 text-white shadow-lg';
  }

  let mainButtonLabel = 'Currently Out of Stock';
  if (isBulk) {
    mainButtonLabel = 'Add Bulk Request to Cart';
  } else if (inStock) {
    mainButtonLabel = 'Add to Cart';
  }


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 font-sans">
      {/* Back to Shop link */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-primary mb-3 sm:mb-5 font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-colors"
      >
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left: Compact Product Image Showcase */}
        <div className="lg:col-span-5 w-full">
          <div className="w-full max-w-[340px] sm:max-w-md lg:max-w-none mx-auto aspect-[4/3] sm:aspect-square max-h-[260px] sm:max-h-[330px] lg:max-h-[420px] bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 flex items-center justify-center relative border border-[#e5e1d7] shadow-xs group overflow-hidden">
            {/* Glowing ambient highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-amber-100/40 rounded-full opacity-60 blur-2xl pointer-events-none"></div>

            {/* Stock status badge */}
            {inStock ? (
              <span className="absolute top-2.5 left-2.5 z-10 bg-emerald-50 text-emerald-700 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] border border-emerald-200/60 shadow-xs">
                In Stock
              </span>
            ) : (
              <span className="absolute top-2.5 left-2.5 z-10 bg-rose-50 text-rose-600 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] border border-rose-200/60 shadow-xs">
                Out of Stock
              </span>
            )}

            {/* Wishlist toggle button */}
            <button
              type="button"
              onClick={() => setIsMainLiked(!isMainLiked)}
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-gray-200/80 flex items-center justify-center shadow-xs text-gray-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart size={14} className={isMainLiked ? 'text-rose-500 fill-rose-500' : ''} />
            </button>

            {/* Main Product Image */}
            <img
              src={thumb(currentVariation.IMAGE_URL, 800)}
              srcSet={thumbSrcSet(currentVariation.IMAGE_URL, [400, 600, 800, 1200])}
              sizes="(min-width: 1024px) 500px, 100vw"
              alt={decodedName}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 relative z-1 mix-blend-multiply"
              onError={fallbackOnError}
            />
          </div>
        </div>

        {/* Right: Product Details & Controls (Compact & Mobile-Optimized) */}
        <div className="lg:col-span-7 flex flex-col pt-0 sm:pt-1">
          {/* Category badge */}
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-50/90 border border-orange-200/70 mb-1.5 w-fit">
            <p className="text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
              {displayNameOf(currentVariation.Category) || 'Premium Paper'}
            </p>
          </div>

          {/* Compact Product Title */}
          <h1 className="text-[19px] sm:text-[23px] lg:text-[27px] font-bold text-[#112338] leading-tight mb-1.5 tracking-tight">
            {decodedName}
          </h1>

          {/* Compact Description (Short on both desktop & mobile with Read more toggle) */}
          <div className="mb-3 sm:mb-4">
            <p
              className={`text-[#64748b] text-[12px] sm:text-[13px] leading-relaxed transition-all ${
                isDescExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {formattedDescription}
            </p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-[11.5px] font-bold text-primary hover:text-[#112338] transition-colors mt-0.5 inline-flex items-center gap-1 cursor-pointer"
              >
                {isDescExpanded ? 'Show less' : 'Read more...'}
              </button>
            )}
          </div>

          {/* Compact Configuration Box */}
          <div className="bg-white border border-[#e2ddd3] rounded-2xl p-4 sm:p-5 mb-3.5 sm:mb-4 shadow-[0_4px_20px_rgba(17,35,56,0.04)]">
            {/* Dynamic Selectors Grid via extracted component */}
            <VariationSelectors
              variationType={variationType}
              variationLabels={variationLabels}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              availableSizes={availableSizes}
              hasMultipleVariations={hasMultipleVariations}
              department={departmentOf(currentVariation.Category)}
              selectedGsm={selectedGsm}
              setSelectedGsm={setSelectedGsm}
              availableGsms={availableGsms}
            />

            {/* Bulk Order Card */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 mb-3 ${
                isBulk
                  ? 'bg-white border-[#e2ddd3] shadow-2xs'
                  : 'bg-[#faf9f6] border-[#e8e4dc] hover:border-[#dcd7cb]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <input
                    type="checkbox"
                    id="bulk-toggle"
                    aria-label="Place Bulk Order Request"
                    checked={isBulk}
                    onChange={(e) => setIsBulk(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#112338] bg-white border-gray-300 rounded focus:ring-[#112338] accent-[#112338] cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="bulk-toggle"
                    className="cursor-pointer select-none text-xs sm:text-[13px] font-bold text-[#112338] block leading-snug"
                  >
                    <span>Place Bulk Order Request</span>
                    <span className="text-[10.5px] sm:text-[11px] text-[#64748b] leading-tight block mt-0.5 font-normal">
                      Check for B2B quantities or special pricing. Rates finalized on WhatsApp.
                    </span>
                  </label>
                </div>
                <span className="shrink-0 text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-amber-800 bg-[#fffbeb] border border-amber-300 px-2 py-0.5 rounded-md">
                  B2B Rates
                </span>
              </div>

              {/* When Bulk is Active: Requirements / Notes */}
              {isBulk && (
                <div className="mt-2.5 pt-2.5 border-t border-[#f1f0eb]">
                  <label
                    htmlFor="bulk-note-input"
                    className="block text-[10px] sm:text-[10.5px] font-bold text-[#334155] uppercase tracking-wider mb-1.5"
                  >
                    BULK REQUIREMENTS / NOTES:
                  </label>
                  <textarea
                    id="bulk-note-input"
                    placeholder={getBulkPlaceholder(currentVariation.Category, departmentOf(currentVariation.Category))}
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-[#cbd5e1] focus:border-[#112338] focus:ring-1 focus:ring-[#112338]/20 rounded-xl p-2.5 sm:p-3 text-xs sm:text-[13px] text-[#112338] placeholder:text-gray-400 outline-none shadow-2xs resize-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Installment Plan Toggle (Only for retail, hidden when bulk is checked) */}
            {showInstallments && (
              <InstallmentPlanBox
                isInstallment={isInstallment}
                setIsInstallment={setIsInstallment}
                installmentPlan={installmentPlan}
                setInstallmentPlan={setInstallmentPlan}
              />
            )}

            {/* Quantity Stepper & Total Price Row: ONLY visible when NOT bulk */}
            {!isBulk && (
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#e8e4dc]/70">
                <div className="flex flex-col">
                  <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Qty ({currentVariation.PACKING_TYPE || 'unit'})
                  </span>
                  <div className="flex items-center bg-white border border-[#dcd7cb] rounded-lg overflow-hidden h-8.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-gray-100 text-[#112338] transition-colors cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      aria-label="Quantity"
                      value={quantity}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value, 10);
                        setQuantity(Number.isNaN(val) || val < 1 ? 1 : val);
                      }}
                      className="w-8 sm:w-9 text-center font-bold text-xs sm:text-sm text-[#112338] outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-gray-100 text-[#112338] transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Total Price
                  </span>
                  <span className="text-[20px] sm:text-[24px] font-black text-primary leading-none">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* When Bulk is active: Stepper is removed; price calculates based on note quantity or base unit */}
            {isBulk && (
              <div className="flex items-center justify-between pt-2.5 border-t border-[#e8e4dc]/70">
                <div className="flex flex-col">
                  <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {hasDetectedBulkQty
                      ? `Est. Total (${detectedBulkQty} ${currentVariation.PACKING_TYPE || 'units'})`
                      : 'Est. Total Price'}
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium">
                    Rates finalized on WhatsApp
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[20px] sm:text-[24px] font-black text-primary leading-none">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[9.5px] text-gray-400 mt-0.5 font-medium">
                    (Rs. {price.toLocaleString()} / {currentVariation.PACKING_TYPE || 'unit'})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button & Navigation Row */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              ref={mainBtnRef}
              onClick={isBulk ? handleAddBulkToCart : handleAddToCart}
              disabled={!inStock}
              className={`w-full h-11 sm:h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base transition-all duration-200 shadow-md cursor-pointer ${mainButtonClass}`}
            >
              {isAdded ? (
                <>
                  <Check size={18} className="stroke-[2.5]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>{mainButtonLabel}</span>
                </>
              )}
            </button>

            {/* Bottom Row: WhatsApp Checkout & View Cart */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1 px-0.5">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <Phone size={12} className="text-emerald-600" /> WhatsApp Checkout
              </span>
              <Link
                to="/cart"
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:text-[#112338] transition-colors"
              >
                <span>View Cart</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Trust Features Strip */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck size={14} />
              </div>
              <p className="text-[10.5px] sm:text-[11px] font-bold text-[#112338] leading-tight">
                Premium <span className="text-gray-400 font-normal">Quality</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck size={14} />
              </div>
              <p className="text-[10.5px] sm:text-[11px] font-bold text-[#112338] leading-tight">
                Fast Delivery <span className="text-gray-400 font-normal">in Pakistan</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Products Section */}
      {relevantProducts.length > 0 && (
        <section className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#e5e1d7]">
          {/* Header with polished View All pill button */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-widest block mb-1">
                Recommended For You
              </span>
              <h2 className="font-serif text-[19px] sm:text-[23px] font-bold text-[#112338] tracking-tight">
                Relevant Products
              </h2>
            </div>
            <Link
              to={categoryTargetUrl}
              className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#f8f6f0] hover:bg-[#112338] text-[#112338] hover:text-white border border-[#e2ddd3] hover:border-[#112338] text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-2xs inline-flex items-center gap-1.5 shrink-0 group/btn cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>

          {/* Compact Grid: 2 columns on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {relevantProducts.map((relProduct) => (
              <CompactProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setShowTerms(false);
          executeAddToCart();
        }}
      />
    </div>
  );
};

export default ProductDetails;
