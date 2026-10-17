import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Maximize, Layers, Copy, HelpCircle, ArrowLeft } from 'lucide-react';
// Live rates fetched directly from "Paper & Canvas" products in Supabase.
import { useCalculatorRates } from '../hooks/useSupabase';
import { usePageSeo } from '../lib/seo';
import { howToSchema, faqSchema } from '../lib/schema';
import { FAQS } from '../data/seo-content';

const EMPTY_OPTIONS = { gsms: [], lengths: [], widths: [] };

/*
 * The arithmetic this page performs, written out as data.
 * weight = (l * w * g * s) / 1550000
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

const CALCULATOR_FAQS = FAQS.filter((f) =>
  ['How do I calculate the weight of a custom paper size?', 'What GSM should I choose?'].includes(f.question)
);

const CustomCalculator = () => {
  usePageSeo('/calculator', {
    extraNodes: [CALCULATOR_HOWTO, faqSchema(CALCULATOR_FAQS)],
  });

  const { categories, loading: isRatesLoading } = useCalculatorRates();

  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [gsm, setGsm] = useState('');
  const [sheets, setSheets] = useState('100');

  React.useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [category, categories]);

  const selectedCatObj = useMemo(
    () => categories.find((c) => c.name === category) || categories[0],
    [category, categories]
  );

  React.useEffect(() => {
    if (selectedCatObj?.brands?.length > 0) {
      const exists = selectedCatObj.brands.some((b) => b.name === brand);
      if (!exists) {
        setBrand(selectedCatObj.brands[0].name);
      }
    } else {
      setBrand('');
    }
  }, [selectedCatObj, brand]);

  const selectedBrandObj = useMemo(() => {
    if (!selectedCatObj?.brands) return null;
    return selectedCatObj.brands.find((b) => b.name === brand) || selectedCatObj.brands[0];
  }, [selectedCatObj, brand]);

  // If the brand has specific rates for different GSMs, dynamically use it; otherwise fallback to brand base rate
  const selectedRate = useMemo(() => {
    if (!selectedBrandObj) return 0;
    const gsmRate = gsm ? selectedBrandObj.gsmRates?.[String(gsm)] : undefined;
    return gsmRate || selectedBrandObj.rate || 0;
  }, [selectedBrandObj, gsm]);

  const categoryData = selectedBrandObj || EMPTY_OPTIONS;

  const results = useMemo(() => {
    const l = Number.parseFloat(length) || 0;
    const w = Number.parseFloat(width) || 0;
    const g = Number.parseFloat(gsm) || 0;
    const s = Number.parseFloat(sheets) || 0;

    if (l > 0 && w > 0 && g > 0 && s > 0) {
      const weight = (l * w * g * s) / 1550000;
      const price = weight * selectedRate;
      return {
        weight: weight.toFixed(4),
        price: Math.round(price).toLocaleString(),
        rawPrice: price,
      };
    }
    return { weight: '0.0000', price: '0', rawPrice: 0 };
  }, [length, width, gsm, sheets, selectedRate]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pt-3 sm:pt-5 px-3.5 sm:px-6 pb-20 font-sans">
      {/* Back Button */}
      <div className="mb-3 sm:mb-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#112338] font-label-caps font-bold tracking-widest uppercase bg-white px-3.5 py-1.5 rounded-[3px] border border-[#e5e1d7] shadow-sm w-fit text-[10px] transition-colors"
        >
          <ArrowLeft size={13} /> Back to Shop
        </Link>
      </div>

      {/* Full Width Top Banner */}
      <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#e5e1d7] shadow-xs mb-3.5 sm:mb-5 bg-[#fcfbfa] relative">
        <div className="w-full aspect-[2.3/1] sm:aspect-[2.8/1] max-h-[190px] sm:max-h-[230px] overflow-hidden">
          <picture className="w-full h-full">
            <source srcSet="/images/calculator-banner-hd.avif" type="image/avif" />
            <source srcSet="/images/calculator-banner-hd.webp" type="image/webp" />
            <img
              src="/images/calculator-banner-hd.webp"
              alt="Custom Size Paper Calculator Banner"
              width={1200}
              height={430}
              className="w-full h-full object-cover object-[65%_center] sm:object-center"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      {/* Header Title & Subtitle */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="font-serif text-[22px] sm:text-[28px] md:text-[32px] font-bold text-[#112338] tracking-tight leading-tight">
          Custom Size Calculator
        </h1>
        <p className="text-[#64748b] mt-1 text-[12px] sm:text-[13.5px] max-w-md mx-auto leading-relaxed">
          Need a non-standard size? Enter dimensions below to instantly calculate weight and price using live market rates.
        </p>
      </div>

      {/* Main Grid: Compact 2-Column Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">
        {/* Input Section (Light Crisp Surface) */}
        <div className="lg:col-span-7 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#e5e1d7] shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2.5 border-b border-[#f0ede6]">
            <span className="w-5.5 h-5.5 rounded-full bg-[#112338] text-white flex items-center justify-center text-[10.5px] font-bold shrink-0">
              1
            </span>
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#112338]">Enter Specifications</h2>
          </div>

          <div className="flex flex-col gap-3 sm:gap-3.5">
            {/* Paper Category Select */}
            <div className="flex flex-col">
              <label htmlFor="calc-category" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">
                Paper Category
              </label>
              <div className="relative">
                <select
                  id="calc-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLength('');
                    setWidth('');
                    setGsm('');
                  }}
                  disabled={isRatesLoading && categories.length === 0}
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-2xs hover:border-gray-400 transition-colors"
                >
                  {categories.length === 0 ? (
                    <option value="">{isRatesLoading ? 'Loading categories...' : 'No categories available'}</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Brand Select */}
            {Boolean(selectedCatObj?.brands?.length) && (
              <div className="flex flex-col">
                <label htmlFor="calc-brand" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">
                  Select Brand (Determines Rate)
                </label>
                <div className="relative">
                  <select
                    id="calc-brand"
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setLength('');
                      setWidth('');
                      setGsm('');
                    }}
                    className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-primary appearance-none cursor-pointer shadow-2xs hover:border-gray-400 transition-colors"
                  >
                    {selectedCatObj.brands.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Size Inputs (Length & Width) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="flex flex-col">
                <label htmlFor="calc-length" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <Maximize size={11} /> Length (inch)
                </label>
                <input
                  id="calc-length"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-8.5 sm:h-9 px-2.5 rounded-lg outline-none focus:border-primary focus:bg-white shadow-2xs transition-all"
                />
                {categoryData.lengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categoryData.lengths.slice(0, 5).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-[4px] font-semibold border transition-all cursor-pointer ${length === l
                            ? 'bg-[#112338] text-white border-[#112338]'
                            : 'bg-[#f5f3ee] text-gray-600 border-[#e0dbcf] hover:border-gray-400'
                          }`}
                      >
                        {l}&quot;
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="calc-width" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <Maximize size={11} className="rotate-90" /> Width (inch)
                </label>
                <input
                  id="calc-width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 36"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-8.5 sm:h-9 px-2.5 rounded-lg outline-none focus:border-primary focus:bg-white shadow-2xs transition-all"
                />
                {categoryData.widths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categoryData.widths.slice(0, 5).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWidth(w)}
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-[4px] font-semibold border transition-all cursor-pointer ${width === w
                            ? 'bg-[#112338] text-white border-[#112338]'
                            : 'bg-[#f5f3ee] text-gray-600 border-[#e0dbcf] hover:border-gray-400'
                          }`}
                      >
                        {w}&quot;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GSM & Sheets Per Pack Inputs */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="flex flex-col">
                <label htmlFor="calc-gsm" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <Layers size={11} /> GSM
                </label>
                <input
                  id="calc-gsm"
                  type="number"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-8.5 sm:h-9 px-2.5 rounded-lg outline-none focus:border-primary focus:bg-white shadow-2xs transition-all"
                />
                {categoryData.gsms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categoryData.gsms.slice(0, 5).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGsm(g)}
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-[4px] font-semibold border transition-all cursor-pointer ${gsm === g
                            ? 'bg-[#112338] text-white border-[#112338]'
                            : 'bg-[#f5f3ee] text-gray-600 border-[#e0dbcf] hover:border-gray-400'
                          }`}
                      >
                        {g}g
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="calc-sheets" className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <Copy size={11} /> Sheets / Pack
                </label>
                <input
                  id="calc-sheets"
                  type="number"
                  value={sheets}
                  onChange={(e) => setSheets(e.target.value)}
                  placeholder="100"
                  className="w-full bg-[#faf8f5] border border-[#dcd7cb] text-[#112338] font-bold text-[12.5px] sm:text-[13px] h-8.5 sm:h-9 px-2.5 rounded-lg outline-none focus:border-primary focus:bg-white shadow-2xs transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section (Deep Dark Black with Crisp Pure White Text) */}
        <div className="lg:col-span-5 bg-[#0a0c10] text-white p-4 sm:p-5.5 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between">
          {/* Subtle warm ambient highlight */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header: Badge + Title */}
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-white/15">
              <span className="w-5.5 h-5.5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-xs">
                2
              </span>
              <h2 className="text-[14.5px] sm:text-[15.5px] font-bold text-white tracking-tight">Calculation Result</h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Current Live Rate: Crisp White Text */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[12.5px] sm:text-[13px]">
                <div className="flex items-center gap-1.5 text-white/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Market Rate</span>
                </div>
                <span className="font-bold text-white tracking-tight">
                  Rs. {selectedRate} <span className="text-white/65 font-normal text-[11px]">/ kg</span>
                </span>
              </div>

              {/* Calculated Weight: Crisp Highlighted Text */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[12.5px] sm:text-[13px]">
                <span className="text-white/90 font-medium">Calculated Weight</span>
                <span className="font-mono font-bold text-amber-300 text-[15px] sm:text-[16px] tracking-tight">
                  {results.weight} <span className="text-white/75 font-sans font-normal text-[12px]">kg</span>
                </span>
              </div>

              {/* Total Estimated Price: Bold White Display */}
              <div className="flex flex-col pt-1 pb-0.5">
                <span className="text-white/80 font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wider mb-1">
                  Total Estimated Price
                </span>
                <div className="font-serif font-black text-[30px] sm:text-[36px] leading-tight text-white tracking-tight flex items-baseline gap-1.5">
                  <span className="text-primary text-[20px] sm:text-[23px] font-bold">Rs.</span>
                  <span className="text-white">{results.price}</span>
                </div>
              </div>
            </div>

            {/* Disclaimer Box with Clean High-Contrast White Text */}
            <div className="mt-3.5 bg-white/[0.08] border border-white/15 p-2.5 sm:p-3 rounded-xl flex items-start gap-2.5 text-[11px] sm:text-[11.5px] text-white/90 leading-relaxed">
              <HelpCircle size={14} className="text-white/75 shrink-0 mt-0.5" />
              <p>
                Price is an estimate based on standard paper formulas. Custom orders are subject to mill availability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal How-It-Works & FAQ Section */}
      <section className="mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-[#e5e1d7]">
        {/* Compact Formula Banner */}
        <div className="bg-[#faf8f5] border border-[#e5e1d7] rounded-xl p-3 sm:p-4 mb-3.5 sm:mb-4">
          <h2 className="text-[13px] sm:text-[14px] font-bold text-[#112338] mb-1.5">
            How the figure is worked out
          </h2>
          <p className="text-[11.5px] sm:text-[12px] text-gray-500 mb-2 leading-relaxed">
            Paper is priced by weight. The price of a ream follows from dimensions and GSM:
          </p>
          <div className="font-mono text-[11px] sm:text-[12px] bg-white border border-[#e2ddd3] rounded-lg p-2.5 text-[#112338] leading-relaxed">
            weight in kg = (length × width × GSM × sheets) ÷ 1,550,000
            <br />
            price = weight in kg × rate per kg
          </div>
        </div>

        {/* Concise FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {CALCULATOR_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="bg-white border border-[#e5e1d7] rounded-xl p-3 sm:p-3.5 shadow-2xs"
            >
              <h3 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#112338] mb-1 leading-snug">
                {faq.question}
              </h3>
              <p className="text-[11.5px] sm:text-[12px] text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomCalculator;
