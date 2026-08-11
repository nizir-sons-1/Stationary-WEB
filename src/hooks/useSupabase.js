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
 * @param {string|null} category  Filter by category, or null for the whole catalog.
 * @param {boolean} enabled       Set false to hold off the request until it is
 *                                actually needed (e.g. a closed search modal).
 */
export function useProducts(category = null, enabled = true) {
  const cacheKey = `products:${category || 'all'}`;

  const subscribe = useCallback((notify) => subscribeTo(cacheKey, notify), [cacheKey]);
  const getSnapshot = useCallback(() => (enabled ? read(cacheKey) : IDLE), [cacheKey, enabled]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!enabled) return;
    load(cacheKey, async () => {
      let query = supabase.from('products').select(PRODUCT_FIELDS);
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    });
  }, [cacheKey, category, enabled]);

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
        .select('id, product_name, category, image_url');
      if (error) throw error;
      return data;
    });
  }, [enabled]);

  return { products: snapshot.data, loading: snapshot.loading, error: snapshot.error };
}

export function useCategoryCounts() {
  const snapshot = useSyncExternalStore(subscribeCounts, readCounts, readCounts);

  useEffect(() => {
    load(COUNTS_KEY, async () => {
      // Only the category column travels over the wire; the tally is done here.
      const { data, error } = await supabase.from('products').select('category');
      if (error) throw error;

      const counts = {};
      for (const row of data) {
        if (!row.category) continue;
        counts[row.category] = (counts[row.category] || 0) + 1;
      }
      return counts;
    });
  }, []);

  return {
    counts: snapshot.loading || snapshot.error ? EMPTY_COUNTS : snapshot.data,
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

    load(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('product_name', productName)
        .maybeSingle();
      if (error) throw error;
      return data;
    });
  }, [cacheKey, productName]);

  return {
    product: snapshot.data === EMPTY ? null : snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}
