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
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-md"
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

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[12px] mb-2 opacity-90">Contact Info</h4>
            <div className="flex items-start gap-3 text-gray-400 text-[14px]">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <span>123 Creative Street, Art District, Lahore, Pakistan</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-[14px]">
              <Phone size={16} className="text-primary shrink-0" />
              <span>+92 300 1234567</span>
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
            <span>by Antigravity</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
