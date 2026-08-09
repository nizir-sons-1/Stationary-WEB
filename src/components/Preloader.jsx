import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Paperclip, Ruler } from 'lucide-react';

// Generate random drops of color (Fine Arts)
const drops = Array.from({ length: 8 }).map((_, i) => ({
  id: `drop-${i}`,
  left: `${Math.random() * 90 + 5}%`,
  width: `${Math.random() * 10 + 5}px`,
  height: `${Math.random() * 40 + 20}px`,
  delay: Math.random() * 1.5,
  duration: Math.random() * 1.5 + 1.5,
  color: ['bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-400'][Math.floor(Math.random() * 5)]
}));

// Generate falling papers (Paper)
const papers = Array.from({ length: 4 }).map((_, i) => ({
  id: `paper-${i}`,
  left: `${Math.random() * 80 + 10}%`,
  size: Math.random() * 30 + 30, // 30 to 60px
  delay: Math.random() * 2,
  duration: Math.random() * 2 + 2.5,
  rotate: Math.random() * 360
}));

// Generate falling stationery (Stationery)
const stationeries = [Pencil, Paperclip, Ruler].map((Icon, i) => ({
  id: `stat-${i}`,
  Icon,
  left: `${Math.random() * 80 + 10}%`,
  delay: Math.random() * 1.5,
  duration: Math.random() * 2 + 2,
  rotate: Math.random() * 360
}));

const Preloader = () => {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('preloader_done'));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;

    // 0 to 100 counter over 3.5 seconds
    const duration = 3500;
    const intervalTime = 35; // Update every 35ms
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(nextProgress);
      if (currentStep >= steps) clearInterval(interval);
    }, intervalTime);

    const timer = setTimeout(() => {
      sessionStorage.setItem('preloader_done', 'true');
      setLoading(false);
    }, duration + 200); // slightly after hitting 100%

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 4,
            rotateX: 10,
            rotateY: -10,
            filter: "blur(20px)"
          }}
          transition={{ duration: 1.2, ease: [0.83, 0, 0.17, 1] }} // very premium cinematic ease
          className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden"
          style={{ perspective: 1000 }}
        >
          {/* Falling Colors Animation (Fine Arts) */}
          {drops.map(drop => (
            <motion.div
              key={drop.id}
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: '120vh', opacity: [0, 1, 1, 0] }}
              transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }}
              className={`absolute top-0 rounded-full blur-[1px] ${drop.color} opacity-60`}
              style={{ left: drop.left, width: drop.width, height: drop.height }}
            />
          ))}

          {/* Falling Papers (Paper) */}
          {papers.map(paper => (
            <motion.div
              key={paper.id}
              initial={{ y: -200, opacity: 0, rotate: paper.rotate }}
              animate={{ y: '120vh', opacity: [0, 1, 1, 0], rotate: paper.rotate + 180 }}
              transition={{ duration: paper.duration, delay: paper.delay, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08)] border border-gray-100 rounded-sm flex items-center justify-center"
              style={{ left: paper.left, width: `${paper.size}px`, height: `${paper.size * 1.4}px` }}
            >
              {/* Notebook lines effect */}
              <div className="w-full h-full p-2 flex flex-col gap-1 opacity-20">
                <div className="w-full h-[1px] bg-blue-400"></div>
                <div className="w-full h-[1px] bg-gray-400"></div>
                <div className="w-full h-[1px] bg-gray-400"></div>
              </div>
            </motion.div>
          ))}

          {/* Falling Stationery */}
          {stationeries.map(stat => (
            <motion.div
              key={stat.id}
              initial={{ y: -200, opacity: 0, rotate: stat.rotate }}
              animate={{ y: '120vh', opacity: [0, 1, 1, 0], rotate: stat.rotate - 180 }}
              transition={{ duration: stat.duration, delay: stat.delay, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 text-gray-400 opacity-60"
              style={{ left: stat.left }}
            >
              <stat.Icon size={28} />
            </motion.div>
          ))}

          {/* Central Logo Reveal */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Playful spinning paint splatter or circle behind text */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 rounded-full -z-10 opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(255,237,213,1) 0%, transparent 60%)' }}
            />
            <motion.div 
              animate={{ rotate: -360, scale: [1, 1.2, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 rounded-full -z-10 translate-x-10 opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(219,234,254,1) 0%, transparent 60%)' }}
            />

            <div className="overflow-hidden mb-2">
              <motion.h2 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", damping: 12 }}
                className="text-[32px] md:text-[48px] font-serif font-black text-secondary tracking-widest flex items-center gap-3"
              >
                NAZIR <span className="text-primary italic font-medium">& SONS</span>
              </motion.h2>
            </div>

            <motion.p 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
              className="text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold"
            >
              Colors of Creativity
            </motion.p>
            
            {/* Elegant loading bar */}
            <div className="w-[180px] h-[4px] bg-gray-100 rounded-full overflow-hidden mt-8 relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 rounded-full transition-all duration-[35ms] ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage Counter moved Below */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gray-400 font-bold text-[14px] font-sans tracking-widest mt-4"
            >
              {progress}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
