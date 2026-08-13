/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PRERENDER
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Runs after `vite build`, over the freshly built `dist/`.
 *
 * The problem it solves: this is a client-rendered single-page app, so the HTML
 * that comes off the server is an empty <div id="root"> and a script tag. A
 * browser fills that in. Googlebot renders JavaScript and eventually fills it
 * in too. Almost nothing else does.
 *
 *   GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bytespider, Amazonbot,
 *   Applebot-Extended, Meta-ExternalAgent — and every social preview scraper —
 *   read the raw HTML response and stop there.
 *
 * To all of them the entire catalogue was a blank page. So this script writes a
 * real HTML document for every route: correct <title>, description, canonical,
 * Open Graph and schema.org graph in the head, and the page's actual content —
 * headings, prose, prices, sizes, GSM, internal links — in the body.
 *
 * The content is written inside <div id="root">, which React replaces the
 * moment it mounts. That is deliberate: it is the same content the app renders,
 * so a visitor sees it a beat earlier and a crawler sees it at all. Nothing is
 * hidden, and nothing is served to a crawler that is not served to a person.
 *
 * It also writes robots.txt, sitemap.xml and llms.txt.
 *
 * The catalogue comes from Supabase at build time. If those credentials are not
 * present the script prerenders the static routes and skips the catalogue
 * rather than failing the build — a deploy without a sitemap is a bad day, a
 * deploy that does not happen is a worse one.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SITE_URL,
  SITE_NAME,
  BUSINESS,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  categoryPath,
  productPath,
} from '../src/lib/site.js';
import { ROUTES, FAQS } from '../src/data/seo-content.js';
import { DEPARTMENTS, groupCategories, displayNameOf, departmentOf } from '../src/data/categories.js';
import {
  graph,
  baseGraphNodes,
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  itemListSchema,
  productSchema,
  howToSchema,
} from '../src/lib/schema.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const TODAY = new Date().toISOString().slice(0, 10);

/* ── plumbing ─────────────────────────────────────────────────────────────── */

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** JSON-LD sits in a <script>, where the only sequence that can break out is "</". */
const escJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const money = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;

/**
 * `.env` for local builds. On Vercel the variables are already in the
 * environment, and this finds nothing and does nothing.
 */
function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const at = line.indexOf('=');
    if (at < 1 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, at).trim();
    if (!process.env[key]) process.env[key] = line.slice(at + 1).trim();
  }
}

/* ── the catalogue ────────────────────────────────────────────────────────── */

const SELECT =
  'id,product_name,category,description,image_url,' +
  'product_variations(id,size,gsm,price,packing_type,stock,image_url)';

async function fetchCatalogue() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender] no Supabase credentials — static routes only, no catalogue.');
    return [];
  }

  const endpoint = `${url}/rest/v1/products?select=${encodeURIComponent(SELECT)}&is_hidden=eq.false&limit=5000`;
  const res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.warn(`[prerender] Supabase returned ${res.status} — static routes only.`);
    return [];
  }
  return res.json();
}

const EMPTY_TAXONOMY = { department: {}, category: {}, hidden: { department: {}, category: {} } };

/**
 * Artwork and visibility chosen in the admin panel, keyed by shelf name.
 *
 * Optional in exactly the way it is optional at runtime: if the table has not
 * been created the build carries on with the bundled artwork rather than
 * failing, which keeps a deploy from depending on a migration having been run.
 * The `is_hidden` column is optional separately — a build against a database
 * with only the first migration asks for it, gets a 400, and retries without,
 * leaving every shelf visible.
 *
 * Reading the flag here matters as much as reading it in the app: this script
 * writes the static HTML and the sitemap, so a hidden shelf left in would keep
 * its indexed page serving a full category listing to anyone who still had the
 * link.
 */
