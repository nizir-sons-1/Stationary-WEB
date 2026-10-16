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
const timestamps = new Map(); // key -> timestamp of last successful fetch
const loaders = new Map(); // key -> loader function for revalidation
const CACHE_TTL_MS = 10000; // 10 seconds stale-while-revalidate threshold

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
 * in-flight request instead of firing a duplicate. Supports stale-while-revalidate
 * and background revalidation on window focus.
 */
function load(key, loader, force = false) {
  loaders.set(key, loader);

  const existing = entries.get(key);
  const isStale = !timestamps.has(key) || Date.now() - (timestamps.get(key) || 0) > CACHE_TTL_MS;

  if (existing && !isStale && !force) return;
  if (inflight.has(key)) return;
  inflight.add(key);

  loader()
    .then((data) => {
      timestamps.set(key, Date.now());
      write(key, { data: data || EMPTY, loading: false, error: null });
    })
    .catch((err) => {
      console.error(`[supabase] failed to load "${key}"`, err);
      if (!existing) {
        write(key, { data: EMPTY, loading: false, error: err.message || 'Request failed' });
      }
    })
    .finally(() => inflight.delete(key));
}

// Automatically revalidate active queries when switching back from admin tab to storefront
if (typeof window !== 'undefined') {
  const handleWindowFocus = () => {
    for (const [key, loaderFn] of loaders.entries()) {
      const subs = listeners.get(key);
      if (subs && subs.size > 0) {
        load(key, loaderFn, true);
      }
    }
  };
  window.addEventListener('focus', handleWindowFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleWindowFocus();
  });
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
  installment_hidden,
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
  let categoryList = [];
  if (Array.isArray(category)) {
    categoryList = category;
  } else if (category != null) {
    categoryList = [category];
  }
  const names = categoryList
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
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
        .select('id, product_name, category, image_url, product_variations(id, price)')
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

// ── Department & category artwork and visibility ─────────────────────────
//
// Departments and categories are free-text columns on `products`, so until now
// their pictures could only live in src/data/categories.js — editing one meant
// a code change and a redeploy. `taxonomy_images` is a small table the admin
// panel writes to (see supabase/taxonomy_images.sql in the admin repo); a row
// there overrides the bundled artwork for one shelf, and its `is_hidden` flag
// (supabase/taxonomy_hidden.sql) takes the whole shelf off the shop.
//
// The table is treated as optional on purpose. If it has not been created the
// request 404s, the shop logs it and carries on with exactly the artwork it had
// before — a missing image table is not a reason to take the storefront down.
// The `is_hidden` column is optional in the same way and for the same reason:
// if only the first migration has been run the query is retried without it, and
// every shelf stays visible, which is the behaviour the shop had before.

const TAXONOMY_KEY = 'taxonomy-images';
const EMPTY_TAXONOMY = Object.freeze({
  department: {},
  category: {},
  hidden: { department: {}, category: {} },
  installment_hidden: { department: {}, category: {} },
});

// Postgres' "column does not exist" — taxonomy_hidden.sql has not been run.
const MISSING_COLUMN = '42703';

export function useTaxonomyImages() {
  const subscribe = useCallback((notify) => subscribeTo(TAXONOMY_KEY, notify), []);
  const getSnapshot = useCallback(() => read(TAXONOMY_KEY), []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    load(TAXONOMY_KEY, async () => {
      const withHidden = await supabase
        .from('taxonomy_images')
        .select('kind, name, image_url, is_hidden, installment_hidden');

      if (!withHidden.error) return shapeTaxonomy(withHidden.data);

      // PGRST205 is "no such table" — the migration has not been run yet.
      if (withHidden.error.code === 'PGRST205') return EMPTY_TAXONOMY;

      if (withHidden.error.code === MISSING_COLUMN || /is_hidden/i.test(withHidden.error.message || '')) {
        const fallback = await supabase.from('taxonomy_images').select('kind, name, image_url');
        if (fallback.error) {
          if (fallback.error.code === 'PGRST205') return EMPTY_TAXONOMY;
          throw fallback.error;
        }
        return shapeTaxonomy(fallback.data);
      }

      throw withHidden.error;
    });
  }, []);

  // An outright failure falls back to the bundled artwork rather than blanking
  // every tile on the homepage — and, just as deliberately, hides nothing: a
  // dropped request must not be able to empty the shop.
  const data = snapshot.loading || snapshot.error || snapshot.data === EMPTY ? EMPTY_TAXONOMY : snapshot.data;

  return {
    departmentImages: data.department || EMPTY_COUNTS,
    categoryImages: data.category || EMPTY_COUNTS,
    hiddenDepartments: data.hidden?.department || EMPTY_COUNTS,
    hiddenCategories: data.hidden?.category || EMPTY_COUNTS,
    hiddenInstallmentDepartments: data.installment_hidden?.department || EMPTY_COUNTS,
    hiddenInstallmentCategories: data.installment_hidden?.category || EMPTY_COUNTS,
    loading: snapshot.loading,
  };
}

