import React, { useState, useMemo } from 'react';
import { Calculator, Maximize, Layers, Copy, HelpCircle } from 'lucide-react';
// Pre-digested at build time from products.json by scripts/build-calculator-data.cjs.
// Importing the raw catalogue here put 428 kB of product rows in the bundle.
import categories from '../data/calculator-rates.json';

const EMPTY_OPTIONS = { gsms: [], lengths: [], widths: [] };

const CustomCalculator = () => {
  const [category, setCategory] = useState(categories.length > 0 ? categories[0].name : '');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [gsm, setGsm] = useState('');
  const [sheets, setSheets] = useState('100');

  const selected = useMemo(
    () => categories.find((c) => c.name === category),
    [category]
  );

  const selectedRate = selected ? selected.rate : 0;
  const categoryData = selected || EMPTY_OPTIONS;

  const results = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const g = parseFloat(gsm) || 0;
    const s = parseFloat(sheets) || 0;
    
    if (l > 0 && w > 0 && g > 0 && s > 0) {
      const weight = (l * w * g * s) / 1550000;
      const price = weight * selectedRate;
      return { 
        weight: weight.toFixed(4), 
        price: Math.round(price).toLocaleString(),
        rawPrice: price
      };
    }
    return { weight: '0.0000', price: '0', rawPrice: 0 };
  }, [length, width, gsm, sheets, selectedRate]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pt-8 px-4 md:px-8 pb-32">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-primary mb-4 shadow-sm border border-orange-100">
          <Calculator size={32} strokeWidth={2} />
        </div>
        <h1 className="font-headline-xl text-[32px] md:text-[42px] font-extrabold text-[#111111] tracking-tight leading-tight">Custom Size Calculator</h1>
        <p className="text-gray-500 mt-3 text-[14px] md:text-[16px] max-w-xl mx-auto">Need a non-standard size? Enter your dimensions below to instantly calculate the weight and price using live market rates.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.03)] relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 -mr-20 -mt-20 opacity-50"></div>
          
          <h2 className="text-[18px] font-bold text-[#111111] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[14px]">1</span>
            Enter Specifications
          </h2>

          <div className="flex flex-col gap-6">
            {/* Category Select */}
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase">Paper Category (Determines Rate)</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLength(''); setWidth(''); setGsm('');
                  }}
                  className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-all cursor-pointer shadow-sm"
                >
                  {categories.map((c, idx) => (
                    <option key={idx} value={c.name}>{c.name} (Rs. {c.rate}/kg)</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Size Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase flex items-center gap-1.5"><Maximize size={14}/> Length (inch)</label>
                <input 
                  type="number" 
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                />
                {categoryData.lengths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {categoryData.lengths.slice(0, 6).map(l => (
                      <button key={l} onClick={() => setLength(l)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${length === l ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'}`}>
                        {l}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase flex items-center gap-1.5"><Maximize size={14} className="rotate-90"/> Width (inch)</label>
                <input 
                  type="number" 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 36"
                  className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                />
                {categoryData.widths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {categoryData.widths.slice(0, 6).map(w => (
                      <button key={w} onClick={() => setWidth(w)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${width === w ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'}`}>
                        {w}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GSM & Sheets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase flex items-center gap-1.5"><Layers size={14}/> GSM</label>
                <input 
                  type="number" 
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                />
                {categoryData.gsms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {categoryData.gsms.slice(0, 6).map(g => (
                      <button key={g} onClick={() => setGsm(g)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${gsm === g ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'}`}>
                        {g}g
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase flex items-center gap-1.5"><Copy size={14}/> Sheets Per Pack</label>
                <input 
                  type="number" 
                  value={sheets}
                  onChange={(e) => setSheets(e.target.value)}
                  placeholder="100"
                  className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 bg-[#111111] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-center">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-[18px] font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[14px]">2</span>
              Calculation Result
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/60 font-medium text-[14px]">Current Live Rate</span>
                <span className="font-bold text-[16px]">Rs. {selectedRate} <span className="text-white/40 font-normal text-[12px]">/ kg</span></span>
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/60 font-medium text-[14px]">Calculated Weight</span>
                <span className="font-bold text-[20px] text-orange-400">{results.weight} <span className="text-white/40 font-normal text-[14px]">kg</span></span>
              </div>

              <div className="flex flex-col pt-2">
                <span className="text-white/60 font-medium text-[14px] mb-1">Total Estimated Price</span>
                <span className="font-price-display font-extrabold text-[42px] leading-none tracking-tight text-white">Rs. {results.price}</span>
              </div>
            </div>

            <div className="mt-10 bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
              <HelpCircle size={18} className="text-white/40 shrink-0 mt-0.5" />
              <p className="text-[12px] text-white/60 leading-relaxed">
                This price is an estimate based on standard paper formulas. Custom orders are subject to mill availability. Contact us for bulk booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCalculator;
