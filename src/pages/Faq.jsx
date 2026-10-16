import React from 'react';
import { motion } from 'framer-motion';
import { FAQS, ROUTES } from '../data/seo-content';
import { usePageSeo } from '../lib/seo';
import { faqSchema } from '../lib/schema';
import { useSettings } from '../hooks/useSettings';

const seo = ROUTES['/faq'];

const Faq = () => {
  usePageSeo('/faq', { extraNodes: [faqSchema(FAQS)] });
  const { contactPhone, phoneE164, whatsappUrl } = useSettings();

  return (
    <main className="flex-grow pt-14 md:pt-20 pb-16 px-4 sm:px-6 max-w-4xl w-full mx-auto font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-14"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Answers</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Frequently Asked{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">
            Questions
          </span>
        </h1>
        <p className="font-body-lg text-body-lg text-gray-500">
          {seo.summary}
        </p>
      </motion.div>

      {/* FAQ List */}
      <div className="flex flex-col gap-3.5 sm:gap-4">
        {FAQS.map((faq, i) => (
          <motion.section
            key={faq.question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
            className="bg-white p-5 sm:p-6 rounded-lg border border-[#e5e1d7] shadow-xs"
          >
            <h2 className="text-[16px] sm:text-[17px] font-bold text-[#112338] mb-2 leading-snug">
              {faq.question}
            </h2>
            <p className="text-gray-600 text-[14px] sm:text-[14.5px] leading-relaxed">
              {faq.answer}
            </p>
          </motion.section>
        ))}
      </div>

      {/* Clean & Basic Modern WhatsApp Box */}
      <div className="mt-12 bg-white border border-[#e5e1d7] rounded-lg p-6 sm:p-8 text-center shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-[#112338] mb-2">
          Still have questions?
        </h2>
        <p className="text-gray-600 text-sm sm:text-[14.5px] max-w-md mx-auto mb-6 leading-relaxed">
          Tell us what you are printing or making and we will tell you which stock to buy.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#112338] hover:bg-[#1a3654] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer"
          >
            WhatsApp us
          </a>
          <a
            href={`tel:${phoneE164}`}
            className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer"
          >
            Call {contactPhone}
          </a>
        </div>
      </div>
    </main>
  );
};

export default Faq;
