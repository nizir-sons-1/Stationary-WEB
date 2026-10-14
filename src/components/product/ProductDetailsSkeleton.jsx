import React from 'react';

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 aspect-[4/3] bg-gray-100 rounded-2xl"></div>
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-5 bg-gray-200 w-24 rounded-full"></div>
          <div className="h-8 bg-gray-200 w-3/4 rounded-lg"></div>
          <div className="h-4 bg-gray-100 w-full rounded"></div>
          <div className="h-36 bg-gray-50 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsSkeleton;
