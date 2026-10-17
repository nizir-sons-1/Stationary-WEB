import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const handleExploreDepartments = (e) => {
    e.preventDefault();
    const target = document.getElementById('departments');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/shop';
    }
  };

  return (
    <section id="hero-section" className="relative w-full -mt-[64px] md:-mt-[68px] pt-[64px] md:pt-[68px] min-h-[500px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[640px] flex items-center overflow-hidden bg-[#f5f2eb]">
      {/* 
        Full Original Banner Image (No cut, no gradient mask)
        Positioned to show the full paper reams, canvas book, and supplies on the right
      */}
      <picture className="absolute inset-0 w-full h-full select-none pointer-events-none">
        <source srcSet="/images/hero-banner.avif" type="image/avif" />
        <source srcSet="/images/hero-banner.webp" type="image/webp" />
        <img
          src="/images/hero-banner.webp"
          alt="Everything for paper, print & creativity - Nazir & Sons"
          width={1600}
          height={900}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-[55%_center] sm:object-[70%_center] lg:object-center select-none pointer-events-none"
        />
      </picture>

      {/* Subtle readability gradient for mobile screens: soft warm wash on mobile, horizontal fade on desktop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#f5f2eb]/92 via-[#f5f2eb]/78 to-[#f5f2eb]/35 sm:bg-gradient-to-r sm:from-[#f5f2eb]/90 sm:via-[#f5f2eb]/70 sm:to-transparent lg:from-transparent lg:via-transparent lg:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Text & Actions Layer */}
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-8 sm:py-10 md:py-12">
        <div className="max-w-[480px] lg:max-w-[520px] flex flex-col items-start text-left">

          {/* Eyebrow / Tagline */}
          <p className="text-[11px] sm:text-[12px] font-bold text-[#334155] uppercase tracking-[0.2em] mb-3 font-sans">
            PREMIUM PAPER &amp; CREATIVE SUPPLIES
          </p>

          {/* Editorial Serif Headline */}
          <h1 className="font-serif text-[34px] sm:text-[40px] md:text-[46px] lg:text-[50px] font-normal text-[#112338] leading-[1.1] tracking-tight mb-3.5">
            Everything for <br />
            paper, print &amp; <br />
            creativity.
          </h1>

          {/* Description (Prominent & Clear) */}
          <p className="text-[15px] sm:text-[16px] md:text-[17px] text-[#0f172a] font-medium leading-[1.65] max-w-[460px] mb-8 sm:mb-10 font-sans drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            Quality paper and creative supplies, selected for makers, studios,
            schools and businesses across Pakistan.
          </p>

          {/* Dual CTAs (Shop Collection & Explore Departments) */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto pt-1">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-[#112338] hover:bg-[#1a3654] text-white px-6 py-3 rounded-[4px] font-semibold text-[14px] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] group font-sans cursor-pointer"
            >
              <span>Shop Collection</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <button
              type="button"
              onClick={handleExploreDepartments}
              className="inline-flex items-center justify-center px-6 py-3 rounded-[4px] font-semibold text-[14px] text-[#112338] border-[1.5px] border-[#112338]/70 hover:border-[#112338] bg-white/80 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none hover:bg-black/[0.04] transition-all duration-200 active:scale-[0.99] font-sans cursor-pointer"
            >
              Explore Departments
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
