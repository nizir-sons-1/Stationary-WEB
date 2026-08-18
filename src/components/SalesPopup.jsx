import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, CheckCircle2 } from 'lucide-react';

// Simulated data to create FOMO and social proof
const NOTIFICATIONS = [
  {
    name: 'Ali from Lahore',
    action: 'just bought',
    item: 'Premium Art Card 300GSM',
    type: 'purchase',
    time: '2 mins ago',
  },
  {
    name: 'Aisha from Karachi',
    action: 'just left a',
    item: '5-star review',
    type: 'review',
    time: '5 mins ago',
  },
  {
    name: 'Usman from Islamabad',
    action: 'just bought',
    item: 'Sketching Pencils Set',
    type: 'purchase',
    time: '12 mins ago',
  },
  {
    name: 'Zainab from Faisalabad',
    action: 'just bought',
    item: 'Watercolor Canvas',
    type: 'purchase',
    time: '1 hr ago',
  },
  {
    name: 'Hamza from Multan',
    action: 'just ordered',
    item: 'Custom Size Paper',
    type: 'purchase',
    time: 'Just now',
  },
];

const SalesPopup = () => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wait a few seconds before showing the first popup so it doesn't block initial interaction
    const initialDelay = setTimeout(() => {
      triggerNextNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const triggerNextNotification = () => {
    // Pick a random notification
    const randomNotif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setCurrentNotification(randomNotif);
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule the next one between 15 to 30 seconds after hiding
      const nextDelay = Math.floor(Math.random() * (30000 - 15000 + 1) + 15000);
      setTimeout(triggerNextNotification, nextDelay);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-24 left-4 md:top-auto md:bottom-8 md:left-8 z-[100] max-w-[320px] w-[calc(100%-2rem)] bg-white/90 backdrop-blur-md border border-white/50 shadow-glass rounded-2xl p-4 flex items-start gap-3"
        >
          {/* Icon */}
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            currentNotification.type === 'purchase' ? 'bg-orange-100 text-primary' : 'bg-green-100 text-green-600'
          }`}>
            {currentNotification.type === 'purchase' ? (
              <ShoppingBag size={18} />
            ) : (
              <Star size={18} className="fill-green-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-500 leading-snug">
              <span className="font-bold text-gray-900">{currentNotification.name}</span> {currentNotification.action}
            </p>
            <p className="text-[14px] font-bold text-secondary truncate mt-0.5">
              {currentNotification.item}
            </p>
            <div className="flex items-center gap-1 mt-1.5 opacity-70">
              <CheckCircle2 size={10} className="text-blue-500" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Verified {currentNotification.type} • {currentNotification.time}
              </span>
            </div>
          </div>
          
          {/* Close button (optional, but good for UX) */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SalesPopup;
