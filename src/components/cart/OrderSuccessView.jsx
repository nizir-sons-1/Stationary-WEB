import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Truck,
  MessageCircle,
  MapPin,
  Check,
  Copy,
} from 'lucide-react';
import VariationBadge from './VariationBadge';

export default function OrderSuccessView({ placedOrder, copied, onCopy }) {
  return (
    <div className="flex-grow pt-4 sm:pt-6 md:pt-8 pb-stack-lg px-margin-mobile md:px-gutter max-w-4xl w-full mx-auto">
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

        {/* Bulk Order Status Banner */}
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
                type="button"
                onClick={onCopy}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors cursor-pointer"
                title="Copy Order ID"
                aria-label="Copy Order ID"
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
    </div>
  );
}
