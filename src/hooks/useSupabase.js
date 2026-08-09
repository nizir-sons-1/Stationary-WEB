import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts(category = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
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
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  return { products, loading, error };
}

export function useCategoryCounts() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
