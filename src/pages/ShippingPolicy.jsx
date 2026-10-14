import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Building2 } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

const ShippingPolicy = () => {
  usePageSeo('/shipping');
  return (
    <main className="flex-grow pt-14 md:pt-20 pb-16 px-4 sm:px-6 max-w-4xl w-full mx-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 sm:mb-14 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Delivery &amp; Logistics</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Shipping <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Policy</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          At Nazir &amp; Sons (nazirandsons.shop), we ensure your premium paper and arts supplies are delivered securely and efficiently across Pakistan.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Standard Delivery */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-6 sm:p-8 rounded-lg border border-[#e5e1d7] shadow-xs"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary mb-4 border border-orange-100">
            <Truck size={24} />
          </div>
          <h2 className="text-xl font-bold text-secondary mb-2">Standard Delivery (B2C)</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            For retail customers purchasing stationery and arts supplies. We offer a flat rate standard delivery across major cities.
          </p>
          <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Flat Rate: Rs 200</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Estimated Time: 3-5 Business Days</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Doorstep delivery via premium couriers</li>
          </ul>
        </motion.div>

        {/* B2B Logistics */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-6 sm:p-8 rounded-lg border border-[#e5e1d7] shadow-xs"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary mb-4 border border-orange-100">
            <Building2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-secondary mb-2">Paper Logistics (B2B)</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            For bulk paper stock orders. Given the heavy weight of our premium paper, specialized logistics are required.
          </p>
          <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-800">Self Pickup:</strong> Collect from our Lahore market store (FREE)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-800">Delivery - Open:</strong> Direct transport delivery (Min Rs 350)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-800">Delivery - Bundle:</strong> Via Adda transport for out-of-city orders</li>
          </ul>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white p-6 sm:p-10 rounded-lg border border-[#e5e1d7] shadow-xs prose prose-gray max-w-none prose-headings:text-[#112338] prose-headings:font-bold prose-a:text-primary"
      >
        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">Order Processing Times</h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] leading-relaxed mb-6">
          All orders placed before 2:00 PM (PKT) are processed on the same business day. Orders placed after this time, or on Sundays and public holidays, will be processed on the next business day. Wholesale paper orders may require an additional 24 hours for proper weighing, cutting (if requested), and secure packing.
        </p>

        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">Out of City Deliveries (Adda Transport)</h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] leading-relaxed mb-6">
          For B2B customers outside Lahore, we utilize trusted Adda (transport) networks. You will be provided with a bilty (receipt) via WhatsApp once the stock is dispatched. The customer is responsible for collecting the goods from their local transport hub and paying the freight charges directly to the transporter.
        </p>

        <h2 className="text-lg sm:text-xl font-bold text-[#112338] mb-2">Damaged or Lost Packages</h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] leading-relaxed">
          While we take extreme care in packing our fine arts and paper materials, transit damages can occasionally occur. Please inspect your package upon delivery. If you notice severe damage to the packaging, please record a video while opening it and contact us immediately at <strong>support@nazirandsons.shop</strong>.
        </p>
      </motion.div>
    </main>
  );
};

export default ShippingPolicy;
