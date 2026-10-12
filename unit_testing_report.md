# Unit Testing Report — Nazir & Sons E-Commerce
04 September 2026

We ran a total of **100 test cases** across 7 areas of the system. Everything passed, zero failures.

---

## Areas Covered

**Site URLs & Links (29 tests)**  
Checked that all page URLs generate correctly — product pages, category pages, department pages. Special characters in product names (spaces, quotes, "&" etc.) are encoded properly so links don't break. Also verified that business info like address, phone number, and store hours stays consistent wherever it appears on the site.

**Image Loading (11 tests)**  
Product images resize properly depending on screen size. If a product has no image or the image link is broken, the system shows a placeholder instead of a broken icon. Tested edge cases like empty URLs and non-CDN images.

**SEO & Google Data (24 tests)**  
The site generates structured data (schema.org) that Google and other search engines read. Tested that Organization, Store, Product, FAQ, and Breadcrumb data all generate with the correct format. Products with one size come through as "Product", products with multiple sizes/GSMs come through as "ProductGroup" — this matters for how Google shows them in search results.

**Shopping Cart (13 tests)**  
Add to cart, remove from cart, update quantity, clear cart — all covered. Verified that adding the same product twice increases quantity instead of creating a duplicate. Bulk orders, regular orders, and installment orders stay as separate line items even if they're the same product. Cart total and count compute correctly. Also tested that the cart survives a browser close — items are still there when the customer comes back.

**Data Processing (13 tests)**  
Category product counts are tallied correctly. Category tile images are deduplicated so two categories don't end up showing the same photo. Products that exist under multiple categories in the database are merged on the detail page — all their variations show up together.

**Newsletter Subscription API (5 tests)**  
Invalid emails get rejected. If the email service is down, the user gets a proper error instead of a blank screen. Valid emails trigger the welcome email correctly.

**Order Confirmation Email API (5 tests)**  
Orders with missing details (no email, no name) are rejected with proper validation. Email service outage is handled gracefully. Valid orders send the confirmation email with the right order ID and customer info.

---

## Results

All 7 test suites passed. 100 out of 100 test cases green. Production build verified after adding the tests — no impact on site speed or functionality.