async function fetchTaxonomyImages() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return EMPTY_TAXONOMY;

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const get = async (select) => {
    const res = await fetch(`${url}/rest/v1/taxonomy_images?select=${select}`, { headers });
    return res;
  };

  try {
    let res = await get('kind,name,image_url,is_hidden');

    // 400 here is PostgREST rejecting the unknown column; everything else is a
    // real failure and falls through to the warning below.
    if (res.status === 400) {
      console.warn('[prerender] taxonomy_images has no is_hidden column — nothing will be hidden.');
      res = await get('kind,name,image_url');
    }

    if (!res.ok) {
      console.warn(`[prerender] taxonomy_images returned ${res.status} — using built-in artwork.`);
      return EMPTY_TAXONOMY;
    }

    const byKind = { department: {}, category: {}, hidden: { department: {}, category: {} } };
    for (const row of await res.json()) {
      if (!byKind[row.kind]) continue;
      if (row.image_url) byKind[row.kind][row.name] = row.image_url;
      if (row.is_hidden) byKind.hidden[row.kind][row.name] = true;
    }
    return byKind;
  } catch (err) {
    console.warn(`[prerender] taxonomy_images unreachable (${err.message}) — using built-in artwork.`);
    return EMPTY_TAXONOMY;
  }
}

/**
 * Folds the raw rows into the same shape the shop renders: departments holding
 * merged category cards, and one entry per distinct product name.
 *
 * Reuses groupCategories from src/data/categories.js rather than reimplementing
 * the merge, so the URLs written here are byte-identical to the ones the app links to.
 */
