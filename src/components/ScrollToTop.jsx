import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // `html { scroll-behavior: smooth }` would otherwise animate this, so every
    // route change would spend a second gliding to the top of a page you have
    // already navigated away from. Route jumps should be instant; only anchors
    // and explicit in-page scrolls get the glide.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
