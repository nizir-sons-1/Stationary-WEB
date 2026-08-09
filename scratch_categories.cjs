const fs = require('fs');
const products = require('./src/data/products.json');
const categories = new Set();
products.forEach(p => {
  if (p.Category) categories.add(p.Category);
});
console.log(Array.from(categories));
