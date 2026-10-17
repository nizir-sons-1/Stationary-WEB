# Vulnerability Report: RLS INSERT policy lacks price/stock verification

## Title
RLS INSERT policy on orders table lacks price/stock verification enabling price manipulation

## Target
supabase/migrations/20261015000000_secure_orders_rls.sql (orders table RLS), /rest/v1/orders (POST INSERT)

## Description
The Supabase Row Level Security INSERT policy on the orders table (orders_insert_policy) validates phone number, customer name length, and that total_amount > 0, but does not verify the order total against the product catalog or check available stock. Because the public anon key is embedded in the frontend bundle, an attacker who bypasses or relaxes the RLS insert restriction could directly insert an order at an attacker-chosen price, bypassing the checkout API server-side price/stock verification.

## Technical Analysis
The orders table has RLS enabled. The INSERT policy orders_insert_policy (lines 67-76 of the migration) enforces phone validity, whatsapp validity, customer name not null, name length >= 2, and total_amount > 0. The only price-related check is total_amount > 0. There is no verification that total_amount matches the sum of items[*].price * quantity, no lookup of product_variations.price, and no stock availability check.

By contrast, the application checkout path (api/checkout.js verifyItemCatalog -> fetchDbVariation -> checkItemPriceAndStock) and the edge function (supabase/functions/create-order/index.ts verifyAndSanitizeItems) both perform server-side price and stock verification before inserting.

Direct INSERT via the public anon key is currently blocked by RLS (all tested inserts returned 42501 new row violates row-level security policy), so the exploit path is not live today. However, the defense-in-depth layer (the database policy itself) does not enforce price integrity, so any future relaxation of the insert restriction would immediately expose price manipulation.

## Proof of Concept
1. The public Supabase anon key is embedded in src/lib/supabase.js and .env.
2. Direct POST /rest/v1/orders inserts using the anon key were attempted with valid payloads (valid Pakistani phone, name >= 2 chars, total_amount of 0.01 and 100).
3. Every insert returned HTTP 401 with code 42501, message new row violates row-level security policy for table orders — the insert path is currently blocked by RLS.
4. Reviewing orders_insert_policy (migration lines 67-76) confirms the policy checks only phone validity, name length, and total_amount > 0; it never verifies price against product_variations or checks stock.
5. Had the insert restriction been relaxed, an attacker could insert an order for expensive items with total_amount set to an arbitrary low value (e.g., 0.01), causing financial loss.

## Evidence
- Anon key decoded: role anon, reachable at https://ygfcoasnftbzavefmqmt.supabase.co; GET /rest/v1/products returns HTTP 200.
- Direct POST /rest/v1/orders via anon key: HTTP 401 {"code":"42501","message":"new row violates row-level security policy for table \"orders\""} across minimal, full-payload, low-total (0.01), zero-total, and invalid-phone variants.
- RLS INSERT policy orders_insert_policy (migration lines 67-76) contains no catalog price or stock verification.
- Checkout API api/checkout.js and edge function supabase/functions/create-order/index.ts both perform server-side price/stock verification before insert.

## Counterevidence
All direct INSERT attempts via the public anon key are rejected by RLS (42501), even when meeting every stated WITH CHECK condition. The application checkout path and edge function both perform server-side price and stock verification. Therefore the specific attack (direct price manipulation via anon INSERT) is not currently exploitable; this is a latent defense-in-depth gap rather than an active vulnerability.

## Confidence
medium

## Confidence Rationale
Static evidence is strong (the RLS policy lacks price/stock verification), but dynamic validation shows the insert path is fully blocked by RLS, so the attack cannot be demonstrated live. Confidence is medium: the root cause is real and reachable if policy changes, but there is no working PoC against the current deployed state.

## Severity Change Conditions
If the RLS insert restriction is relaxed or a separate anon-permitted insert path is confirmed, this becomes a confirmed high-severity price-manipulation vulnerability (financial loss via arbitrary order pricing).

## CVSS Breakdown
{"attack_vector":"N","attack_complexity":"H","privileges_required":"N","user_interaction":"N","scope":"U","confidentiality":"N","integrity":"L","availability":"N"}

## Remediation Steps
Strengthen the orders_insert_policy RLS policy so it cannot permit an order whose total does not match the verified catalog price and available stock. Add a server-side check that recomputes the expected total from the items JSONB (validating each item's price against product_variations.price and confirming requested quantity does not exceed available stock) and rejects the insert when the client-supplied total_amount deviates from the recomputed total. Alternatively, restrict INSERT on orders to the service_role only and require all customer orders to flow through the verified checkout API / create-order edge function, which already performs price and stock validation. Apply the same price-integrity guard to any code path that inserts into orders.

## Fix (code location)
File: supabase/migrations/20261015000000_secure_orders_rls.sql lines 67-76
fix_before: CREATE POLICY "orders_insert_policy" ON orders FOR INSERT TO anon, authenticated WITH CHECK ( is_valid_pakistani_phone(customer_phone) AND (whatsapp_number IS NULL OR whatsapp_number = '' OR is_valid_pakistani_phone(whatsapp_number)) AND customer_name IS NOT NULL AND length(trim(customer_name)) >= 2 AND total_amount > 0 );
fix_after: CREATE POLICY "orders_insert_policy" ON orders FOR INSERT TO anon, authenticated WITH CHECK ( is_valid_pakistani_phone(customer_phone) AND (whatsapp_number IS NULL OR whatsapp_number = '' OR is_valid_pakistani_phone(whatsapp_number)) AND customer_name IS NOT NULL AND length(trim(customer_name)) >= 2 AND total_amount > 0 AND (SELECT COALESCE(SUM((item->>'price')::numeric * (item->>'quantity')::numeric), 0) FROM jsonb_array_elements(items) AS item) = total_amount );