function buildTree(rows, categoryOverrides = {}, hiddenCategories = {}) {
  const counts = {};
  const images = {};
  for (const row of rows) {
    if (!row.category) continue;
    counts[row.category] = (counts[row.category] || 0) + 1;
    if (row.image_url && !images[row.category]) images[row.category] = row.image_url;
  }

  const grouped = groupCategories(counts, images, categoryOverrides);

  // Hidden categories are dropped once, here, so every consumer below — the
  // static pages, the sitemap and llms.txt — is working from the same list and
  // none of them can reintroduce a shelf the others left out.
  const byDepartment = {};
  for (const [department, cards] of Object.entries(grouped)) {
    byDepartment[department] = cards.filter((card) => !hiddenCategories[card.name]);
  }

  // Product name -> every row and variation carrying that name. The catalogue
  // has 23 duplicate names across categories, and /product/:name shows them as
  // one page, so they are merged here the same way.
  const products = new Map();
  for (const row of rows) {
    const name = row.product_name;
    if (!name) continue;
    let entry = products.get(name);
    if (!entry) {
      entry = {
        name,
        category: row.category,
        description: row.description,
        image: row.image_url,
        variations: [],
      };
      products.set(name, entry);
    }
    for (const v of row.product_variations || []) {
      entry.variations.push({
        sku: v.id,
        size: v.size,
        gsm: v.gsm,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        packingType: v.packing_type,
      });
    }
    if (!entry.image && row.image_url) entry.image = row.image_url;
  }

  /*
   * Which products sit on which category card.
   *
   * Built from the rows rather than from the merged `products` map above: 23
   * product names appear in more than one category, and the shop lists such a
   * product under each of them. Walking the merged map instead would file each
   * one under whichever category happened to be seen first, and the category
   * page would then claim fewer products than the live grid shows.
   */
  const productsByCategory = new Map();
  for (const row of rows) {
    if (!row.product_name) continue;
    const display = displayNameOf(row.category);
    let list = productsByCategory.get(display);
    if (!list) {
      list = [];
      productsByCategory.set(display, list);
    }
    if (!list.some((p) => p.name === row.product_name)) list.push(products.get(row.product_name));
  }
  for (const list of productsByCategory.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return { byDepartment, products, productsByCategory };
}

/* ── the shell ────────────────────────────────────────────────────────────── */

/*
 * Enough CSS for the pre-hydration frame to look like a page rather than a wall
 * of unstyled text. Deliberately not Tailwind: Tailwind's output is generated
 * from what it finds in src/, and a class only used here would be purged out of
 * the stylesheet, which is a failure mode that would not show up until it was
 * live.
 */
const SHELL_CSS = `
#prerender{max-width:1200px;margin:0 auto;padding:24px 20px 64px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#111;line-height:1.6}
#prerender a{color:#ea580c;text-decoration:none}
#prerender a:hover{text-decoration:underline}
#prerender header{display:flex;flex-wrap:wrap;gap:16px;align-items:baseline;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:16px;margin-bottom:28px}
#prerender .brand{font-size:22px;font-weight:800;letter-spacing:.12em;color:#0f172a}
#prerender nav a{margin-right:16px;font-size:14px;color:#475569}
#prerender .crumbs{font-size:12px;color:#94a3b8;margin-bottom:12px}
#prerender h1{font-size:34px;line-height:1.15;margin:0 0 12px;color:#0f172a;font-weight:800}
#prerender h2{font-size:20px;margin:32px 0 10px;color:#0f172a}
#prerender h3{font-size:16px;margin:20px 0 6px;color:#0f172a}
#prerender .lede{font-size:17px;color:#475569;max-width:70ch}
#prerender ul{padding-left:20px;color:#475569}
#prerender li{margin:6px 0}
#prerender .grid{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0;padding:0;list-style:none}
#prerender .grid li{margin:0}
#prerender .grid a{display:inline-block;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:14px;color:#0f172a}
#prerender table{border-collapse:collapse;width:100%;max-width:760px;margin:16px 0;font-size:14px}
#prerender th,#prerender td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}
#prerender th{background:#f8fafc;font-weight:700;color:#0f172a}
#prerender .faq{max-width:80ch}
#prerender .faq p{color:#475569}
#prerender footer{margin-top:56px;border-top:1px solid #e5e7eb;padding-top:20px;font-size:13px;color:#64748b}
`.trim();

const NAV_LINKS = [
  ['/shop', 'Shop'],
  ['/calculator', 'Paper Calculator'],
  ['/faq', 'FAQ'],
  ['/about', 'Our Story'],
  ['/contact', 'Contact'],
];

const FOOTER_LINKS = [
  ['/shipping', 'Shipping'],
  ['/returns', 'Returns & Refunds'],
  ['/track-order', 'Track Order'],
  ['/reviews', 'Reviews'],
  ['/careers', 'Careers'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
];

const shellHeader = () => `
<header>
  <a class="brand" href="/">NAZIR &amp; SONS</a>
  <nav>${NAV_LINKS.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</header>`;

const shellFooter = () => `
<footer>
  <p><strong>${esc(SITE_NAME)}</strong> — ${esc(BUSINESS.street)}, ${esc(BUSINESS.city)}, ${esc(BUSINESS.countryName)}</p>
  <p>Phone &amp; WhatsApp <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a> · <a href="mailto:${BUSINESS.email}">${esc(BUSINESS.email)}</a></p>
  <p>${esc(BUSINESS.openingHoursText)} Serving Pakistan's printing industry since ${BUSINESS.founded}.</p>
  <nav>${FOOTER_LINKS.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</footer>`;

const crumbs = (trail) =>
  `<p class="crumbs">${trail
    .map((c, i) => (i === trail.length - 1 ? esc(c.name) : `<a href="${c.path}">${esc(c.name)}</a>`))
    .join(' › ')}</p>`;

/* ── the document ─────────────────────────────────────────────────────────── */

/**
 * Strips every head tag the template carries that this script is about to state
 * properly for the specific route, so no page ends up with two titles, two
 * descriptions, or an og:url pointing at the home page.
 *
 * index.html keeps generic versions of all of these because the dev server and
 * the SPA fallback serve it directly; they just must not survive into a
 * prerendered document alongside the real ones.
 */
function stripHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>\s*/i, '')
    .replace(/<meta\s+name="robots"[\s\S]*?>\s*/i, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?>\s*/i, '')
    .replace(/<meta\s+property="og:[\s\S]*?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[\s\S]*?>\s*/gi, '')
    .replace(/<meta\s+name="geo\.[\s\S]*?>\s*/gi, '')
    // Only ever present if this script has already run over this dist — see below.
    .replace(/<style>[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, '');
}

/**
 * Resets the body to an empty mount point.
 *
 * `dist/index.html` is both this script's template and one of its outputs, so
 * running `npm run prerender` twice without an intervening `vite build` would
 * otherwise hand every page the home page's prerendered body — the
 * `<div id="root"></div>` it looks for no longer exists to be replaced, and the
 * substitution silently does nothing. Rebuilding the body from scratch makes
 * the script idempotent instead of quietly wrong on the second run.
 */
function resetBody(html) {
  return html.replace(/(<body[^>]*>)[\s\S]*?(<\/body>)/i, '$1\n    <div id="root"></div>\n  $2');
}

function head({ title, description, canonical, image, noindex, jsonLd }) {
  const url = absoluteUrl(canonical);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="${
      noindex
        ? 'noindex, follow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    }" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="en_PK" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(ogImage)}" />
    <meta name="geo.region" content="PK-PB" />
    <meta name="geo.placename" content="${esc(BUSINESS.city)}" />
    <style>${SHELL_CSS}</style>
    <script type="application/ld+json" data-seo-graph>${escJson(jsonLd)}</script>`;
}

let template = '';
const written = [];
const skipped = [];

function write(routePath, page) {
  const doc = template
    .replace('</head>', `${head(page)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><div id="prerender">${page.body}</div></div>`);

  // '/' is dist/index.html; everything else is a directory with an index.html,
  // which every static host resolves without needing cleanUrls to be on.
  const relative = routePath === '/' ? 'index.html' : path.join(decodeURIComponent(routePath).slice(1), 'index.html');
  const file = path.join(DIST, relative);

  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, doc, 'utf8');
    written.push(routePath);
  } catch (err) {
    // Product names contain characters that are legal in a URL but not in a
    // filename on every platform — '|', '"', '*', '?'. Those pages fall back to
    // client rendering, which is what they did before this script existed.
    skipped.push({ routePath, reason: err.code || err.message });
  }
}

/* ── page bodies ──────────────────────────────────────────────────────────── */

function staticPage(routePath) {
  const seo = ROUTES[routePath];
  const trail =
    routePath === '/'
      ? [{ name: 'Home', path: '/' }]
      : [{ name: 'Home', path: '/' }, { name: seo.h1, path: routePath }];

  const isFaq = routePath === '/faq';
  const nodes = [
    ...baseGraphNodes(),
    // Always WebPage: the FAQPage node appended below is the one that holds the
    // questions, and two nodes claiming the type helps nobody.
    webPageSchema({ path: routePath, title: seo.title, description: seo.description }),
    breadcrumbSchema(trail),
  ];
  if (isFaq) nodes.push(faqSchema(FAQS));
  if (routePath === '/calculator') nodes.push(calculatorHowTo());

  const body = `
${shellHeader()}
<main>
  ${routePath === '/' ? '' : crumbs(trail)}
  <h1>${esc(seo.h1)}</h1>
  <p class="lede">${esc(seo.summary)}</p>
  ${seo.bullets ? `<ul>${seo.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
  ${isFaq ? faqBody(FAQS) : ''}
  ${routePath === '/' || routePath === '/shop' ? departmentLinks() : ''}
</main>
${shellFooter()}`;

  write(routePath, {
    title: seo.title,
    description: seo.description,
    canonical: routePath,
    noindex: Boolean(seo.noindex),
    jsonLd: graph(nodes),
    body,
  });
}

const faqBody = (faqs) =>
  `<div class="faq">${faqs
    .map((f) => `<h2>${esc(f.question)}</h2><p>${esc(f.answer)}</p>`)
    .join('')}</div>`;

const departmentLinks = () => `
  <h2>Departments</h2>
  <ul class="grid">${DEPARTMENTS.map(
    (d) => `<li><a href="${categoryPath(d.name)}">${esc(d.name)}</a></li>`
  ).join('')}</ul>`;

function calculatorHowTo() {
  return howToSchema({
    name: 'How to calculate the weight and price of a custom paper size',
    description:
      'Convert sheet dimensions and GSM into a weight in kilograms, then into a price in Pakistani rupees at the per-kilogram rate for that paper.',
    path: '/calculator',
    supply: ['Sheet length in inches', 'Sheet width in inches', 'Paper GSM', 'Number of sheets'],
    tool: ['Nazir & Sons custom size calculator'],
    steps: [
      {
        name: 'Measure the sheet',
        text: 'Take the length and the width of one sheet in inches. Multiply them to get the area of a single sheet in square inches.',
      },
      {
        name: 'Bring in the GSM and the sheet count',
        text: 'Multiply that area by the GSM of the paper and by the number of sheets you want. GSM is the weight in grams of one square metre of that paper.',
      },
      {
        name: 'Convert to kilograms',
        text: 'Divide the result by 1,550,000. In full: weight in kg = (length × width × GSM × sheets) ÷ 1,550,000.',
      },
      {
        name: 'Convert to a price',
        text: 'Multiply the weight in kilograms by the per-kilogram rate for that brand and category.',
      },
    ],
  });
}

function departmentPage(department, cards) {
  const routePath = categoryPath(department.name);
  const title = `${department.name} — Buy Online in Pakistan | Nazir & Sons`;
  const description = `Browse ${cards.length} categories of ${department.name} at Nazir & Sons, Lahore. Live prices in PKR, wholesale and retail, delivered nationwide.`;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: department.name, path: routePath },
  ];
  const total = cards.reduce((sum, c) => sum + (c.count || 0), 0);

  write(routePath, {
    title,
    description,
    canonical: routePath,
    jsonLd: graph([
      ...baseGraphNodes(),
      webPageSchema({ path: routePath, title, description, type: 'CollectionPage' }),
      breadcrumbSchema(trail),
      itemListSchema({
        name: department.name,
        path: routePath,
        items: cards.map((c) => ({ name: c.name, path: categoryPath(department.name, c.name) })),
      }),
    ]),
    body: `
${shellHeader()}
<main>
  ${crumbs(trail)}
  <h1>${esc(department.name)}</h1>
  <p class="lede">${cards.length} categories and ${total} products in ${esc(department.name)} at Nazir &amp; Sons, ${esc(BUSINESS.city)}. Wholesale and retail, with delivery across ${esc(BUSINESS.countryName)}.</p>
  <h2>Categories</h2>
  <ul class="grid">${cards
    .map(
      (c) =>
        `<li><a href="${categoryPath(department.name, c.name)}">${esc(c.name)} (${c.count})</a></li>`
    )
    .join('')}</ul>
</main>
${shellFooter()}`,
  });
}

function categoryPage(department, card, products) {
  const routePath = categoryPath(department, card.name);
  const title = `${card.name} — Price & Sizes in Lahore | Nazir & Sons`;
  const description = `Buy ${card.name} from Nazir & Sons, Lahore. ${products.length} products listed by size and GSM with live prices in PKR — wholesale and retail, delivered across Pakistan.`;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: department, path: categoryPath(department) },
    { name: card.name, path: routePath },
  ];

  write(routePath, {
    title,
    description,
    canonical: routePath,
    image: card.image,
    jsonLd: graph([
      ...baseGraphNodes(),
      webPageSchema({ path: routePath, title, description, type: 'CollectionPage' }),
      breadcrumbSchema(trail),
      itemListSchema({
        name: card.name,
        path: routePath,
        items: products.map((p) => ({ name: p.name, path: productPath(p.name) })),
      }),
    ]),
    body: `
${shellHeader()}
<main>
  ${crumbs(trail)}
  <h1>${esc(card.name)}</h1>
  <p class="lede">${products.length} ${esc(card.name)} products in stock at Nazir &amp; Sons, ${esc(BUSINESS.city)} — part of the ${esc(department)} range. Prices in PKR by sheet size and GSM, sold retail and by the ream.</p>
  <h2>Products</h2>
  <ul class="grid">${products
    .map((p) => `<li><a href="${productPath(p.name)}">${esc(p.name)}</a></li>`)
    .join('')}</ul>
</main>
${shellFooter()}`,
  });
}

function productPage(product) {
  const routePath = productPath(product.name);
  const displayCategory = displayNameOf(product.category);
  const department = departmentOf(product.category);

  const sizes = [...new Set(product.variations.map((v) => v.size).filter(Boolean))];
  const gsms = [...new Set(product.variations.map((v) => Number(v.gsm)).filter((n) => n > 0))].sort(
    (a, b) => a - b
  );
  const prices = product.variations.map((v) => v.price).filter((n) => n > 0);

  const facts = [
    sizes.length ? `Sizes: ${sizes.slice(0, 4).join(', ')}` : null,
    gsms.length ? `GSM: ${gsms[0] === gsms.at(-1) ? gsms[0] : `${gsms[0]}–${gsms.at(-1)}`}` : null,
    prices.length ? `From ${money(Math.min(...prices))}` : null,
  ].filter(Boolean);

  const title = `${product.name}${displayCategory ? ` — ${displayCategory}` : ''} | Nazir & Sons`;
  const description = [
    `Buy ${product.name}${displayCategory ? ` (${displayCategory})` : ''} from Nazir & Sons, Lahore.`,
    facts.join('. ') + (facts.length ? '.' : ''),
    'Wholesale and retail, delivered across Pakistan.',
  ]
    .join(' ')
    .slice(0, 300);

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: department, path: categoryPath(department) },
    { name: displayCategory, path: categoryPath(department, displayCategory) },
    { name: product.name, path: routePath },
  ];

  const rows = product.variations
    .filter((v) => v.price > 0)
    .sort((a, b) => a.price - b.price)
    .map(
      (v) => `<tr>
        <td>${esc(v.size || '—')}</td>
        <td>${v.gsm ? `${esc(v.gsm)} gsm` : '—'}</td>
        <td>${esc(money(v.price))}</td>
        <td>${v.stock > 0 ? 'In stock' : 'Out of stock'}</td>
      </tr>`
    )
    .join('');

  write(routePath, {
    title,
    description,
    canonical: routePath,
    image: product.image,
    jsonLd: graph([
      ...baseGraphNodes(),
      webPageSchema({ path: routePath, title, description, type: 'ItemPage' }),
      breadcrumbSchema(trail),
      productSchema({
        name: product.name,
        description: product.description,
        category: displayCategory,
        image: product.image,
        path: routePath,
        variations: product.variations,
      }),
    ]),
    body: `
${shellHeader()}
<main>
  ${crumbs(trail)}
  <h1>${esc(product.name)}</h1>
  <p class="lede">${esc(
    (product.description || `${product.name} from Nazir & Sons, Lahore`).replace(/\.?$/, '.')
  )}${facts.length ? ` ${esc(facts.join('. '))}.` : ''}</p>
  ${product.image ? `<p><img src="${esc(product.image)}" alt="${esc(product.name)}" width="320" loading="lazy" /></p>` : ''}
  ${
    rows
      ? `<h2>Sizes, weights and prices</h2>
  <table>
    <thead><tr><th>Size</th><th>GSM</th><th>Price</th><th>Availability</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p>Prices are in Pakistani rupees and follow the live per-kilogram rate for the stock, which is why the same sheet size costs more at a higher GSM. For a size not listed, use the <a href="/calculator">paper calculator</a> or ask on <a href="${BUSINESS.whatsapp}">WhatsApp</a>.</p>`
      : ''
  }
  <p>Category: <a href="${categoryPath(department, displayCategory)}">${esc(displayCategory)}</a> · Department: <a href="${categoryPath(department)}">${esc(department)}</a></p>
</main>
${shellFooter()}`,
  });
}

