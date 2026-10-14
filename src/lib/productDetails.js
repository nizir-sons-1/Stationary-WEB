import { displayNameOf, departmentOf } from '../data/categories';
import { categoryPath, productPath } from './site';
import { productSchema } from './schema';

export function mapProductVariations(currentProduct) {
  if (!currentProduct?.product_variations) return [];
  return currentProduct.product_variations.map((v) => ({
    PRODUCT_NAME: currentProduct.product_name,
    Description: currentProduct.description,
    Category: currentProduct.category,
    ProductID: v.id,
    Display_Size: v.size,
    GSM: String(v.gsm),
    CALCULATED_PRICE_RS: v.price,
    PACKING_TYPE: v.packing_type,
    Stock: v.stock,
    IMAGE_URL: v.image_url || currentProduct.image_url,
  }));
}

export function findActiveVariation(productVariations, selectedGsm, selectedSize) {
  if (!productVariations || productVariations.length === 0) return null;
  return (
    productVariations.find((p) => {
      const pSize = p.LENGTH_INCH && p.WIDTH_INCH ? `${p.LENGTH_INCH}x${p.WIDTH_INCH}` : p.Display_Size || 'N/A';
      return p.GSM === selectedGsm && pSize === selectedSize;
    }) || productVariations[0]
  );
}

export function buildProductPageSeo(decodedName, currentProduct, catalogue, productVariations) {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];
  if (catalogue) {
    trail.push(
      { name: catalogue.department, path: categoryPath(catalogue.department) },
      { name: catalogue.displayCategory, path: categoryPath(catalogue.department, catalogue.displayCategory) }
    );
  }
  trail.push({ name: decodedName, path: productPath(decodedName) });

  const extraNodes = catalogue
    ? [
        productSchema({
          name: decodedName,
          description: currentProduct?.description,
          category: catalogue.displayCategory,
          image: catalogue.image,
          path: productPath(decodedName),
          variations: productVariations.map((v) => ({
            sku: v.ProductID,
            size: v.Display_Size,
            gsm: v.GSM,
            price: Number(v.CALCULATED_PRICE_RS),
            stock: Number(v.Stock),
            packingType: v.PACKING_TYPE,
          })),
        }),
      ]
    : [];

  return {
    title: catalogue?.title || `${decodedName} | Nazir & Sons`,
    description:
      catalogue?.description ||
      `${decodedName} from Nazir & Sons — premium paper, fine arts and stationery in Lahore, delivered across Pakistan.`,
    canonicalPath: productPath(decodedName),
    image: catalogue?.image,
    imageAlt: decodedName,
    type: 'product',
    pageType: 'ItemPage',
    noindex: !catalogue,
    trail,
    extraNodes,
  };
}

export function getMainButtonState(inStock, isAdded, isBulk) {
  let className = 'bg-[#112338] hover:bg-[#1a3654] active:scale-[0.99] text-white hover:shadow-lg';
  if (!inStock) {
    className = 'bg-gray-200 text-gray-400 cursor-not-allowed';
  } else if (isAdded) {
    className = 'bg-emerald-600 text-white shadow-lg';
  }

  let label = 'Currently Out of Stock';
  if (isBulk) {
    label = 'Add Bulk Request to Cart';
  } else if (inStock) {
    label = 'Add to Cart';
  }

  return { className, label };
}

export const INSTALLMENT_CATEGORIES = new Set([
  'bleach card',
  'art card',
  'art paper',
  'matte paper',
  'copy paper',
  'offset paper',
  'ivory card',
  'color card',
  'carbonless',
  'stickers',
  'local paper',
  'boxboard',
  'news',
  'butter paper',
  'kraft card',
  'book paper',
]);

export function isEligibleForInstallments(product, category, hiddenTaxonomy) {
  if (product?.installment_hidden) return false;
  if (hiddenTaxonomy?.[product?.category]) return false;
  return INSTALLMENT_CATEGORIES.has((category || '').toLowerCase());
}

