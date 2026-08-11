import React from 'react';
import { motion } from 'framer-motion';
import { Truck, PackageCheck, Building2, MapPin } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <p className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">Delivery & Logistics</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Shipping <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-serif italic font-medium">Policy</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          At Nazir & Sons (nazirandsons.shop), we ensure your premium paper and arts supplies are delivered securely and efficiently across Pakistan.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        {/* Standard Delivery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
            <Truck size={28} />
          </div>
          <h3 className="text-2xl font-bold text-secondary mb-3">Standard Delivery (B2C)</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            For retail customers purchasing stationery and arts supplies. We offer a flat rate standard delivery across major cities.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Flat Rate: Rs 200</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Estimated Time: 3-5 Business Days</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Doorstep delivery via premium couriers</li>
          </ul>
        </motion.div>

        {/* B2B Logistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-primary mb-6">
            <Building2 size={28} />
          </div>
          <h3 className="text-2xl font-bold text-secondary mb-3">Paper Logistics (B2B)</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            For bulk paper stock orders. Given the heavy weight of our premium paper, specialized logistics are required.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-700">Self Pickup:</strong> Collect from our Lahore market store (FREE)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-700">Delivery - Open:</strong> Direct transport delivery (Min Rs 350)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> <strong className="text-gray-700">Delivery - Bundle:</strong> Via Adda transport for out-of-city orders</li>
          </ul>
        </motion.div>

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-panel bg-gray-50/50 p-8 md:p-12 rounded-[32px] border border-gray-100 max-w-4xl mx-auto prose prose-gray max-w-none prose-headings:font-serif prose-headings:italic prose-a:text-primary"
      >
        <h2>Order Processing Times</h2>
        <p>
          All orders placed before 2:00 PM (PKT) are processed on the same business day. Orders placed after this time, or on Sundays and public holidays, will be processed on the next business day. Wholesale paper orders may require an additional 24 hours for proper weighing, cutting (if requested), and secure packing.
        </p>

        <h2>Out of City Deliveries (Adda Transport)</h2>
        <p>
          For B2B customers outside Lahore, we utilize trusted Adda (transport) networks. You will be provided with a bilty (receipt) via WhatsApp once the stock is dispatched. The customer is responsible for collecting the goods from their local transport hub and paying the freight charges directly to the transporter.
        </p>

        <h2>Damaged or Lost Packages</h2>
        <p>
          While we take extreme care in packing our fine arts and paper materials, transit damages can occasionally occur. Please inspect your package upon delivery. If you notice severe damage to the packaging, please record a video while opening it and contact us immediately at <strong>support@nazirandsons.shop</strong>.
        </p>
      </motion.div>

    </main>
  );
};

export default ShippingPolicy;
