import React from 'react';
import { Minus, Plus, Trash2, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // 1. Save Order to Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: cartTotal,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Save Order Items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: item.price,
        size: item.size,
        gsm: item.gsm,
        packing_type: item.packingType,
        is_bulk: item.isBulk || false,
        bulk_notes: item.bulkDetails || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. WhatsApp Redirect
      let message = `*New Order Request (ID: ${orderData.id.split('-')[0]})*\n\n`;
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
        message += `   Est. Price: Rs. ${(item.price * item.quantity).toLocaleString()}\n\n`;
      });
      message += `*Estimated Total: Rs. ${cartTotal.toLocaleString()}*\n`;
      message += `\nPlease confirm availability and final pricing.`;
      
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
      <main className="flex-grow pt-16 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto flex flex-col items-center justify-center min-h-[60vh]">
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
    <main className="flex-grow pt-8 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      <header className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex justify-between items-end">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Review Order</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Verify specifications before requesting a final quote on WhatsApp.</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Cart Table Area */}
        <div className="lg:col-span-8 flex flex-col gap-stack-md">
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
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50/50 border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 lg:p-8 rounded-[32px] sticky top-24 transition-all duration-300">
            <h2 className="font-headline-md text-xl font-bold text-secondary border-b border-gray-200 pb-4 mb-6">Order Summary</h2>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-bold text-gray-500">Subtotal</span>
              <span className="text-base font-bold text-secondary">Rs. {cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 pb-6 mb-6">
              <span className="text-sm font-bold text-gray-500">Delivery</span>
              <span className="text-sm font-bold text-primary">TBD on WhatsApp</span>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Est. Total</span>
              <span className="text-3xl font-black text-secondary leading-none">Rs. {cartTotal.toLocaleString()}</span>
            </div>
            
            <button onClick={handleCheckout} disabled={isCheckingOut} className={`w-full text-white py-5 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-1'}`}>
              <MessageCircle size={20} /> {isCheckingOut ? 'Processing...' : 'Checkout via WhatsApp'}
            </button>
            
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
