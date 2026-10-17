import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage Component', () => {
  it('renders with lazy loading by default for below-the-fold images', () => {
    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123"
        alt="Test Image"
        width={300}
        height={200}
      />
    );

    const img = screen.getByAltText('Test Image');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('fetchpriority')).toBe('low');
    expect(img.getAttribute('width')).toBe('300');
    expect(img.getAttribute('height')).toBe('200');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('renders with eager loading and high fetchpriority for LCP priority images', () => {
    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123"
        alt="LCP Hero"
        width={1200}
        height={600}
        priority={true}
      />
    );

    const img = screen.getByAltText('LCP Hero');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('generates responsive srcset and sizes when supported', () => {
    render(
      <OptimizedImage
        src="https://cdn.shopify.com/s/files/1/product.jpg"
        alt="Product"
        width={400}
        height={300}
        sizes="(min-width: 1024px) 400px, 100vw"
      />
    );

    const img = screen.getByAltText('Product');
    expect(img.getAttribute('srcset')).toContain('200w');
    expect(img.getAttribute('srcset')).toContain('400w');
    expect(img.getAttribute('sizes')).toBe('(min-width: 1024px) 400px, 100vw');
  });

  it('falls back to placeholder when src is missing', () => {
    render(
      <OptimizedImage
        src=""
        alt="Missing"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText('Missing');
    expect(img.getAttribute('src')).toBe('/images/placeholder.svg');
  });
});
