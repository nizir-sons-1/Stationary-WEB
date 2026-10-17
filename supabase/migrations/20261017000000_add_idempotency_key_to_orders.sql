-- ==============================================================================
-- Migration: Add idempotency_key to orders and enforce uniqueness
-- Description:
--   1. Adds 'idempotency_key' column (text, nullable) to orders table.
--   2. Adds partial unique index on (customer_phone, idempotency_key) where
--      idempotency_key IS NOT NULL to prevent double-charging / duplicate orders
--      at the database level (defense-in-depth).
-- ==============================================================================

-- 1. Add idempotency_key column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- 2. Add partial unique index for defense-in-depth
-- Multiple orders without an idempotency key (NULL) are permitted, but duplicate
-- non-null idempotency keys for the same customer phone are strictly rejected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_customer_phone_idempotency_key 
ON orders (customer_phone, idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- 3. Documentation comments
COMMENT ON COLUMN orders.idempotency_key IS 'Client-provided idempotency key used to prevent duplicate order creation upon retries or rapid re-submissions.';
