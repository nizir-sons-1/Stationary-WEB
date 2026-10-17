import React from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="w-full h-full animate-page-transition"
    >
      {children}
    </div>
  );
};

export default PageTransition;
