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

async function scrapeAndPush() {
  console.log('Starting Scrape & Push...');

  try {
    // 0. Wipe existing data
    console.log('Wiping existing test data...');
    await supabase.from('product_variations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Wiped.');

    // 1. Fetch from stationers.pk
    let allProducts = [];
    console.log('Fetching page 1...');
    const res1 = await fetch('https://stationers.pk/products.json?limit=250&page=1');
    const data1 = await res1.json();
    allProducts = allProducts.concat(data1.products);

    console.log('Fetching page 2...');
    const res2 = await fetch('https://stationers.pk/products.json?limit=250&page=2');
    const data2 = await res2.json();
    allProducts = allProducts.concat(data2.products);

    console.log(`Fetched total ${allProducts.length} products.`);

    // 2. Process and Push
    for (const item of allProducts) {
      if (!item) continue;

      const name = item.title || 'Unknown Product';
      let category = item.product_type || (item.tags && item.tags.length > 0 ? item.tags[0] : 'Stationery');
      
      // Capitalize first letter of category if needed, or sanitize
      category = category.trim();
      
      let description = item.body_html || '';
      // Strip HTML
      description = description.replace(/<[^>]*>?/gm, '').trim();
      if (!description) description = 'Premium Quality Product';

      let image_url = '';
      if (item.images && item.images.length > 0) {
        image_url = item.images[0].src;
      }

      console.log(`Inserting product: ${name.substring(0, 30)}...`);
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          product_name: name,
          category: category,
          description: description,
          image_url: image_url
        })
        .select('id')
        .single();

      if (productError) {
        console.error(`Error inserting product ${name}:`, productError);
        continue;
      }

      const productId = productData.id;

      // Insert Variations
      const variationsToInsert = [];
      if (item.variants && item.variants.length > 0) {
        for (const variant of item.variants) {
          const size = variant.option1 && variant.option1 !== 'Default Title' ? variant.option1 : 'Standard';
          const gsm = variant.option2 ? variant.option2 : 'N/A';
          const price = Number(variant.price) || 0;
          
          let var_img = image_url;
          if (variant.featured_image && variant.featured_image.src) {
            var_img = variant.featured_image.src;
          }

          variationsToInsert.push({
            product_id: productId,
            size: size,
            gsm: gsm,
            price: price,
            packing_type: 'unit',
            stock: 100, // Dummy stock
            image_url: var_img
          });
        }
      } else {
        variationsToInsert.push({
          product_id: productId,
          size: 'Standard',
          gsm: 'N/A',
          price: 150,
          packing_type: 'unit',
          stock: 100,
          image_url: image_url
        });
      }

      const { error: varError } = await supabase
        .from('product_variations')
        .insert(variationsToInsert);

      if (varError) {
        console.error(`Error inserting variations for ${name}:`, varError);
      }
    }

    console.log('Scrape and Push completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

scrapeAndPush();
