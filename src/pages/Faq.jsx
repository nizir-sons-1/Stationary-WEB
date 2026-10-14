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

      <div className="max-w-4xl mx-auto mt-14 bg-[#112338] text-white p-7 sm:p-10 md:p-12 rounded-[24px] sm:rounded-[32px] text-center shadow-[0_20px_50px_rgba(17,35,56,0.18)] border border-[#1a3654] relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-3 border border-white/10">
            Need Expert Advice?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-serif tracking-tight text-white">
            Still Have Questions?
          </h2>
          <p className="text-gray-300 mb-7 sm:mb-8 max-w-xl mx-auto text-[14px] sm:text-[15px] leading-relaxed">
            Tell us what you are printing or making and we will recommend the exact paper, GSM, and finish for your project.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={BUSINESS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-[13.5px] sm:text-[14px] px-6 py-3 rounded-full transition-all shadow-[0_4px_14px_rgba(37,211,102,0.35)] cursor-pointer"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp Us</span>
            </a>
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-semibold text-[13.5px] sm:text-[14px] px-5 py-3 rounded-full transition-all cursor-pointer"
            >
              <Phone size={15} /> <span>{BUSINESS.phone}</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-semibold text-[13.5px] sm:text-[14px] px-5 py-3 rounded-full transition-all cursor-pointer"
            >
              <MapPin size={15} /> <span>Visit Store</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Faq;
