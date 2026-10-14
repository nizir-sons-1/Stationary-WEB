import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function EmptyCartView() {
  return (
    <div className="flex-grow pt-32 md:pt-40 pb-stack-lg px-margin-mobile md:px-gutter max-w-container-max w-full mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <MessageCircle size={40} className="text-gray-300" />
      </div>
      <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Your Cart is Empty</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 text-center max-w-md">Looks like you haven't added anything yet. Browse our premium stock to find what you need.</p>
      <Link to="/shop" className="bg-[#111111] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary transition-colors shadow-lg hover:-translate-y-1">
        Start Shopping
      </Link>
    </div>
  );
}