function shapeTaxonomy(rows) {
  const out = { department: {}, category: {}, hidden: { department: {}, category: {} }, installment_hidden: { department: {}, category: {} } };
  for (const row of rows || []) {
    if (!out[row.kind]) continue;
    if (row.image_url) out[row.kind][row.name] = row.image_url;
    if (row.is_hidden) out.hidden[row.kind][row.name] = true;
    if (row.installment_hidden) out.installment_hidden[row.kind][row.name] = true;
  }
  return out;
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
  if (current?.data && current.data !== EMPTY) {
    write(REVIEWS_KEY, { ...current, data: [data, ...current.data] });
  } else {
    // Force a full refetch if cache was empty.
    entries.delete(REVIEWS_KEY);
    inflight.delete(REVIEWS_KEY);
  }

  return data;
}

const SETTINGS_KEY = 'store-settings';
export const DEFAULT_STORE_SETTINGS = Object.freeze({
  id: 1,
  standard_delivery_fee: 200,
  goods_transport_min_fee: 350,
  free_shipping_threshold: null,
  is_free_shipping_enabled: false,
  contact_phone: '0320 2220001',
  contact_whatsapp: '923202220001',
  announcement_text: '',
  is_announcement_enabled: false,
});

export function normalizeStoreSettings(data) {
  if (!data) return DEFAULT_STORE_SETTINGS;
  const isFreeEnabled = Boolean(data.is_free_shipping_enabled);
  const thresholdVal = Number.parseFloat(data.free_shipping_threshold);
  return {
    id: data.id || 1,
    standard_delivery_fee: Number.isFinite(Number.parseFloat(data.standard_delivery_fee))
      ? Number.parseFloat(data.standard_delivery_fee)
      : 200,
    goods_transport_min_fee: Number.isFinite(Number.parseFloat(data.goods_transport_min_fee))
      ? Number.parseFloat(data.goods_transport_min_fee)
      : 350,
    free_shipping_threshold: isFreeEnabled && Number.isFinite(thresholdVal) ? thresholdVal : null,
    is_free_shipping_enabled: isFreeEnabled,
    contact_phone: (data.contact_phone || '0320 2220001').trim(),
    contact_whatsapp: (data.contact_whatsapp || '923202220001').trim(),
    announcement_text: (data.announcement_text || '').trim(),
    is_announcement_enabled: Boolean(data.is_announcement_enabled),
    extra_configs: data.extra_configs || {},
    updated_at: data.updated_at || null,
  };
}

export function useStoreSettings() {
  const subscribe = useCallback((notify) => subscribeTo(SETTINGS_KEY, notify), []);
  const getSnapshot = useCallback(() => read(SETTINGS_KEY), []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    load(SETTINGS_KEY, async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          return DEFAULT_STORE_SETTINGS;
        }
        console.warn('[useStoreSettings] error fetching store_settings:', error.message);
        return DEFAULT_STORE_SETTINGS;
      }
      return normalizeStoreSettings(data);
    });
  }, []);

  const data =
    snapshot.loading || snapshot.error || snapshot.data === EMPTY
      ? DEFAULT_STORE_SETTINGS
      : snapshot.data;

  return {
    settings: data,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}

export function useSettings() {
  const { settings, loading, error } = useStoreSettings();

  const standardDeliveryFee = settings.standard_delivery_fee;
  const goodsTransportMinFee = settings.goods_transport_min_fee;
  const isFreeShippingEnabled = settings.is_free_shipping_enabled;
  const freeShippingThreshold = settings.free_shipping_threshold;

  const contactPhone = settings.contact_phone || '0320 2220001';
  let phoneE164 = contactPhone.startsWith('+')
    ? contactPhone.replace(/\s+/g, '')
    : '+92' + contactPhone.replace(/\D/g, '').replace(/^0/, '');
  if (!phoneE164.startsWith('+92')) phoneE164 = '+923202220001';

  let rawWa = (settings.contact_whatsapp || '923202220001').replace(/\D/g, '');
  if (rawWa.startsWith('03') && rawWa.length === 11) {
    rawWa = '92' + rawWa.slice(1);
  }
  const contactWhatsapp = rawWa || '923202220001';
  const whatsappUrl = `https://wa.me/${contactWhatsapp}`;

  const isAnnouncementEnabled = settings.is_announcement_enabled;
  const announcementText = settings.announcement_text;
  const hasAnnouncement = isAnnouncementEnabled && announcementText.length > 0;

  return {
    settings,
    loading,
    error,
    standardDeliveryFee,
    goodsTransportMinFee,
    isFreeShippingEnabled,
    freeShippingThreshold,
    contactPhone,
    phoneE164,
    contactWhatsapp,
    whatsappUrl,
    isAnnouncementEnabled,
    announcementText,
    hasAnnouncement,
  };
}

const CALCULATOR_RATES_KEY = 'calculator-rates:products';

