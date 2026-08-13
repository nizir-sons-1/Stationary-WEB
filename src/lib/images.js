/*
 * Image plumbing shared by every grid in the shop.
 *
 * Two things were going wrong before this existed:
 *
 *  1. The "no photo" fallback pointed at an Unsplash photo that has since been
 *     removed, so a missing product image rendered a broken-image icon — and
 *     the onError handler then swapped in a URL that 404s just as hard.
 *  2. Product photography is served at full resolution (often 1500–2500 px)
 *     into tiles that are 150–400 px wide. On a phone that is megabytes of
 *     pixels decoded and thrown away.
 */

/** Ships with the site, so it can never go missing the way the old one did. */
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Shopify's CDN resizes on request, which is where nearly all of the catalogue
 * photography lives. Anything else is returned untouched.
 *
 * @param {string} url    original image URL
 * @param {number} width  the widest the image is ever painted, in CSS pixels
 */
export function thumb(url, width) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
  if (!url.includes('cdn.shopify.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('width', String(width));
    return u.toString();
  } catch {
    // A malformed URL is not worth taking a render down for.
    return url;
  }
}

/**
 * A `srcset` of width candidates for the same image.
 *
 * Width descriptors rather than 1x/2x: a tile in this layout is ~135 px across
 * on a phone and ~240 px on a wide desktop, so a fixed 2x pair either starves
 * the desktop or makes the phone download roughly twice the pixels it can
 * display. With `w` descriptors and a `sizes` hint the browser solves for the
 * real slot width and its own device pixel ratio.
 *
 * @param {string} url        original image URL
 * @param {number[]} widths   candidate widths to offer
 */
export function thumbSrcSet(url, widths = [200, 300, 400, 600, 800]) {
  if (!url || typeof url !== 'string' || !url.includes('cdn.shopify.com')) return undefined;
  return widths.map((w) => `${thumb(url, w)} ${w}w`).join(', ');
}

/**
 * Drop-in `onError` for any <img>. Swaps to the local placeholder exactly once —
 * the guard matters because assigning a src that also fails would loop forever.
 */
export function fallbackOnError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.srcset = '';
  img.src = PLACEHOLDER_IMAGE;
}
