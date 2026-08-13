import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';

/*
 * A tiny module-level store shared by every consumer.
 *
 * The previous version kept a plain object cache and bailed out of the effect
 * whenever a request was already in flight. A second component mounting during
 * that window never re-rendered when the data landed, so it stayed on its
 * loading skeleton forever. Everything now reads through useSyncExternalStore,
 * so one fetch notifies every subscriber.
 */

const EMPTY = Object.freeze([]);
const EMPTY_COUNTS = Object.freeze({});
const COUNTS_KEY = 'category-counts';
const CATALOG_KEY = 'products:all';

const entries = new Map(); // key -> { data, loading, error } (immutable snapshots)
const listeners = new Map(); // key -> Set<() => void>
const inflight = new Set(); // keys currently being fetched

const PENDING = Object.freeze({ data: EMPTY, loading: true, error: null });
const IDLE = Object.freeze({ data: EMPTY, loading: false, error: null });

function read(key) {
  return entries.get(key) || PENDING;
}

function write(key, snapshot) {
  entries.set(key, Object.freeze(snapshot));
  const subs = listeners.get(key);
  if (subs) for (const notify of subs) notify();
}

function subscribeTo(key, notify) {
  let subs = listeners.get(key);
  if (!subs) {
    subs = new Set();
    listeners.set(key, subs);
  }
  subs.add(notify);
  return () => {
    subs.delete(notify);
    if (subs.size === 0) listeners.delete(key);
  };
}

/**
 * Runs `loader` once per key and shares the result. Concurrent callers join the
 * in-flight request instead of firing a duplicate.
 */
function load(key, loader) {
  if (entries.has(key) || inflight.has(key)) return;
  inflight.add(key);

  loader()
    .then((data) => write(key, { data: data || EMPTY, loading: false, error: null }))
    .catch((err) => {
      console.error(`[supabase] failed to load "${key}"`, err);
      // Surface the failure instead of leaving the UI spinning forever.
      write(key, { data: EMPTY, loading: false, error: err.message || 'Request failed' });
    })
    .finally(() => inflight.delete(key));
}

// `image_url` on the variation is what lets a single product show a different
// photo per size/GSM. It was missing from this projection, so every variation
// silently fell back to the parent product image.
const PRODUCT_FIELDS = `
  id,
  product_name,
  category,
  description,
  image_url,
  product_variations (
    id, size, gsm, price, packing_type, stock, image_url
  )
`;

/**
 * @param {string|string[]|null} category  One category, several (the same shelf
 *                                is spelled more than one way in the data — see
 *                                src/data/categories.js), or null for everything.
 * @param {boolean} enabled       Set false to hold off the request until it is
 *                                actually needed (e.g. a closed search modal).
 */
export function useProducts(category = null, enabled = true) {
  // Sorted so ['A','B'] and ['B','A'] share one cache entry and one request.
  const names = category == null ? [] : [].concat(category).filter(Boolean).sort();
  const cacheKey = `products:${names.length ? names.join('|') : 'all'}`;

  const subscribe = useCallback((notify) => subscribeTo(cacheKey, notify), [cacheKey]);
  const getSnapshot = useCallback(() => (enabled ? read(cacheKey) : IDLE), [cacheKey, enabled]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // `names` is a fresh array each render; the key already encodes its contents.
  const filter = names.join('|');

  useEffect(() => {
    if (!enabled) return;
    load(cacheKey, async () => {
      const list = filter ? filter.split('|') : [];
      let query = supabase.from('products').select(PRODUCT_FIELDS).eq('is_hidden', false);
      if (list.length === 1) query = query.eq('category', list[0]);
      else if (list.length > 1) query = query.in('category', list);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    });
  }, [cacheKey, filter, enabled]);

  return { products: snapshot.data, loading: snapshot.loading, error: snapshot.error };
}

const subscribeCounts = (notify) => subscribeTo(COUNTS_KEY, notify);
const readCounts = () => read(COUNTS_KEY);

/**
 * Just enough to power the search list: name, category and thumbnail. The full
 * catalogue with every variation is a ~1 MB response; this one is ~150 kB, and
 * search never looks at a single field the heavier query adds.
 */
export function useProductIndex(enabled = true) {
  const cacheKey = 'product-index';

  const subscribe = useCallback((notify) => subscribeTo(cacheKey, notify), []);
  const getSnapshot = useCallback(() => (enabled ? read(cacheKey) : IDLE), [enabled]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!enabled) return;
    load(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, category, image_url, product_variations(id)')
        .eq('is_hidden', false);
      if (error) throw error;
      return data.filter(p => p.product_variations && p.product_variations.length > 0);
    });
  }, [enabled]);

  return { products: snapshot.data, loading: snapshot.loading, error: snapshot.error };
}

const EMPTY_STATS = Object.freeze({ counts: EMPTY_COUNTS, images: EMPTY_COUNTS });

