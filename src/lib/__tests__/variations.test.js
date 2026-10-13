import { describe, it, expect } from 'vitest';
import {
  getColorHex,
  isColorVariation,
  isMeaninglessVariation,
  determineVariationType,
  getVariationLabels,
  hasMeaningfulVariations,
  formatVariationTag,
} from '../variations.js';

describe('variations utility', () => {
  it('detects standard colors accurately', () => {
    expect(isColorVariation('Blue')).toBe(true);
    expect(getColorHex('Blue')).toBe('#2563eb');
    expect(isColorVariation('Red')).toBe(true);
    expect(getColorHex('Red')).toBe('#dc2626');
    expect(isColorVariation('Black')).toBe(true);
    expect(getColorHex('Black')).toBe('#18181b');
    expect(isColorVariation('Dark Green')).toBe(true);
    expect(isColorVariation('Sky Blue')).toBe(true);
    expect(isColorVariation('Assorted')).toBe(true);
  });

  it('handles variations with suffixes like (1pc) or Marker', () => {
    expect(isColorVariation('Blue (1pc)')).toBe(true);
    expect(getColorHex('Blue (1pc)')).toBe('#2563eb');
    expect(isColorVariation('Black Marker')).toBe(true);
    expect(getColorHex('Black Marker')).toBe('#18181b');
  });

  it('correctly identifies meaningless or default variations', () => {
    expect(isMeaninglessVariation('Standard')).toBe(true);
    expect(isMeaninglessVariation('standard')).toBe(true);
    expect(isMeaninglessVariation('N/A')).toBe(true);
    expect(isMeaninglessVariation('Default Title')).toBe(true);
    expect(isMeaninglessVariation('')).toBe(true);
    expect(isMeaninglessVariation(null)).toBe(true);

    expect(isMeaninglessVariation('Blue')).toBe(false);
    expect(isMeaninglessVariation('A4')).toBe(false);
    expect(isMeaninglessVariation('23x36')).toBe(false);
  });

  it('determines variation types correctly', () => {
    // Marker colors
    expect(
      determineVariationType(['Blue', 'Black', 'Red', 'Green'], 'Whiteboard Marker Ink', 'Stationery')
    ).toBe('color');

    // Paper sizes
    expect(
      determineVariationType(['23x36', '20x30'], 'Art Paper', 'Paper & Canvas')
    ).toBe('size');

    // Volumes
    expect(
      determineVariationType(['100ml', '250ml', '500ml'], 'Epoxy Resin', 'Fine Arts')
    ).toBe('volume');

    // Tips
    expect(
      determineVariationType(['0.5mm', '0.7mm', '1.0mm'], 'Gel Pen', 'Stationery')
    ).toBe('tip');
  });

  it('checks hasMeaningfulVariations properly', () => {
    expect(hasMeaningfulVariations(['Standard'])).toBe(false);
    expect(hasMeaningfulVariations(['N/A'])).toBe(false);
    expect(hasMeaningfulVariations([''])).toBe(false);
    expect(hasMeaningfulVariations([])).toBe(false);

    expect(hasMeaningfulVariations(['Blue', 'Black'])).toBe(true);
    expect(hasMeaningfulVariations(['23x36', '20x30'])).toBe(true);
    expect(hasMeaningfulVariations(['500ml'])).toBe(true);
  });

  it('formats variation tag for badges and receipts', () => {
    const blueTag = formatVariationTag('Blue', 'N/A', 'Whiteboard Marker Ink', 'Stationery');
    expect(blueTag.isMeaningless).toBe(false);
    expect(blueTag.type).toBe('color');
    expect(blueTag.hex).toBe('#2563eb');
    expect(blueTag.label).toBe('Color');

    const stdTag = formatVariationTag('Standard', 'N/A');
    expect(stdTag.isMeaningless).toBe(true);

    const labels = getVariationLabels('color');
    expect(labels.selectLabel).toBe('Select Color');
    expect(labels.shortLabel).toBe('Color');
  });
});
