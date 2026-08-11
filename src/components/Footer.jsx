import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowRight, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0a0a0a] text-white pt-20 pb-[calc(30px+80px)] md:pb-8 font-sans border-t border-white/10">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen"></div>
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
              <a href="#" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.6l.4-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 hover:shadow-antigravity transition-all duration-300 preserve-3d">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
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
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors duration-300"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-orange-500 text-white font-bold text-[13px] px-4 md:px-6 rounded-full flex items-center gap-2 transition-colors duration-300 shadow-[0_4px_14px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_20px_rgba(234,88,12,0.5)]">
                Subscribe <ArrowRight size={14} className="hidden sm:block" />
              </button>
            </div>
          </div>

        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pt-12 border-t border-white/10">
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Shop Departments</h4>
            <Link to="/shop" state={{ mainCategory: 'Fine Arts' }} className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Fine Arts</Link>
            <Link to="/shop" state={{ mainCategory: 'Stationery' }} className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Stationery</Link>
            <Link to="/shop" state={{ mainCategory: 'Paper & Canvas' }} className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Paper & Canvas</Link>
            <Link to="/shop" state={{ mainCategory: 'Accessories' }} className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Accessories</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Customer Service</h4>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Contact Us</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Track Order</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Shipping Policy</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Returns & Refunds</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">About Us</h4>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Our Story</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Careers</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300 text-[14px] w-fit">Terms of Service</a>
          </div>

          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Contact Info</h4>
            <div className="flex items-start gap-3 text-gray-400 text-[14px]">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <span>Nazir & Sons Paper, Lahore paper market, Abkari Road, Anarkali Bazaar, Lahore</span>
                <a href="https://maps.google.com?q=Nazir%20and%20Sons%20Paper,%20Lahore%20paper%20market,%20Abkari%20Road,%20Anarkali%20Bazaar%20Lahore&ftid=0x39191b00195674b9:0xa86214db65adc697&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,47071704,94218641,94282134,100813469,94286869,100820247,100822499&g_st=iw" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white text-[12px] font-bold underline underline-offset-2 transition-colors">
                  View in Google Maps
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-[14px]">
              <Phone size={16} className="text-primary shrink-0" />
              <div className="flex flex-wrap items-center gap-4">
                <a href="tel:+923202220001" className="hover:text-primary transition-colors">+92 320 2220001</a>
                <a href="https://wa.me/923202220001" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-[14px]">
              <Mail size={16} className="text-primary shrink-0" />
              <span>support@nazirsons.com</span>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 text-gray-500 text-[12px]">
          <p>© 2024 NAZIR & SONS. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Crafted with</span>
            <Sparkles size={12} className="text-primary animate-pulse" />
            <span>by Nexsol</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
