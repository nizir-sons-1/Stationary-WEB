-- ==============================================================================
-- Migration: Secure Orders Table with Row Level Security (RLS)
-- Description: Enforces least privilege on 'orders' table.
--              - Prevents unauthenticated data dumping (anon SELECT * returns 0 rows)
--              - Enforces valid Pakistani phone number on INSERT
--              - Restricts SELECT to exact order ID or verified customer phone
--              - Provides secure RPC for exact order tracking
-- ==============================================================================

-- 1. Enable Row Level Security (RLS) on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing permissive policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Allow public read" ON orders;
DROP POLICY IF EXISTS "Allow public insert" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_select_policy" ON orders;

-- 3. Validation helper for Pakistani phone numbers
CREATE OR REPLACE FUNCTION is_valid_pakistani_phone(phone text)
RETURNS boolean AS $$
DECLARE
  digits text;
  rest text;
BEGIN
  IF phone IS NULL OR trim(phone) = '' THEN
    RETURN false;
  END IF;

  -- Strip all non-digits
  digits := regexp_replace(phone, '\D', '', 'g');

  -- Normalize international prefixes to local 03XXXXXXXXX format
  IF digits ~ '^923[0-9]{9}$' THEN
    digits := '0' || substring(digits from 3);
  ELSIF digits ~ '^00923[0-9]{9}$' THEN
    digits := '0' || substring(digits from 5);
  ELSIF digits ~ '^3[0-9]{9}$' THEN
    digits := '0' || digits;
  END IF;

  -- Must be strictly 11 digits starting with '03'
  IF NOT digits ~ '^03[0-9]{9}$' THEN
    RETURN false;
  END IF;

  rest := substring(digits from 3);

  -- Reject repeating dummy numbers (e.g., 03000000000, 03111111111, 03999999999)
  IF rest ~ '^([0-9])\1{8}$' THEN
    RETURN false;
  END IF;

  -- Reject sequential test numbers
  IF rest = '123456789' OR rest = '987654321' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. INSERT Policy: Allow inserting orders only with valid data and verified phone
CREATE POLICY "orders_insert_policy" ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  is_valid_pakistani_phone(customer_phone)
  AND (whatsapp_number IS NULL OR whatsapp_number = '' OR is_valid_pakistani_phone(whatsapp_number))
  AND customer_name IS NOT NULL
  AND length(trim(customer_name)) >= 2
  AND total_amount > 0
);

-- 5. SELECT Policy: Restrict direct SELECT to matching session context
-- Note: Direct 'SELECT * FROM orders' by anon key will return 0 rows.
CREATE POLICY "orders_select_policy" ON orders
FOR SELECT
TO anon, authenticated
USING (
  (
    nullif(current_setting('app.current_order_id', true), '') IS NOT NULL
    AND (
      id::text = current_setting('app.current_order_id', true)
      OR substring(id::text, 1, 8) = lower(current_setting('app.current_order_id', true))
    )
  )
  OR
  (
    nullif(current_setting('app.current_phone', true), '') IS NOT NULL
    AND customer_phone = current_setting('app.current_phone', true)
  )
);

-- 6. No UPDATE or DELETE policies for anon / authenticated:
-- Only service_role (Admin / Edge Function / Backend) can modify or delete orders.

-- 7. Secure RPC Function for Customer Order Tracking (Exact Match Only)
-- Replaces insecure partial '.ilike.%phone%' matching.
CREATE OR REPLACE FUNCTION get_tracked_order(search_query text)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  customer_name text,
  customer_phone text,
  whatsapp_number text,
  customer_email text,
  customer_address text,
  shipping_method text,
  payment_method text,
  total_amount numeric,
  status text,
  items jsonb
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean text;
  clean_phone text;
BEGIN
  clean := trim(coalesce(search_query, ''));

  -- Strip leading '#' if present
  IF clean LIKE '#%' THEN
    clean := trim(substring(clean from 2));
  END IF;

  IF length(clean) < 3 THEN
    RETURN;
  END IF;

  -- Option A: Exact 8-character hex prefix
  IF clean ~* '^[0-9a-f]{8}$' THEN
    RETURN QUERY
    SELECT o.id, o.created_at, o.customer_name, o.customer_phone, o.whatsapp_number,
           o.customer_email, o.customer_address, o.shipping_method, o.payment_method,
           o.total_amount, o.status, o.items
    FROM orders o
    WHERE substring(o.id::text, 1, 8) = lower(clean)
    ORDER BY o.created_at DESC
    LIMIT 1;
    RETURN;
  END IF;

  -- Option B: Full UUID
  IF clean ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN QUERY
    SELECT o.id, o.created_at, o.customer_name, o.customer_phone, o.whatsapp_number,
           o.customer_email, o.customer_address, o.shipping_method, o.payment_method,
           o.total_amount, o.status, o.items
    FROM orders o
    WHERE o.id::text = lower(clean)
    ORDER BY o.created_at DESC
    LIMIT 1;
    RETURN;
  END IF;

  -- Option C: Strictly Valid 11-digit Pakistani Phone (EXACT match only, no wildcards)
  IF is_valid_pakistani_phone(clean) THEN
    clean_phone := regexp_replace(clean, '\D', '', 'g');
    IF clean_phone ~ '^923[0-9]{9}$' THEN
      clean_phone := '0' || substring(clean_phone from 3);
    ELSIF clean_phone ~ '^00923[0-9]{9}$' THEN
      clean_phone := '0' || substring(clean_phone from 5);
    ELSIF clean_phone ~ '^3[0-9]{9}$' THEN
      clean_phone := '0' || clean_phone;
    END IF;

    RETURN QUERY
    SELECT o.id, o.created_at, o.customer_name, o.customer_phone, o.whatsapp_number,
           o.customer_email, o.customer_address, o.shipping_method, o.payment_method,
           o.total_amount, o.status, o.items
    FROM orders o
    WHERE o.customer_phone = clean_phone OR o.whatsapp_number = clean_phone
    ORDER BY o.created_at DESC
    LIMIT 5;
    RETURN;
  END IF;

  -- If neither exact ID nor valid 11-digit phone, return empty (prevents enumeration)
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant execution of tracking RPC to public anon
GRANT EXECUTE ON FUNCTION get_tracked_order(text) TO anon, authenticated;
