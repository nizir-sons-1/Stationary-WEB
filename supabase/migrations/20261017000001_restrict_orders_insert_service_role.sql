-- ==============================================================================
-- Migration: Restrict orders INSERT to service_role (Price Integrity Protection)
-- Description:
--   1. Revokes direct INSERT permissions from 'anon' and 'authenticated' roles.
--   2. Ensures all order creation flows through verified server-side endpoints
--      (/api/checkout or Edge Function create-order) under service_role.
--   3. Eliminates client-side price tampering and catalog mismatch risks at the DB level.
-- ==============================================================================

-- 1. Revoke direct table-level INSERT permissions from untrusted roles
REVOKE INSERT ON orders FROM anon, authenticated;

-- 2. Drop weak public insert policy
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;

-- 3. Explicitly permit INSERT only to service_role
CREATE POLICY "orders_insert_service_role_only" ON orders
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Verify RLS is strictly active
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE orders IS 'Orders table: direct client inserts revoked. All inserts must be performed by service_role via verified backend checkout endpoints.';
