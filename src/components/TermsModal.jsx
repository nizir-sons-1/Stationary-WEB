import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, onAgree }) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAgree = () => {
    if (hasAgreed) {
      onAgree();
      setHasAgreed(false); // reset for next time
    }
  };

  const handleClose = () => {
    setHasAgreed(false);
    onClose();
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white mb-4 backdrop-blur-md">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Installment Terms</h2>
              <p className="text-indigo-100 mt-2 text-sm">Please review the requirements for our installment plans.</p>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="mt-0.5 bg-indigo-100 p-1 rounded text-indigo-600"><Check size={14} strokeWidth={3} /></div>
                  <p><strong>Physical Bank Cheques:</strong> You must provide post-dated physical bank cheques as a guarantee for the installment duration.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="mt-0.5 bg-indigo-100 p-1 rounded text-indigo-600"><Check size={14} strokeWidth={3} /></div>
                  <p><strong>Verification Process:</strong> All installment requests are subject to approval and background verification.</p>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="mt-0.5 bg-indigo-100 p-1 rounded text-indigo-600"><Check size={14} strokeWidth={3} /></div>
                  <p><strong>WhatsApp Confirmation:</strong> The final agreement and processing will be completed securely via WhatsApp.</p>
                </li>
              </ul>

              {/* Checkbox */}
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm font-bold text-[#111111] leading-tight">
                  I have read and agree to provide physical cheques and comply with the terms.
                </span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAgree}
                  disabled={!hasAgreed}
                  className={`flex-[2] py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${
                    hasAgreed 
                      ? 'bg-[#111111] hover:bg-indigo-600 shadow-indigo-600/20 hover:-translate-y-0.5' 
                      : 'bg-gray-300 cursor-not-allowed shadow-transparent'
                  }`}
                >
                  Agree & Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TermsModal;
