import React from 'react';
import { motion } from 'framer-motion';
import { usePageSeo } from '../lib/seo';

const TermsOfService = () => {
  usePageSeo('/terms');
  return (
    <main className="flex-grow pt-14 md:pt-20 pb-16 px-4 sm:px-6 max-w-4xl w-full mx-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 sm:mb-14 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Legal Agreement</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Service</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          By accessing and using nazirandsons.shop, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white p-6 sm:p-10 md:p-12 rounded-lg border border-[#e5e1d7] shadow-xs prose prose-gray max-w-none prose-headings:text-[#112338] prose-headings:font-bold prose-a:text-primary"
      >
        <h2>1. General Conditions</h2>
        <p>
          We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
        </p>

        <h2>2. Products and Pricing</h2>
        <p>
          Prices for our premium paper stocks and fine arts products are subject to change without notice due to the volatile nature of paper market rates. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
        </p>

        <h2>3. Accuracy of Billing and Account Information</h2>
        <p>
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per business or per order. These restrictions may include orders placed by or under the same customer account, the same WhatsApp number, or orders that use the same billing and/or shipping address.
        </p>

        <h2>4. Governing Law</h2>
        <p>
          These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, with jurisdiction in Lahore courts.
        </p>

        <h2>5. Contact Information</h2>
        <p>
          Questions about the Terms of Service should be sent to us via WhatsApp at <strong>+92 320 2220001</strong> or by email at <strong>support@nazirandsons.shop</strong>.
        </p>
      </motion.div>
    </main>
  );
};

export default TermsOfService;
