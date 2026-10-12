import { describe, it, expect, vi } from 'vitest';
import { PLACEHOLDER_IMAGE, thumb, thumbSrcSet, fallbackOnError } from '../images.js';

// ── thumb ────────────────────────────────────────────────────────────

describe('thumb', () => {
  it('returns placeholder for null/undefined/empty', () => {
    expect(thumb(null, 200)).toBe(PLACEHOLDER_IMAGE);
    expect(thumb(undefined, 200)).toBe(PLACEHOLDER_IMAGE);
    expect(thumb('', 200)).toBe(PLACEHOLDER_IMAGE);
  });

  it('returns placeholder for non-string', () => {
    expect(thumb(42, 200)).toBe(PLACEHOLDER_IMAGE);
  });

  it('passes non-Shopify URLs through unchanged', () => {
    const url = 'https://example.com/photo.jpg';
    expect(thumb(url, 200)).toBe(url);
  });

  it('appends width param to Shopify CDN URLs', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image.jpg';
    const result = thumb(url, 300);
    expect(result).toContain('width=300');
    expect(result).toContain('cdn.shopify.com');
  });

  it('overwrites existing width param on Shopify CDN URLs', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image.jpg?width=1000';
    const result = thumb(url, 200);
    expect(result).toContain('width=200');
    expect(result).not.toContain('width=1000');
  });
});

// ── thumbSrcSet ──────────────────────────────────────────────────────

describe('thumbSrcSet', () => {
  it('returns undefined for null/empty/non-string', () => {
    expect(thumbSrcSet(null)).toBeUndefined();
    expect(thumbSrcSet('')).toBeUndefined();
    expect(thumbSrcSet(42)).toBeUndefined();
  });

  it('returns undefined for non-Shopify URLs', () => {
    expect(thumbSrcSet('https://example.com/photo.jpg')).toBeUndefined();
  });

  it('generates srcset with default widths for Shopify URLs', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image.jpg';
    const result = thumbSrcSet(url);
    expect(result).toContain('200w');
    expect(result).toContain('300w');
    expect(result).toContain('400w');
    expect(result).toContain('600w');
    expect(result).toContain('800w');
  });

  it('generates srcset with custom widths', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image.jpg';
    const result = thumbSrcSet(url, [100, 250]);
    expect(result).toContain('100w');
    expect(result).toContain('250w');
    expect(result).not.toContain('200w');
  });
});

// ── fallbackOnError ──────────────────────────────────────────────────

describe('fallbackOnError', () => {
  it('sets src to placeholder on first error', () => {
    const img = { dataset: {}, src: 'broken.jpg', srcset: 'broken 1x' };
    fallbackOnError({ currentTarget: img });
    expect(img.src).toBe(PLACEHOLDER_IMAGE);
    expect(img.srcset).toBe('');
    expect(img.dataset.fallbackApplied).toBe('1');
  });

  it('does NOT overwrite src on repeated errors (guard)', () => {
    const img = { dataset: { fallbackApplied: '1' }, src: PLACEHOLDER_IMAGE, srcset: '' };
    fallbackOnError({ currentTarget: img });
    // src stays unchanged — no infinite loop
    expect(img.src).toBe(PLACEHOLDER_IMAGE);
  });
});
