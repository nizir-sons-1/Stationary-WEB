import React from 'react';
import { getColorHex } from '../../lib/variations';
import { PAPER_AND_CANVAS } from '../../data/categories';

export function VariationSelectors({
  variationType,
  variationLabels,
  selectedSize,
  setSelectedSize,
  availableSizes,
  hasMultipleVariations,
  department,
  selectedGsm,
  setSelectedGsm,
  availableGsms,
}) {
  const isPaper = department === PAPER_AND_CANVAS;
  if (!hasMultipleVariations && !isPaper) {
    return null;
  }

  return (
    <div className={`grid ${isPaper ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5 sm:gap-3 mb-3 sm:mb-3.5`}>
      {variationType === 'color' ? (
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#112338] uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-gray-400 font-semibold">{variationLabels.shortLabel}:</span>
              <span className="text-[#112338] font-black">{selectedSize}</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium bg-[#f8fafc] px-2 py-0.5 rounded-full border border-gray-200">
              {availableSizes.length} {availableSizes.length === 1 ? 'shade' : 'shades'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableSizes.map((opt) => {
              const hex = getColorHex(opt);
              const isSelected = selectedSize === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedSize(opt)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-[#112338] bg-[#112338] text-white shadow-xs'
                      : 'border-[#e2ddd3] bg-white text-[#112338] hover:border-[#112338]/40 hover:bg-[#faf9f6]'
                  }`}
                  title={opt}
                >
                  {hex && (
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 transition-transform ${
                        isSelected ? 'border border-white/60 ring-1 ring-white/30' : 'border border-black/15'
                      }`}
                      style={{ background: hex }}
                    />
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        hasMultipleVariations && (
          <div className="flex flex-col">
            <label htmlFor="pdp-size" className="text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {variationLabels.selectLabel}
            </label>
            <select
              id="pdp-size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-white border border-[#dcd7cb] text-[#112338] text-[12px] sm:text-[13px] font-semibold h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-[#112338] shadow-2xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:12px] cursor-pointer hover:border-gray-400 transition-colors"
            >
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )
      )}

      {isPaper && (
        <div className="flex flex-col">
          <label htmlFor="pdp-gsm" className="text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Select GSM
          </label>
          <select
            id="pdp-gsm"
            value={selectedGsm}
            onChange={(e) => setSelectedGsm(e.target.value)}
            className="w-full bg-white border border-[#dcd7cb] text-[#112338] text-[12px] sm:text-[13px] font-semibold h-9 sm:h-9.5 px-3 rounded-lg outline-none focus:border-[#112338] shadow-2xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:12px] cursor-pointer hover:border-gray-400 transition-colors"
          >
            {availableGsms.map((g) => (
              <option key={g} value={g}>
                {g}g
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default VariationSelectors;
