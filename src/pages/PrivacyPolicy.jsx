import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <p className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">Data Protection</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-serif italic font-medium">Policy</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          Last updated: August 2026. This Privacy Policy describes how nazirandsons.shop collects, uses, and protects your information.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-panel bg-white p-8 md:p-16 rounded-[40px] border border-gray-100 max-w-4xl mx-auto prose prose-gray max-w-none prose-headings:font-serif prose-headings:italic prose-a:text-primary shadow-glass"
      >
        <h2>1. Information We Collect</h2>
        <p>
          When you visit <strong>nazirandsons.shop</strong>, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
        </p>
        <p>
          When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number (WhatsApp). We refer to this information as "Order Information."
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
        </p>
        <ul>
          <li>Communicate with you regarding your premium paper and stationery orders.</li>
          <li>Screen our orders for potential risk or fraud.</li>
          <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
        </ul>

        <h2>3. Data Retention</h2>
        <p>
          When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
        </p>

        <h2>4. Changes</h2>
        <p>
          We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>support@nazirandsons.shop</strong> or by mail using the details provided below:
        </p>
        <p>
          <strong>Nazir & Sons Paper</strong><br/>
          Lahore Paper Market, Abkari Road<br/>
          Anarkali Bazaar, Lahore, Pakistan
        </p>
      </motion.div>
    </main>
  );
};

export default PrivacyPolicy;
