import React from 'react';
import { getColorHex, isColorVariation, isMeaninglessVariation } from '../../lib/variations';

export default function VariationBadge({ size }) {
  if (isMeaninglessVariation(size)) return null;
  if (isColorVariation(size)) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-gray-700 border border-gray-200 rounded-md">
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
          style={{ background: getColorHex(size) || '#94a3b8' }}
        />
        Color: {size}
      </span>
    );
  }
  return (
    <span className="bg-gray-50 px-2 py-1 text-[10px] md:text-[11px] font-bold text-gray-600 border border-gray-200 rounded-md">
      {size}
    </span>
  );
}
