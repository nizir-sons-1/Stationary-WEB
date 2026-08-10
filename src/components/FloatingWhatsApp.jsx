import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingWhatsApp = () => {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber = "923202220001";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[60] flex flex-col items-end pointer-events-none">
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl pointer-events-none relative origin-bottom-right"
          >
            <span className="text-[13px] font-bold text-gray-800 tracking-wide">
              Need Help? Chat with us!
            </span>
            {/* Triangle pointer */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/90 border-b border-r border-white/40 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group pointer-events-auto"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse Effect Rings */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute inset-[-4px] rounded-full bg-[#25D366] opacity-20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        
        {/* Main Button Body */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-[0_4px_20px_rgba(37,211,102,0.4)] flex items-center justify-center border-2 border-white/20 overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
          
          {/* WhatsApp SVG Icon */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="white" 
            className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md z-10"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </motion.div>
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
