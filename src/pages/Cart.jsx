import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, MessageCircle, ArrowLeft, Truck, PackageCheck, CreditCard, Building2, MapPin, CheckCircle2, Check, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageSeo } from '../lib/seo';
import { departmentOf, PAPER_AND_CANVAS } from '../data/categories';
import { getColorHex, isColorVariation, isMeaninglessVariation } from '../lib/variations';
import { isValidPakistaniPhone, normalizePakistaniPhone } from '../lib/phone';

export const CUSTOMER_STORAGE_KEY = 'nazir_saved_customer';

export function loadSavedCustomer() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomerInfo(info) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Ignore storage quota / private browsing errors
  }
}

export function clearSavedCustomer() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  } catch {}
}

const PAPER_CATEGORIES = [
  'bleach card', 'art card', 'art paper', 'matte paper', 'copy paper', 
  'offset paper', 'ivory card', 'color card', 'carbonless', 'stickers', 
  'local paper', 'boxboard', 'news', 'butter paper', 'kraft card', 'book paper'
];

function isPaperAndCanvasItem(item) {
  if (!item) return false;
  const dept = String(item.department || item.Department || '').trim().toLowerCase();
  if (dept === PAPER_AND_CANVAS.toLowerCase() || dept === 'paper & canvas' || dept === 'paper-and-canvas') {
    return true;
  }
  const rawCat = String(item.category || item.Category || '');
  const resolvedDept = String(departmentOf(rawCat) || '').trim().toLowerCase();
  if (resolvedDept === PAPER_AND_CANVAS.toLowerCase() || resolvedDept === 'paper & canvas' || resolvedDept === 'paper-and-canvas') {
    return true;
  }
  const catLower = rawCat.toLowerCase();
  return PAPER_CATEGORIES.some((c) => catLower.includes(c));
}

function isB2BCart(cartItems) {
  if (cartItems.some((item) => item.isBulk)) return true;
  return cartItems.every(isPaperAndCanvasItem);
}

function validateCheckoutInput({ checkoutPhase, fullName, phone, address, isB2B, shippingMethod }) {
  if (checkoutPhase !== 'checkout') return { valid: true };
  if (!fullName?.trim()) {
    return { valid: false, message: 'Please enter your full name.' };
  }
  if (!isValidPakistaniPhone(phone)) {
    return {
      valid: false,
      message: 'Kripya 11 digits Pakistani mobile number enter karein jo 03 se shuru ho (e.g. 0300 1234567). Order confirm hone ke liye 11 digits mobile number zaroori hai.'
    };
  }
  if (shippingMethod !== 'self_pickup' && !address?.trim()) {
    return {
      valid: false,
      message: isB2B
        ? 'Please enter your delivery city, shop, or goods transport / adda address.'
        : 'Please enter your delivery address.'
    };
  }
  return { valid: true };
}

function generateFallbackOrderId() {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    return `ORD-${(window.crypto.getRandomValues(new Uint32Array(1))[0] % 90000) + 10000}`;
  }
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

function getShippingFeeText(shippingMethod) {
  if (shippingMethod === 'self_pickup') return 'FREE';
  if (shippingMethod === 'standard_delivery') return 'Rs 200';
  return 'TBD';
}

