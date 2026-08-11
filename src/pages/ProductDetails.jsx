import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Truck, ShieldCheck, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useSupabase';
import TermsModal from '../components/TermsModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1596484552993-9c878e11a37c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const ProductDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const decodedName = decodeURIComponent(name);
  
  const { product: currentProduct, loading } = useProduct(decodedName);

  // Map Supabase product_variations to the expected format
  const productVariations = useMemo(() => {
    if (!currentProduct || !currentProduct.product_variations) return [];
    return currentProduct.product_variations.map(v => ({
      PRODUCT_NAME: currentProduct.product_name,
      Description: currentProduct.description,
      Category: currentProduct.category,
      ProductID: v.id,
      Display_Size: v.size,
      GSM: String(v.gsm),
      CALCULATED_PRICE_RS: v.price,
      PACKING_TYPE: v.packing_type,
      Stock: v.stock,
      IMAGE_URL: v.image_url || currentProduct.image_url
    }));
  }, [currentProduct]);

  const [selectedSize, setSelectedSize] = useState('');
  
  // Initialize Size when product loads
  React.useEffect(() => {
    if (productVariations.length > 0 && !selectedSize) {
      const p = productVariations[0];
      setSelectedSize(p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A'));
    }
  }, [productVariations, selectedSize]);

  const availableGsms = useMemo(() => {
    if (!selectedSize || productVariations.length === 0) return [];
    const gsms = productVariations.filter(p => {
      const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A');
      return pSize === selectedSize;
    }).map(p => p.GSM).filter(Boolean);
    return [...new Set(gsms)].sort((a, b) => Number(a) - Number(b));
  }, [productVariations, selectedSize]);

  const [selectedGsm, setSelectedGsm] = useState(() => availableGsms[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkNote, setBulkNote] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState('3 Months');
  const [showTerms, setShowTerms] = useState(false);

  // Handle GSM auto-select when size changes
  React.useEffect(() => {
    if (availableGsms.length > 0 && !availableGsms.includes(selectedGsm)) {
      setSelectedGsm(availableGsms[0]);
    }
  }, [availableGsms, selectedGsm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-container-max mx-auto px-margin-mobile md:px-gutter py-8 animate-pulse">
        <div className="w-full aspect-[4/3] lg:aspect-square bg-gray-200 rounded-[32px] mb-8"></div>
        <div className="h-10 bg-gray-200 w-3/4 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 w-1/2 rounded-lg"></div>
      </div>
    );
  }

  if (productVariations.length === 0 || !currentProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link to="/shop" className="mt-4 text-primary hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const currentVariation = productVariations.find(p => {
    const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A');
    return p.GSM === selectedGsm && pSize === selectedSize;
  }) || productVariations[0];

  const inStock = Number(currentVariation.Stock) > 0;
  const price = Number(currentVariation.CALCULATED_PRICE_RS) || 0;
  const totalPrice = price * quantity;

  const handleAddToCart = () => {
    if (isInstallment) {
      setShowTerms(true);
      return;
    }
    executeAddToCart();
  };

  const executeAddToCart = () => {
    const item = {
      id: currentVariation.ProductID || `${currentVariation.PRODUCT_NAME}-${currentVariation.GSM}-${selectedSize}`,
      name: currentVariation.PRODUCT_NAME,
      gsm: currentVariation.GSM,
      size: selectedSize,
      price: price,
      image: currentVariation.IMAGE_URL || FALLBACK_IMAGE,
      packingType: currentVariation.PACKING_TYPE || 'ream',
      category: currentVariation.Category
    };
    
    addToCart(item, quantity, isBulk, isBulk ? bulkNote : null, isInstallment, isInstallment ? installmentPlan : null);
    navigate('/cart');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-8 font-sans">
      <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-bold text-sm tracking-widest uppercase transition-colors">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Left: 3D Product Image Gallery */}
        <div className="perspective-1000 preserve-3d">
          <div className="w-full aspect-[4/3] lg:aspect-square bg-gray-50 rounded-[32px] p-4 flex items-center justify-center relative shadow-glass glass-panel border border-white/60 group overflow-hidden" style={{ transform: 'rotateX(5deg) rotateY(-5deg)' }}>
            {/* Glowing background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-200/50 rounded-full opacity-60 -z-10 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <img
              src={currentVariation.IMAGE_URL || FALLBACK_IMAGE}
              alt={decodedName}
              // The hero image of this route — worth fetching at high priority.
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 preserve-3d mix-blend-multiply"
              style={{ transform: 'translateZ(30px)' }}
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            
            {!inStock && (
              <div className="absolute top-6 left-6 bg-red-50 text-red-600 font-bold uppercase tracking-widest px-4 py-2 rounded-xl text-xs shadow-sm">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="flex flex-col pt-4">
          <div className="inline-block px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-4 w-fit">
            <p className="text-primary text-[11px] font-bold uppercase tracking-widest">{currentVariation.Category || 'Premium Paper'}</p>
          </div>
          
          <h1 className="text-[32px] lg:text-[48px] font-black text-secondary leading-tight mb-2 tracking-tight">
            {decodedName}
          </h1>
          <p className="text-gray-500 text-lg mb-8">{currentVariation.Description || 'Premium High Quality Stock for professional printing and arts.'}</p>

          {/* Configuration Box */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 lg:p-8 mb-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Size</label>
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="bg-white border border-gray-200 text-secondary text-sm md:text-base font-bold py-3 px-4 rounded-xl outline-none focus:border-primary shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px] cursor-pointer hover:border-gray-300 transition-colors"
                >
                  {[...new Set(productVariations.map(p => p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : (p.Display_Size || 'N/A')))].filter(Boolean).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select GSM</label>
                <select 
                  value={selectedGsm}
                  onChange={(e) => setSelectedGsm(e.target.value)}
                  className="bg-white border border-gray-200 text-secondary text-sm md:text-base font-bold py-3 px-4 rounded-xl outline-none focus:border-primary shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px] cursor-pointer hover:border-gray-300 transition-colors"
                >
                  {availableGsms.map(g => (
                    <option key={g} value={g}>{g}g</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Order Toggle */}
            <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100 mb-4">
              <input 
                type="checkbox" 
                id="bulk-toggle" 
                checked={isBulk} 
                onChange={(e) => setIsBulk(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <label htmlFor="bulk-toggle" className="font-bold text-secondary cursor-pointer">Place Bulk Order Request</label>
                <p className="text-xs text-gray-500 mt-1">Check this if you need B2B quantities or special pricing. We will finalize rates on WhatsApp.</p>
                {isBulk && (
                  <textarea 
                    placeholder="E.g., I need 500 reams for my printing press..."
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    className="mt-3 w-full bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary shadow-sm min-h-[80px]"
                  ></textarea>
                )}
              </div>
            </div>

            {/* Installment Plan Toggle (Only for Paper & Canvas) */}
            {['bleach card', 'art card', 'art paper', 'matte paper', 'copy paper', 'offset paper', 'ivory card', 'color card', 'carbonless', 'stickers', 'local paper', 'boxboard', 'news', 'butter paper', 'kraft card', 'book paper'].includes((currentVariation.Category || '').toLowerCase()) && (
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
                <input 
                  type="checkbox" 
                  id="installment-toggle" 
                  checked={isInstallment} 
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 accent-blue-600 cursor-pointer"
                />
                <div className="flex flex-col w-full">
                  <label htmlFor="installment-toggle" className="font-bold text-secondary cursor-pointer">Request Installment Plan</label>
                  <p className="text-xs text-gray-500 mt-1">T&C apply. Requires physical bank cheques. Approval via WhatsApp.</p>
                  
                  {isInstallment && (
                    <div className="mt-3">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Duration</label>
                      <select 
                        value={installmentPlan}
                        onChange={(e) => setInstallmentPlan(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-secondary text-sm font-bold py-3 px-4 rounded-xl outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <option value="3 Months">3 Months (0% Markup)</option>
                        <option value="6 Months">6 Months</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
              <div className="flex flex-col w-full sm:w-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity ({currentVariation.PACKING_TYPE || 'ream'})</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 text-secondary transition-colors"><Minus size={16} /></button>
                  <span className="w-12 text-center font-bold text-lg text-secondary">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-50 text-secondary transition-colors"><Plus size={16} /></button>
                </div>
              </div>
              
              <div className="flex flex-col text-right w-full sm:w-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Price</span>
                <span className="text-[32px] font-black text-primary leading-none">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 shadow-lg ${inStock ? 'bg-secondary text-white hover:bg-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingBag size={22} />
            {inStock ? (isBulk ? 'Add Bulk Request to Cart' : 'Add to Cart') : 'Currently Out of Stock'}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-2">
            <Phone size={14} /> Checkout is finalized securely via WhatsApp.
          </p>

          {/* Trust Features */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm font-bold text-secondary leading-tight">Premium<br/><span className="text-gray-500 font-medium">Quality Assured</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck size={20} />
              </div>
              <p className="text-sm font-bold text-secondary leading-tight">Fast Delivery<br/><span className="text-gray-500 font-medium">Across Pakistan</span></p>
            </div>
          </div>

        </div>
      </div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onAgree={() => {
          setShowTerms(false);
          executeAddToCart();
        }} 
      />
    </div>
  );
};

export default ProductDetails;
