import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, CreditCard } from 'lucide-react';

const ReturnsRefunds = () => {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-4">
          <p className="text-rose-600 text-[12px] font-bold uppercase tracking-widest">Customer Protection</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Returns & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500 font-serif italic font-medium">Refunds</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          Our commitment to quality at nazirandsons.shop is absolute. Please read our policy regarding returns and exchanges for premium materials.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 mb-4 border border-gray-100">
            <RefreshCcw size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">7-Day Return Policy</h3>
          <p className="text-sm text-gray-500">For retail stationery and arts items, returns are accepted within 7 days of delivery in original condition.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-primary mb-4 border border-orange-100">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">B2B Paper Stocks</h3>
          <p className="text-sm text-gray-500">Wholesale paper (reams/bundles) cannot be returned once cut or unpacked unless there is a confirmed manufacturing defect.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4 border border-green-100">
            <CreditCard size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Refund Processing</h3>
          <p className="text-sm text-gray-500">Approved refunds are processed via Bank Transfer or EasyPaisa within 3-5 business days of item receipt.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-panel bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 max-w-4xl mx-auto prose prose-gray max-w-none prose-headings:font-serif prose-headings:italic prose-a:text-primary"
      >
        <h2>Conditions for Return</h2>
        <ul>
          <li>Items must be unused, in the same condition that you received them, and in their original packaging.</li>
          <li>A receipt or proof of purchase (Order ID) is required to complete your return.</li>
          <li>For premium fine arts supplies (like canvases, paints, and specialized markers), the seal must remain intact. Opened art supplies are strictly non-refundable.</li>
        </ul>

        <h2>Non-returnable Items</h2>
        <p>Certain goods are exempt from being returned:</p>
        <ul>
          <li>Paper stock that has been custom-cut to size according to client specifications.</li>
          <li>Goods purchased during clearance sales or using special promotional discounts.</li>
          <li>Gift cards.</li>
        </ul>

        <h2>How to initiate a Return</h2>
        <p>
          To initiate a return, please contact us on WhatsApp at <strong>+92 320 2220001</strong> or email us at <strong>support@nazirandsons.shop</strong> with your order number and photographs of the product. Our customer service team will guide you through the process and provide the return shipping address. You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
        </p>
      </motion.div>
    </main>
  );
};

export default ReturnsRefunds;
