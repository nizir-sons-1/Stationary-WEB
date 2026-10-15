import React from 'react';
import { ArrowRight, PackageCheck } from 'lucide-react';
import { departmentOf, PAPER_AND_CANVAS } from '../../data/categories';

export function OrderSummary({
  cartItems,
  cartTotal,
  shippingMethod,
  shippingFeeText,
  checkoutPhase,
  setCheckoutPhase,
  isCheckingOut,
  settings = null,
}) {
  const standardFee =
    typeof settings?.standard_delivery_fee === 'number' ? settings.standard_delivery_fee : 200;
  const threshold =
    settings?.is_free_shipping_enabled && typeof settings?.free_shipping_threshold === 'number'
      ? settings.free_shipping_threshold
      : null;
  const isFreeShipping = threshold !== null && cartTotal >= threshold;
  let deliveryCharge = 0;
  if (shippingMethod === 'standard_delivery' && !isFreeShipping) {
    deliveryCharge = standardFee;
  }

  return (
    <div className="bg-gray-50/50 border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 lg:p-8 rounded-[32px] sticky top-32 transition-all duration-300">
      <h2 className="font-headline-md text-xl font-bold text-secondary border-b border-gray-200 pb-4 mb-6">Order Summary</h2>
      
      <div className="flex justify-between items-center py-2">
        <span className="text-sm font-medium text-gray-500">Subtotal ({cartItems.length} items)</span>
        <span className="text-sm font-bold text-secondary">Rs. {cartTotal.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between items-center py-2">
        <span className="text-sm font-medium text-gray-500">Shipping</span>
        <span className="text-sm font-bold text-primary">
          {shippingFeeText}
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-gray-200 pb-6 mb-6">
        <span className="text-sm font-medium text-gray-500">Total Weight</span>
        <span className="text-sm font-bold text-secondary">N/A</span>
      </div>
      
      <div className="flex justify-between items-end mb-8">
        <span className="text-xl font-bold text-secondary">Total</span>
        <span className="text-2xl font-black text-blue-900 leading-none">
          Rs. {(cartTotal + deliveryCharge).toLocaleString()}
        </span>
      </div>

      {/* Mini Cart Items (Only visible in Checkout Phase) */}
      {checkoutPhase === 'checkout' && (
        <div className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xs font-bold text-gray-900 mb-4">Items in Cart:</h3>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.name}-${item.size || ''}-${item.isBulk ? 'bulk' : 'std'}`} className="flex flex-col text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-700 font-medium">{item.name} ({item.size}{departmentOf(item.category) === PAPER_AND_CANVAS ? `, ${item.gsm}g` : ''})</span>
                  {item.isBulk && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      Bulk
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500">{item.quantity} × Rs. {(item.price * item.quantity).toLocaleString()} (Rs. {item.price.toLocaleString()}/{item.packingType})</span>
                {item.bulkDetails && (
                  <span className="text-[10px] text-blue-900 bg-blue-50/70 rounded px-1.5 py-0.5 mt-1 border border-blue-200/60 italic line-clamp-2">
                    {item.bulkDetails}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {checkoutPhase === 'cart' ? (
        <button
          type="button"
          onClick={() => {
            const hasUnpriced = cartItems.some(i => !i.isBulk && Number(i.price || 0) <= 0);
            if (hasUnpriced) {
              alert('Some items in your cart do not have a confirmed price. Please remove them or contact us on WhatsApp for a custom quotation.');
              return;
            }
            setCheckoutPhase('checkout');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className="w-full text-white bg-[#111111] hover:bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 py-4 font-bold text-sm uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Proceed to Checkout <ArrowRight size={18} />
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="submit" form="checkout-form" disabled={isCheckingOut} className={`w-full text-white py-5 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#111111] hover:bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1'}`}>
            <PackageCheck size={20} /> {isCheckingOut ? 'Processing Order...' : 'Confirm & Place Order'}
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckoutPhase('cart');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors cursor-pointer"
          >
            Cancel Checkout
          </button>
        </div>
      )}
      
      <p className="text-[11px] font-medium text-gray-400 mt-6 text-center px-4 leading-relaxed">
        Orders are placed directly into our system. You will receive an immediate confirmation upon completion.
      </p>
    </div>
  );
}

export default OrderSummary;
