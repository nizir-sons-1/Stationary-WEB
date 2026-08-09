import React from 'react';
import { BadgeCheck, Truck, Globe, Zap } from 'lucide-react';

const TrustStats = () => {
  const stats = [
    {
      icon: <BadgeCheck size={28} className="text-primary" />,
      title: "30+",
      subtitle: "Years Experience",
      desc: "Serving the printing industry since 1993."
    },
    {
      icon: <Truck size={28} className="text-primary" />,
      title: "4",
      subtitle: "Major Cities",
      desc: "Fast delivery networks across Pakistan."
    },
    {
      icon: <Globe size={28} className="text-primary" />,
      title: "10+",
      subtitle: "Global Brands",
      desc: "Direct importers of premium paper."
    },
    {
      icon: <Zap size={28} className="text-primary" />,
      title: "24h",
      subtitle: "Same Day Dispatch",
      desc: "Order today, ships today."
    }
  ];

  const marqueeStats = [...stats, ...stats, ...stats, ...stats];

  return (
    <section className="relative z-20 max-w-[100vw] overflow-hidden -mt-8 md:-mt-12 mb-12 md:mb-20 py-4">
      {/* Edge fade gradients */}
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-surface to-transparent z-30 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-surface to-transparent z-30 pointer-events-none"></div>
      
      <div className="flex w-max animate-marquee-fast hover:[animation-play-state:paused]">
        {marqueeStats.map((stat, idx) => (
          <div 
            key={idx} 
            className="group flex flex-row items-center text-left p-3 md:p-5 bg-white/90 backdrop-blur-md rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 mx-2 md:mx-3 w-[220px] md:w-[280px] shrink-0 cursor-pointer overflow-hidden relative"
          >
            {/* Subtle highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="w-12 h-12 rounded-full bg-[#fff4ed] flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 group-hover:bg-primary transition-all duration-500 z-10">
              {React.cloneElement(stat.icon, { className: "text-primary transition-colors duration-500 group-hover:text-white w-5 h-5 md:w-6 md:h-6" })}
            </div>
            
            <div className="flex flex-col justify-center z-10">
              <h3 className="font-headline-xl text-[20px] md:text-[28px] font-extrabold text-[#111111] leading-none mb-0.5 tracking-tight">
                {stat.title}
              </h3>
              <p className="font-label-caps text-[9px] md:text-[11px] text-gray-500 font-bold uppercase tracking-widest md:tracking-[0.15em] leading-tight">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustStats;
