import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, ArrowRight, CheckCircle2, MessageCircle, Clock, Truck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STATUS_MAP = {
  pending: { label: 'Order Received', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
};

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      const needle = trackingId.trim();

      // Try matching by: order ID prefix (first 8 chars uppercase), phone number, or full UUID
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, created_at, total_amount, customer_name, items, shipping_method')
        .or(`customer_phone.ilike.%${needle}%,id.ilike.%${needle}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setResult(data);
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

  const statusInfo = result ? (STATUS_MAP[result.status] || STATUS_MAP.pending) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl text-center mb-10"
      >
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
          <Package size={32} className="text-primary" />
        </div>
        <h1 className="font-headline-xl text-[32px] md:text-[48px] text-secondary font-black tracking-tight mb-4">
          Track Your Order
        </h1>
        <p className="font-body-lg text-gray-500">
          Enter your Order ID or phone number below to check the real-time status of your delivery.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-xl"
      >
        <div className="glass-panel bg-white p-6 md:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          <form onSubmit={handleTrack} className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. ORD-12345 or 0320..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-secondary font-medium"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSearching}
                className={`bg-[#111111] text-white px-8 py-4 rounded-2xl font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${isSearching ? 'opacity-70 cursor-wait' : 'hover:bg-primary hover:shadow-primary/30 hover:-translate-y-1'}`}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Track <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>

          {/* Result Section */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              className="border-t border-gray-100 pt-8"
            >
              <div className={`flex items-start gap-4 p-5 ${statusInfo.bg} ${statusInfo.border} border rounded-2xl`}>
                <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm ${statusInfo.color} shrink-0`}>
                  <StatusIcon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-secondary text-lg mb-1">Status: {statusInfo.label}</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Order for <span className="font-bold">{result.customer_name}</span> — {Array.isArray(result.items) ? result.items.length : 0} item(s)
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>ID: <span className="text-secondary">{result.id.slice(0, 8).toUpperCase()}</span></span>
                    <span>Total: <span className="text-primary">Rs. {Number(result.total_amount || 0).toLocaleString()}</span></span>
                    <span>Date: <span className="text-secondary">{new Date(result.created_at).toLocaleDateString()}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">Need help with this order?</p>
                <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors">
                  <MessageCircle size={18} /> Contact Support
                </a>
              </div>
            </motion.div>
          )}

          {/* Not Found */}
          {notFound && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              className="border-t border-gray-100 pt-8"
            >
              <div className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 shrink-0">
                  <Search size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg mb-1">No Order Found</h4>
                  <p className="text-gray-500 text-sm mb-2">We couldn't find an order matching "{trackingId}". Please double-check your Order ID or phone number.</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors">
                  <MessageCircle size={18} /> Ask on WhatsApp
                </a>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
      
    </main>
  );
};

export default TrackOrder;
