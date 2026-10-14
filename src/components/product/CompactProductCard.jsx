import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { PLACEHOLDER_IMAGE, fallbackOnError, thumb, thumbSrcSet } from '../../lib/images';
import { flyToCart } from '../../lib/cartAnimation';

/*
 * Compact Product Card for Related / Relevant Products
 * Modern & Polished Style:
 * Elevated warm card border, subtle hover lift, top-right heart wishlist button,
 * 2-line title, bold PKR price typography, and compact dark navy Add to Cart button with fly-to-cart animation.
 */
export const CompactProductCard = ({ product }) => {
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

export default CompactProductCard;
