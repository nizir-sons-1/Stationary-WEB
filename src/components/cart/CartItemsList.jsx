import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { departmentOf, PAPER_AND_CANVAS } from '../../data/categories';
import VariationBadge from './VariationBadge';

export function CartItemsList({ cartItems, updateQuantity, removeFromCart }) {
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
            <button onClick={() => removeFromCart(item.id, item.isBulk, item.isInstallment, item.installmentPlan)} className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default CartItemsList;
