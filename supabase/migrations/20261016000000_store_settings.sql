-- Migration: Store Settings & Shipping Rates
-- Creates a single-row store_settings table for configurable business parameters

CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  standard_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
  goods_transport_min_fee NUMERIC(10, 2) NOT NULL DEFAULT 350.00,
  free_shipping_threshold NUMERIC(10, 2) DEFAULT NULL,
  is_free_shipping_enabled BOOLEAN NOT NULL DEFAULT false,
  contact_phone TEXT NOT NULL DEFAULT '0320 2220001',
  contact_whatsapp TEXT NOT NULL DEFAULT '923202220001',
  announcement_text TEXT DEFAULT '',
  is_announcement_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT store_settings_single_row CHECK (id = 1)
);

-- Seed default initial row if not exists
INSERT INTO public.store_settings (
  id,
  standard_delivery_fee,
  goods_transport_min_fee,
  free_shipping_threshold,
  is_free_shipping_enabled,
  contact_phone,
  contact_whatsapp
) VALUES (
  1,
  200.00,
  350.00,
  5000.00,
  false,
  '0320 2220001',
  '923202220001'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (public / anon / customers) can read store_settings
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Authenticated staff / owner can update store_settings
DROP POLICY IF EXISTS "Authenticated users can update store settings" ON public.store_settings;
CREATE POLICY "Authenticated users can update store settings"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_store_settings_update ON public.store_settings;
CREATE TRIGGER on_store_settings_update
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_store_settings_updated_at();
