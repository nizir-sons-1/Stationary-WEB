import React from 'react';
import { motion } from 'framer-motion';
import { usePageSeo } from '../lib/seo';

const TermsOfService = () => {
  usePageSeo('/terms');
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
          <p className="text-slate-600 text-[12px] font-bold uppercase tracking-widest">Legal Agreement</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-500 font-serif italic font-medium">Service</span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          By accessing and using nazirandsons.shop, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-panel bg-white p-8 md:p-16 rounded-[40px] border border-gray-100 max-w-4xl mx-auto prose prose-gray max-w-none prose-headings:font-serif prose-headings:italic prose-a:text-primary shadow-glass"
      >
        <h2>1. General Conditions</h2>
        <p>
          We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
        </p>

        <h2>2. Products and Pricing</h2>
        <p>
          Prices for our premium paper stocks and fine arts products are subject to change without notice due to the volatile nature of paper market rates. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
        </p>
        <p>
          Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
        </p>

        <h2>3. Accuracy of Billing and Account Information</h2>
        <p>
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address.
        </p>
        <p>
          In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
        </p>

        <h2>4. Paper Weights and Dimensions</h2>
        <p>
          While we make every effort to ensure the accuracy of the GSM (Grams per Square Meter) and dimensions listed on our site, please note that minor industry-standard tolerances apply. A variance of ±5% in GSM or ±1-2mm in dimensions is considered acceptable within the paper manufacturing industry.
        </p>

        <h2>5. Contact Information</h2>
        <p>
          Questions about the Terms of Service should be sent to us at <strong>support@nazirandsons.shop</strong>.
        </p>
      </motion.div>
    </main>
  );
};

export default TermsOfService;
