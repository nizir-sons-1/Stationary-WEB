import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { BUSINESS, DEPARTMENT_NAMES, categoryPath } from '../lib/site';

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0a0a0a] text-white pt-20 pb-[calc(30px+80px)] md:pb-8 font-sans border-t border-white/10">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        
        {/* Top Section: Newsletter & Branding */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20 mb-16">
          
          {/* Brand */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Link className="flex items-baseline gap-1.5 group" to="/">
              <span className="font-serif text-[28px] md:text-[36px] font-bold text-white tracking-widest leading-none group-hover:text-primary transition-colors duration-500">
                NAZIR
              </span>
              <span className="font-serif text-[26px] md:text-[34px] font-medium text-primary italic leading-none">
                & SONS
              </span>
            </Link>
            <p className="text-gray-400 font-body-sm leading-relaxed">
              Your ultimate destination for premium fine arts, aesthetics, stationery, and high-quality paper. Elevating creativity since inception.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              <a href="tel:+923202220001" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4 w-full lg:w-auto flex-1 max-w-md">
            <h3 className="text-[18px] font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Join our Creative Hub
            </h3>
            <p className="text-gray-400 text-[14px]">Subscribe to our newsletter for exclusive offers, updates, and artistic inspiration.</p>
            <div className="relative mt-2 group">
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.elements.newsletter_email.value;
                if (email) {
                  window.open(`https://wa.me/923202220001?text=${encodeURIComponent(`Hi, I'd like to subscribe to your newsletter. My email: ${email}`)}`, '_blank');
                  e.target.reset();
                }
              }}>
                <input 
                  name="newsletter_email"
                  type="email" 
                  required
                  placeholder="Enter your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors duration-300"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-orange-500 text-white font-bold text-[13px] px-4 md:px-6 rounded-full flex items-center gap-2 transition-colors duration-300 shadow-[0_4px_14px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_20px_rgba(234,88,12,0.5)]">
                  Subscribe <ArrowRight size={14} className="hidden sm:block" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pt-12 border-t border-white/10">
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Shop Departments</h4>
            {/* Real hrefs, not router state. These four links are the site's
                main path into the catalogue, and a crawler can only follow
                what is in the href. */}
            {DEPARTMENT_NAMES.map((name) => (
              <Link
                key={name}
                to={categoryPath(name)}
                className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit"
              >
                {name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Customer Service</h4>
            <Link to="/contact" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Contact Us</Link>
            <Link to="/faq" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">FAQ</Link>
            <Link to="/track-order" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Track Order</Link>
            <Link to="/shipping" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Shipping Policy</Link>
            <Link to="/returns" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Returns & Refunds</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">About Us</h4>
            <Link to="/about" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Our Story</Link>
            <Link to="/careers" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Careers</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Terms of Service</Link>
          </div>

          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Contact Info</h4>
            <div className="flex items-start gap-3 text-gray-400 text-[14px]">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                {/* Same strings the LocalBusiness schema emits — local search
                    ranks on the name, address and phone agreeing everywhere. */}
                <span>Nazir &amp; Sons Paper, {BUSINESS.street}, {BUSINESS.city}</span>
                <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white text-[12px] font-bold underline underline-offset-2 transition-colors">
                  View in Google Maps
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-[14px]">
              <Phone size={16} className="text-primary shrink-0" />
              <div className="flex flex-wrap items-center gap-4">
                <a href={`tel:${BUSINESS.phoneE164}`} className="hover:text-primary transition-colors">{BUSINESS.phone}</a>
                <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-[14px]">
              <Mail size={16} className="text-primary shrink-0" />
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-primary transition-colors">{BUSINESS.email}</a>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 text-gray-500 text-[12px]">
          <p>&copy; {new Date().getFullYear()} NAZIR & SONS. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Crafted with</span>
            <Sparkles size={12} className="text-primary" />
            <span>by Nexsol</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
