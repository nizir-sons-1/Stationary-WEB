import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Paperclip, Ruler } from 'lucide-react';

/*
 * The intro used to hold the page hostage for 3.5s, then spend another 1.2s on
 * an exit transition — nearly five seconds before anyone could see the shop.
 * It now runs for just over a second, animates entirely on the compositor
 * (no framer-motion on the critical path), and drives the percentage counter
 * straight to the DOM so it doesn't re-render React ~28 times a second.
 */
const DURATION = 1100;
const EXIT = 450;

const COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-400'];

// Deterministic pseudo-random layout: no Math.random(), so the markup is stable
// across renders and identical for every visitor.
const rand = (seed) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const drops = Array.from({ length: 8 }, (_, i) => ({
  id: `drop-${i}`,
  left: `${rand(i + 1) * 90 + 5}%`,
  width: `${rand(i + 11) * 10 + 5}px`,
  height: `${rand(i + 21) * 40 + 20}px`,
  delay: `${rand(i + 31) * 0.9}s`,
  duration: `${rand(i + 41) * 1.2 + 1.2}s`,
  color: COLORS[Math.floor(rand(i + 51) * COLORS.length)],
}));

const papers = Array.from({ length: 4 }, (_, i) => ({
  id: `paper-${i}`,
  left: `${rand(i + 61) * 80 + 10}%`,
  size: rand(i + 71) * 30 + 30,
  delay: `${rand(i + 81) * 0.8}s`,
  duration: `${rand(i + 91) * 1.5 + 2}s`,
  rotate: rand(i + 101) * 360,
}));

const stationeries = [Pencil, Paperclip, Ruler].map((Icon, i) => ({
  id: `stat-${i}`,
  Icon,
  left: `${rand(i + 111) * 80 + 10}%`,
  delay: `${rand(i + 121) * 0.7}s`,
  duration: `${rand(i + 131) * 1.5 + 1.8}s`,
  rotate: rand(i + 141) * 360,
}));

const seen = () => {
  try {
    return sessionStorage.getItem('preloader_done') === 'true';
  } catch {
    // Private-mode Safari throws on sessionStorage; never let that break boot.
    return true;
  }
};

const Preloader = () => {
  const [phase, setPhase] = useState(() => (seen() ? 'gone' : 'visible'));
  const counterRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (phase !== 'visible') return;

    let raf = 0;
    const start = performance.now();

    const tick = (now) => {
      const pct = Math.min(Math.round(((now - start) / DURATION) * 100), 100);
      if (counterRef.current) counterRef.current.textContent = `${pct}%`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const toExit = setTimeout(() => {
      try {
        sessionStorage.setItem('preloader_done', 'true');
      } catch {
        /* storage unavailable — the intro simply replays next navigation */
      }
      setPhase('exiting');
    }, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(toExit);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = setTimeout(() => setPhase('gone'), EXIT);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  const exiting = phase === 'exiting';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden motion-reduce:animate-none"
      style={{
        perspective: 1000,
        transition: `opacity ${EXIT}ms cubic-bezier(0.83, 0, 0.17, 1), transform ${EXIT}ms cubic-bezier(0.83, 0, 0.17, 1)`,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(2.4)' : 'scale(1)',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* Falling colours (Fine Arts) */}
      {drops.map((drop) => (
        <span
          key={drop.id}
          className={`absolute top-0 rounded-full animate-fall ${drop.color}`}
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}

      {/* Falling papers */}
      {papers.map((paper) => (
        <div
          key={paper.id}
          className="absolute top-0 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08)] border border-gray-100 rounded-sm animate-fall"
          style={{
            left: paper.left,
            width: `${paper.size}px`,
            height: `${paper.size * 1.4}px`,
            animationDelay: paper.delay,
            animationDuration: paper.duration,
            '--fall-from': `${paper.rotate}deg`,
            '--fall-to': `${paper.rotate + 180}deg`,
          }}
        >
          <div className="w-full h-full p-2 flex flex-col gap-1 opacity-20">
            <div className="w-full h-px bg-blue-400" />
            <div className="w-full h-px bg-gray-400" />
            <div className="w-full h-px bg-gray-400" />
          </div>
        </div>
      ))}

      {/* Falling stationery */}
      {stationeries.map(({ id, Icon, left, delay, duration, rotate }) => (
        <div
          key={id}
          className="absolute top-0 text-gray-400 animate-fall"
          style={{
            left,
            animationDelay: delay,
            animationDuration: duration,
            '--fall-from': `${rotate}deg`,
            '--fall-to': `${rotate - 180}deg`,
          }}
        >
          <Icon size={28} />
        </div>
      ))}

      {/* Central logo reveal */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="absolute w-48 h-48 rounded-full -z-10 opacity-60 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,237,213,1) 0%, transparent 60%)' }}
        />
        <div
          className="absolute w-56 h-56 rounded-full -z-10 translate-x-10 opacity-60 animate-spin-slow-reverse"
          style={{ background: 'radial-gradient(circle, rgba(219,234,254,1) 0%, transparent 60%)' }}
        />

        <div className="overflow-hidden mb-2">
          <h2 className="text-[32px] md:text-[48px] font-serif font-black text-secondary tracking-widest flex items-center gap-3 animate-rise-in">
            NAZIR <span className="text-primary italic font-medium">&amp; SONS</span>
          </h2>
        </div>

        <p
          className="text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold animate-pop-in"
          style={{ animationDelay: '0.15s' }}
        >
          Colors of Creativity
        </p>

        <div className="w-[180px] h-[4px] bg-gray-100 rounded-full overflow-hidden mt-8 shadow-inner">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 rounded-full"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        <div
          ref={counterRef}
          className="text-gray-400 font-bold text-[14px] font-sans tracking-widest mt-4 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          0%
        </div>
      </div>
    </div>
  );
};

export default Preloader;