/* ── robots, sitemap, llms.txt ────────────────────────────────────────────── */

/*
 * Every one of these agents is named explicitly rather than left to the
 * wildcard, because several of them are known to treat an unnamed wildcard
 * conservatively, and because being cited by an answer engine is worth more to
 * a wholesaler than being crawled by one more search index.
 *
 * GPTBot / OAI-SearchBot / ChatGPT-User — OpenAI: training, search index, and
 * live retrieval when a user asks about you by name.
 * ClaudeBot / Claude-User / Claude-SearchBot — Anthropic.
 * PerplexityBot / Perplexity-User — Perplexity.
 * Google-Extended — governs Gemini and AI Overviews grounding, separately from
 * Googlebot, which is why it needs its own line.
 * Applebot-Extended, Meta-ExternalAgent, Amazonbot, Bytespider, YouBot, cohere-ai.
 */
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'meta-externalagent',
  'Amazonbot',
  'Bytespider',
  'YouBot',
  'cohere-ai',
  'Diffbot',
  'omgili',
];

function writeRobots() {
  const body = `# ${SITE_NAME} — ${SITE_URL}
# Everything here is public catalogue and shop information. Crawl it.

User-agent: *
Allow: /
# Nothing to index: a basket is per-visitor, and order status is per-order.
Disallow: /cart
Disallow: /track-order

${AI_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n')}

# A plain-text summary of the business and the catalogue, for language models.
# See ${SITE_URL}/llms.txt

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), body, 'utf8');
}

function writeSitemap(urls) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      ({ loc, priority, changefreq }) => `  <url>
    <loc>${esc(absoluteUrl(loc))}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
}

