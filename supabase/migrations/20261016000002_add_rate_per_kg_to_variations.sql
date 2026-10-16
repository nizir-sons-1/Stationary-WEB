-- Migration: Add rate_per_kg to product_variations
-- Enables custom paper size calculator (/calculator) to directly read and use
-- live market rates managed per variation in the admin products portal.

-- 1. Add rate_per_kg column if not already present
ALTER TABLE public.product_variations
ADD COLUMN IF NOT EXISTS rate_per_kg NUMERIC(10, 2);

COMMENT ON COLUMN public.product_variations.rate_per_kg IS 'Market rate in PKR per KG for paper products (used by live Custom Size Calculator)';

-- 2. Performance index for querying variations with rates
CREATE INDEX IF NOT EXISTS idx_product_variations_rate_per_kg
ON public.product_variations (product_id, rate_per_kg)
WHERE rate_per_kg IS NOT NULL;

-- 3. One-time backfill: calculate and populate rate_per_kg for all existing Paper & Canvas variations
-- Formula:
--   Weight in kg = (length * width * GSM * sheets) / 1,550,000
--   Rate per kg = price / Weight in kg
-- Note: Cards use 100 sheets per packet, while paper reams (rate100 > 750) use 500 sheets.
DO $$
BEGIN
  UPDATE public.product_variations pv
  SET rate_per_kg = ROUND(
    CASE
      -- When price / wt100 > 750, this variation is a 500-sheet ream (Offset Paper, Art Paper, News, etc.)
      WHEN (pv.price * 1550000.0) / (
        NULLIF(SPLIT_PART(LOWER(pv.size), 'x', 1)::numeric * SPLIT_PART(LOWER(pv.size), 'x', 2)::numeric * NULLIF(pv.gsm::numeric, 0) * 100.0, 0)
      ) > 750.0
      THEN (pv.price * 1550000.0) / (
        SPLIT_PART(LOWER(pv.size), 'x', 1)::numeric * SPLIT_PART(LOWER(pv.size), 'x', 2)::numeric * pv.gsm::numeric * 500.0
      )
      -- Otherwise 100-sheet packet (Art Card, Bleach Card, BoxBoard, Kraft Card, etc.)
      ELSE (pv.price * 1550000.0) / (
        SPLIT_PART(LOWER(pv.size), 'x', 1)::numeric * SPLIT_PART(LOWER(pv.size), 'x', 2)::numeric * pv.gsm::numeric * 100.0
      )
    END,
    2
  )
  FROM public.products p
  WHERE pv.product_id = p.id
    AND p.department = 'Paper & Canvas'
    AND (pv.rate_per_kg IS NULL OR pv.rate_per_kg = 0)
    AND pv.price > 0
    AND pv.size ~ '^[0-9]+(\.[0-9]+)?x[0-9]+(\.[0-9]+)?$'
    AND pv.gsm ~ '^[0-9]+(\.[0-9]+)?$'
    AND pv.gsm::numeric > 0;
END $$;
