import React from 'react';
import { motion } from 'framer-motion';
import { usePageSeo } from '../lib/seo';

const OurStory = () => {
  usePageSeo('/about', { pageType: 'AboutPage' });
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Heritage & Craft</p>
          </div>
          <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-6">
            The Story of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Nazir & Sons</span>
          </h1>
          <p className="font-body-lg text-body-lg text-gray-500 mb-6">
            Rooted in the historic heart of Lahore's paper market, Nazir & Sons has been synonymous with premium quality paper, fine arts, and stationery for decades.
          </p>
          <p className="font-body-lg text-body-lg text-gray-500">
            What started as a humble trading post in Anarkali Bazaar has blossomed into nazirandsons.shop, a digital and physical powerhouse providing creators, publishers, and businesses with materials that elevate their work.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative perspective-1000"
        >
          <div className="glass-panel bg-white p-2 rounded-[32px] shadow-glass border border-white/60 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <img 
              src="https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Historic paper craft" 
              className="w-full h-auto rounded-[28px] object-cover aspect-[4/3] mix-blend-multiply"
            />
          </div>
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-200/40 rounded-full blur-[100px] -z-10"></div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-panel bg-gray-50/50 p-8 md:p-16 rounded-[40px] border border-gray-100 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 font-serif italic">Our Mission</h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
          "To bridge the gap between imagination and creation by providing the finest paper stocks and artistic tools to the creators of Pakistan. We believe that premium materials inspire premium ideas."
        </p>
      </motion.div>

    </main>
  );
};

export default OurStory;
