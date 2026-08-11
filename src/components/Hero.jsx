import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Unlock } from 'lucide-react';

// How long the intro overlay owns the screen (Preloader DURATION + EXIT).
const INTRO_MS = 1550;

const CAROUSEL = [
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Art Supplies Hub' },
  { src: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80', alt: 'Premium Notebooks' },
  { src: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80', alt: 'Pens & Brushes' },
];
// Duplicated so the vertical marquee loops seamlessly.
const CAROUSEL_LOOP = [...CAROUSEL, ...CAROUSEL];

const Hero = () => {
  const containerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const ctaContainerRef = useRef(null);
  const imageRef = useRef(null);
  const badgeRef = useRef(null);
  const descRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isInteracting = useRef(false);
  const [isLocked, setIsLocked] = useState(true);

  const headlineText = "Your Ultimate Paper & Stationery Hub".split(" ");

  useEffect(() => {
    let animationFrameId;
    const autoScroll = () => {
      if (isLocked && !isInteracting.current && scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollTop += 0.8;
        // Seamless loop (approximate)
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
          el.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };
    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLocked]);

  useEffect(() => {
    // Wait for the intro only while the intro is actually on screen. This reads
    // the flag the Preloader owns rather than a second "site_loaded" key: with
    // two independent flags, landing on /shop first and then navigating home
    // left the hero delayed and the page unscrollable for 1.5s with no overlay
    // visible to explain it.
    let introRunning = false;
    try {
      introRunning = sessionStorage.getItem('preloader_done') !== 'true';
    } catch {
      /* storage unavailable — assume no intro and animate immediately */
    }

    // The intro overlay covers the page, so hide the scrollbar while it does.
    // The release is scheduled unconditionally, never gated on an animation
    // callback — a gsap failure must not leave the page permanently unscrollable.
    let releaseScroll;
    if (introRunning) {
      document.body.style.overflow = 'hidden';
      releaseScroll = setTimeout(() => {
        document.body.style.overflow = '';
      }, INTRO_MS);
    }

    // gsap + ScrollTrigger is ~70 kB that the first paint does not need. The
    // markup is styled to its final state and every tween is a `.from()`, so
    // loading the library after paint costs nothing visually.
    let ctx;
    let cancelled = false;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const headlineTargets = gsap.utils.toArray('.split-word');
          const startTime = introRunning ? INTRO_MS / 1000 : 0;
          const animSpeed = introRunning ? 1 : 0.6;

          const tl = gsap.timeline();

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
            tl.from(eyebrowRef.current, { opacity: 0, duration: 0.6 * animSpeed }, startTime + 0.25);
          }

          // Parallax only ticks while the user scrolls, unlike the old infinite
          // float tween — that one is a pure CSS animation now.
          gsap.to('.parallax-bg', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }, containerRef);
      }
    );

    return () => {
      cancelled = true;
      ctx?.revert();
      clearTimeout(releaseScroll);
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
                  <span className={`split-word inline-block will-change-transform ${word === 'Paper' ? 'text-primary relative' : ''}`}>
                    {word}
                    {word === 'Paper' && (
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
          </div>
        </div>

        {/* Right Content / Hero Image (Antigravity 3D Carousel) */}
        <div className="relative flex justify-center items-center h-[400px] md:h-[550px] perspective-1000 preserve-3d w-full">

          {/* Circular organic background shapes with parallax (optimized) */}
          <div className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full opacity-60 -z-10" style={{ background: 'radial-gradient(circle, rgba(254,215,170,0.6) 0%, transparent 60%)' }}></div>
          <div className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-3/4 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full opacity-60 -z-10" data-speed="0.8" style={{ background: 'radial-gradient(circle, rgba(191,219,254,0.6) 0%, transparent 60%)' }}></div>

          {/* 3D Tilted Scrollable Carousel */}
          <div ref={imageRef} className="relative z-10 w-full h-[500px] md:h-[700px] preserve-3d flex justify-center items-center overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
            
            {/* Scroll Lock Toggle */}
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-50 bg-white/80 backdrop-blur-md border border-white/50 p-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] text-secondary hover:bg-white hover:scale-110 transition-all duration-300 pointer-events-auto flex items-center justify-center"
              title={isLocked ? "Unlock to scroll manually" : "Lock to auto-scroll"}
            >
              {isLocked ? <Lock size={20} className="text-gray-500" /> : <Unlock size={20} className="text-primary" />}
            </button>

            <div className={`w-full h-full flex justify-center preserve-3d transition-all duration-500 ${isLocked ? 'pointer-events-none' : 'pointer-events-auto'}`} style={{ transform: 'rotateX(15deg) rotateY(-20deg) rotateZ(5deg)' }}>
              
              <div 
                ref={scrollContainerRef}
                onMouseEnter={() => { if(!isLocked) isInteracting.current = true; }}
                onMouseLeave={() => { if(!isLocked) isInteracting.current = false; }}
                onTouchStart={() => { if(!isLocked) isInteracting.current = true; }}
                onTouchEnd={() => { if(!isLocked) isInteracting.current = false; }}
                className={`flex flex-col items-center gap-6 md:gap-8 preserve-3d py-[20%] overflow-y-auto h-[150%] w-full ${isLocked ? '' : 'cursor-grab active:cursor-grabbing'}`} 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`
                  div::-webkit-scrollbar { display: none; }
                `}</style>
                {CAROUSEL_LOOP.map((img, i) => (
                  <div
                    key={i}
                    className="shrink-0 animate-float motion-reduce:animate-none w-[240px] md:w-[320px] rounded-2xl overflow-hidden glass-panel shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[2px] border-white/80 p-2 md:p-3 bg-white/40 backdrop-blur-xl preserve-3d"
                    style={{
                      '--float-z': '40px',
                      '--float-tilt': `${(i % 2 === 0 ? 1 : -1) * 1.5}deg`,
                      animationDelay: `${(i % 3) * 0.6}s`,
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
                      <img
                        src={img.src}
                        alt={img.alt}
                        width={320}
                        height={400}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'low'}
                        decoding="async"
                        className="w-full h-auto object-cover aspect-[4/5] hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/*
            Two layers on purpose: gsap animates the outer element on entrance,
            the CSS float owns the inner one. Sharing a single element would let
            the CSS animation clobber gsap's inline transform.
          */}
          <div ref={badgeRef} className="absolute z-40 top-[15%] left-[5%] md:-left-[5%]">
            <div
              className="animate-float motion-reduce:animate-none glass-panel p-3 md:p-4 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex items-center gap-3 border border-white/70 bg-white/80 backdrop-blur-md"
              style={{ '--float-z': '160px', '--float-tilt': '-1.5deg' }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-inner">
                <Sparkles size={18} fill="currentColor" />
              </div>
              <div className="pr-3">
                <p className="text-[13px] md:text-[14px] font-black text-secondary uppercase tracking-widest leading-tight">Premium<br />Quality</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
