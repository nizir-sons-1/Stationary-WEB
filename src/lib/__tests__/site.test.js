import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  BUSINESS,
  DEPARTMENT_NAMES,
  absoluteUrl,
  productPath,
  slugify,
  titleFromSlug,
  categoryPath,
} from '../site.js';

// ── Constants ────────────────────────────────────────────────────────

describe('SITE_URL', () => {
  it('has no trailing slash', () => {
    expect(SITE_URL).not.toMatch(/\/$/);
  });

  it('starts with https', () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
  });
});

describe('BUSINESS', () => {
  it('has all NAP fields', () => {
    expect(BUSINESS.legalName).toBeTruthy();
    expect(BUSINESS.phone).toBeTruthy();
    expect(BUSINESS.phoneE164).toMatch(/^\+\d+$/);
    expect(BUSINESS.street).toBeTruthy();
    expect(BUSINESS.city).toBeTruthy();
    expect(BUSINESS.country).toBe('PK');
  });

  it('has valid opening hours', () => {
    expect(BUSINESS.openingHours.length).toBeGreaterThan(0);
    for (const slot of BUSINESS.openingHours) {
      expect(slot.days.length).toBeGreaterThan(0);
      expect(slot.opens).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.closes).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('has valid coordinates', () => {
    expect(BUSINESS.latitude).toBeGreaterThan(0);
    expect(BUSINESS.longitude).toBeGreaterThan(0);
  });
});

describe('DEPARTMENT_NAMES', () => {
  it('is a non-empty array of strings', () => {
    expect(DEPARTMENT_NAMES.length).toBeGreaterThan(0);
    for (const name of DEPARTMENT_NAMES) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

// ── absoluteUrl ──────────────────────────────────────────────────────

describe('absoluteUrl', () => {
  it('returns SITE_URL/ for no argument (default path is "/")', () => {
    expect(absoluteUrl()).toBe(`${SITE_URL}/`);
  });

  it('returns SITE_URL for empty string', () => {
    expect(absoluteUrl('')).toBe(SITE_URL);
  });

  it('returns SITE_URL for null', () => {
    expect(absoluteUrl(null)).toBe(SITE_URL);
  });

  it('prepends SITE_URL to a path with leading slash', () => {
    expect(absoluteUrl('/about')).toBe(`${SITE_URL}/about`);
  });

  it('prepends SITE_URL and adds slash for path without leading slash', () => {
    expect(absoluteUrl('about')).toBe(`${SITE_URL}/about`);
  });

  it('passes through absolute URLs unchanged', () => {
    const url = 'https://example.com/foo';
    expect(absoluteUrl(url)).toBe(url);
  });

  it('passes through http URLs unchanged', () => {
    const url = 'http://example.com/foo';
    expect(absoluteUrl(url)).toBe(url);
  });
});

// ── productPath ──────────────────────────────────────────────────────

describe('productPath', () => {
  it('encodes a simple name', () => {
    expect(productPath('Art Card')).toBe('/product/Art%20Card');
  });

  it('encodes special characters', () => {
    const name = 'Water Proof Tape 2"x5M China';
    const result = productPath(name);
    expect(result).toContain('/product/');
    expect(result).toContain(encodeURIComponent(name));
  });

  it('handles names with ampersand', () => {
    const result = productPath('Paper & Canvas');
    expect(result).toBe('/product/Paper%20%26%20Canvas');
  });
});

// ── slugify ──────────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Fine Arts')).toBe('fine-arts');
  });

  it('converts & to and', () => {
    expect(slugify('Paper & Canvas')).toBe('paper-and-canvas');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('collapses multiple special chars into one hyphen', () => {
    expect(slugify('a!!b@@c')).toBe('a-b-c');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});

// ── titleFromSlug ────────────────────────────────────────────────────

describe('titleFromSlug', () => {
  it('capitalises each word', () => {
    expect(titleFromSlug('fine-arts')).toBe('Fine Arts');
  });

  it('handles single word', () => {
    expect(titleFromSlug('stationery')).toBe('Stationery');
  });

  it('handles empty string', () => {
    expect(titleFromSlug('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(titleFromSlug(null)).toBe('');
    expect(titleFromSlug(undefined)).toBe('');
  });
});

// ── categoryPath ─────────────────────────────────────────────────────

describe('categoryPath', () => {
  it('returns /shop when no department', () => {
    expect(categoryPath()).toBe('/shop');
    expect(categoryPath(null)).toBe('/shop');
    expect(categoryPath('')).toBe('/shop');
  });

  it('returns /shop/{dept} when only department given', () => {
    expect(categoryPath('Paper & Canvas')).toBe('/shop/paper-and-canvas');
  });

  it('returns /shop/{dept}/{cat} when both given', () => {
    expect(categoryPath('Paper & Canvas', 'Art Card')).toBe('/shop/paper-and-canvas/art-card');
  });
});
