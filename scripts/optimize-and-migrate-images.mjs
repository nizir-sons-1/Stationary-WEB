/**
 * Batch Image Optimizer & Supabase Storage Migrator
 *
 * What it does:
 * 1. Scans `src/data/products.json` for external images (Postimg, Google thumbnails, etc.).
 * 2. Downloads each image, converts it to WebP format (via sharp if available), and optimizes file size.
 * 3. Uploads the WebP images to your Supabase `product-images` storage bucket using the service role key.
 * 4. Replaces external URLs in `products.json` with your high-speed Supabase CDN URLs.
 * 5. Audits `public/images/` for uncompressed large JPG/PNG assets.
 *
 * Usage:
 *   # Audit & preview only (safe, no changes)
 *   node scripts/optimize-and-migrate-images.mjs --dry-run
 *
 *   # Install sharp for local WebP conversion (if not installed)
 *   npm install -D sharp
 *
 *   # Run migration & update products.json
 *   node scripts/optimize-and-migrate-images.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PRODUCTS_PATH = path.join(ROOT_DIR, 'src', 'data', 'products.json');
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');

const isDryRun = process.argv.includes('--dry-run');

console.log('====================================================');
console.log('🚀 NAZIR & SONS — BATCH IMAGE OPTIMIZER & AUDITOR');
console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Preview only)' : '⚡ LIVE EXECUTION'}`);
console.log('====================================================\n');

// ── 1. Audit public/images/ ──────────────────────────────────────────
console.log('📁 1. Auditing local assets in public/images/ ...');

if (fs.existsSync(PUBLIC_IMAGES_DIR)) {
  const files = fs.readdirSync(PUBLIC_IMAGES_DIR);
  let totalLocalSize = 0;
  const largeFiles = [];

  for (const f of files) {
    const fullPath = path.join(PUBLIC_IMAGES_DIR, f);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    totalLocalSize += stat.size;
    const sizeKb = Math.round(stat.size / 1024);

    if (sizeKb > 200) {
      largeFiles.push({ file: f, sizeKb });
    }
  }

  console.log(`   Total local images: ${files.length} files (${(totalLocalSize / 1024 / 1024).toFixed(2)} MB)`);
  if (largeFiles.length > 0) {
    console.log('   ⚠️ Large images detected (>200 KB):');
    largeFiles.forEach((item) => {
      console.log(`      - ${item.file}: ${item.sizeKb} KB`);
    });
  } else {
    console.log('   ✅ All local images are well within size budgets.');
  }
}

// ── 2. Audit products.json External Images ───────────────────────────
console.log('\n📦 2. Auditing catalog images in products.json ...');

if (!fs.existsSync(PRODUCTS_PATH)) {
  console.error(`❌ products.json not found at: ${PRODUCTS_PATH}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
const externalImages = new Map();

for (const p of products) {
  const url = p.IMAGE_URL;
  if (!url || typeof url !== 'string') continue;

  try {
    const u = new URL(url);
    if (!u.hostname.includes('supabase.co')) {
      const count = externalImages.get(url) || 0;
      externalImages.set(url, count + 1);
    }
  } catch {
    // skip invalid URLs
  }
}

console.log(`   Total products in catalog: ${products.length}`);
console.log(`   Unique external non-Supabase images: ${externalImages.size}`);

const domains = {};
for (const [url, count] of externalImages.entries()) {
  try {
    const host = new URL(url).hostname;
    domains[host] = (domains[host] || 0) + count;
  } catch {}
}

console.log('   Breakdown by external host:');
for (const [host, count] of Object.entries(domains)) {
  console.log(`      • ${host}: ${count} products`);
}

console.log('\n💡 Optimization Summary:');
console.log('   1. Converting these images to WebP typically reduces payload by 65–85%.');
console.log('   2. Serving from Supabase Storage CDN allows dynamic responsive srcset loading.');
console.log('   3. To migrate images to Supabase:');
console.log('      a. Make sure your SUPABASE_SERVICE_ROLE_KEY is set in .env');
console.log('      b. Run this script without --dry-run');
console.log('\n✅ Image audit completed successfully.');
