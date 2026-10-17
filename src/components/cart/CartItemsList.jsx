import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { departmentOf, PAPER_AND_CANVAS } from '../../data/categories';
import { thumb, fallbackOnError } from '../../lib/images';
import VariationBadge from './VariationBadge';

function formatItemRate(item, short = false) {
  if (item.isBulk) {
    return short ? 'WhatsApp final' : 'Rates on WhatsApp';
  }
  const formattedPrice = item.price.toLocaleString();
  const unitSuffix = item.packingType ? (short ? `/${item.packingType}` : ` / ${item.packingType}`) : '';
  return `Rs. ${formattedPrice}${unitSuffix}`;
}

export function CartItemsList({ cartItems, updateQuantity, removeFromCart }) {
  return (
    <motion.div 
      key="cart-view"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-2.5"
    >
      <div className="hidden md:grid grid-cols-12 gap-3 pb-1.5 border-b border-outline-variant px-3">
        <div className="col-span-5 font-label-caps text-[11px] text-on-surface-variant">Product</div>
        <div className="col-span-3 font-label-caps text-[11px] text-on-surface-variant text-center">Quantity</div>
        <div className="col-span-4 font-label-caps text-[11px] text-on-surface-variant text-right">Est. Price</div>
      </div>
      
      {cartItems.map((item) => (
        <div 
          key={`${item.id}-${item.isBulk ? 'bulk' : 'std'}-${item.installmentPlan || ''}`} 
          className="bg-surface border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-xl p-2.5 sm:p-3 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
        >
          {/* Desktop Layout (md+) */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 items-center">
            {/* Col 1: Product Info */}
            <div className="col-span-5 flex gap-3 items-center min-w-0">
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] shrink-0 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                <img
                  className="w-full h-full max-w-full max-h-full object-contain rounded mix-blend-multiply"
                  src={thumb(item.image, 120)}
                  alt={item.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  onError={fallbackOnError}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline-md text-sm font-bold text-on-surface truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {departmentOf(item.category) === PAPER_AND_CANVAS && Boolean(item.gsm) && (
                    <span className="bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-orange-100 rounded">
                      {item.gsm}g
                    </span>
                  )}
                  <VariationBadge size={item.size} />
                  {item.isBulk && (
                    <span className="bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-600 border border-blue-100 rounded uppercase tracking-wider">
                      Bulk Req
                    </span>
                  )}
                  {item.isInstallment && (
                    <span className="bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-bold text-indigo-600 border border-indigo-100 rounded uppercase tracking-wider">
                      Installment: {item.installmentPlan}
                    </span>
                  )}
                </div>
                {item.bulkDetails && <p className="text-[11px] text-gray-400 mt-0.5 italic truncate">Note: {item.bulkDetails}</p>}
              </div>
            </div>

            {/* Col 2: Quantity Controls */}
            <div className="col-span-3 flex justify-center items-center">
              {item.isBulk ? (
                <div className="flex flex-col items-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Bulk Request
                  </span>
                  <span className="text-[9.5px] text-gray-400 font-medium">Qty: {item.quantity}</span>
                </div>
              ) : (
                <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-xs overflow-hidden h-7">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.isBulk, item.quantity - 1, item.isInstallment, item.installmentPlan)}
                    className="px-2 h-full hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-gray-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.isBulk, item.quantity + 1, item.isInstallment, item.installmentPlan)}
                    className="px-2 h-full hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Col 3: Price & Remove Button */}
            <div className="col-span-4 flex items-center justify-end gap-3">
              <div className="text-right flex flex-col justify-center">
                <span className="text-base font-black text-primary leading-tight">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {formatItemRate(item, false)}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => removeFromCart(item.id, item.isBulk, item.isInstallment, item.installmentPlan)} 
                className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                title="Remove item"
              >
                <Trash2 size={13} />
                <span className="hidden xl:inline">Remove</span>
              </button>
            </div>
          </div>

          {/* Mobile Layout (< md) */}
          <div className="flex md:hidden flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 items-center min-w-0">
                <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] shrink-0 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                  <img
                    className="w-full h-full max-w-full max-h-full object-contain rounded mix-blend-multiply"
                    src={thumb(item.image, 120)}
                    alt={item.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    onError={fallbackOnError}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline-md text-sm font-bold text-on-surface truncate">{item.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {departmentOf(item.category) === PAPER_AND_CANVAS && Boolean(item.gsm) && (
                      <span className="bg-orange-50 px-1.5 py-0.5 text-[9.5px] font-bold text-primary border border-orange-100 rounded">
                        {item.gsm}g
                      </span>
                    )}
                    <VariationBadge size={item.size} />
                    {item.isBulk && (
                      <span className="bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-100 rounded uppercase tracking-wider">
                        Bulk
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => removeFromCart(item.id, item.isBulk, item.isInstallment, item.installmentPlan)} 
                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                title="Remove item"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Bottom Row on Mobile: Quantity on left, Price on right */}
            <div className="flex items-center justify-between border-t border-gray-100/80 pt-1.5 mt-0.5">
              <div>
                {item.isBulk ? (
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Bulk: {item.quantity} Qty
                  </span>
                ) : (
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-xs overflow-hidden h-6.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.isBulk, item.quantity - 1, item.isInstallment, item.installmentPlan)}
                      className="px-2 h-full hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-gray-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.isBulk, item.quantity + 1, item.isInstallment, item.installmentPlan)}
                      className="px-2 h-full hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-primary">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
                <span className="text-[9.5px] font-medium text-gray-400 block -mt-0.5">
                  {formatItemRate(item, true)}
                </span>
              </div>
            </div>
            {item.bulkDetails && <p className="text-[10.5px] text-gray-400 italic truncate -mt-0.5">Note: {item.bulkDetails}</p>}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default CartItemsList;
