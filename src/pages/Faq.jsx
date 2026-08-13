import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Phone, MapPin } from 'lucide-react';
import { FAQS, ROUTES } from '../data/seo-content';
import { BUSINESS } from '../lib/site';
import { usePageSeo } from '../lib/seo';
import { faqSchema } from '../lib/schema';

/*
 * The answer page.
 *
 * Every question here is one a customer actually asks over WhatsApp, and every
 * answer is the same commitment the shipping, returns and contact pages already
 * make — restated as a self-contained paragraph.
 *
 * The paragraphs are rendered open rather than tucked inside an accordion. A
 * collapsed <details> is indexed, but the answer an engine quotes is the one it
 * can read without simulating a click, and there are only fifteen of them.
 */
const seo = ROUTES['/faq'];

const Faq = () => {
  // The graph carries exactly one FAQPage node — the one below, holding the
  // questions. Typing the page node as a second FAQPage would leave a crawler
  // choosing between two nodes claiming to be the same thing.
  usePageSeo('/faq', { extraNodes: [faqSchema(FAQS)] });

  return (
    <main className="flex-grow pt-16 md:pt-24 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16"
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
        <p className="font-body-lg text-body-lg text-gray-500">{seo.summary}</p>
      </motion.div>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {FAQS.map((faq, i) => (
          <motion.section
            key={faq.question}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
            className="glass-panel bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          >
            <h2 className="flex items-start gap-3 text-[17px] md:text-[20px] font-bold text-secondary mb-3 leading-snug">
              <HelpCircle size={20} className="text-primary shrink-0 mt-0.5" />
              {faq.question}
            </h2>
            <p className="text-gray-600 leading-relaxed text-[14px] md:text-[15px] pl-0 md:pl-8">
              {faq.answer}
            </p>
          </motion.section>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-16 glass-panel bg-[#0a0a0a] text-white p-8 md:p-12 rounded-[32px] text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif italic">Still need an answer?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto text-[15px]">
          Tell us what you are printing or making and we will tell you which stock to buy.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white font-bold text-[14px] px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp us
          </a>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[14px] px-6 py-3 rounded-full transition-colors"
          >
            <Phone size={16} /> {BUSINESS.phone}
          </a>
          <Link
            to="/contact"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[14px] px-6 py-3 rounded-full transition-colors"
          >
            <MapPin size={16} /> Visit the store
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Faq;
