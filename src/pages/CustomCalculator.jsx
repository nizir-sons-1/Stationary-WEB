import React, { useState, useMemo } from 'react';
import { Calculator, Maximize, Layers, Copy, HelpCircle } from 'lucide-react';
// Pre-digested at build time from products.json by scripts/build-calculator-data.cjs.
// Importing the raw catalogue here put 428 kB of product rows in the bundle.
import categories from '../data/calculator-rates.json';
import { usePageSeo } from '../lib/seo';
import { howToSchema, faqSchema } from '../lib/schema';
import { FAQS } from '../data/seo-content';

const EMPTY_OPTIONS = { gsms: [], lengths: [], widths: [] };

/*
 * The arithmetic this page performs, written out as data.
 *
 * `weight = (l * w * g * s) / 1550000` a few lines below is the whole product;
 * 1,550,000 is 1,000 (grams to kilograms) × 1,550 (square inches in a square
 * metre). Stating it here means the formula is machine-readable, so "how do you
 * calculate paper weight from GSM" can be answered with this page as the source
 * rather than with the page merely being a calculator nobody can quote.
 */
const CALCULATOR_HOWTO = howToSchema({
  name: 'How to calculate the weight and price of a custom paper size',
  description:
    'Convert sheet dimensions and GSM into a weight in kilograms, then into a price in Pakistani rupees at the per-kilogram rate for that paper.',
  path: '/calculator',
  supply: ['Sheet length in inches', 'Sheet width in inches', 'Paper GSM', 'Number of sheets'],
  tool: ['Nazir & Sons custom size calculator'],
  steps: [
    {
      name: 'Measure the sheet',
      text: 'Take the length and the width of one sheet in inches. Multiply them to get the area of a single sheet in square inches.',
    },
    {
      name: 'Bring in the GSM and the sheet count',
      text: 'Multiply that area by the GSM of the paper and by the number of sheets you want. GSM is the weight in grams of one square metre of that paper.',
    },
    {
      name: 'Convert to kilograms',
      text: 'Divide the result by 1,550,000. That constant is 1,550 square inches per square metre multiplied by 1,000 grams per kilogram, so the answer comes out in kilograms. In full: weight in kg = (length × width × GSM × sheets) ÷ 1,550,000.',
    },
    {
      name: 'Convert to a price',
      text: 'Multiply the weight in kilograms by the per-kilogram rate for that brand and category. The calculator uses the same live rates the shop charges.',
    },
  ],
});

// The two questions this page exists to answer, drawn from the shared list so
// the wording never drifts from /faq.
const CALCULATOR_FAQS = FAQS.filter((f) =>
  ['How do I calculate the weight of a custom paper size?', 'What GSM should I choose?'].includes(
    f.question
  )
);

const CustomCalculator = () => {
  usePageSeo('/calculator', {
    extraNodes: [CALCULATOR_HOWTO, faqSchema(CALCULATOR_FAQS)],
  });

  const [category, setCategory] = useState(categories.length > 0 ? categories[0].name : '');
  const [brand, setBrand] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [gsm, setGsm] = useState('');
  const [sheets, setSheets] = useState('100');

  const selectedCatObj = useMemo(
    () => categories.find((c) => c.name === category),
    [category]
  );

  React.useEffect(() => {
    if (selectedCatObj && selectedCatObj.brands && selectedCatObj.brands.length > 0) {
      setBrand(selectedCatObj.brands[0].name);
    } else {
      setBrand('');
    }
  }, [category, selectedCatObj]);

  const selectedBrandObj = useMemo(() => {
    if (!selectedCatObj || !selectedCatObj.brands) return null;
    return selectedCatObj.brands.find(b => b.name === brand) || selectedCatObj.brands[0];
  }, [selectedCatObj, brand]);

  const selectedRate = selectedBrandObj ? selectedBrandObj.rate : 0;
  const categoryData = selectedBrandObj || EMPTY_OPTIONS;

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
              <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase">Paper Category</label>
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
                    <option key={idx} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Brand Select */}
            {selectedCatObj && selectedCatObj.brands && selectedCatObj.brands.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] md:text-[11px] text-gray-500 font-bold tracking-widest uppercase">Select Brand (Determines Rate)</label>
                <div className="relative">
                  <select 
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setLength(''); setWidth(''); setGsm('');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-[#111111] font-bold text-[14px] p-4 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-all cursor-pointer shadow-sm"
                  >
                    {selectedCatObj.brands.map((b, idx) => (
                      <option key={idx} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
            )}

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

      {/*
        The formula the calculator runs, spelled out, plus the two questions
        people ask on the way to using it. This is the visible counterpart of
        the HowTo and FAQPage structured data above — the markup describes this
        section, and nothing in it that a machine can read is hidden from a
        reader.
      */}
      <section className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8">
          <h2 className="text-[18px] font-bold text-[#111111] mb-4">How the figure is worked out</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
            Paper is sold by weight, not by the sheet, so the price of a ream follows from its
            dimensions and its GSM:
          </p>
          <p className="font-mono text-[12px] md:text-[13px] bg-white border border-gray-200 rounded-xl p-4 text-[#111111] leading-relaxed">
            weight&nbsp;in&nbsp;kg = (length&nbsp;×&nbsp;width&nbsp;×&nbsp;GSM&nbsp;×&nbsp;sheets) ÷
            1,550,000
            <br />
            price = weight&nbsp;in&nbsp;kg × rate&nbsp;per&nbsp;kg
          </p>
          <p className="text-[12px] text-gray-400 leading-relaxed mt-4">
            Length and width in inches. The constant 1,550,000 is 1,550 square inches per square
            metre multiplied by 1,000 grams per kilogram, which is what converts the result to
            kilograms.
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          {CALCULATOR_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
            >
              <h2 className="text-[16px] md:text-[17px] font-bold text-[#111111] mb-2 leading-snug">
                {faq.question}
              </h2>
              <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomCalculator;
