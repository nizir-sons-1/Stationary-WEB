import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';

// Below the fold, and the only thing on this route that needs framer-motion.
// Splitting it keeps the animation library off the first-paint critical path.
const CategoryCards = lazy(() => import('../components/CategoryCards'));

const Home = () => {
  return (
    <>
      <Hero />
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg">
        <TrustStats />
        {/* min-height matches the loaded section so the page doesn't jump. */}
        <Suspense fallback={<div className="min-h-[420px]" aria-hidden="true" />}>
          <CategoryCards />
        </Suspense>
      </main>
    </>
  );
};

export default Home;
