import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useStoreSettings } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { usePageSeo } from '../lib/seo';
import { isValidPakistaniPhone } from '../lib/phone';
import {
  loadSavedCustomer,
  saveCustomerInfo,
  clearSavedCustomer,
} from '../lib/customerStorage';
import {
  isPaperAndCanvasItem,
  isB2BCart,
  validateCheckoutInput,
  generateFallbackOrderId,
  getShippingFeeText,
  buildOrderPayload,
  sendOrderNotifications,
} from '../lib/orderCheckout';
import EmptyCartView from '../components/cart/EmptyCartView';
import OrderSuccessView from '../components/cart/OrderSuccessView';
import CartItemsList from '../components/cart/CartItemsList';
import CheckoutForm from '../components/cart/CheckoutForm';
import OrderSummary from '../components/cart/OrderSummary';

function getOrCreateIdempotencyKey() {
  let key = localStorage.getItem('paperWeb_order_idempotency');
  if (!key) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      key = `ord_${crypto.randomUUID()}`;
    } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      key = `ord_${arr[0].toString(36)}_${arr[1].toString(36)}`;
    } else {
      key = `ord_${Date.now().toString(36)}`;
    }
    localStorage.setItem('paperWeb_order_idempotency', key);
  }
  return key;
}

async function placeOrderViaApi(payloadBody, idempotencyKey, fallbackPayload) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(payloadBody),
    });

    if (res.ok) {
      const data = await res.json();
      return { order: data.order, finalTotal: data.finalTotal };
    }
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Server error placing order');
  } catch (apiErr) {
    console.warn('[checkout] API endpoint unavailable, fallback to direct Supabase insert:', apiErr.message);
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert(fallbackPayload)
      .select()
      .single();

    if (insertError) throw insertError;
    return { order: insertedOrder, finalTotal: fallbackPayload.total_amount };
  }
}

const Cart = () => {
  usePageSeo('/cart');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isCheckoutRequested =
    searchParams.get('phase') === 'checkout' ||
    searchParams.get('checkout') === 'true' ||
    location.state?.phase === 'checkout';

  const checkoutAutoTriggered = useRef(false);

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

  useEffect(() => {
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
  useEffect(() => {
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

  // If cart does not have Paper & Canvas, ensure Adda shipping is reset to standard delivery
  useEffect(() => {
    if (!hasPaperAndCanvas && (shippingMethod === 'delivery_bundle' || shippingMethod === 'delivery_open')) {
      setShippingMethod('standard_delivery');
    }
  }, [hasPaperAndCanvas, shippingMethod]);

  // Scroll to top immediately when checkout phase transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [checkoutPhase]);

  const handleCopyOrderId = () => {
    if (placedOrder?.id && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(placedOrder.id).catch(() => { });
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

    const hasUnpricedItem = cartItems.some(i => !i.isBulk && Number(i.price || 0) <= 0);
    if (hasUnpricedItem) {
      alert('Your cart contains items without a confirmed price. Please remove them or contact us on WhatsApp for rate finalization.');
      return;
    }

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
      const orderConfig = buildOrderPayload({
        cartItems, fullName, phone, email, address, shippingMethod, paymentMethod, isB2B, cartTotal, settings
      });

      const idempotencyKey = getOrCreateIdempotencyKey();
      const payloadBody = {
        cartItems, fullName, phone, email, address, shippingMethod, paymentMethod, isB2B, idempotencyKey
      };

      const { order: insertedOrder, finalTotal: confirmedTotal } = await placeOrderViaApi(
        payloadBody, idempotencyKey, orderConfig.orderPayload
      );

      localStorage.removeItem('paperWeb_order_idempotency');
      const orderId = insertedOrder?.id?.slice(0, 8).toUpperCase() || generateFallbackOrderId();

      sendOrderNotifications({
        orderId, fullName, phone: orderConfig.cleanPhone, email, address,
        shipLabel: orderConfig.shipLabel, payLabel: orderConfig.payLabel,
        finalTotal: confirmedTotal, cartItems
      });

      setPlacedOrder({
        id: orderId, customerName: fullName, phone: orderConfig.cleanPhone,
        email: email, address: orderConfig.formattedAddress, rawAddress: address,
        shipping: orderConfig.shipLabel, payment: orderConfig.payLabel,
        total: confirmedTotal, orderType: orderConfig.calculatedOrderType,
        hasBulk: orderConfig.hasBulk, bulkNotes: orderConfig.bulkNotesText,
        items: [...cartItems]
      });

      if (rememberDetails) {
        saveCustomerInfo({ fullName, phone: orderConfig.cleanPhone, email: email || '', address: address || '' });
      }

      clearCart();
      setCheckoutPhase('success');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert(err.message || 'Failed to place order. Please try again or contact us directly.');
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

  const shippingFeeText = getShippingFeeText(shippingMethod, settings, cartTotal);

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
                settings={settings}
                cartTotal={cartTotal}
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
            settings={settings}
          />
        </div>
      </div>
    </main>
  );
};

export default Cart;
