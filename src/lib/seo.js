/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PER-ROUTE HEAD MANAGEMENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A single-page app has one <head> and many pages. Without something like this,
 * every URL on the site shares the home page's title, description and canonical
 * tag — which is what was happening: sixteen routes and ~600 product pages all
 * announcing themselves as "Nazir & Sons — Premium Paper, Fine Arts & Stationery".
 * Google collapses that into one indexed page and drops the rest as duplicates.
 *
 * The build also writes a correct static <head> into every prerendered route
 * (see scripts/prerender.js), so the tags are already right on first paint and
 * for crawlers that never run JavaScript. This hook is what keeps them right
 * during client-side navigation, when no new HTML document is ever fetched.
 *
 * It edits the existing tags in place rather than appending new ones, so a
 * prerendered page and a client-navigated page end up with byte-identical
 * heads instead of two competing descriptions.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SITE_URL,
  SITE_NAME,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from './site';
import { ROUTES, trailFor } from '../data/seo-content';
import { graph, baseGraphNodes, webPageSchema, breadcrumbSchema } from './schema';

const JSONLD_MARK = 'data-seo-graph';

/** Finds a head tag by selector, creating it (with the given attrs) if absent. */
function upsert(selector, tagName, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name, content) {
  const el = upsert(`meta[name="${name}"]`, 'meta', { name });
  el.setAttribute('content', content);
}

function setProperty(property, content) {
  const el = upsert(`meta[property="${property}"]`, 'meta', { property });
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  const el = upsert(`link[rel="${rel}"]`, 'link', { rel });
  el.setAttribute('href', href);
}

/**
 * The `robots` value for a page we do want indexed.
 *
 * The three `max-*` directives are what allow Google, and the AI summarisers
 * that honour the same tag, to quote a full-length snippet and show a large
 * image. Without them the default is a truncated snippet — which for an answer
 * engine means less of the page is eligible to be cited at all.
 */
export const INDEX_DIRECTIVES =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

export const NOINDEX_DIRECTIVES = 'noindex, follow';

/**
 * @param {object}  seo
 * @param {string}  seo.title            Full <title>, already including the brand.
 * @param {string}  seo.description      ~150 characters, written for a search result.
 * @param {string}  [seo.canonicalPath]  Defaults to the current pathname.
 * @param {string}  [seo.image]          Social card image; absolute or site-relative.
 * @param {string}  [seo.imageAlt]
 * @param {string}  [seo.type]           Open Graph type — 'website', 'article', 'product'.
 * @param {boolean} [seo.noindex]        Cart, tracking, 404 — real pages, not search results.
 * @param {object}  [seo.jsonLd]         A schema.org @graph object; see src/lib/schema.js.
 */
export function useSeo({
  title,
  description,
  canonicalPath,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const { pathname } = useLocation();
  const path = canonicalPath || pathname;
  const graphJson = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const url = absoluteUrl(path);
    const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);

    document.title = title;
    setMeta('description', description);
    setMeta('robots', noindex ? NOINDEX_DIRECTIVES : INDEX_DIRECTIVES);
    setLink('canonical', url);

    setProperty('og:site_name', SITE_NAME);
    setProperty('og:locale', SITE_LOCALE);
    setProperty('og:type', type);
    setProperty('og:title', title);
    setProperty('og:description', description);
    setProperty('og:url', url);
    setProperty('og:image', ogImage);
    setProperty('og:image:alt', imageAlt || title);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // The graph is replaced wholesale on every route change rather than merged.
    // Leaving the previous page's Product node behind would tell a crawler that
    // this URL is two different things at once.
    const previous = document.head.querySelectorAll(`script[${JSONLD_MARK}]`);
    for (const node of previous) node.remove();

    if (!graphJson) return undefined;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(JSONLD_MARK, '');
    script.textContent = graphJson;
    document.head.appendChild(script);

    return () => script.remove();
  }, [title, description, path, image, imageAlt, type, noindex, graphJson]);
}

/**
 * The common case: a route that already has an entry in src/data/seo-content.js.
 *
 * Pulls its title, description and indexability from there, attaches the
 * organisation / store / website graph that every page carries plus its own
 * WebPage and breadcrumb nodes, and lets a caller add whatever else that
 * particular page can prove — a FAQPage, an ItemList, a Product.
 *
 * @param {string} path                  Route key, e.g. '/shipping'.
 * @param {object} [options]
 * @param {Array}  [options.extraNodes]  Additional schema.org nodes for this page.
 * @param {string} [options.title]       Overrides the table, for dynamic routes.
 * @param {string} [options.description]
 * @param {Array}  [options.trail]       Breadcrumb trail, if not the default two levels.
 */
export function usePageSeo(path, options = {}) {
  const entry = ROUTES[path] || {};
  const title = options.title || entry.title;
  const description = options.description || entry.description;
  const canonicalPath = options.canonicalPath || path;
  const trail = options.trail || trailFor(path);

  useSeo({
    title,
    description,
    canonicalPath,
    image: options.image,
    imageAlt: options.imageAlt,
    type: options.type,
    noindex: options.noindex ?? entry.noindex ?? false,
    jsonLd: graph([
      ...baseGraphNodes(),
      webPageSchema({ path: canonicalPath, title, description, type: options.pageType }),
      breadcrumbSchema(trail),
      ...(options.extraNodes || []),
    ]),
  });
}

/** Site-relative or absolute — either way, what a meta tag needs. */
export { absoluteUrl, SITE_URL, SITE_NAME };
