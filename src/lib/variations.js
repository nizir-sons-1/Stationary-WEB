/**
 * Variation and Color Intelligence Utility
 *
 * Provides intelligent detection of product variations:
 * - Differentiates between Colors, Dimensions/Sizes, Volume, Tip types, and generic Options.
 * - Maps color names to CSS colors / gradients for swatch rendering.
 * - Suppresses redundant / single 'Standard' or 'N/A' variation selectors.
 * - Formats badges and receipts cleanly across PDP, Shop cards, Cart, and WhatsApp notifications.
 */

export const COLOR_PALETTE = {
  blue: '#2563eb',
  'dark blue': '#1e3a8a',
  'light blue': '#38bdf8',
  'sky blue': '#0ea5e9',
  'royal blue': '#1d4ed8',
  navy: '#0f172a',
  red: '#dc2626',
  'dark red': '#991b1b',
  crimson: '#e11d48',
  maroon: '#881337',
  burgundy: '#701a75',
  green: '#16a34a',
  'dark green': '#14532d',
  'light green': '#4ade80',
  lime: '#65a30d',
  olive: '#4d7c0f',
  teal: '#0d9488',
  turquoise: '#14b8a6',
  mint: '#2dd4bf',
  black: '#18181b',
  white: '#ffffff',
  yellow: '#eab308',
  'lemon yellow': '#facc15',
  orange: '#ea580c',
  'dark orange': '#c2410c',
  purple: '#9333ea',
  violet: '#7c3aed',
  magenta: '#c026d3',
  pink: '#ec4899',
  rose: '#f43f5e',
  peach: '#fb923c',
  coral: '#f87171',
  brown: '#78350f',
  chocolate: '#451a03',
  grey: '#4b5563',
  gray: '#4b5563',
  'light grey': '#9ca3af',
  'light gray': '#9ca3af',
  'dark grey': '#374151',
  'dark gray': '#374151',
  silver: '#94a3b8',
  gold: '#d97706',
  bronze: '#b45309',
  copper: '#b45309',
  beige: '#fef3c7',
  cream: '#fffbeb',
  khaki: '#d4d4d8',
  neon: 'linear-gradient(135deg, #a3e635, #f43f5e)',
  'neon green': '#4ade80',
  'neon yellow': '#facc15',
  'neon pink': '#f43f5e',
  'neon orange': '#fb923c',
  pastel: 'linear-gradient(135deg, #fbcfe8, #bfdbfe)',
  assorted: 'linear-gradient(135deg, #ef4444 0%, #eab308 33%, #22c55e 66%, #3b82f6 100%)',
  multi: 'linear-gradient(135deg, #ef4444 0%, #eab308 33%, #22c55e 66%, #3b82f6 100%)',
  multicolor: 'linear-gradient(135deg, #ef4444 0%, #eab308 33%, #22c55e 66%, #3b82f6 100%)',
  'multi color': 'linear-gradient(135deg, #ef4444 0%, #eab308 33%, #22c55e 66%, #3b82f6 100%)',
  'multi-color': 'linear-gradient(135deg, #ef4444 0%, #eab308 33%, #22c55e 66%, #3b82f6 100%)',
};

const MEANINGLESS_VALUES = new Set([
  '',
  'n/a',
  'na',
  'standard',
  'default',
  'default title',
  'none',
  'null',
  'undefined',
  '1pc', // When sole variation is just "1pc" with no other options
]);

/**
 * Checks if a variation string is meaningless or redundant.
 */
export function isMeaninglessVariation(val) {
  if (!val) return true;
  const normalized = String(val).trim().toLowerCase();
  return MEANINGLESS_VALUES.has(normalized);
}

/**
 * Normalizes a variation value and returns its CSS hex/gradient or null.
 */
export function getColorHex(val) {
  if (!val || isMeaninglessVariation(val)) return null;
  const raw = String(val).trim().toLowerCase();

  // 1. Direct exact match
  if (COLOR_PALETTE[raw]) return COLOR_PALETTE[raw];

  // 2. Check compound phrases (e.g. "Dark Blue (1pc)", "Color: Blue", "Blue Marker")
  const stripped = raw
    .replace(/[()[\]{}]/g, '')
    .replace(/\b(color|colour|pc|pack|marker|pen|ink|refill|1pc)\b/g, '')
    .trim();

  if (COLOR_PALETTE[stripped]) return COLOR_PALETTE[stripped];

  // 3. Substring match for key colors
  const keys = Object.keys(COLOR_PALETTE).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    // Word boundary check
    const regex = new RegExp(String.raw`\b${k}\b`, 'i');
    if (regex.test(raw)) {
      return COLOR_PALETTE[k];
    }
  }

  return null;
}

