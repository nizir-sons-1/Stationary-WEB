/*
 * The calculator needs rates and distinct sizes/GSMs grouped by Category and Brand.
 * Run after changing src/data/products.json:  npm run build:data
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'src/data/products.json');
const OUTPUT = path.join(ROOT, 'src/data/calculator-rates.json');

const products = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

/** Distinct numeric values for a field, ascending, kept as strings for the UI. */
const uniqueNumbers = (rows, key) =>
  [...new Set(rows.map((r) => r[key]).filter((v) => v && String(v).trim() !== ''))]
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .map(String);

// Group by Category -> Brand (PRODUCT_NAME)
const byCategory = new Map();

for (const row of products) {
  if (!row.Category) continue;
  
  // Only include items that actually have a RATE_PER_KG
  const rate = Number(row.RATE_PER_KG);
  if (!Number.isFinite(rate) || rate <= 0) continue;

  if (!byCategory.has(row.Category)) {
    byCategory.set(row.Category, new Map());
  }
  
  const brandMap = byCategory.get(row.Category);
  const brandName = row.PRODUCT_NAME || row.Category; // Fallback to category if no name
  
  if (!brandMap.has(brandName)) {
    brandMap.set(brandName, []);
  }
  
  brandMap.get(brandName).push(row);
}

const categories = [];

for (const [categoryName, brandMap] of byCategory) {
  const brands = [];
  
  for (const [brandName, rows] of brandMap) {
    // Pick highest valid rate for this brand
    const rate = rows.reduce((max, r) => {
      const value = Number(r.RATE_PER_KG);
      return Number.isFinite(value) && value > max ? value : max;
    }, 0);
    
    brands.push({
      name: brandName,
      rate,
      gsms: uniqueNumbers(rows, 'GSM'),
      lengths: uniqueNumbers(rows, 'LENGTH_INCH'),
      widths: uniqueNumbers(rows, 'WIDTH_INCH'),
    });
  }
  
  // Sort brands alphabetically
  brands.sort((a, b) => a.name.localeCompare(b.name));
  
  categories.push({
    name: categoryName,
    brands
  });
}

categories.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(OUTPUT, JSON.stringify(categories) + '\n');

const before = fs.statSync(SOURCE).size;
const after = fs.statSync(OUTPUT).size;
console.log(
  `calculator-rates.json: ${categories.length} categories, ` +
    `${(before / 1024).toFixed(0)} kB -> ${(after / 1024).toFixed(1)} kB`
);
