import React from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import CategoryCards from '../components/CategoryCards';

const Home = () => {
  return (
    <>
      <Hero />
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg">
        <TrustStats />
        <CategoryCards />
      </main>
    </>
  );
};

export default Home;
