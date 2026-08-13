import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import { usePageSeo } from '../lib/seo';
import { itemListSchema } from '../lib/schema';
import { DEPARTMENT_NAMES, categoryPath } from '../lib/site';

// Below the fold, and the only thing on this route that needs framer-motion.
// Splitting it keeps the animation library off the first-paint critical path.
const CategoryCards = lazy(() => import('../components/CategoryCards'));

// The five shelves, stated as data so a crawler that never reaches the
// department grid still learns what the shop is divided into.
const DEPARTMENT_LIST = itemListSchema({
  name: 'Nazir & Sons departments',
  path: '/',
  items: DEPARTMENT_NAMES.map((name) => ({ name, path: categoryPath(name) })),
});

const Home = () => {
  usePageSeo('/', { extraNodes: [DEPARTMENT_LIST] });

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