function buildOrderPayload({
  cartItems,
  fullName,
  phone,
  email,
  address,
  shippingMethod,
  paymentMethod,
  isB2B,
  cartTotal,
}) {
  const shipMap = {
    self_pickup: 'Self Pickup (FREE)',
    delivery_open: 'Delivery - Open (Min Rs 350)',
    delivery_bundle: 'Delivery - Bundle (Only for Adda)',
    standard_delivery: 'Standard Delivery (Rs 200)',
  };
  const payMap = {
    shop: 'Pay at Shop (Pay when collecting)',
    bank: 'Bank Transfer',
    cod: 'Cash on Delivery (COD)',
    online: 'Online Transfer',
  };

  let finalTotal = cartTotal;
  if (shippingMethod === 'standard_delivery') finalTotal += 200;

  const hasBulk = cartItems.some((item) => item.isBulk);
  const bulkNotesList = cartItems
    .filter((item) => item.isBulk && item.bulkDetails)
    .map((item) => `${item.name}: ${item.bulkDetails}`);
  const bulkNotesText = bulkNotesList.join(' | ');

  let calculatedOrderType = isB2B ? 'B2B' : 'B2C';
  if (hasBulk) {
    calculatedOrderType = isB2B ? 'Bulk Order (B2B)' : 'Bulk Order';
  }

  let formattedAddress = address || null;
  if (bulkNotesText) {
    formattedAddress = address
      ? `${address}\n\n📌 [BULK ORDER NOTE]: ${bulkNotesText}`
      : `[BULK ORDER NOTE]: ${bulkNotesText}`;
  }

  const items = cartItems.map((item) => {
    let adminMsg = null;
    if (item.bulkDetails) {
      adminMsg = `[BULK ORDER NOTE]: ${item.bulkDetails}`;
    } else if (item.isBulk) {
      adminMsg = '[BULK ORDER REQUEST]';
    }

    return {
      name: item.name,
      size: item.size,
      gsm: item.gsm,
      quantity: item.quantity,
      packingType: item.packingType,
      price: item.price,
      isBulk: item.isBulk || false,
      bulkDetails: item.bulkDetails || null,
      admin_label: item.isBulk ? 'BULK_ORDER_REQUEST' : null,
      admin_message: adminMsg,
      isInstallment: item.isInstallment || false,
      installmentPlan: item.installmentPlan || null,
    };
  });

  const cleanPhone = normalizePakistaniPhone(phone);

  return {
    orderPayload: {
      customer_name: fullName,
      customer_phone: cleanPhone,
      customer_email: email || null,
      customer_address: formattedAddress,
      whatsapp_number: cleanPhone,
      shipping_method: shipMap[shippingMethod] || shippingMethod,
      payment_method: payMap[paymentMethod] || paymentMethod,
      total_amount: finalTotal,
      total_price: finalTotal,
      status: 'pending',
      order_type: calculatedOrderType,
      items,
    },
    cleanPhone,
    finalTotal,
    hasBulk,
    bulkNotesText,
    calculatedOrderType,
    shipLabel: shipMap[shippingMethod] || shippingMethod,
    payLabel: payMap[paymentMethod] || paymentMethod,
    formattedAddress,
  };
}

function sendOrderNotifications({ orderId, fullName, phone, email, address, shipLabel, payLabel, finalTotal, cartItems }) {
  if (email) {
    try {
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            order_id: orderId,
            customer_name: fullName,
            customer_email: email,
            shipping_method: shipLabel,
            payment_method: payLabel,
            total_amount: finalTotal,
          },
        }),
      }).catch((err) => console.error('Error triggering email API:', err));
    } catch (emailErr) {
      console.error('Failed to initiate email send:', emailErr);
    }
  }

  try {
    fetch('/api/send-order-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderDetails: {
          order_id: orderId,
          customer_name: fullName,
          customer_phone: phone,
          customer_address: address || 'Self Pickup at Shop',
          shipping_method: shipLabel,
          payment_method: payLabel,
          total_amount: finalTotal,
          items: cartItems.map((item) => ({
            name: item.name,
            size: item.size,
            gsm: item.gsm,
            quantity: item.quantity,
            packingType: item.packingType,
            price: item.price,
            isBulk: item.isBulk || false,
            bulkDetails: item.bulkDetails || null,
          })),
        },
      }),
    }).catch((err) => console.error('Error triggering WhatsApp notification API:', err));
  } catch (waErr) {
    console.error('Failed to trigger WhatsApp notification:', waErr);
  }
}

function VariationBadge({ size }) {
  if (isMeaninglessVariation(size)) return null;
  if (isColorVariation(size)) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-gray-700 border border-gray-200 rounded-md">
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
          style={{ background: getColorHex(size) || '#94a3b8' }}
        />
        Color: {size}
      </span>
    );
  }
  return (
    <span className="bg-gray-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-gray-600 border border-gray-200 rounded-md">
      {size}
    </span>
  );
}