/**
 * Per-category product tally plus one representative photo for each.
 *
 * The photo used to come from a hand-written table of stock Unsplash links,
 * which is why so many shelves shared a picture and several showed something
 * unrelated to what they sell. Pulling it from a product that is actually in
 * the category makes it correct by construction, and the extra column costs
 * one field on a query that was already being made.
 */
export function useCategoryCounts() {
  const snapshot = useSyncExternalStore(subscribeCounts, readCounts, readCounts);

  useEffect(() => {
    load(COUNTS_KEY, async () => {
      // Two narrow columns travel over the wire; the tally is done here.
      // Ordering makes the chosen photo stable between loads — without it
      // Postgres is free to return rows in any order and the card art would
      // flicker between products on every visit.
      const { data, error } = await supabase
        .from('products')
        .select('category, image_url')
        .eq('is_hidden', false)
        .order('product_name', { ascending: true });
      if (error) throw error;

      const counts = {};
      const images = {};
      const taken = new Set();

      for (const row of data) {
        if (!row.category) continue;
        counts[row.category] = (counts[row.category] || 0) + 1;

        // First usable photo wins, but never one another category already
        // claimed — a handful of products share a stock image, and two cards
        // showing the same picture is exactly what this is meant to prevent.
        if (row.image_url && !images[row.category] && !taken.has(row.image_url)) {
          images[row.category] = row.image_url;
          taken.add(row.image_url);
        }
      }

      // Categories whose every photo was already spoken for still deserve one;
      // a repeat beats a blank tile.
      for (const row of data) {
        if (row.category && row.image_url && !images[row.category]) {
          images[row.category] = row.image_url;
        }
      }

      return { counts, images };
    });
  }, []);

  const stats = snapshot.loading || snapshot.error ? EMPTY_STATS : snapshot.data;

  return {
    counts: stats.counts || EMPTY_COUNTS,
    images: stats.images || EMPTY_COUNTS,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}

export function useProduct(productName) {
  const cacheKey = productName ? `product:${productName}` : null;

  const subscribe = useCallback(
    (notify) => (cacheKey ? subscribeTo(cacheKey, notify) : () => {}),
    [cacheKey]
  );
  const getSnapshot = useCallback(() => (cacheKey ? read(cacheKey) : IDLE), [cacheKey]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!cacheKey) return;

    // Coming from the shop grid the full catalog is usually already resident —
    // reuse it rather than paying for another round trip.
    const catalog = entries.get(CATALOG_KEY);
    const hit = catalog?.data?.find((p) => p.product_name === productName);
    if (hit) {
      if (!entries.has(cacheKey)) write(cacheKey, { data: hit, loading: false, error: null });
      return;
    }

    /*
     * Deliberately not `.maybeSingle()`.
     *
     * 23 product names exist on more than one row — the same stock catalogued
     * under two categories, e.g. "IP SUN Art Card". PostgREST answers a
     * single-object request over two rows with a 406 and PGRST116, so every one
     * of those products rendered "Product not found" rather than a page. The
     * shop grid meanwhile showed a card for each row, so two tiles led to the
     * same dead URL.
     *
     * Fetching the rows and folding their variations together is what the page
     * has always claimed to show: one product, every size and GSM it comes in.
     * scripts/prerender.js merges them the same way, so the static HTML and the
     * live page describe the same thing.
     */
    load(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('product_name', productName);
      if (error) throw error;
      if (!data || data.length === 0) return null;

      const [first, ...rest] = data;
      if (rest.length === 0) return first;

      return {
        ...first,
        description: first.description || rest.find((r) => r.description)?.description || null,
        image_url: first.image_url || rest.find((r) => r.image_url)?.image_url || null,
        product_variations: data.flatMap((row) => row.product_variations || []),
      };
    });
  }, [cacheKey, productName]);

  return {
    product: snapshot.data === EMPTY ? null : snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}

// ── Reviews ──────────────────────────────────────────────────────────

const REVIEWS_KEY = 'reviews:all';

export function useReviews() {
  const subscribe = useCallback((notify) => subscribeTo(REVIEWS_KEY, notify), []);
  const getSnapshot = useCallback(() => read(REVIEWS_KEY), []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    load(REVIEWS_KEY, async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    });
  }, []);

  return {
    reviews: snapshot.data === EMPTY ? [] : snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}

/**
 * Insert a new review and refresh the cache so the UI updates immediately.
 */
export async function submitReview({ name, rating, text }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ name, rating, text, verified: false, helpful: 0 })
    .select()
    .single();

  if (error) throw error;

  // Prepend the new review to the existing cache so it shows instantly.
  const current = entries.get(REVIEWS_KEY);
  if (current && current.data && current.data !== EMPTY) {
    write(REVIEWS_KEY, { ...current, data: [data, ...current.data] });
  } else {
    // Force a full refetch if cache was empty.
    entries.delete(REVIEWS_KEY);
    inflight.delete(REVIEWS_KEY);
  }

  return data;
}
