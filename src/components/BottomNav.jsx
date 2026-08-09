import React from 'react';
import { Home, Grid, Calculator, ShoppingCart, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50 flex justify-around items-center h-16 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-all duration-300">
      <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 p-2 min-w-[44px] min-h-[44px] transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-secondary'}`}>
        <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="font-sans text-[10px] tracking-wide font-bold">Home</span>
      </Link>
      <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full gap-1 p-2 min-w-[44px] min-h-[44px] transition-colors ${isActive('/shop') ? 'text-primary' : 'text-gray-400 hover:text-secondary'}`}>
        <Grid size={22} strokeWidth={isActive('/shop') ? 2.5 : 2} />
        <span className="font-sans text-[10px] tracking-wide font-bold">Shop</span>
      </Link>
      <Link to="/calculator" className={`flex flex-col items-center justify-center w-full h-full gap-1 p-2 min-w-[44px] min-h-[44px] transition-colors ${isActive('/calculator') ? 'text-primary' : 'text-gray-400 hover:text-secondary'}`}>
        <Calculator size={22} strokeWidth={isActive('/calculator') ? 2.5 : 2} />
        <span className="font-sans text-[10px] tracking-wide font-bold">Calc</span>
      </Link>
      <Link to="/reviews" className={`flex flex-col items-center justify-center w-full h-full gap-1 p-2 min-w-[44px] min-h-[44px] transition-colors ${isActive('/reviews') ? 'text-primary' : 'text-gray-400 hover:text-secondary'}`}>
        <Star size={22} strokeWidth={isActive('/reviews') ? 2.5 : 2} />
        <span className="font-sans text-[10px] tracking-wide font-bold">Reviews</span>
      </Link>
      <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full gap-1 p-2 min-w-[44px] min-h-[44px] relative transition-colors ${isActive('/cart') ? 'text-primary' : 'text-gray-400 hover:text-secondary'}`}>
        <ShoppingCart size={22} strokeWidth={isActive('/cart') ? 2.5 : 2} />
        <span className="font-sans text-[10px] tracking-wide font-bold">Cart</span>
        {cartCount > 0 && <span className="absolute top-1.5 right-[18%] bg-primary text-white text-[9px] font-bold w-[16px] h-[16px] flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>}
      </Link>
    </nav>
  );
};

export default BottomNav;
