import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Utility to split text on whitespace without breaking HTML structures if possible,
// but since we only need text, we'll iterate over elements marked data-split.
// Removed unused splitTextToSpans function

const Hero = () => {
  const containerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const ctaContainerRef = useRef(null);
  const imageRef = useRef(null);
  const badgeRef = useRef(null);
  const descRef = useRef(null);

  const headlineText = "Your Ultimate Creative & Stationery Hub".split(" ");

  useEffect(() => {
    // Determine if it's the first time loading to sync with Preloader
    const isFirstLoad = !sessionStorage.getItem('site_loaded');
    const delayTime = isFirstLoad ? 3.7 : 0.1;
    sessionStorage.setItem('site_loaded', 'true');

    // Lock scrolling initially if it's the first load, else don't lock
    if (isFirstLoad) {
      document.body.style.overflow = 'hidden';
    }

    const ctx = gsap.context(() => {
      const headlineTargets = gsap.utils.toArray('.split-word');

      // Master Timeline
      const tl = gsap.timeline({
        delay: delayTime, 
        onComplete: () => {
          document.body.style.overflow = ''; // Release scroll
        }
      });

      // If it's the first load, we add a slight 0.6s stagger offset. 
      // If not, we start immediately at 0s so there's no delay when returning to home.
      const startTime = isFirstLoad ? 0.6 : 0;
      const animSpeed = isFirstLoad ? 1 : 0.6; // slightly faster animation on return

      // Choreography using .from() so default state is always visible if JS fails
      if (ctaContainerRef.current) {
        tl.from(ctaContainerRef.current.children, {
          y: 26, opacity: 0, stagger: 0.05, ease: 'power3.out', duration: 0.6 * animSpeed
        }, startTime);
      }
      
      if (headlineTargets.length) {
        tl.from(headlineTargets, {
          yPercent: 110, duration: 0.8 * animSpeed, stagger: 0.04, ease: 'power3.out'
        }, startTime + 0.05);
      }
      
      tl.from([descRef.current, imageRef.current, badgeRef.current], {
        y: 44, opacity: 0, stagger: 0.08, ease: 'power3.out', duration: 0.7 * animSpeed
      }, startTime + 0.2);
      
      if (eyebrowRef.current) {
        tl.from(eyebrowRef.current, {
          opacity: 0, duration: 0.6 * animSpeed
        }, startTime + 0.25);
      }

      // Antigravity Floating animation
      gsap.to('.float-element', {
        y: -20,
        rotationZ: 'random(-2, 2)',
        duration: 3.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.6,
          from: 'random'
        }
      });

      // Parallax Backgrounds
      gsap.to('.parallax-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full min-h-[85vh] flex items-center bg-[#fafaf9] pt-40 pb-8 overflow-hidden font-sans">

      <div className="px-margin-mobile md:px-gutter max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div ref={eyebrowRef} className="inline-flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-primary" />
            <span className="text-[14px] md:text-[16px] font-bold text-gray-800">
              Glow with Confidence, Shop with Trust
            </span>
          </div>

          <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-bold text-secondary leading-[1.06] mb-6 block">
            {headlineText.map((word, i) => (
              <React.Fragment key={i}>
                <span className="inline-block overflow-hidden align-top pb-[0.35em] -mb-[0.35em] px-[0.05em]">
                  <span className={`split-word inline-block will-change-transform ${word === 'Creative' ? 'text-primary relative' : ''}`}>
                    {word}
                    {word === 'Creative' && (
                      <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-auto text-orange-200 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" />
                      </svg>
                    )}
                  </span>
                </span>
                {i < headlineText.length - 1 && ' '}
              </React.Fragment>
            ))}
          </h1>

          <p ref={descRef} className="text-[16px] md:text-[18px] text-gray-500 mb-10 max-w-lg font-body-lg">
            Discover premium fine arts materials, aesthetic stationery, and high-quality paper. Elevate your creative journey today.
          </p>

          <div ref={ctaContainerRef} className="flex items-center gap-6">
            <Link
              to="/shop"
              className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-[15px] hover:bg-secondary/90 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link
              to="/categories"
              className="text-secondary font-bold text-[15px] hover:text-primary transition-colors underline underline-offset-4"
            >
              View All Products
            </Link>
          </div>
        </div>

        {/* Right Content / Hero Image (Antigravity 3D Carousel) */}
        <div className="relative flex justify-center items-center h-[400px] md:h-[550px] perspective-1000 preserve-3d w-full">

          {/* Circular organic background shapes with parallax (optimized) */}
          <div className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full opacity-60 -z-10" style={{ background: 'radial-gradient(circle, rgba(254,215,170,0.6) 0%, transparent 60%)' }}></div>
          <div className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-3/4 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full opacity-60 -z-10" data-speed="0.8" style={{ background: 'radial-gradient(circle, rgba(191,219,254,0.6) 0%, transparent 60%)' }}></div>

          {/* 3D Tilted Continuous Carousel */}
          <div ref={imageRef} className="relative z-10 w-full h-[500px] md:h-[700px] preserve-3d flex justify-center items-center overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
            <div className="w-full flex justify-center preserve-3d" style={{ transform: 'rotateX(15deg) rotateY(-20deg) rotateZ(5deg)' }}>
              
              <div className="flex flex-col gap-6 md:gap-8 animate-marquee-vertical hover:[animation-play-state:paused] preserve-3d pt-8">
                {[
                  { src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", alt: "Art Supplies Hub" },
                  { src: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80", alt: "Premium Notebooks" },
                  { src: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80", alt: "Pens & Brushes" },
                  // Duplicated for seamless infinite loop
                  { src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", alt: "Art Supplies Hub" },
                  { src: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80", alt: "Premium Notebooks" },
                  { src: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80", alt: "Pens & Brushes" }
                ].map((img, i) => (
                  <div key={i} className="float-element w-[240px] md:w-[320px] rounded-2xl overflow-hidden glass-panel shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[2px] border-white/80 p-2 md:p-3 bg-white/40 backdrop-blur-xl preserve-3d" style={{ transform: 'translateZ(40px)' }}>
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
                      <img src={img.src} alt={img.alt} className="w-full h-auto object-cover aspect-[4/5] hover:scale-110 transition-transform duration-700 ease-in-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Floating Badge */}
          <div ref={badgeRef} className="float-element absolute z-40 top-[15%] left-[5%] md:-left-[5%] glass-panel p-3 md:p-4 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex items-center gap-3 border border-white/70 bg-white/80 backdrop-blur-md" style={{ transform: 'translateZ(160px)' }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-inner">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <div className="pr-3">
              <p className="text-[13px] md:text-[14px] font-black text-secondary uppercase tracking-widest leading-tight">Premium<br />Quality</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
