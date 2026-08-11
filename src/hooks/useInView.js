import { useEffect, useState } from 'react';

/**
 * True while the observed element is on (or near) the screen.
 *
 * An infinite CSS animation or a requestAnimationFrame loop does not stop
 * costing frames just because its element scrolled out of view — the compositor
 * keeps advancing it, and the loop keeps waking the main thread. Gating those
 * on this hook lets an off-screen marquee or carousel go completely idle, which
 * is what leaves the frame budget free for the part of the page you are
 * actually looking at.
 *
 * Starts `true` and stays `true` where IntersectionObserver is unavailable, so
 * the worst case is today's behaviour rather than an animation that never runs.
 */
export function useInView(ref, { rootMargin = '200px' } = {}) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

export default useInView;