export function computeRelevantProducts(allProducts, currentProduct) {
  if (!allProducts || allProducts.length === 0 || !currentProduct) return [];
  const currentCat = (currentProduct.category || '').toLowerCase();
  const currentDept = departmentOf(currentProduct.category);

  const others = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.product_name !== currentProduct.product_name
  );

  const sameCat = others.filter((p) => (p.category || '').toLowerCase() === currentCat);
  const sameDept = others.filter(
    (p) => (p.category || '').toLowerCase() !== currentCat && departmentOf(p.category) === currentDept
  );
  const remaining = others.filter(
    (p) => (p.category || '').toLowerCase() !== currentCat && departmentOf(p.category) !== currentDept
  );

  return [...sameCat, ...sameDept, ...remaining].slice(0, 4);
}

export function buildCatalogueSummary(currentProduct, productVariations, decodedName) {
  if (!currentProduct || productVariations.length === 0) return null;

  const category = currentProduct.category || '';
  const displayCategory = displayNameOf(category);
  const department = departmentOf(category);
  const sizes = [...new Set(productVariations.map((v) => v.Display_Size).filter(Boolean))];
  const gsms = [...new Set(productVariations.map((v) => v.GSM).filter((g) => g && g !== 'null'))]
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b);
  const prices = productVariations.map((v) => Number(v.CALCULATED_PRICE_RS)).filter((n) => n > 0);

  let gsmFact = null;
  if (gsms.length) {
    const minGsm = gsms[0];
    const maxGsm = gsms.at(-1);
    const gsmRange = minGsm === maxGsm ? String(minGsm) : `${minGsm}–${maxGsm}`;
    gsmFact = `GSM: ${gsmRange}`;
  }

  const facts = [
    sizes.length ? `Sizes: ${sizes.slice(0, 4).join(', ')}` : null,
    gsmFact,
    prices.length ? `From Rs. ${Math.min(...prices).toLocaleString()}` : null,
  ].filter(Boolean);

  const categorySuffix = displayCategory ? ` — ${displayCategory}` : '';
  const categoryParenthesis = displayCategory ? ` (${displayCategory})` : '';

  return {
    displayCategory,
    department,
    title: `${decodedName}${categorySuffix} | Nazir & Sons`,
    description: [
      `Buy ${decodedName}${categoryParenthesis} from Nazir & Sons, Lahore.`,
      facts.join('. ') + (facts.length ? '.' : ''),
      'Wholesale and retail, delivered across Pakistan.',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 300),
    image: currentProduct.image_url || productVariations[0]?.IMAGE_URL,
  };
}

export function getBulkPlaceholder(category, department) {
  const cat = (category || '').toLowerCase();
  const dept = (department || '').toLowerCase();

  if (
    dept === 'paper & canvas' ||
    cat.includes('paper') ||
    cat.includes('card') ||
    cat.includes('board') ||
    cat.includes('ream')
  ) {
    return 'E.g., Need 200 reams for printing press or 500 sheets of custom cut size...';
  }
  if (
    dept === 'fine arts' ||
    cat.includes('paint') ||
    cat.includes('canvas') ||
    cat.includes('brush') ||
    cat.includes('acrylic') ||
    cat.includes('oil')
  ) {
    return 'E.g., Need 50 stretched canvases or 100 acrylic paint tubes for studio/workshop batch...';
  }
  if (
    dept === 'accessories' ||
    cat.includes('craft') ||
    cat.includes('bead') ||
    cat.includes('resin') ||
    cat.includes('glitter') ||
    cat.includes('clay') ||
    cat.includes('tool')
  ) {
    return 'E.g., Need 100 packets or 50 boxes for jewelry workshop or manufacturing batch...';
  }
  if (
    dept === 'notebooks & stationary' ||
    cat.includes('notebook') ||
    cat.includes('diary') ||
    cat.includes('pen') ||
    cat.includes('file') ||
    cat.includes('folder')
  ) {
    return 'E.g., Need 200 spiral notebooks or stationery packages for school/office supply...';
  }
  return 'E.g., Need 50+ units with custom wholesale requirements or packaging...';
}

export function extractQuantityFromNote(text) {
  if (!text) return 1;
  const match = text.match(/\b([1-9]\d{0,6})\b/);
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }
  return 1;
}

export function cleanDescriptionText(raw) {
  if (!raw) return '';
  return raw
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .trim();
}
