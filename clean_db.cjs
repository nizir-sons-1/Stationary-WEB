const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

async function cleanDB() {
  console.log('Starting DB cleanup...');

  try {
    // 1. Fetch all products
    console.log('Fetching all products...');
    let allProducts = [];
    let page = 0;
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, description')
        .range(page * 1000, (page + 1) * 1000 - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allProducts = allProducts.concat(data);
      page++;
    }
    console.log(`Fetched ${allProducts.length} products.`);

    // 2. Deduplicate
    const seenNames = new Set();
    const duplicateIds = [];
    const productsToUpdate = [];

    for (const p of allProducts) {
      const name = p.product_name.trim().toLowerCase();
      if (seenNames.has(name)) {
        duplicateIds.push(p.id);
      } else {
        seenNames.add(name);
        
        // Check description for competitor names
        let newDesc = p.description || '';
        const badWords = [/stationers\.pk/gi, /stationers pk/gi, /stationers/gi];
        let changed = false;
        
        for (const regex of badWords) {
          if (regex.test(newDesc)) {
            newDesc = newDesc.replace(regex, 'Nazir & Sons');
            changed = true;
          }
        }
        
        if (changed) {
          productsToUpdate.push({ id: p.id, description: newDesc });
        }
      }
    }

    console.log(`Found ${duplicateIds.length} duplicate products.`);
    console.log(`Found ${productsToUpdate.length} descriptions to fix.`);

    // 3. Delete duplicates
    if (duplicateIds.length > 0) {
      console.log('Deleting duplicate product variations...');
      // Batch delete to avoid URI too long
      for (let i = 0; i < duplicateIds.length; i += 100) {
        const batch = duplicateIds.slice(i, i + 100);
        await supabase.from('product_variations').delete().in('product_id', batch);
      }
      
      console.log('Deleting duplicate products...');
      for (let i = 0; i < duplicateIds.length; i += 100) {
        const batch = duplicateIds.slice(i, i + 100);
        await supabase.from('products').delete().in('id', batch);
      }
      console.log('Duplicates deleted.');
    }

    // 4. Update descriptions
    if (productsToUpdate.length > 0) {
      console.log('Updating descriptions...');
      for (const p of productsToUpdate) {
        await supabase.from('products').update({ description: p.description }).eq('id', p.id);
      }
      console.log('Descriptions updated.');
    }

    console.log('DB cleanup completed successfully!');
  } catch (err) {
    console.error('Error cleaning DB:', err);
  }
}

cleanDB();
