import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, MessageCircle, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

const ContactUs = () => {
  usePageSeo('/contact', { pageType: 'ContactPage' });

  return (
    <main className="flex-grow pt-4 sm:pt-6 md:pt-8 pb-16 px-4 sm:px-6 md:px-gutter max-w-container-max w-full mx-auto font-sans">
      {/* Back Button */}
      <div className="mb-4 sm:mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors"
        >
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </div>

      {/* Editorial Header matching Hero page aesthetic */}
      <div className="mb-6 sm:mb-10 max-w-2xl">
        <span className="text-[10.5px] sm:text-[11.5px] font-bold text-[#64748b] uppercase tracking-[0.2em] font-sans block mb-2">
          Direct Assistance &amp; Inquiries
        </span>
        <h1 className="font-serif text-[30px] sm:text-[40px] md:text-[46px] font-normal text-[#112338] leading-[1.12] tracking-tight mb-2.5">
          Get in Touch with Nazir &amp; Sons
        </h1>
        <p className="text-[#64748b] text-[13.5px] sm:text-[15px] leading-relaxed">
          Whether you need custom ream orders, wholesale paper rates, fine art supplies, or delivery details across Pakistan — our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* Left: Contact Info Card */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#e5e1d7] shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#f0ede6]">
            <h2 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#112338] tracking-tight">
              Store &amp; Contact Info
            </h2>
            <span className="text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200/60">
              Est. 1993
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faf8f5] border border-[#e5e1d7] text-[#112338] flex items-center justify-center shrink-0">
                <MapPin size={17} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112338] text-[13.5px] sm:text-[14px] leading-tight mb-0.5">
                  Head Office &amp; Store
                </h3>
                <p className="text-[#64748b] text-[12.5px] sm:text-[13px] leading-relaxed">
                  Nazir &amp; Sons Paper<br />
                  Lahore Paper Market, Abkari Road<br />
                  Anarkali Bazaar, Lahore, Pakistan
                </p>
                <a
                  href="https://maps.google.com?q=Nazir%20and%20Sons%20Paper,%20Lahore%20paper%20market,%20Abkari%20Road,%20Anarkali%20Bazaar%20Lahore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline mt-1"
                >
                  <span>Get Directions</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faf8f5] border border-[#e5e1d7] text-[#112338] flex items-center justify-center shrink-0">
                <Phone size={17} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112338] text-[13.5px] sm:text-[14px] leading-tight mb-0.5">
                  Phone &amp; WhatsApp
                </h3>
                <p className="text-[#64748b] text-[12.5px] sm:text-[13px] leading-relaxed flex flex-col gap-0.5">
                  <a href="tel:+923202220001" className="font-semibold text-[#112338] hover:text-primary transition-colors">
                    +92 320 2220001
                  </a>
                  <a
                    href="https://wa.me/923202220001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle size={13} /> Chat on WhatsApp
                  </a>
                </p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faf8f5] border border-[#e5e1d7] text-[#112338] flex items-center justify-center shrink-0">
                <Mail size={17} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112338] text-[13.5px] sm:text-[14px] leading-tight mb-0.5">
                  Email Address
                </h3>
                <a
                  href="mailto:support@nazirandsons.shop"
                  className="text-[#64748b] text-[12.5px] sm:text-[13px] hover:text-primary transition-colors font-medium"
                >
                  support@nazirandsons.shop
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faf8f5] border border-[#e5e1d7] text-[#112338] flex items-center justify-center shrink-0">
                <Clock size={17} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112338] text-[13.5px] sm:text-[14px] leading-tight mb-0.5">
                  Business Hours
                </h3>
                <p className="text-[#64748b] text-[12.5px] sm:text-[13px] leading-relaxed">
                  Monday – Saturday: 10:00 AM – 7:00 PM<br />
                  <span className="text-gray-400">Sunday: Closed</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#e5e1d7] shadow-xs">
          <div className="pb-3.5 mb-4 border-b border-[#f0ede6]">
            <h2 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#112338] tracking-tight">
              Send us a Message
            </h2>
            <p className="text-[#64748b] text-[12px] sm:text-[13px] mt-0.5">
              Fill out the form below to initiate a direct order inquiry via WhatsApp.
            </p>
          </div>

          <form
            className="flex flex-col gap-3.5 sm:gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = form.elements.name?.value || '';
              const email = form.elements.email?.value || '';
              const subject = form.elements.subject?.value || '';
              const message = form.elements.message?.value || '';
              const text = `*New Contact Form Message*\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
              window.open(`https://wa.me/923202220001?text=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col">
                <label htmlFor="contact-name" className="text-[9.5px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] rounded-lg px-3 py-2 text-[13px] font-medium text-[#112338] outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="contact-email" className="text-[9.5px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] rounded-lg px-3 py-2 text-[13px] font-medium text-[#112338] outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="contact-subject" className="text-[9.5px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Subject / Paper Inquiry
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                placeholder="e.g. Bulk A4 Copy Paper / Art Supplies inquiry"
                className="w-full bg-[#faf8f5] border border-[#dcd7cb] rounded-lg px-3 py-2 text-[13px] font-medium text-[#112338] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="contact-message" className="text-[9.5px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Your Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows="4"
                required
                placeholder="Details of quantity, sizes, GSM, or any specific questions..."
                className="w-full bg-[#faf8f5] border border-[#dcd7cb] rounded-lg p-3 text-[13px] font-medium text-[#112338] outline-none focus:border-primary focus:bg-white transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="h-10.5 px-6 rounded-xl bg-[#112338] hover:bg-[#1a3654] text-white text-[11.5px] sm:text-[12px] font-bold tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 self-start cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle size={15} /> Send via WhatsApp
            </button>
          </form>
        </div>

        {/* Map Section */}
        <div className="lg:col-span-12 bg-white rounded-xl sm:rounded-2xl border border-[#e5e1d7] overflow-hidden shadow-xs mt-2">
          <div className="p-3 sm:p-4 border-b border-[#e5e1d7] bg-[#faf8f5] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[15px] sm:text-[16px] font-bold text-[#112338]">
                Store Location Map
              </h3>
              <p className="text-[11.5px] text-[#64748b]">
                Lahore Paper Market, Abkari Road, Anarkali Bazaar, Lahore
              </p>
            </div>
            <a
              href="https://maps.google.com?q=Nazir%20and%20Sons%20Paper,%20Lahore%20paper%20market,%20Abkari%20Road,%20Anarkali%20Bazaar%20Lahore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="w-full h-[260px] sm:h-[320px] relative bg-gray-100">
            <iframe
              src="https://maps.google.com/maps?q=Nazir%20and%20Sons%20Paper,%20Lahore&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nazir & Sons Store Map"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactUs;
