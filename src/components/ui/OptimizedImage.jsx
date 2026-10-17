import React from 'react';
import { thumb, thumbSrcSet, fallbackOnError, PLACEHOLDER_IMAGE } from '../../lib/images';

/**
 * High-performance responsive image component.
 *
 * Features:
 * - Automatic CDN thumbnailing and responsive `srcset` generation (Shopify, Supabase Storage, Unsplash)
 * - Native `loading="lazy"` on below-the-fold images by default
 * - `priority={true}` for LCP hero images: applies `loading="eager"` + `fetchPriority="high"`
 * - Explicit `width` and `height` to eliminate Cumulative Layout Shift (CLS)
 * - Safe single-fire SVG placeholder onError fallback
 */
export default function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  widths,
  onError,
  decoding = 'async',
  ...rest
}) {
  const isEager = priority || loading === 'eager';
  const effectiveSrc = src ? thumb(src, width || 400) : PLACEHOLDER_IMAGE;
  const effectiveSrcSet = src ? thumbSrcSet(src, widths) : undefined;

  return (
    <img
      src={effectiveSrc}
      srcSet={effectiveSrcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={isEager ? 'eager' : 'lazy'}
      fetchPriority={isEager ? 'high' : 'low'}
      decoding={decoding}
      onError={onError || fallbackOnError}
      className={className}
      {...rest}
    />
  );
}
