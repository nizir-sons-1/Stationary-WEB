import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, CreditCard } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

const ReturnsRefunds = () => {
  usePageSeo('/returns');
  return (
    <main className="flex-grow pt-14 md:pt-20 pb-16 px-4 sm:px-6 max-w-4xl w-full mx-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 sm:mb-14 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Customer Protection</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Returns &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Refunds</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          Our commitment to quality at nazirandsons.shop is absolute. Please read our policy regarding returns and exchanges for premium materials.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-6 rounded-lg border border-[#e5e1d7] shadow-xs text-center flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary mb-3.5 border border-orange-100">
            <RefreshCcw size={22} />
          </div>
          <h2 className="font-bold text-base text-secondary mb-1.5">7-Day Return Policy</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            For retail stationery and arts items, returns are accepted within 7 days of delivery in original condition.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-6 rounded-lg border border-[#e5e1d7] shadow-xs text-center flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary mb-3.5 border border-orange-100">
            <ShieldAlert size={22} />
          </div>
          <h2 className="font-bold text-base text-secondary mb-1.5">B2B Paper Stocks</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Wholesale paper (reams/bundles) cannot be returned once cut or unpacked unless there is a confirmed manufacturing defect.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white p-6 rounded-lg border border-[#e5e1d7] shadow-xs text-center flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary mb-3.5 border border-orange-100">
            <CreditCard size={22} />
          </div>
          <h2 className="font-bold text-base text-secondary mb-1.5">Refund Processing</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Approved refunds are processed via Bank Transfer or EasyPaisa within 3-5 business days of item receipt.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white p-6 sm:p-10 rounded-lg border border-[#e5e1d7] shadow-xs prose prose-gray max-w-none prose-headings:text-[#112338] prose-headings:font-bold prose-a:text-primary"
      >
        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">Conditions for Return</h2>
        <ul className="space-y-1.5 text-sm sm:text-[14.5px] text-gray-600 mb-6">
          <li>Items must be unused, in the same condition that you received them, and in their original packaging.</li>
          <li>A receipt or proof of purchase (Order ID) is required to complete your return.</li>
          <li>For premium fine arts supplies (like canvases, paints, and specialized markers), the seal must remain intact. Opened art supplies are strictly non-refundable.</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">Non-returnable Items</h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] leading-relaxed mb-2">Certain goods are exempt from being returned:</p>
        <ul className="space-y-1.5 text-sm sm:text-[14.5px] text-gray-600 mb-6">
          <li>Paper stock that has been custom-cut to size according to client specifications.</li>
          <li>Goods purchased during clearance sales or using special promotional discounts.</li>
          <li>Gift cards.</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">How to Initiate a Return</h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] leading-relaxed">
          To initiate a return, please contact us on WhatsApp at <strong>+92 320 2220001</strong> or email us at <strong>support@nazirandsons.shop</strong> with your order number and photographs of the product. Our customer service team will guide you through the process and provide the return shipping address. You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
        </p>
      </motion.div>
    </main>
  );
};

export default ReturnsRefunds;
