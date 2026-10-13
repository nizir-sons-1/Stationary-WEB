import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, ArrowRight, CheckCircle2, Clock, Truck, XCircle, ArrowLeft, MapPin, Copy, Check, ShoppingBag } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePageSeo } from '../lib/seo';

const STATUS_MAP = {
  pending: { label: 'Order Received', step: 1, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  processing: { label: 'Processing', step: 2, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  shipped: { label: 'Dispatched / In Transit', step: 3, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  delivered: { label: 'Delivered', step: 4, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  completed: { label: 'Completed', step: 4, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', step: 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const TrackOrder = () => {
  usePageSeo('/track-order');
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [trackingId, setTrackingId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchOrder = async (idToSearch) => {
    let clean = (idToSearch || '').trim();
    if (clean.startsWith('#')) clean = clean.slice(1).trim();
    if (!clean) return;

    setIsSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      let matchedOrder = null;

      // Strategy 1: Hex 8-character prefix match (e.g., 6B7BD55B)
      if (/^[0-9a-f]{8}$/i.test(clean)) {
        const hex = clean.toLowerCase();
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items')
          .gte('id', `${hex}-0000-0000-0000-000000000000`)
          .lte('id', `${hex}-ffff-ffff-ffff-ffffffffffff`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          matchedOrder = data;
        }
      }

      // Strategy 2: Full UUID match
      if (!matchedOrder && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items')
          .eq('id', clean.toLowerCase())
          .maybeSingle();

        if (!error && data) {
          matchedOrder = data;
        }
      }

      // Strategy 3: Phone number match (digits only)
      if (!matchedOrder) {
        const digits = clean.replace(/[^0-9]/g, '');
        if (digits.length >= 7) {
          const { data, error } = await supabase
            .from('orders')
            .select('id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items')
            .or(`customer_phone.ilike.%${digits}%,whatsapp_number.ilike.%${digits}%`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            matchedOrder = data;
          }
        }
      }

      // Strategy 4: Fallback partial name or email
      if (!matchedOrder && clean.length >= 3 && !/^[0-9a-f]{8}$/i.test(clean)) {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items')
          .or(`customer_name.ilike.%${clean}%,customer_email.ilike.%${clean}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          matchedOrder = data;
        }
      }

      if (matchedOrder) {
        setResult(matchedOrder);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Track order error:', err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (initialId) {
      searchOrder(initialId);
    }
  }, [initialId]);

  const handleTrack = async (e) => {
    e.preventDefault();
    await searchOrder(trackingId);
  };

  const statusInfo = result ? (STATUS_MAP[result.status] || STATUS_MAP.pending) : null;
  const StatusIcon = statusInfo?.icon || Clock;
  const currentStep = statusInfo?.step || 1;

  const totalAmount = Number(result?.total_price || result?.total_amount || 0);

  return (
    <main className="flex-grow pt-4 sm:pt-6 md:pt-8 pb-stack-lg px-margin-mobile md:px-gutter max-w-4xl w-full mx-auto">
      
      {/* Standard Unified Back Button */}
      <div className="mb-4 sm:mb-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Shop
        </Link>
      </div>

      {/* Page Heading */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-sm border border-orange-100">
          <Package size={28} className="text-primary" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#112338] font-normal tracking-tight mb-2">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Enter your 8-digit Order ID or your phone number to check live processing and delivery details.
        </p>
      </motion.div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-[20px] sm:rounded-[28px] border border-[#e5e1d7] shadow-sm mb-6">
        <form onSubmit={handleTrack} className="w-full">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Order ID (e.g. 6B7BD55B) or Phone (e.g. 0329...)" 
                className="w-full bg-[#fbfaf8] border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[#112338] font-medium text-sm"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className={`bg-[#111111] text-white px-7 py-3.5 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${isSearching ? 'opacity-70 cursor-wait' : 'hover:bg-primary hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer'}`}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Track <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#e5e1d7] shadow-md overflow-hidden"
        >
          {/* Header Status Bar */}
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-[#fbfaf8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Order Reference</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg sm:text-xl font-bold text-[#112338]">
                  #{result.id.slice(0, 8).toUpperCase()}
                </span>
                <button 
                  onClick={() => {
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(result.id.slice(0, 8).toUpperCase()).catch(() => {});
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {new Date(result.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(result.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} shrink-0`}>
              <StatusIcon size={16} />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          {result.status !== 'cancelled' && (
            <div className="p-5 sm:p-7 border-b border-gray-100 bg-white">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block mb-4">
                Fulfillment Progress
              </span>
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Connecting Bar */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-500" 
                    style={{ width: currentStep === 1 ? '15%' : currentStep === 2 ? '50%' : currentStep === 3 ? '80%' : '100%' }}
                  />
                </div>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                    ✓
                  </div>
                  <span className="text-[10.5px] sm:text-xs font-semibold text-[#112338] mt-2">Received</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                    {currentStep >= 2 ? '✓' : '2'}
                  </div>
                  <span className="text-[10.5px] sm:text-xs font-semibold text-[#112338] mt-2">Processing</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                    {currentStep >= 3 ? '✓' : '3'}
                  </div>
                  <span className="text-[10.5px] sm:text-xs font-semibold text-[#112338] mt-2">Dispatched</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 4 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                    {currentStep >= 4 ? '✓' : '4'}
                  </div>
                  <span className="text-[10.5px] sm:text-xs font-semibold text-[#112338] mt-2">Delivered</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Shipping Summary */}
          <div className="p-5 sm:p-7 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Customer Details</span>
              <p className="text-sm font-bold text-[#112338] mt-0.5">{result.customer_name || 'Valued Customer'}</p>
              {result.customer_phone && <p className="text-xs text-gray-600 mt-0.5">{result.customer_phone}</p>}
              {result.customer_email && <p className="text-xs text-gray-400 mt-0.5">{result.customer_email}</p>}
            </div>

            <div>
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Method</span>
              <p className="text-sm font-bold text-[#112338] mt-0.5">{result.shipping_method || 'Standard Delivery'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Payment: {result.payment_method || 'Cash on Delivery'}</p>
            </div>

            {result.customer_address && (
              <div className="sm:col-span-2 md:col-span-1">
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Destination</span>
                <p className="text-xs sm:text-sm text-gray-700 mt-0.5 flex items-start gap-1">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>{result.customer_address}</span>
                </p>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div className="p-5 sm:p-7">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-1.5">
              <ShoppingBag size={14} /> Items in Order ({Array.isArray(result.items) ? result.items.length : 0})
            </h3>
            
            <div className="divide-y divide-gray-100 border border-[#e5e1d7] rounded-xl overflow-hidden bg-white mb-6">
              {Array.isArray(result.items) && result.items.map((item, idx) => (
                <div key={`${item.name || 'item'}-${idx}`} className="p-3.5 sm:p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#112338] truncate">{item.name}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.gsm && <span>• {item.gsm}g</span>}
                      <span>• Qty: {item.quantity} {item.packingType || ''}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-[#112338]">
                      Rs. {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                    {item.price && (
                      <p className="text-[10.5px] text-gray-400">
                        Rs. {Number(item.price).toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="bg-[#fbfaf8] border border-[#e5e1d7] rounded-xl p-4 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-600">Total Order Amount</span>
              <span className="text-xl sm:text-2xl font-black text-primary">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Need Assistance Bar */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Need assistance with this order? Call Nazir &amp; Sons at <a href="tel:+923202220001" className="font-semibold text-secondary hover:underline">+92 320 2220001</a> or visit our store in Lahore.
            </p>
          </div>
        </motion.div>
      )}

      {/* Not Found View */}
      {notFound && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-200 text-center shadow-sm"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Search size={22} />
          </div>
          <h3 className="font-bold text-lg text-secondary mb-1">No Order Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
            We couldn't find an order matching <strong className="text-secondary font-mono">"{trackingId}"</strong>. Please verify that you entered the 8-character Order ID (like 6B7BD55B) or the phone number used during checkout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              type="button" 
              onClick={() => { setTrackingId(''); setNotFound(false); }}
              className="text-xs font-bold text-secondary bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Try Another Number
            </button>
            <Link 
              to="/shop"
              className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      )}

    </main>
  );
};

export default TrackOrder;
