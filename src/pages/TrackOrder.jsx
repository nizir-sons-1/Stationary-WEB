import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, ArrowRight, CheckCircle2, Clock, Truck, XCircle, ArrowLeft, MapPin, Copy, Check, PackageCheck, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePageSeo } from '../lib/seo';
import { isColorVariation, isMeaninglessVariation } from '../lib/variations';
import { isValidPakistaniPhone, normalizePakistaniPhone } from '../lib/phone';

const STATUS_MAP = {
  pending: { label: 'Order Received', step: 1, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  processing: { label: 'Processing', step: 2, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  shipped: { label: 'Dispatched / In Transit', step: 3, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  delivered: { label: 'Delivered', step: 4, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  completed: { label: 'Completed', step: 4, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', step: 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const STEP_PROGRESS_WIDTH = {
  1: '15%',
  2: '50%',
  3: '80%',
  4: '100%',
};

const ORDER_SELECT_FIELDS = 'id, status, created_at, total_amount, total_price, customer_name, customer_phone, customer_email, customer_address, payment_method, shipping_method, items';

const isSafeEmail = (str) => typeof str === 'string' && str.length <= 100 && /^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,10}$/.test(str);

// Helper: Check client-side rate limit (max 10 attempts / hour per session)
function checkClientRateLimit() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  try {
    const raw = localStorage.getItem('paperWeb_tracking_attempts');
    const stored = raw ? JSON.parse(raw) : [];
    const valid = stored.filter((t) => now - t < oneHour);

    if (valid.length >= 10) {
      return false;
    }

    valid.push(now);
    localStorage.setItem('paperWeb_tracking_attempts', JSON.stringify(valid));
    return true;
  } catch {
    return true;
  }
}

// Fallback direct query if serverless API is offline (Strict Exact Match Only)
async function fetchOrderRecordDirect(clean) {
  if (/^[0-9a-f]{8}$/i.test(clean)) {
    const hex = clean.toLowerCase();
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .gte('id', `${hex}-0000-0000-0000-000000000000`)
      .lte('id', `${hex}-ffff-ffff-ffff-ffffffffffff`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .eq('id', clean.toLowerCase())
      .maybeSingle();
    return data;
  }

  if (isValidPakistaniPhone(clean)) {
    const exactPhone = normalizePakistaniPhone(clean);
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .or(`customer_phone.eq.${exactPhone},whatsapp_number.eq.${exactPhone}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }

  if (isSafeEmail(clean)) {
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .eq('customer_email', clean.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }

  return null;
}

function validateTrackingInput(clean) {
  const digitsOnly = clean.replace(/\D/g, '');
  const isNumberInput = digitsOnly.length > 0 && /^\+?[\d\s-]+$/.test(clean);

  if (isNumberInput) {
    if (!isValidPakistaniPhone(clean)) {
      return 'Kripya mukammal 11 digits Pakistani mobile number enter karein jo 03 se shuru ho (e.g. 0300 1234567).';
    }
    return null;
  }

  const isHex8 = /^[0-9a-f]{8}$/i.test(clean);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
  const isEmail = isSafeEmail(clean);

  if (!isHex8 && !isUuid && !isEmail && clean.length < 5) {
    return 'Please enter a valid 8-character Order ID (e.g. 6B7BD55B) or your 11-digit phone number.';
  }

  return null;
}

async function executeTrackingLookup(clean) {
  const res = await fetch('/api/track-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: clean }),
  });

  if (res.status === 429) {
    throw new Error('Rate limit reached (max 10 attempts/hour). Please try again after some time.');
  }

  if (res.ok) {
    const json = await res.json();
    return json.order;
  }

  return await fetchOrderRecordDirect(clean);
}

const TrackOrder = () => {
  usePageSeo('/track-order');
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [trackingId, setTrackingId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownSec, setCooldownSec] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSec((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSec]);

  const searchOrder = async (idToSearch) => {
    let clean = (idToSearch || '').trim();
    if (clean.startsWith('#')) clean = clean.slice(1).trim();
    if (!clean || cooldownSec > 0) return;

    setErrorMessage('');
    setNotFound(false);

    const validationError = validateTrackingInput(clean);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!checkClientRateLimit()) {
      setErrorMessage('Too many tracking attempts (max 10/hour). Please wait before trying again.');
      return;
    }

    setIsSearching(true);
    setResult(null);
    setCooldownSec(3);

    try {
      const matchedOrder = await executeTrackingLookup(clean);
      if (matchedOrder) {
        setResult(matchedOrder);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.warn('Tracking query error:', err);
      setErrorMessage(err.message || 'Failed to look up order.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      void searchOrder(initialId);
    }
  }, [initialId]);

  const handleTrack = async (e) => {
    e.preventDefault();
    await searchOrder(trackingId);
  };

  const statusInfo = result ? (STATUS_MAP[result.status] || STATUS_MAP.pending) : null;
  const StatusIcon = statusInfo?.icon || Clock;
  const currentStep = statusInfo?.step || 1;
  const progressWidth = STEP_PROGRESS_WIDTH[currentStep] || '15%';

  const totalAmount = Number(result?.total_price || result?.total_amount || 0);

  const renderButtonContent = () => {
    if (isSearching) {
      return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
    }
    if (cooldownSec > 0) {
      return <span>Wait ({cooldownSec}s)</span>;
    }
    return (
      <span className="inline-flex items-center gap-1.5">
        Track <ArrowRight size={15} />
      </span>
    );
  };

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 max-w-2xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Live Tracking</p>
        </div>
        <h1 className="font-headline-xl text-[34px] sm:text-[44px] md:text-[52px] text-secondary font-black tracking-tight leading-none mb-3">
          Track Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">
            Order
          </span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500 max-w-md mx-auto">
          Enter your 8-digit Order ID or your 11-digit phone number to check live processing and delivery details.
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
                placeholder="Enter Order ID (e.g. 6B7BD55B) or 11-digit Phone (03001234567)" 
                className="w-full bg-[#fbfaf8] border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[#112338] font-medium text-sm"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching || cooldownSec > 0}
              className={`bg-[#111111] text-white px-7 py-3.5 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                isSearching || cooldownSec > 0
                  ? 'opacity-70 cursor-not-allowed bg-gray-400'
                  : 'hover:bg-primary hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {renderButtonContent()}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-3.5 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#e5e1d7] shadow-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-[#fbfaf8] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Order ID</span>
                <span className="font-mono text-xs text-gray-500">#{result.id.slice(0, 8).toUpperCase()}</span>
                <button 
                  onClick={() => {
                    if (navigator.clipboard?.writeText) {
                      void navigator.clipboard.writeText(result.id.slice(0, 8).toUpperCase()).catch(() => {});
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-gray-400 hover:text-[#112338] transition-colors p-1"
                  title="Copy Order ID"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#112338] mt-1">
                {result.customer_name}
              </h2>
            </div>
            
            <div className={`px-4 py-2 rounded-full border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-xs`}>
              <StatusIcon size={16} />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Progress Bar & Tracker */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="relative mb-8 mt-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                  style={{ width: progressWidth }}
                />
              </div>

              <div className="flex justify-between mt-3 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <span className={currentStep >= 1 ? 'text-primary font-black' : ''}>1. Received</span>
                <span className={currentStep >= 2 ? 'text-primary font-black' : ''}>2. Processing</span>
                <span className={currentStep >= 3 ? 'text-primary font-black' : ''}>3. Shipped</span>
                <span className={currentStep >= 4 ? 'text-primary font-black' : ''}>4. Delivered</span>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Date</span>
                <span className="text-sm font-semibold text-[#112338]">
                  {new Date(result.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Payment</span>
                <span className="text-sm font-semibold text-[#112338]">
                  {result.payment_method || 'Cash on Delivery'}
                </span>
              </div>

              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Shipping</span>
                <span className="text-sm font-semibold text-[#112338]">
                  {result.shipping_method || 'Standard'}
                </span>
              </div>

              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Total</span>
                <span className="text-sm font-black text-primary">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Items Details */}
          <div className="p-6 sm:p-8 space-y-6">
            {result.customer_address && (
              <div className="flex items-start gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-100/80">
                <MapPin className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">Shipping Address</span>
                  <p className="text-sm text-gray-700 font-medium whitespace-pre-line">{result.customer_address}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-2">
                <PackageCheck size={16} /> Ordered Items ({Array.isArray(result.items) ? result.items.length : 0})
              </h3>
              
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {Array.isArray(result.items) && result.items.map((item, idx) => {
                  const hasColor = isColorVariation(item.size);
                  const showSpec = !hasColor && !isMeaninglessVariation(item.size);
                  const itemKey = item.id ? `${item.id}-${idx}` : `${item.name}-${item.size || ''}-${idx}`;

                  return (
                    <div key={itemKey} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#112338] line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium">
                            {showSpec ? item.size : ''} {item.gsm ? `• ${item.gsm}g` : ''} {item.packingType ? `• ${item.packingType}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-[#112338]">
                          Rs {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Not Found View */}
      {notFound && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[24px] sm:rounded-[28px] border border-[#e5e1d7] shadow-sm text-center max-w-lg mx-auto"
        >
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto mb-4">
            <XCircle size={28} />
          </div>
          <h3 className="text-lg font-black text-[#112338] mb-1">No Matching Order Found</h3>
          <p className="text-sm text-gray-500 mb-6">
            We could not find an order matching <span className="font-semibold text-gray-700">"{trackingId}"</span>. Please check your 8-digit Order ID or 11-digit phone number and try again.
          </p>
          <button
            onClick={() => {
              setTrackingId('');
              setNotFound(false);
            }}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline cursor-pointer"
          >
            Clear and Try Again
          </button>
        </motion.div>
      )}
    </main>
  );
};

export default TrackOrder;
