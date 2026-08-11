import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, MessageCircle, ArrowLeft, Truck, PackageCheck, CreditCard, Building2, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
// No supabase import here on purpose: checkout hands off to WhatsApp and never
// touches the database, so importing the client only forced the ~55 kB supabase
// chunk to download whenever someone opened their cart.
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Checkout States
  const [checkoutPhase, setCheckoutPhase] = useState('cart'); // 'cart' | 'checkout'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('self_pickup'); // 'self_pickup' | 'delivery_open' | 'delivery_bundle' | 'standard_delivery'
  const [paymentMethod, setPaymentMethod] = useState('shop'); // 'shop' | 'bank' | 'cod' | 'online'

  // Determine if it's a B2B (Paper) or B2C (Stationery/Arts/Misc) checkout
  // It is ONLY B2B if EVERY item in the cart is explicitly a Paper category.
  const isB2B = cartItems.every(item => {
    const cat = (item.category || '').toLowerCase();
    const dept = (item.department || '').toLowerCase();
    
    const isPaperCategory = [
      'bleach card', 'art card', 'art paper', 'matte paper', 'copy paper', 
      'offset paper', 'ivory card', 'color card', 'carbonless', 'stickers', 
      'local paper', 'boxboard', 'news', 'butter paper', 'kraft card', 'book paper'
    ].some(c => cat.includes(c));

    const isPaperDept = dept === 'paper & canvas' && isPaperCategory; // Strict check

    return isPaperCategory || isPaperDept;
  });

  // Force default methods if switching types
  React.useEffect(() => {
    if (isB2B) {
      if (shippingMethod === 'standard_delivery') setShippingMethod('self_pickup');
      if (paymentMethod === 'cod' || paymentMethod === 'online') setPaymentMethod('shop');
    } else {
      if (shippingMethod !== 'standard_delivery') setShippingMethod('standard_delivery');
      if (paymentMethod === 'shop') setPaymentMethod('cod');
    }
  }, [isB2B]);

  const handleCheckout = async (e) => {
    e?.preventDefault();
    if (cartItems.length === 0) return;
    if (checkoutPhase === 'checkout' && (!fullName || !phone || (!isB2B && !address))) {
      alert("Please fill in all required details.");
      return;
    }
    
    setIsCheckingOut(true);
    try {
      // Generate a simple Order ID since we are bypassing DB insertion for now
      const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      // 3. WhatsApp Redirect
      let message = `*New Order Request (ID: ${orderId})*\n\n`;
      
      message += `*Customer Details:*\n`;
      message += `Name: ${fullName}\n`;
      message += `Phone: ${phone}\n`;
      if (email) message += `Email: ${email}\n`;
      if (address) message += `Address: ${address}\n`;
      
      const shipMap = {
        'self_pickup': 'Self Pickup (FREE)',
        'delivery_open': 'Delivery - Open (Min Rs 350)',
        'delivery_bundle': 'Delivery - Bundle (Only for Adda)',
        'standard_delivery': 'Standard Delivery (Rs 200)'
      };
      const payMap = {
        'shop': 'Pay at Shop (Pay when collecting)',
        'bank': 'Bank Transfer',
        'cod': 'Cash on Delivery (COD)',
        'online': 'Online Transfer'
      };
      
      message += `Shipping: ${shipMap[shippingMethod]}\n`;
      message += `Payment: ${payMap[paymentMethod]}\n\n`;

      message += `*Order Items:*\n`;
      cartItems.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Size: ${item.size} | GSM: ${item.gsm}g\n`;
        message += `   Qty: ${item.quantity} ${item.packingType}\n`;
        if (item.isBulk) {
          message += `   [Bulk Request]\n`;
          if (item.bulkDetails) message += `   Note: ${item.bulkDetails}\n`;
        }
        if (item.isInstallment) {
          message += `   [Installment Plan: ${item.installmentPlan}]\n`;
          message += `   *Requires T&C confirmation and physical bank cheque*\n`;
        }
        message += `   Price: Rs. ${(item.price * item.quantity).toLocaleString()}\n\n`;
      });
      
      let finalTotal = cartTotal;
      if (shippingMethod === 'standard_delivery') finalTotal += 200;
      
      message += `*Total Order Value: Rs. ${finalTotal.toLocaleString()}*\n`;
      message += `\nPlease confirm my order.`;
      
      const whatsappUrl = `https://wa.me/923202220001?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      clearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to place order. Please try again or contact us directly.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
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

  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <header className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex justify-between items-end">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            {checkoutPhase === 'cart' ? 'Review Order' : 'Checkout Details'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            {checkoutPhase === 'cart' 
              ? 'Verify specifications before proceeding.' 
              : 'Complete your details to request a final quote on WhatsApp.'}
          </p>
        </div>
        {checkoutPhase === 'checkout' && (
          <button onClick={() => setCheckoutPhase('cart')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Cart
          </button>
        )}
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Left Column (Cart Items OR Checkout Form) */}
        <div className="lg:col-span-8 flex flex-col gap-stack-md">
          <AnimatePresence mode="wait">
            
            {checkoutPhase === 'cart' && (
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
                
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="bg-surface border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                    <div className="md:col-span-6 flex gap-4 items-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-2">
                        <img className="w-full h-full object-cover rounded-lg mix-blend-multiply" src={item.image} alt={item.name} />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-orange-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-primary border border-orange-100 rounded-md">{item.gsm}g</span>
                          <span className="bg-gray-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-gray-500 border border-gray-200 rounded-md">{item.size}</span>
                          {item.isBulk && <span className="bg-blue-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-blue-600 border border-blue-100 rounded-md uppercase tracking-widest">Bulk Req</span>}
                          {item.isInstallment && <span className="bg-indigo-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-indigo-600 border border-indigo-100 rounded-md uppercase tracking-widest">Installment: {item.installmentPlan}</span>}
                        </div>
                        {item.bulkDetails && <p className="text-xs text-gray-400 mt-2 italic line-clamp-1">Note: {item.bulkDetails}</p>}
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 flex justify-start md:justify-center items-center">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.isBulk, item.quantity - 1, item.isInstallment, item.installmentPlan)} className="px-3 py-2 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors"><Minus size={14} /></button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.isBulk, item.quantity + 1, item.isInstallment, item.installmentPlan)} className="px-3 py-2 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-colors"><Plus size={14} /></button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 text-left md:text-right flex flex-col justify-center">
                      <span className="text-lg md:text-xl font-black text-primary">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-gray-400">Rs. {item.price.toLocaleString()} / {item.packingType}</span>
                    </div>
                    
                    <div className="md:col-span-12 flex justify-end md:-mt-8">
                      <button onClick={() => removeFromCart(item.id, item.isBulk, item.isInstallment, item.installmentPlan)} className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {checkoutPhase === 'checkout' && (
              <motion.form 
                id="checkout-form"
                onSubmit={handleCheckout}
                key="checkout-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-10"
              >
                {/* Personal Details */}
                <div className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Customer Information</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Full Name *</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your phone number" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Email Address (Optional)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white" />
                  </div>
                  
                  {!isB2B && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700">Delivery Address *</label>
                      <textarea required value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full shipping address" rows="3" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white resize-none" />
                    </div>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Shipping Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {isB2B ? (
                      <>
                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${shippingMethod === 'self_pickup' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="shipping" value="self_pickup" checked={shippingMethod === 'self_pickup'} onChange={() => setShippingMethod('self_pickup')} className="sr-only" />
                          <Building2 className={shippingMethod === 'self_pickup' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${shippingMethod === 'self_pickup' ? 'text-[#25D366]' : 'text-gray-700'}`}>Self Pickup</div>
                            <div className={`text-xs mt-0.5 ${shippingMethod === 'self_pickup' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>FREE</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${shippingMethod === 'delivery_open' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="shipping" value="delivery_open" checked={shippingMethod === 'delivery_open'} onChange={() => setShippingMethod('delivery_open')} className="sr-only" />
                          <Truck className={shippingMethod === 'delivery_open' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${shippingMethod === 'delivery_open' ? 'text-[#25D366]' : 'text-gray-700'}`}>Delivery - Open</div>
                            <div className={`text-xs mt-0.5 ${shippingMethod === 'delivery_open' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Min Rs 350</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${shippingMethod === 'delivery_bundle' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="shipping" value="delivery_bundle" checked={shippingMethod === 'delivery_bundle'} onChange={() => setShippingMethod('delivery_bundle')} className="sr-only" />
                          <PackageCheck className={shippingMethod === 'delivery_bundle' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${shippingMethod === 'delivery_bundle' ? 'text-[#25D366]' : 'text-gray-700'}`}>Delivery - Bundle</div>
                            <div className={`text-xs mt-0.5 ${shippingMethod === 'delivery_bundle' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Only for Adda</div>
                          </div>
                        </label>
                      </>
                    ) : (
                      <label className={`md:col-span-3 cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${shippingMethod === 'standard_delivery' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input type="radio" name="shipping" value="standard_delivery" checked={shippingMethod === 'standard_delivery'} onChange={() => setShippingMethod('standard_delivery')} className="sr-only" />
                        <Truck className={shippingMethod === 'standard_delivery' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                        <div>
                          <div className={`font-bold text-sm ${shippingMethod === 'standard_delivery' ? 'text-[#25D366]' : 'text-gray-700'}`}>Standard Delivery</div>
                          <div className={`text-xs mt-0.5 ${shippingMethod === 'standard_delivery' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Rs 200 Flat Rate</div>
                        </div>
                      </label>
                    )}

                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg text-secondary border-b border-gray-100 pb-2">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {isB2B ? (
                      <>
                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${paymentMethod === 'shop' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="payment" value="shop" checked={paymentMethod === 'shop'} onChange={() => setPaymentMethod('shop')} className="sr-only" />
                          <MapPin className={paymentMethod === 'shop' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${paymentMethod === 'shop' ? 'text-[#25D366]' : 'text-gray-700'}`}>Pay at Shop</div>
                            <div className={`text-xs mt-0.5 ${paymentMethod === 'shop' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Pay when collecting</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${paymentMethod === 'bank' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="sr-only" />
                          <CreditCard className={paymentMethod === 'bank' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${paymentMethod === 'bank' ? 'text-[#25D366]' : 'text-gray-700'}`}>Bank Transfer</div>
                            <div className={`text-xs mt-0.5 ${paymentMethod === 'bank' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Details via WhatsApp</div>
                          </div>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${paymentMethod === 'cod' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                          <MapPin className={paymentMethod === 'cod' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${paymentMethod === 'cod' ? 'text-[#25D366]' : 'text-gray-700'}`}>Cash on Delivery (COD)</div>
                            <div className={`text-xs mt-0.5 ${paymentMethod === 'cod' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Pay at your doorstep</div>
                          </div>
                        </label>

                        <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center gap-2 transition-all ${paymentMethod === 'online' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="sr-only" />
                          <CreditCard className={paymentMethod === 'online' ? 'text-[#25D366]' : 'text-gray-400'} size={24} />
                          <div>
                            <div className={`font-bold text-sm ${paymentMethod === 'online' ? 'text-[#25D366]' : 'text-gray-700'}`}>Online Payment</div>
                            <div className={`text-xs mt-0.5 ${paymentMethod === 'online' ? 'text-[#25D366]/80' : 'text-gray-500'}`}>Bank / EasyPaisa / JazzCash</div>
                          </div>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
        
        {/* Right Column (Order Summary) */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-gray-50/50 border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 lg:p-8 rounded-[32px] sticky top-32 transition-all duration-300">
            <h2 className="font-headline-md text-xl font-bold text-secondary border-b border-gray-200 pb-4 mb-6">Order Summary</h2>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">Subtotal ({cartItems.length} items)</span>
              <span className="text-sm font-bold text-secondary">Rs. {cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">Shipping</span>
              <span className="text-sm font-bold text-primary">
                {shippingMethod === 'self_pickup' ? 'FREE' : shippingMethod === 'standard_delivery' ? 'Rs 200' : 'TBD'}
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
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex flex-col text-sm">
                      <span className="text-gray-700 font-medium">{item.name} ({item.size}, {item.gsm}g)</span>
                      <span className="text-[11px] text-gray-500">{item.quantity} × Rs. {(item.price * item.quantity).toLocaleString()} (Rs. {item.price.toLocaleString()}/{item.packingType})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {checkoutPhase === 'cart' ? (
              <button onClick={() => setCheckoutPhase('checkout')} className="w-full text-white bg-[#111111] hover:bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 py-5 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button type="submit" form="checkout-form" disabled={isCheckingOut} className={`w-full text-white py-5 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-1'}`}>
                  <MessageCircle size={20} /> {isCheckingOut ? 'Processing...' : 'Place Order via WhatsApp'}
                </button>
                <button onClick={() => setCheckoutPhase('cart')} className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors">
                  Cancel Checkout
                </button>
              </div>
            )}
            
            <p className="text-[11px] font-medium text-gray-400 mt-6 text-center px-4 leading-relaxed">
              Paper market prices fluctuate. This is an estimated quote. Final rates and delivery charges will be confirmed on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
