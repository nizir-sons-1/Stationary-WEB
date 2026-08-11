/*
 * The calculator only needs a rate per category plus the distinct sizes/GSMs it
 * offers as quick-pick chips — a few kB. Importing the raw 438 kB catalogue for
 * that shipped the entire product list to every visitor.
 *
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

const byCategory = new Map();

for (const row of products) {
  if (!row.Category) continue;
  if (!byCategory.has(row.Category)) byCategory.set(row.Category, []);
  byCategory.get(row.Category).push(row);
}

const categories = [];

for (const [name, rows] of byCategory) {
  // The original picked the highest rate seen for the category — keep that.
  const rate = rows.reduce((max, r) => {
    const value = Number(r.RATE_PER_KG);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  if (rate <= 0) continue; // matches the old `RATE_PER_KG > 0` filter

  categories.push({
    name,
    rate,
    gsms: uniqueNumbers(rows, 'GSM'),
    lengths: uniqueNumbers(rows, 'LENGTH_INCH'),
    widths: uniqueNumbers(rows, 'WIDTH_INCH'),
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
