import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Heart,
  Check,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useProduct, useProducts, useTaxonomyImages } from '../hooks/useSupabase';
import TermsModal from '../components/TermsModal';
import { PLACEHOLDER_IMAGE, fallbackOnError, thumb, thumbSrcSet } from '../lib/images';
import { displayNameOf, departmentOf } from '../data/categories';
import { usePageSeo } from '../lib/seo';
import { categoryPath } from '../lib/site';
import { flyToCart } from '../lib/cartAnimation';
import {
  determineVariationType,
  getVariationLabels,
  hasMeaningfulVariations,
} from '../lib/variations';
import {
  computeRelevantProducts,
  buildCatalogueSummary,
  getBulkPlaceholder,
  extractQuantityFromNote,
  cleanDescriptionText,
  isEligibleForInstallments,
  mapProductVariations,
  findActiveVariation,
  buildProductPageSeo,
  getMainButtonState,
} from '../lib/productDetails';
import CompactProductCard from '../components/product/CompactProductCard';
import ProductDetailsSkeleton from '../components/product/ProductDetailsSkeleton';
import ProductNotFound from '../components/product/ProductNotFound';
import VariationSelectors from '../components/product/VariationSelectors';
import InstallmentPlanBox from '../components/product/InstallmentPlanBox';

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
    return mapProductVariations(currentProduct);
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
  useEffect(() => {
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
  useEffect(() => {
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

  const productSeo = useMemo(() => {
    return buildProductPageSeo(decodedName, currentProduct, catalogue, productVariations);
  }, [decodedName, currentProduct, catalogue, productVariations]);

  usePageSeo('/product', productSeo);

  if (loading) return <ProductDetailsSkeleton />;
  if (productVariations.length === 0 || !currentProduct) return <ProductNotFound />;

  const currentVariation = findActiveVariation(productVariations, selectedGsm, selectedSize);

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

  const { className: mainButtonClass, label: mainButtonLabel } = getMainButtonState(
    inStock,
    isAdded,
    isBulk
  );


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

            {/* Main Product Image (LCP on Product Details page) */}
            <img
              src={thumb(currentVariation.IMAGE_URL || currentProduct?.image_url, 800)}
              srcSet={thumbSrcSet(currentVariation.IMAGE_URL || currentProduct?.image_url, [400, 600, 800, 1200])}
              sizes="(min-width: 1024px) 500px, 100vw"
              alt={decodedName}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 relative z-1 mix-blend-multiply"
              onError={(e) => {
                if (currentProduct?.image_url && e.currentTarget.src !== currentProduct.image_url) {
                  e.currentTarget.src = currentProduct.image_url;
                  e.currentTarget.srcset = '';
                  return;
                }
                fallbackOnError(e);
              }}
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
              className={`text-[#64748b] text-[12px] sm:text-[13px] leading-relaxed transition-all ${isDescExpanded ? '' : 'line-clamp-2'
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
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 mb-3 ${isBulk
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
          {/* Header with polished View All text link */}
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
              className="inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-[#112338] hover:text-primary transition-colors cursor-pointer shrink-0 group"
            >
              <span>View All</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
