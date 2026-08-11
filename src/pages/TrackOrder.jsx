import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setIsSearching(true);
    // Simulate network request
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        status: 'processing',
        message: 'Your order is currently being processed by our team.',
        eta: '2-3 Business Days'
      });
    }, 1500);
  };

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
          Enter your Order ID or WhatsApp number below to check the real-time status of your premium delivery.
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
              <div className="flex items-start gap-4 p-5 bg-orange-50/50 border border-orange-100 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg mb-1">Status: Processing</h4>
                  <p className="text-gray-600 text-sm mb-2">{result.message}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Delivery: <span className="text-primary">{result.eta}</span></p>
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

        </div>
      </motion.div>
      
    </main>
  );
};

export default TrackOrder;