export function parseDimensions(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return null;
  const parts = sizeStr.toLowerCase().split(/[x×]/).map((s) => s.trim());
  if (parts.length === 2) {
    const l = Number.parseFloat(parts[0]);
    const w = Number.parseFloat(parts[1]);
    if (Number.isFinite(l) && Number.isFinite(w) && l > 0 && w > 0) {
      return { length: l, width: w };
    }
  }
  return null;
}

export function deriveRatePerKg(price, length, width, gsm, ratePerKg) {
  const directRate = Number(ratePerKg);
  if (Number.isFinite(directRate) && directRate > 0) {
    return directRate;
  }
  const p = Number(price);
  const l = Number(length);
  const w = Number(width);
  const g = Number(gsm);
  if (!p || !l || !w || !g) return 0;

  // Standard paper weight formula: (length * width * GSM * sheets) / 1,550,000
  const wt100 = (l * w * g * 100) / 1550000;
  if (wt100 <= 0) return 0;
  const rate100 = p / wt100;

  // Paper in Pakistan trades at ~150-550 PKR/KG. If rate100 > 750, price was for a 500-sheet ream.
  const is500Sheets = rate100 > 750;
  const rate = is500Sheets ? rate100 / 5 : rate100;
  return Math.round(rate);
}

function normalizePaperCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'General';
  const c = cat.trim();
  if (c === 'Art Cards') return 'Art Card';
  if (c === 'Color Cards') return 'Color Card';
  return c;
}

function extractBrandCalculatorData(prod) {
  const categoryName = normalizePaperCategory(prod.category);
  const brandName = prod.product_name?.trim() || categoryName;
  const variations = prod.product_variations || [];

  const validRates = [];
  const gsmsSet = new Set();
  const lengthsSet = new Set();
  const widthsSet = new Set();
  const gsmRates = {};

  for (const v of variations) {
    const dim = parseDimensions(v.size);
    const gsmNum = Number.parseFloat(v.gsm);
    const priceNum = Number.parseFloat(v.price);
    if (!dim || !Number.isFinite(gsmNum) || gsmNum <= 0) continue;

    const rate = deriveRatePerKg(priceNum, dim.length, dim.width, gsmNum, v.rate_per_kg);
    if (rate > 0) {
      gsmRates[String(gsmNum)] = rate;
      validRates.push(rate);
    }

    lengthsSet.add(dim.length);
    widthsSet.add(dim.width);
    gsmsSet.add(gsmNum);
  }

  if (validRates.length === 0) return null;

  return {
    categoryName,
    brandObj: {
      id: prod.id,
      name: brandName,
      rate: Math.max(...validRates),
      gsmRates,
      gsms: Array.from(gsmsSet).sort((a, b) => a - b).map(String),
      lengths: Array.from(lengthsSet).sort((a, b) => a - b).map(String),
      widths: Array.from(widthsSet).sort((a, b) => a - b).map(String),
    },
  };
}

export function transformProductsToCalculatorCategories(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return EMPTY;
  }
  const map = new Map();

  for (const prod of products) {
    const parsed = extractBrandCalculatorData(prod);
    if (!parsed) continue;

    const { categoryName, brandObj } = parsed;
    if (!map.has(categoryName)) {
      map.set(categoryName, []);
    }
    map.get(categoryName).push(brandObj);
  }

  const result = [];
  for (const [name, brands] of map.entries()) {
    brands.sort((a, b) => a.name.localeCompare(b.name));
    result.push({ name, brands });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));

  return result.length > 0 ? result : EMPTY;
}

export function useCalculatorRates() {
  const subscribe = useCallback((notify) => subscribeTo(CALCULATOR_RATES_KEY, notify), []);
  const getSnapshot = useCallback(() => read(CALCULATOR_RATES_KEY), []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    load(CALCULATOR_RATES_KEY, async () => {
      // Query Paper & Canvas products with their variations
      // First attempt includes rate_per_kg column from product_variations
      let { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          category,
          department,
          product_variations (
            id,
            size,
            gsm,
            price,
            packing_type,
            rate_per_kg
          )
        `)
        .eq('department', 'Paper & Canvas')
        .order('category', { ascending: true })
        .order('product_name', { ascending: true });

      // If rate_per_kg column has not yet been added to Postgres (code 42703), retry query without it
      if (error && (error.code === '42703' || /rate_per_kg/i.test(error.message || ''))) {
        const fallback = await supabase
          .from('products')
          .select(`
            id,
            product_name,
            category,
            department,
            product_variations (
              id,
              size,
              gsm,
              price,
              packing_type
            )
          `)
          .eq('department', 'Paper & Canvas')
          .order('category', { ascending: true })
          .order('product_name', { ascending: true });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.warn('[useCalculatorRates] error fetching paper products:', error.message);
        throw error;
      }

      return transformProductsToCalculatorCategories(data || []);
    });
  }, []);

  const categories =
    !snapshot.loading && !snapshot.error && snapshot.data !== EMPTY && Array.isArray(snapshot.data)
      ? snapshot.data
      : EMPTY;

  return {
    categories,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}
