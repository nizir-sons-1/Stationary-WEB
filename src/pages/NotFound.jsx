import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Big 404 */}
      <h1 className="text-[120px] md:text-[180px] font-black text-gray-100 leading-none select-none mb-[-20px] md:mb-[-40px]">
        404
      </h1>

      <div className="relative z-10">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
          <Home size={28} className="text-primary" />
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold text-secondary mb-4 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/shop"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-secondary font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Browse Shop
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-primary transition-colors shadow-lg flex items-center gap-2"
          >
            <Home size={16} /> Homepage
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
