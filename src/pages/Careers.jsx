import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, Zap, Sparkles } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

const Careers = () => {
  usePageSeo('/careers');
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
          <p className="text-purple-600 text-[12px] font-bold uppercase tracking-widest">Join Our Team</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Careers at <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 font-serif italic font-medium">Nazir & Sons</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          Be part of a legacy. We're looking for passionate individuals who love paper, arts, and premium customer service to help us grow nazirandsons.shop.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-primary mb-4 border border-orange-100">
            <Heart size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-secondary">Creative Culture</h3>
          <p className="text-sm text-gray-500">Immerse yourself in a workspace surrounded by the finest arts supplies and paper crafts.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-secondary">Growth Opportunities</h3>
          <p className="text-sm text-gray-500">We invest in our team. Learn about supply chain, e-commerce, and high-end retail.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
            <Zap size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-secondary">Impactful Work</h3>
          <p className="text-sm text-gray-500">Help provide the canvas for Pakistan's greatest publishers, artists, and businesses.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-panel bg-gray-50/50 p-12 rounded-[40px] border border-gray-100 text-center max-w-3xl mx-auto"
      >
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
          <Briefcase size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-4">No Open Positions</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          We are currently fully staffed and not actively hiring. However, we are always open to meeting extraordinary talent.
        </p>
        <a href="mailto:careers@nazirandsons.shop" className="bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-block">
          Send Resume Anyway
        </a>
      </motion.div>

    </main>
  );
};

export default Careers;