/**
 * llms.txt — the convention for handing a language model a curated map of a
 * site in Markdown instead of making it reconstruct one from HTML.
 *
 * The important part is the prose, not the link list: this is the text that
 * gets retrieved and quoted when someone asks a chatbot where to buy paper in
 * Lahore, so it states the facts plainly and in full sentences.
 */
// `departments` is the visible list, not the full one — llms.txt is a public
// description of the catalogue, so a hidden shelf has no more business here
// than it has on the sitemap.
function writeLlmsTxt({ byDepartment, productsByCategory, departments = DEPARTMENTS }) {
  const home = ROUTES['/'];

  const sections = [
    `# ${SITE_NAME}`,
    '',
    `> ${home.description}`,
    '',
    home.summary,
    '',
    '## Business details',
    '',
    `- **Name:** ${SITE_NAME} (${BUSINESS.alternateName})`,
    `- **Trading since:** ${BUSINESS.founded}`,
    `- **Address:** ${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.region}, ${BUSINESS.countryName}`,
    `- **Phone and WhatsApp:** ${BUSINESS.phone}`,
    `- **Email:** ${BUSINESS.email}`,
    `- **Opening hours:** ${BUSINESS.openingHoursText}`,
    `- **Serves:** ${BUSINESS.areaServed}, wholesale and retail`,
    `- **Currency:** ${BUSINESS.currency}`,
    `- **Website:** ${SITE_URL}`,
    '',
    '## Key pages',
    '',
    ...['/shop', '/calculator', '/faq', '/about', '/contact', '/shipping', '/returns'].map(
      (p) => `- [${ROUTES[p].h1}](${SITE_URL}${p}): ${ROUTES[p].description}`
    ),
    '',
    '## Departments and categories',
    '',
  ];

  for (const department of departments) {
    const cards = byDepartment[department.name] || [];
    if (!cards.length) continue;
    sections.push(`### ${department.name}`, '');
    for (const card of cards) {
      // The number of product pages, not the number of database rows: a product
      // sold in six sizes is one page, and the count has to match what the
      // category page actually lists.
      const listed = (productsByCategory.get(card.name) || []).length;
      sections.push(
        `- [${card.name}](${SITE_URL}${categoryPath(department.name, card.name)}): ${listed} products`
      );
    }
    sections.push('');
  }

  sections.push('## Answers to common questions', '');
  for (const faq of FAQS) {
    sections.push(`### ${faq.question}`, '', faq.answer, '');
  }

  fs.writeFileSync(path.join(DIST, 'llms.txt'), sections.join('\n'), 'utf8');

  // The long form: every product, with its sizes, GSM and price, as plain text.
  const full = [
    `# ${SITE_NAME} — full catalogue`,
    '',
    `Generated ${TODAY} from the live catalogue at ${SITE_URL}.`,
    `All prices in ${BUSINESS.currency}. ${BUSINESS.openingHoursText}`,
    `Contact: ${BUSINESS.phone} · ${BUSINESS.email} · ${BUSINESS.street}, ${BUSINESS.city}.`,
    '',
  ];

  for (const department of departments) {
    const cards = byDepartment[department.name] || [];
    if (!cards.length) continue;
    full.push(`## ${department.name}`, '');
    for (const card of cards) {
      const products = productsByCategory.get(card.name) || [];
      if (!products.length) continue;
      full.push(`### ${card.name}`, '');
      for (const product of products) {
        const priced = product.variations.filter((v) => v.price > 0);
        const detail = priced.length
          ? priced
              .slice(0, 12)
              .map(
                (v) =>
                  `${v.size || 'standard'}${v.gsm ? ` ${v.gsm}gsm` : ''} — ${money(v.price)}${
                    v.stock > 0 ? '' : ' (out of stock)'
                  }`
              )
              .join('; ')
          : 'price on request';
        full.push(
          `- **${product.name}**${product.description ? ` — ${product.description}` : ''}. ${detail}. ${SITE_URL}${productPath(product.name)}`
        );
      }
      full.push('');
    }
  }

  fs.writeFileSync(path.join(DIST, 'llms-full.txt'), full.join('\n'), 'utf8');
}

