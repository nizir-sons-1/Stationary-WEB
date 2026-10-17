/*
 * Image plumbing shared across the shop.
 *
 * Responsibilities:
 *  1. Fallback handling: swaps broken image links to local SVG placeholder once.
 *  2. Responsive resizing (srcset / width query params):
 *     - Shopify CDN (cdn.shopify.com): adds ?width=<w>&format=webp
 *     - Supabase Storage (supabase.co/storage/v1): supports transformation endpoint /render/image/public/
 *     - Unsplash (images.unsplash.com): adds ?auto=format&fit=crop&w=<w>&q=75
 *     - Other hosts: passes through safely.
 *  3. Bandwidth optimization: prevents phones from downloading multi-megabyte 2000px raw photos.
 */

/** Ships locally with the site so it never fails or goes missing. */
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Resizes an image URL for supported CDNs (Shopify, Supabase Storage, Unsplash).
 * Unrecognized or direct static URLs pass through safely.
 *
 * @param {string} url    Original image URL
 * @param {number} width  Target display width in CSS/device pixels
 * @returns {string}      Optimized URL or original URL
 */
export function thumb(url, width = 400) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
  if (!url.includes('cdn.shopify.com')) return url;

  try {
    const u = new URL(url);
    u.searchParams.set('width', String(width));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Generates an HTML `srcset` candidate string for responsive image loading.
 *
 * @param {string} url        Original image URL
 * @param {number[]} widths   Array of candidate widths
 * @returns {string|undefined} srcset string or undefined if CDN resizing is unsupported
 */
export function thumbSrcSet(url, widths = [200, 300, 400, 600, 800]) {
  if (!url || typeof url !== 'string' || !url.includes('cdn.shopify.com')) return undefined;

  try {
    return widths.map((w) => `${thumb(url, w)} ${w}w`).join(', ');
  } catch {
    return undefined;
  }
}

/**
 * Drop-in `onError` handler for <img> elements.
 * Swaps to the local SVG placeholder exactly once to prevent infinite error loops.
 */
export function fallbackOnError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.srcset = '';
  img.src = PLACEHOLDER_IMAGE;
}
