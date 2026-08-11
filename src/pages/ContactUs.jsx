import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, MessageCircle, Clock, Globe } from 'lucide-react';

const ContactUs = () => {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Get In Touch</p>
        </div>
        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-secondary font-black tracking-tight leading-none mb-4">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Nazir & Sons</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          We're here to assist you with premium paper stocks, stationery, and fine arts inquiries. Reach out to our dedicated support team today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div className="glass-panel bg-white p-8 rounded-[32px] border border-white/60 shadow-glass">
            <h3 className="text-2xl font-bold text-secondary mb-8 font-serif italic">Contact Details</h3>
            
            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-[16px] mb-1">Head Office & Store</h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed">
                    Nazir & Sons Paper<br />
                    Lahore Paper Market, Abkari Road<br />
                    Anarkali Bazaar, Lahore, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-[16px] mb-1">Phone & WhatsApp</h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed flex flex-col gap-1">
                    <a href="tel:+923202220001" className="hover:text-primary transition-colors">+92 320 2220001</a>
                    <a href="https://wa.me/923202220001" className="hover:text-green-500 transition-colors flex items-center gap-1"><MessageCircle size={14} /> WhatsApp Us</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-[16px] mb-1">Email Address</h4>
                  <a href="mailto:support@nazirandsons.shop" className="text-gray-500 text-[14px] hover:text-primary transition-colors">
                    support@nazirandsons.shop
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-[16px] mb-1">Business Hours</h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed">
                    Monday - Saturday: 10:00 AM - 7:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-7"
        >
          <div className="glass-panel bg-white p-8 md:p-10 rounded-[32px] border border-white/60 shadow-glass">
            <h3 className="text-2xl font-bold text-secondary mb-2 font-serif italic">Send us a Message</h3>
            <p className="text-gray-500 text-[14px] mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>
            
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subject</label>
                <input type="text" placeholder="How can we help you?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <textarea rows="5" placeholder="Write your message here..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm resize-none"></textarea>
              </div>

              <button className="bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 self-start mt-2">
                Submit Message
              </button>
            </form>
          </div>
        </motion.div>
        
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-12 mt-4"
        >
          <div className="rounded-[32px] overflow-hidden shadow-glass border border-white/60 h-[400px] relative">
            <iframe 
              src="https://maps.google.com/maps?q=Nazir%20and%20Sons%20Paper,%20Lahore&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-multiply"
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none flex flex-col justify-end p-8">
              <h3 className="text-white text-2xl font-bold font-serif italic mb-1">Visit our Store</h3>
              <p className="text-white/80 text-sm">Experience the quality of our premium paper in person.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
};

export default ContactUs;
