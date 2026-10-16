import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import TermsModal from '../TermsModal';
import { PLACEHOLDER_IMAGE, fallbackOnError, thumb, thumbSrcSet } from '../../lib/images';
import { flyToCart } from '../../lib/cartAnimation';
import {
  PAPER_AND_CANVAS,
  PAPER_CATEGORY_NAMES,
  departmentOf,
} from '../../data/categories';
import {
  getColorHex,
  determineVariationType,
  getVariationLabels,
  hasMeaningfulVariations,
} from '../../lib/variations';

const formatPrice = (priceStr) => {
  const num = Number(priceStr);
  return Number.isNaN(num) ? priceStr : num.toLocaleString();
};

/**
 * ProductGroupCard displays a product card with interactive variation selectors (Size, GSM, Color),
 * installment calculation request toggle, and Add to Cart action with fly animation.
 */
const ProductGroupCard = React.memo(function ProductGroupCard({
  productName,
  installmentHidden,
  isCategoryInstallmentDisabled,
  variations,
}) {
  const { addToCart } = useCart();
  const { contactWhatsapp } = useSettings();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGsm, setSelectedGsm] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const btnRef = useRef(null);

  const triggerAddAnimation = () => {
    setIsAdded(true);
    if (btnRef.current) {
      flyToCart(btnRef.current);
    }
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Extract all unique Sizes for this product group
  const availableSizes = useMemo(() => {
    const sizes = variations
      .map((p) =>
        p.LENGTH_INCH && p.WIDTH_INCH
          ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}`
          : p.Display_Size || 'N/A'
      )
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
    const gsms = variations
      .filter((p) => {
        const pSize =
          p.LENGTH_INCH && p.WIDTH_INCH
            ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}`
            : p.Display_Size || 'N/A';
        return pSize === selectedSize;
      })
      .map((p) => p.GSM)
      .filter(Boolean);
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

  const variationType = useMemo(() => {
    const cat = variations[0]?.Category || '';
    const dept = departmentOf(cat);
    return determineVariationType(availableSizes, cat, dept);
  }, [availableSizes, variations]);

  const variationLabels = useMemo(() => {
    return getVariationLabels(variationType);
  }, [variationType]);

  const hasMultipleVariations = useMemo(() => {
    return hasMeaningfulVariations(availableSizes);
  }, [availableSizes]);

  // Get the precise product variation based on selections
  const currentVariation = useMemo(() => {
    if (!selectedGsm || !selectedSize) return variations[0];
    return (
      variations.find((p) => {
        const pSize =
          p.LENGTH_INCH && p.WIDTH_INCH
            ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}`
            : p.Display_Size || 'N/A';
        return p.GSM === selectedGsm && pSize === selectedSize && Number(p.CALCULATED_PRICE_RS) > 0;
      }) ||
      variations.find((p) => {
        const pSize =
          p.LENGTH_INCH && p.WIDTH_INCH
            ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}`
            : p.Display_Size || 'N/A';
        return p.GSM === selectedGsm && pSize === selectedSize;
      }) ||
      variations[0]
    );
  }, [variations, selectedGsm, selectedSize]);

  const variationPrice = Number(currentVariation?.CALCULATED_PRICE_RS || 0);
  const hasValidPrice = variationPrice > 0;
  const inStock = Number(currentVariation?.Stock || 0) > 0;

  let buttonStyle = 'bg-gray-100 text-gray-400 cursor-not-allowed';
  let buttonContent = <span className="text-[9px] font-bold uppercase">Out</span>;
  let buttonTitle = 'Out of stock';

  if (isAdded) {
    buttonStyle = 'bg-emerald-600 text-white';
    buttonTitle = 'Item added';
    buttonContent = (
      <>
        <Check size={13} className="stroke-[2.5]" />
        <span className="hidden sm:inline">Added</span>
      </>
    );
  } else if (!hasValidPrice) {
    buttonStyle = 'bg-[#112338] text-white hover:bg-[#1a3654] active:scale-95 cursor-pointer';
    buttonTitle = 'Call / WhatsApp for current rate';
    buttonContent = (
      <>
        <ShoppingBag size={13} />
        <span className="hidden sm:inline">Add</span>
      </>
    );
  } else if (inStock) {
    buttonStyle = 'bg-[#112338] text-white hover:bg-[#1a3654] active:scale-95';
    buttonTitle = 'Add to cart';
    buttonContent = (
      <>
        <ShoppingBag size={13} />
        <span className="hidden sm:inline">Add</span>
      </>
    );
  }

  return (
    <article className="product-card w-full h-full group bg-white border border-[#e5e1d7] hover:border-[#112338]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col rounded-[3px] overflow-hidden">
      {/* Product Image Link */}
      <Link
        to={`/product/${encodeURIComponent(productName)}`}
        className="aspect-[4/3] bg-[#fbfaf8] overflow-hidden relative border-b border-[#e5e1d7]/70 p-3 flex items-center justify-center cursor-pointer"
      >
        {inStock ? (
          <div className="absolute top-2 left-2 bg-white/95 text-emerald-700 text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider border border-emerald-200/60 rounded-[2px] shadow-sm z-10 backdrop-blur-xs">
            In Stock
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-rose-50/95 text-rose-600 text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider border border-rose-200/60 rounded-[2px] shadow-sm z-10 backdrop-blur-xs">
            Out of Stock
          </div>
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
        <Link
          to={`/product/${encodeURIComponent(productName)}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="font-serif text-[13px] sm:text-[14.5px] md:text-[16px] font-medium text-[#112338] leading-snug line-clamp-1">
            {productName}
          </h3>
        </Link>
        <p className="text-[10px] sm:text-[11.5px] text-[#64748b] mt-0.5 mb-2.5 line-clamp-1">
          {currentVariation?.Description || 'Premium High Quality Stock'}
        </p>

        {/* Dynamic Selectors */}
        {(hasMultipleVariations ||
          departmentOf(currentVariation?.Category) === PAPER_AND_CANVAS) && (
          <div
            className={`grid ${
              departmentOf(currentVariation?.Category) === PAPER_AND_CANVAS
                ? 'grid-cols-2'
                : 'grid-cols-1'
            } gap-1.5 mb-2.5`}
          >
            {hasMultipleVariations && (
              <div className="flex flex-col bg-[#faf8f5] rounded-[3px] p-1.5 border border-[#e5e1d7]">
                <div className="flex items-center justify-between px-0.5 mb-0.5">
                  <span className="text-[7.5px] md:text-[8.5px] text-[#8892a0] font-bold uppercase tracking-wider">
                    {variationLabels.shortLabel}
                  </span>
                  {variationType === 'color' && getColorHex(selectedSize) && (
                    <span
                      className="w-2 h-2 rounded-full border border-black/15 shrink-0"
                      style={{ background: getColorHex(selectedSize) }}
                    />
                  )}
                </div>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-transparent text-[#112338] text-[10px] sm:text-[11px] font-semibold px-0.5 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:10px]"
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {departmentOf(currentVariation?.Category) === PAPER_AND_CANVAS && (
              <div className="flex flex-col bg-[#faf8f5] rounded-[3px] p-1.5 border border-[#e5e1d7]">
                <span className="text-[7.5px] md:text-[8.5px] text-[#8892a0] font-bold uppercase tracking-wider px-0.5">
                  GSM
                </span>
                <select
                  value={selectedGsm}
                  onChange={(e) => setSelectedGsm(e.target.value)}
                  className="w-full bg-transparent text-[#112338] text-[10px] sm:text-[11px] font-semibold px-0.5 py-0.5 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_center] bg-[length:10px]"
                >
                  {availableGsms.map((gsm) => (
                    <option key={gsm} value={gsm}>
                      {gsm}g
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Installment Toggle */}
        {!installmentHidden &&
          !isCategoryInstallmentDisabled &&
          PAPER_CATEGORY_NAMES.has(
            (currentVariation?.Category || '').toLowerCase()
          ) && (
            <div className="flex items-center gap-1.5 mb-2.5 bg-indigo-50/60 p-1.5 rounded-[3px] border border-indigo-100">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-3 h-3 text-indigo-600 bg-white border-indigo-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer shadow-sm"
                />
                <span className="text-[8px] md:text-[8.5px] text-indigo-700 font-bold uppercase tracking-wider">
                  Request Installment (3M)
                </span>
              </label>
            </div>
          )}

        {/* Price & Action */}
        <div className="mt-auto pt-2.5 border-t border-[#e5e1d7]/70 flex justify-between items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-semibold tracking-wider text-[#64748b] uppercase mb-0.5 line-clamp-1">
              Rs / {currentVariation?.PACKING_TYPE || 'ream'}
            </span>
            {hasValidPrice ? (
              <span className="font-serif font-bold text-[#112338] text-[15px] sm:text-[17px] leading-tight whitespace-nowrap">
                Rs. {formatPrice(variationPrice)}
              </span>
            ) : (
              <span className="font-serif font-bold text-[#112338] text-[13px] sm:text-[14px] leading-tight whitespace-nowrap">
                Rate on Request
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!hasValidPrice) {
                const specText = selectedSize ? `${selectedSize}, ${selectedGsm}g` : '';
                const msg = encodeURIComponent(`Assalam-o-Alaikum, mujhe "${currentVariation.PRODUCT_NAME}" (${specText}) ka current wholesale rate chahiye.`);
                window.open(`https://wa.me/${contactWhatsapp}?text=${msg}`, '_blank');
                return;
              }
              if (inStock) {
                if (isInstallment) {
                  setShowTerms(true);
                } else {
                  addToCart(
                    {
                      id:
                        currentVariation.ProductID ||
                        `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
                      name: currentVariation.PRODUCT_NAME,
                      gsm: currentVariation.GSM,
                      size: selectedSize,
                      price: variationPrice,
                      image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
                      packingType: currentVariation.PACKING_TYPE || 'ream',
                      category: currentVariation.Category,
                    },
                    1,
                    false,
                    null,
                    false,
                    null
                  );
                  triggerAddAnimation();
                }
              }
            }}
            ref={btnRef}
            className={`${buttonStyle} h-8 md:h-9 px-2.5 sm:px-3 rounded-[3px] font-semibold text-[11px] sm:text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 shadow-sm`}
            title={buttonTitle}
          >
            {buttonContent}
          </button>
        </div>
      </div>

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setShowTerms(false);
          addToCart(
            {
              id:
                currentVariation.ProductID ||
                `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
              name: currentVariation.PRODUCT_NAME,
              gsm: currentVariation.GSM,
              size: selectedSize,
              price: Number(currentVariation.CALCULATED_PRICE_RS) || 0,
              image: currentVariation.IMAGE_URL || PLACEHOLDER_IMAGE,
              packingType: currentVariation.PACKING_TYPE || 'ream',
              category: currentVariation.Category,
            },
            1,
            false,
            null,
            true,
            '3 Months'
          );
        }}
      />
    </article>
  );
});

export default ProductGroupCard;