/* ── main ─────────────────────────────────────────────────────────────────── */

async function main() {
  loadEnv();

  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found — run `vite build` before this script.');
  }
  template = resetBody(stripHead(fs.readFileSync(indexPath, 'utf8')));

  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no <div id="root"> mount point to fill.');
  }

  const [rows, taxonomyImages] = await Promise.all([fetchCatalogue(), fetchTaxonomyImages()]);
  const { byDepartment, products, productsByCategory } = buildTree(
    rows,
    taxonomyImages.category,
    taxonomyImages.hidden.category
  );

  // Hidden departments never reach a page, a sitemap entry or llms.txt. Computed
  // once and reused so the three writers below cannot disagree.
  const visibleDepartments = DEPARTMENTS.filter((d) => !taxonomyImages.hidden.department[d.name]);

  const sitemap = [];

  // Static routes.
  for (const [routePath, seo] of Object.entries(ROUTES)) {
    staticPage(routePath);
    if (!seo.noindex) {
      sitemap.push({
        loc: routePath,
        priority: seo.priority ?? 0.5,
        changefreq: seo.changefreq || 'monthly',
      });
    }
  }

  // Departments and categories.
  for (const department of visibleDepartments) {
    const cards = byDepartment[department.name] || [];
    if (!cards.length) continue;

    departmentPage(department, cards);
    sitemap.push({ loc: categoryPath(department.name), priority: 0.8, changefreq: 'weekly' });

    for (const card of cards) {
      const list = productsByCategory.get(card.name) || [];
      categoryPage(department.name, card, list);
      sitemap.push({
        loc: categoryPath(department.name, card.name),
        priority: 0.7,
        changefreq: 'weekly',
      });
    }
  }

  // Products.
  for (const product of products.values()) {
    productPage(product);
    sitemap.push({ loc: productPath(product.name), priority: 0.6, changefreq: 'weekly' });
  }

  writeRobots();
  writeSitemap(sitemap);
  writeLlmsTxt({ byDepartment, productsByCategory, departments: visibleDepartments });

  const categoryCount = visibleDepartments.reduce(
    (sum, d) => sum + (byDepartment[d.name] || []).length,
    0
  );

  const hiddenCount =
    DEPARTMENTS.length - visibleDepartments.length + Object.keys(taxonomyImages.hidden.category).length;

  console.log(
    `[prerender] ${written.length} pages written ` +
      `(${Object.keys(ROUTES).length} static, ${visibleDepartments.length} departments, ` +
      `${categoryCount} categories, ${products.size} products)`
  );
  if (hiddenCount) {
    console.log(`[prerender] ${hiddenCount} shelf/shelves hidden by the admin panel — not written.`);
  }
  console.log(`[prerender] sitemap.xml: ${sitemap.length} URLs · robots.txt · llms.txt · llms-full.txt`);

  if (skipped.length) {
    console.warn(
      `[prerender] ${skipped.length} route(s) could not be written to disk and stay client-rendered:`
    );
    for (const s of skipped.slice(0, 5)) console.warn(`  ${s.routePath} (${s.reason})`);
    if (skipped.length > 5) console.warn(`  …and ${skipped.length - 5} more`);
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
