const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env
const envFile = fs.readFileSync('.env', 'utf8');
const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

const productsData = require('./src/data/products.json');

async function migrate() {
  console.log('Starting migration...');

  // 0. Wipe existing data
  console.log('Wiping existing data...');
  await supabase.from('product_variations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Wiped.');

  // 1. Group by Product Name
  const groupedProducts = {};
  for (const item of productsData) {
    const name = item.PRODUCT_NAME || 'Unknown Product';
    if (!groupedProducts[name]) {
      groupedProducts[name] = {
        name,
        category: item.Category || 'Uncategorized',
        description: item.Description || 'Premium High Quality Stock',
        image_url: item.IMAGE_URL || '',
        variations: []
      };
    }
    
    let sizeStr = '';
    if (item.LENGTH_INCH && item.WIDTH_INCH) {
      sizeStr = `${item.LENGTH_INCH}x${item.WIDTH_INCH}`;
    } else {
      sizeStr = item.Display_Size || 'N/A';
    }

    groupedProducts[name].variations.push({
      size: sizeStr,
      gsm: item.GSM || 'N/A',
      price: Number(item.CALCULATED_PRICE_RS) || 0,
      packing_type: item.PACKING_TYPE || 'ream',
      stock: Math.floor(Number(item.Stock) || 100),
      image_url: item.IMAGE_URL || null
    });
  }

  // 2. Insert Products and Variations
  const productsList = Object.values(groupedProducts);
  console.log(`Found ${productsList.length} unique products with variations.`);

  for (const prod of productsList) {
    console.log(`Inserting product: ${prod.name}...`);
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        product_name: prod.name,
        category: prod.category,
        description: prod.description,
        image_url: prod.image_url
      })
      .select('id')
      .single();

    if (productError) {
      console.error(`Error inserting product ${prod.name}:`, productError);
      continue;
    }

    const productId = productData.id;

    // Insert Variations
    const variationsToInsert = prod.variations.map(v => ({
      product_id: productId,
      size: v.size,
      gsm: v.gsm,
      price: v.price,
      packing_type: v.packing_type,
      stock: v.stock,
      image_url: v.image_url
    }));

    const { error: varError } = await supabase
      .from('product_variations')
      .insert(variationsToInsert);

    if (varError) {
      console.error(`Error inserting variations for ${prod.name}:`, varError);
    } else {
      console.log(` -> Successfully inserted ${variationsToInsert.length} variations for ${prod.name}`);
    }
  }

  console.log('Migration completed successfully!');
}

migrate();
