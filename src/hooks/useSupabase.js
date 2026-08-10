import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Simple in-memory cache to prevent lag
let globalProductsCache = {};
let globalCountsCache = null;
let isFetchingProducts = {};

export function useProducts(category = null) {
  const cacheKey = category || 'all';
  const [, setTick] = useState(0);

  useEffect(() => {
    // If already cached, don't fetch again
    if (globalProductsCache[cacheKey]) {
      return;
    }

    // Prevent duplicate concurrent requests
    if (isFetchingProducts[cacheKey]) return;
    isFetchingProducts[cacheKey] = true;

    async function fetchProducts() {
      try {
        setTick(t => t + 1); // trigger loading render
        let query = supabase
          .from('products')
          .select(`
            id,
            product_name,
            category,
            description,
            image_url,
            product_variations (
              id, size, gsm, price, packing_type, stock
            )
          `);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error: err } = await query;

        if (err) throw err;
        
        globalProductsCache[cacheKey] = data || [];
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        isFetchingProducts[cacheKey] = false;
        setTick(t => t + 1); // trigger completion render
      }
    }

    fetchProducts();
  }, [category, cacheKey]);

  return { 
    products: globalProductsCache[cacheKey] || [], 
    loading: !globalProductsCache[cacheKey], 
    error: null 
  };
}

export function useCategoryCounts() {
  const [counts, setCounts] = useState(globalCountsCache || {});
  const [loading, setLoading] = useState(!globalCountsCache);

  useEffect(() => {
    if (globalCountsCache) {
      setCounts(globalCountsCache);
      setLoading(false);
      return;
    }

    async function fetchCounts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category');
        
        if (error) throw error;
        
        const countMap = {};
        data.forEach(item => {
          if (!countMap[item.category]) countMap[item.category] = 0;
          countMap[item.category]++;
        });
        
        globalCountsCache = countMap;
        setCounts(countMap);
      } catch (err) {
        console.error('Error fetching counts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  return { counts, loading };
}

export function useProduct(productName) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!productName) return;

      // Check cache first
      if (globalProductsCache['all']) {
        const cachedProduct = globalProductsCache['all'].find(p => p.product_name === productName);
        if (cachedProduct) {
          setProduct(cachedProduct);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select(`
            id,
            product_name,
            category,
            description,
            image_url,
            product_variations (
              id, size, gsm, price, packing_type, stock
            )
          `)
          .eq('product_name', productName)
          .single();

        if (err) throw err;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productName]);

  return { product, loading, error };
}
