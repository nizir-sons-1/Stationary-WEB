import React from 'react';
import { Link } from 'react-router-dom';

export function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
      <Link to="/shop" className="mt-4 text-primary font-bold hover:underline">
        Back to Shop
      </Link>
    </div>
  );
}

export default ProductNotFound;