function EmptyCartView() {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <MessageCircle size={40} className="text-gray-300" />
      </div>
      <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Your Cart is Empty</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 text-center max-w-md">Looks like you haven't added anything yet. Browse our premium stock to find what you need.</p>
      <Link to="/shop" className="bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary transition-colors shadow-lg hover:-translate-y-1">
        Start Shopping
      </Link>
    </main>
  );
}

function OrderSuccessView({ placedOrder, copied, onCopy }) {
  return (
    <main className="flex-grow pt-4 sm:pt-6 md:pt-8 pb-stack-lg px-margin-mobile md:px-gutter max-w-4xl w-full mx-auto">
      {/* Standard Unified Back Button */}
      <div className="mb-3 sm:mb-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Shop
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="bg-white border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-[24px] md:rounded-[32px] p-5 sm:p-8 md:p-12 overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <span className="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2.5 border border-emerald-100">
            Order Confirmed
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#112338] tracking-tight">
            Thank You! Your Order Has Been Placed
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2.5 max-w-lg leading-relaxed">
            We have received your order <strong className="font-mono text-[#112338]">#{placedOrder.id}</strong>. Our warehouse team is now packaging your items.
          </p>
        </div>

        {/* Verification Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950">Order Confirmed</h4>
              <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
                Customer: <strong className="font-medium text-emerald-950">{placedOrder.customerName}</strong> ({placedOrder.phone})
              </p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">Dispatch &amp; Delivery</h4>
              <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">
                Method: <strong className="font-medium text-blue-950">{placedOrder.shipping}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Order Status Banner (if order contains bulk requests) */}
        {placedOrder.hasBulk && (
          <div className="mb-6 bg-[#fcfbf9] border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm text-[#112338]">Bulk Order Inquiry Received</h4>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  Wholesale
                </span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Aapka bulk order inquiry hume receive ho gaya hai. Humari team jald hi aap se WhatsApp (<strong className="text-[#112338]">{placedOrder.phone}</strong>) par rabta karegi aur best wholesale rates &amp; dispatch schedule confirm karegi.
              </p>
              {placedOrder.items
                .filter((i) => i.isBulk && i.bulkDetails)
                .map((i) => (
                  <div key={`${i.name}-${i.size || 'std'}-${i.gsm || '0'}`} className="mt-2 text-xs bg-white border border-[#e2ddd3] rounded-lg p-2.5 text-[#112338]">
                    <span className="font-bold text-amber-800">Your Requirements for {i.name}:</span> {i.bulkDetails}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 border border-[#e2ddd3] shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Order ID</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base md:text-lg font-mono font-bold text-[#112338]">#{placedOrder.id}</span>
              <button 
                onClick={onCopy}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Payment</span>
            <span className="text-sm font-bold text-[#112338] mt-0.5 block truncate" title={placedOrder.payment}>{placedOrder.payment}</span>
          </div>

          <div>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Shipping</span>
            <span className="text-sm font-bold text-[#112338] mt-0.5 block truncate" title={placedOrder.shipping}>{placedOrder.shipping}</span>
          </div>

          <div>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
            <span className="text-base md:text-lg font-black text-primary mt-0.5 block">
              Rs. {placedOrder.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Customer Address Summary (if provided) */}
        {(placedOrder.rawAddress || placedOrder.address) && (
          <div className="mb-6 bg-white border border-[#e2ddd3] rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
            <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Destination</span>
              <p className="text-xs sm:text-sm text-gray-700 font-medium mt-0.5">{placedOrder.rawAddress || placedOrder.address}</p>
            </div>
          </div>
        )}

        {/* Items Summary */}
        <div className="mb-8">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Purchased Items ({placedOrder.items.length})</h3>
          <div className="divide-y divide-gray-100 border border-[#e5e1d7] rounded-2xl overflow-hidden bg-white max-h-60 overflow-y-auto custom-scrollbar">
            {placedOrder.items.map((item) => (
              <div key={`${item.name}-${item.size || 'std'}-${item.gsm || '0'}-${item.quantity}`} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-10 h-10 bg-gray-50 rounded-lg p-1 shrink-0 border border-gray-100 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-[#112338]">{item.name}</h4>
                    <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 mt-0.5">
                      <VariationBadge size={item.size} />
                      {item.gsm && <span>• {item.gsm}g</span>}
                      <span>• Qty: {item.quantity} {item.packingType}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#112338] shrink-0">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link 
            to={`/track-order?id=${placedOrder.id}`} 
            className="flex-1 bg-secondary text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          >
            Track Order Status <ArrowRight size={16} />
          </Link>
          <Link 
            to="/shop" 
            className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Customer Support Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Need assistance? Contact Nazir &amp; Sons at <a href="tel:+923202220001" className="text-gray-600 hover:text-primary font-semibold underline">+92 320 2220001</a> or visit our store in Lahore.
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function CartItemsList({ cartItems, updateQuantity, removeFromCart }) {
  return (
    <motion.div 
      key="cart-view"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-stack-md"
    >
      <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-outline-variant px-4">
        <div className="col-span-6 font-label-caps text-label-caps text-on-surface-variant">Product</div>
        <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant text-center">Quantity</div>
        <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant text-right">Est. Price</div>
      </div>
      
      {cartItems.map((item) => (
        <div key={`${item.id}-${item.isBulk ? 'bulk' : 'std'}-${item.installmentPlan || ''}`} className="bg-surface border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="md:col-span-6 flex gap-4 items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-2">
              <img className="w-full h-full object-cover rounded-lg mix-blend-multiply" src={item.image} alt={item.name} />
            </div>
            <div>
              <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">{item.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {departmentOf(item.category) === PAPER_AND_CANVAS && <span className="bg-orange-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-primary border border-orange-100 rounded-md">{item.gsm}g</span>}
                <VariationBadge size={item.size} />
                {item.isBulk && <span className="bg-blue-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-blue-600 border border-blue-100 rounded-md uppercase tracking-widest">Bulk Req</span>}
                {item.isInstallment && <span className="bg-indigo-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-indigo-600 border border-indigo-100 rounded-md uppercase tracking-widest">Installment: {item.installmentPlan}</span>}
              </div>
              {item.bulkDetails && <p className="text-xs text-gray-400 mt-2 italic line-clamp-1">Note: {item.bulkDetails}</p>}
            </div>
          </div>
          
          <div className="md:col-span-3 flex justify-start md:justify-center items-center">
            {item.isBulk ? (
              <div className="flex flex-col items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  Bulk Request
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} (Quoted)</span>
              </div>
            ) : (
              <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.isBulk, item.quantity - 1, item.isInstallment, item.installmentPlan)}
                  className="px-3 py-2 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.isBulk, item.quantity + 1, item.isInstallment, item.installmentPlan)}
                  className="px-3 py-2 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="md:col-span-3 text-left md:text-right flex flex-col justify-center">
            <span className="text-lg md:text-xl font-black text-primary">Rs. {(item.price * item.quantity).toLocaleString()}</span>
            <span className="text-[11px] font-bold text-gray-400">
              {item.isBulk ? 'Rates finalized on WhatsApp' : `Rs. ${item.price.toLocaleString()} / ${item.packingType}`}
            </span>
          </div>
          
          <div className="md:col-span-12 flex justify-end md:-mt-8">
            <button onClick={() => removeFromCart(item.id, item.isBulk, item.isInstallment, item.installmentPlan)} className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function getPhoneInputBorderClass(phoneVal, isValid) {
  if (phoneVal.length > 0 && !isValid) {
    return 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-400 text-[#112338]';
  }
  return 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-[#112338]';
}

function RadioOptionCard({ name, value, checked, onChange, icon: Icon, title, subtitle, colSpan }) {
  return (
    <label className={`${colSpan ? 'col-span-full' : ''} cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${
      checked ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <Icon className={checked ? 'text-primary' : 'text-gray-400'} size={24} />
      <div>
        <div className={`font-bold text-sm ${checked ? 'text-primary' : 'text-gray-700'}`}>{title}</div>
        <div className={`text-xs mt-0.5 ${checked ? 'text-primary/80' : 'text-gray-500'}`}>{subtitle}</div>
      </div>
    </label>
  );
}

function getAddressFieldConfig({ shippingMethod, isB2B, hasPaperAndCanvas }) {
  if (shippingMethod === 'delivery_bundle') {
    return {
      label: 'Goods Transport / Adda Address *',
      placeholder: 'Enter your city and goods transport / adda details',
    };
  }
  if (isB2B) {
    if (hasPaperAndCanvas) {
      return {
        label: 'Delivery / Adda / City Address *',
        placeholder: 'Enter your city, shop name, or goods transport / adda details',
      };
    }
    return {
      label: 'Delivery / Shop / City Address *',
      placeholder: 'Enter your city, shop, or delivery address',
    };
  }
  return {
    label: 'Delivery Address *',
    placeholder: 'Enter your full shipping address',
  };
}

function CustomerInfoFields({
  fullName,
  setFullName,
  phone,
  handlePhoneChange,
  isPhoneValid,
  email,
  setEmail,
  address,
  setAddress,
  isB2B,
  shippingMethod,
  rememberDetails,
  setRememberDetails,
  onClearDetails,
  hasAutoFilled,
  hasPaperAndCanvas,
}) {
  const phoneBorderClass = getPhoneInputBorderClass(phone, isPhoneValid);
  const addressConfig = getAddressFieldConfig({ shippingMethod, isB2B, hasPaperAndCanvas });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-secondary">Customer Information</h3>
          {hasAutoFilled && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              <Check size={12} className="stroke-[2.5]" /> Auto-filled
            </span>
          )}
        </div>
        {(fullName || phone || address) && (
          <button
            type="button"
            onClick={onClearDetails}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {hasAutoFilled && (
        <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3 py-1.5">
          <Check size={13} className="text-emerald-600 stroke-[2.5]" />
          <span>Details remembered from your previous order</span>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-fullName" className="text-sm font-bold text-gray-700">Full Name *</label>
        <input id="customer-fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-phone" className="text-sm font-bold text-gray-700">Phone Number *</label>
        <input 
          id="customer-phone" 
          type="tel" 
          inputMode="numeric"
          autoComplete="tel"
          required 
          value={phone} 
          onChange={handlePhoneChange} 
          placeholder="0300 1234567" 
          className={`p-4 rounded-xl border outline-none shadow-sm bg-white text-sm transition-all ${phoneBorderClass}`} 
        />
        {phone.length > 0 && !isPhoneValid && (
          <p className="text-[11.5px] font-medium text-red-500">
            Kripya 11 digits Pakistani mobile number enter karein (e.g. 0300 1234567).
          </p>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-email" className="text-sm font-bold text-gray-700">Email Address (Optional)</label>
        <input id="customer-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
      </div>
      
      {(shippingMethod !== 'self_pickup' || !isB2B) && (
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-address" className="text-sm font-bold text-gray-700">
            {addressConfig.label}
          </label>
          <textarea
            id="customer-address"
            required={shippingMethod !== 'self_pickup'}
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={addressConfig.placeholder}
            rows="3"
            className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white resize-none"
          />
        </div>
      )}

      <div className="pt-1">
        <label htmlFor="customer-remember" className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs text-gray-700 hover:text-gray-900 transition-colors">
          <input
            id="customer-remember"
            type="checkbox"
            checked={rememberDetails}
            onChange={(e) => setRememberDetails(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer accent-primary"
          />
          <span className="font-medium">Remember my details for faster checkout next time</span>
        </label>
      </div>
    </div>
  );
}

function ShippingMethodSelector({ isB2B, shippingMethod, setShippingMethod, hasPaperAndCanvas }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Shipping Method</h3>
      <div className={`grid grid-cols-1 ${hasPaperAndCanvas && isB2B ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {isB2B ? (
          <>
            <RadioOptionCard
              name="shipping"
              value="self_pickup"
              checked={shippingMethod === 'self_pickup'}
              onChange={() => setShippingMethod('self_pickup')}
              icon={Building2}
              title="Self Pickup"
              subtitle="FREE"
            />
            <RadioOptionCard
              name="shipping"
              value="delivery_open"
              checked={shippingMethod === 'delivery_open'}
              onChange={() => setShippingMethod('delivery_open')}
              icon={Truck}
              title="Delivery - Open"
              subtitle="Min Rs 350"
            />
            {hasPaperAndCanvas && (
              <RadioOptionCard
                name="shipping"
                value="delivery_bundle"
                checked={shippingMethod === 'delivery_bundle'}
                onChange={() => setShippingMethod('delivery_bundle')}
                icon={PackageCheck}
                title="Delivery - Bundle"
                subtitle="Only for Adda"
              />
            )}
          </>
        ) : (
          <RadioOptionCard
            name="shipping"
            value="standard_delivery"
            checked={shippingMethod === 'standard_delivery'}
            onChange={() => setShippingMethod('standard_delivery')}
            icon={Truck}
            title="Standard Delivery"
            subtitle="Rs 200 Flat Rate"
            colSpan
          />
        )}
      </div>
    </div>
  );
}

function PaymentMethodSelector({ isB2B, paymentMethod, setPaymentMethod }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isB2B ? (
          <>
            <RadioOptionCard
              name="payment"
              value="shop"
              checked={paymentMethod === 'shop'}
              onChange={() => setPaymentMethod('shop')}
              icon={MapPin}
              title="Pay at Shop"
              subtitle="Pay when collecting"
            />
            <RadioOptionCard
              name="payment"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={() => setPaymentMethod('bank')}
              icon={CreditCard}
              title="Bank Transfer"
              subtitle="Account details on confirmation"
            />
          </>
        ) : (
          <>
            <RadioOptionCard
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              icon={MapPin}
              title="Cash on Delivery (COD)"
              subtitle="Pay at your doorstep"
            />
            <RadioOptionCard
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
              icon={CreditCard}
              title="Online Payment"
              subtitle="Bank / EasyPaisa / JazzCash"
            />
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({
  cartItems,
  fullName,
  setFullName,
  phone,
  handlePhoneChange,
  isPhoneValid,
  email,
  setEmail,
  address,
  setAddress,
  isB2B,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  rememberDetails,
  setRememberDetails,
  onClearDetails,
  hasAutoFilled,
  hasPaperAndCanvas,
}) {
  const hasBulk = Array.isArray(cartItems) && cartItems.some((item) => item.isBulk);

  return (
    <motion.form 
      id="checkout-form"
      onSubmit={handleCheckout}
      key="checkout-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-10"
    >
      {hasBulk && (
        <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
            <PackageCheck size={20} />
          </div>
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="block font-bold text-blue-950 text-xs sm:text-sm">
              Bulk Order Checkout Active
            </strong>
            {hasPaperAndCanvas
              ? "This order includes wholesale items with custom specifications. Please complete your contact and shipping information below. Final invoice and bilty/adda dispatch details will be verified with you."
              : "This order includes wholesale items with custom specifications. Please complete your contact and shipping information below. Final invoice and dispatch details will be verified with you."}
          </div>
        </div>
      )}

      <CustomerInfoFields
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        handlePhoneChange={handlePhoneChange}
        isPhoneValid={isPhoneValid}
        email={email}
        setEmail={setEmail}
        address={address}
        setAddress={setAddress}
        isB2B={isB2B}
        shippingMethod={shippingMethod}
        rememberDetails={rememberDetails}
        setRememberDetails={setRememberDetails}
        onClearDetails={onClearDetails}
        hasAutoFilled={hasAutoFilled}
        hasPaperAndCanvas={hasPaperAndCanvas}
      />
      <ShippingMethodSelector
        isB2B={isB2B}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        hasPaperAndCanvas={hasPaperAndCanvas}
      />
      <PaymentMethodSelector
        isB2B={isB2B}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    </motion.form>
  );
}

function OrderSummary({
  cartItems,
  cartTotal,
  shippingMethod,
  shippingFeeText,
  checkoutPhase,
  setCheckoutPhase,
  isCheckingOut,
}) {
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
          Rs. {(cartTotal + (shippingMethod === 'standard_delivery' ? 200 : 0)).toLocaleString()}
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
            setCheckoutPhase('checkout');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className="w-full text-white bg-[#111111] hover:bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 py-5 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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

const Cart = () => {
  usePageSeo('/cart');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const isCheckoutRequested =
    searchParams.get('phase') === 'checkout' ||
    searchParams.get('checkout') === 'true' ||
    location.state?.phase === 'checkout';

  const checkoutAutoTriggered = React.useRef(false);

  // Checkout States
  const [savedProfile] = useState(loadSavedCustomer);
  const [rememberDetails, setRememberDetails] = useState(true);
  const [checkoutPhase, setCheckoutPhase] = useState(() => {
    if (isCheckoutRequested && cartItems.length > 0) {
      checkoutAutoTriggered.current = true;
      return 'checkout';
    }
    return 'cart';
  });

  React.useEffect(() => {
    if (isCheckoutRequested && cartItems.length > 0 && !checkoutAutoTriggered.current) {
      checkoutAutoTriggered.current = true;
      setCheckoutPhase('checkout');
    }
  }, [isCheckoutRequested, cartItems.length]);
  const [fullName, setFullName] = useState(() => savedProfile.fullName || '');
  const [phone, setPhone] = useState(() => savedProfile.phone || '');
  const [email, setEmail] = useState(() => savedProfile.email || '');
  const [address, setAddress] = useState(() => savedProfile.address || '');
  const [shippingMethod, setShippingMethod] = useState('self_pickup'); // 'self_pickup' | 'delivery_open' | 'delivery_bundle' | 'standard_delivery'
  const [paymentMethod, setPaymentMethod] = useState('shop'); // 'shop' | 'bank' | 'cod' | 'online'
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasAutoFilled = Boolean(savedProfile.fullName || savedProfile.phone || savedProfile.address);

  // Sync customer details to localStorage when rememberDetails is enabled
  React.useEffect(() => {
    if (rememberDetails) {
      if (fullName || phone || email || address) {
        saveCustomerInfo({ fullName, phone, email, address });
      }
    } else {
      clearSavedCustomer();
    }
  }, [fullName, phone, email, address, rememberDetails]);

  const handleClearDetails = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    clearSavedCustomer();
  };

  const isB2B = isB2BCart(cartItems);
  const hasPaperAndCanvas = cartItems.some(isPaperAndCanvasItem);

  // Force default methods if switching types
  React.useEffect(() => {
    if (isB2B) {
      setShippingMethod(prev => {
        if (prev === 'standard_delivery') return 'self_pickup';
        if (prev === 'delivery_bundle' && !hasPaperAndCanvas) return 'delivery_open';
        return prev;
      });
      setPaymentMethod(prev => (prev === 'cod' || prev === 'online' ? 'shop' : prev));
    } else {
      setShippingMethod(prev => (prev !== 'standard_delivery' ? 'standard_delivery' : prev));
      setPaymentMethod(prev => (prev === 'shop' ? 'cod' : prev));
    }
  }, [isB2B, hasPaperAndCanvas]);

  // Scroll to top immediately when checkout phase transitions
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [checkoutPhase]);

  const handleCopyOrderId = () => {
    if (placedOrder?.id && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(placedOrder.id).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPhoneValid = isValidPakistaniPhone(phone);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^\d\s+-]/g, '').slice(0, 16);
    setPhone(val);
  };

  const handleCheckout = async (e) => {
    e?.preventDefault();
    if (cartItems.length === 0) return;
    const check = validateCheckoutInput({ checkoutPhase, fullName, phone, address, isB2B, shippingMethod });
    if (!check.valid) {
      alert(check.message);
      if (!isValidPakistaniPhone(phone)) {
        document.getElementById('customer-phone')?.focus();
      }
      return;
    }
    
    setIsCheckingOut(true);
    try {
      const {
        orderPayload,
        cleanPhone,
        finalTotal,
        hasBulk,
        bulkNotesText,
        calculatedOrderType,
        shipLabel,
        payLabel,
        formattedAddress
      } = buildOrderPayload({
        cartItems,
        fullName,
        phone,
        email,
        address,
        shippingMethod,
        paymentMethod,
        isB2B,
        cartTotal
      });

      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (insertError) {
        console.error('Supabase order insert error:', insertError);
      }

      const orderId = insertedOrder?.id?.slice(0, 8).toUpperCase() || generateFallbackOrderId();

      sendOrderNotifications({
        orderId,
        fullName,
        phone: cleanPhone,
        email,
        address,
        shipLabel,
        payLabel,
        finalTotal,
        cartItems
      });

      setPlacedOrder({
        id: orderId,
        customerName: fullName,
        phone: cleanPhone,
        email: email,
        address: formattedAddress,
        rawAddress: address,
        shipping: shipLabel,
        payment: payLabel,
        total: finalTotal,
        orderType: calculatedOrderType,
        hasBulk: hasBulk,
        bulkNotes: bulkNotesText,
        items: [...cartItems]
      });

      if (rememberDetails) {
        saveCustomerInfo({
          fullName,
          phone: cleanPhone,
          email: email || '',
          address: address || '',
        });
      }

      clearCart();
      setCheckoutPhase('success');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to place order. Please try again or contact us directly.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (checkoutPhase === 'success' && placedOrder) {
    return <OrderSuccessView placedOrder={placedOrder} copied={copied} onCopy={handleCopyOrderId} />;
  }

  if (cartItems.length === 0) {
    return <EmptyCartView />;
  }

  const shippingFeeText = getShippingFeeText(shippingMethod);

  return (
    <main className="flex-grow pt-4 sm:pt-6 md:pt-8 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      {/* Standard Unified Back Button */}
      <div className="mb-3 sm:mb-4">
        {checkoutPhase === 'cart' ? (
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} /> Back to Shop
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCheckoutPhase('cart');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} /> Back to Cart
          </button>
        )}
      </div>

      <header className="mb-stack-lg border-b border-outline-variant pb-stack-sm">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            {checkoutPhase === 'cart' ? 'Review Order' : 'Checkout Details'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            {checkoutPhase === 'cart' 
              ? 'Verify specifications before proceeding.' 
              : 'Complete your details to confirm your order.'}
          </p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column (Cart Items OR Checkout Form) */}
        <div className="lg:col-span-8 flex flex-col gap-stack-md">
          <AnimatePresence mode="wait">
            {checkoutPhase === 'cart' && (
              <CartItemsList
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            )}

            {checkoutPhase === 'checkout' && (
              <CheckoutForm
                cartItems={cartItems}
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                handlePhoneChange={handlePhoneChange}
                isPhoneValid={isPhoneValid}
                email={email}
                setEmail={setEmail}
                address={address}
                setAddress={setAddress}
                isB2B={isB2B}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                handleCheckout={handleCheckout}
                rememberDetails={rememberDetails}
                setRememberDetails={setRememberDetails}
                onClearDetails={handleClearDetails}
                hasAutoFilled={hasAutoFilled}
                hasPaperAndCanvas={hasPaperAndCanvas}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Column (Order Summary) */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <OrderSummary
            cartItems={cartItems}
            cartTotal={cartTotal}
            shippingMethod={shippingMethod}
            shippingFeeText={shippingFeeText}
            checkoutPhase={checkoutPhase}
            setCheckoutPhase={setCheckoutPhase}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </div>
    </main>
  );
};

export default Cart;