/**
 * Checks if a specific variation string represents a recognized color.
 */
export function isColorVariation(val) {
  return getColorHex(val) !== null;
}

/**
 * Classifies an array of variation values into attribute type:
 * 'color' | 'size' | 'volume' | 'tip' | 'option'
 */
export function determineVariationType(values = [], category = '', department = '') {
  const normDept = (department || '').toLowerCase();
  const normCat = (category || '').toLowerCase();

  // Paper & Canvas is always dimensional sizes
  if (normDept.includes('paper') || normCat.includes('card') || normCat.includes('paper')) {
    return 'size';
  }

  const valid = values.filter((v) => !isMeaninglessVariation(v));
  if (valid.length === 0) return 'option';

  // Check if majority of options are colors
  const colorCount = valid.filter((v) => isColorVariation(v)).length;
  if (colorCount > 0 && colorCount / valid.length >= 0.5) {
    return 'color';
  }

  // Check dimensional size patterns (e.g. 23x36, 12x18, A4, A3, Legal, etc.)
  const sizePattern = /\b(?:\d+x\d+|[ab][0-6]|legal|letter|folio)\b/i;
  const isSize = valid.some((v) => sizePattern.test(v));
  if (isSize) return 'size';

  // Check volume patterns (ml, litre, oz)
  const volumePattern = /\b(\d+\s*(ml|l|ltr|oz|gallon))\b/i;
  if (valid.some((v) => volumePattern.test(v))) return 'volume';

  // Check tip/nib patterns
  const tipPattern = /\b(nib|tip|point|chisel|bullet|round nib|0\.\d+mm)\b/i;
  if (valid.some((v) => tipPattern.test(v))) return 'tip';

  // If category indicates colors/ink/markers
  if (
    normCat.includes('marker') ||
    normCat.includes('ink') ||
    normCat.includes('paint') ||
    normCat.includes('pencil') ||
    normCat.includes('crayon') ||
    normCat.includes('pigment') ||
    normCat.includes('glitter')
  ) {
    // If any color recognized
    if (colorCount > 0) return 'color';
  }

  return 'option';
}

/**
 * Returns human-friendly selector labels based on the variation type.
 */
export function getVariationLabels(type) {
  switch (type) {
    case 'color':
      return { selectLabel: 'Select Color', shortLabel: 'Color', prefix: 'Color' };
    case 'volume':
      return { selectLabel: 'Select Volume', shortLabel: 'Volume', prefix: 'Volume' };
    case 'tip':
      return { selectLabel: 'Select Tip', shortLabel: 'Tip', prefix: 'Tip' };
    case 'size':
      return { selectLabel: 'Select Size', shortLabel: 'Size', prefix: 'Size' };
    default:
      return { selectLabel: 'Select Option', shortLabel: 'Option', prefix: 'Option' };
  }
}

/**
 * Returns true if the variation list has 2+ options or has 1 meaningful option.
 * Returns false if it only contains empty/redundant ['Standard'] or ['N/A'].
 */
export function hasMeaningfulVariations(values = []) {
  const distinct = [...new Set(values.map((v) => (v ? String(v).trim() : '')))].filter(Boolean);
  if (distinct.length === 0) return false;
  if (distinct.length === 1 && isMeaninglessVariation(distinct[0])) return false;
  return true;
}

/**
 * Formats variation for Cart, Order Tracking, or WhatsApp notification.
 */
export function formatVariationTag(size, gsm, category = '', department = '') {
  const isMeaningless = isMeaninglessVariation(size);
  const type = size ? determineVariationType([size], category, department) : 'option';
  const labels = getVariationLabels(type);

  return {
    isMeaningless,
    type,
    label: labels.shortLabel,
    displayValue: size,
    hex: getColorHex(size),
  };
}
