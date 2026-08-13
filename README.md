# Nazir & Sons — storefront

React 19 + Vite 8 + Tailwind, backed by Supabase, deployed on Vercel.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/`, then prerender every route |
| `npm run build:app` | Just the Vite build, no prerender |
| `npm run prerender` | Prerender over an existing `dist/` (safe to re-run) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |
| `npm run build:data` | Regenerate `src/data/calculator-rates.json` from `products.json` |
| `npm run og` | Rebuild `public/og-image.png` from the logo artwork (rarely needed) |

## Environment

Set these in `.env` locally and in **Vercel → Settings → Environment Variables**:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`VITE_SUPABASE_URL` is also read by `index.html` to emit a `<link rel="preconnect">`,
so the browser can open the connection to Supabase before the bundle asks for data.

## How the site gets found

This is a client-rendered SPA, which search engines tolerate and answer engines
do not — GPTBot, ClaudeBot, PerplexityBot and every social preview scraper read
the raw HTML response and never run the JavaScript. So `npm run build` runs
`scripts/prerender.js` afterwards, which writes a real HTML document for every
route: correct head tags, schema.org graph, and the page's actual content.

| Where | What lives there |
| --- | --- |
| `src/lib/site.js` | The address, phone, hours, domain — stated once, used everywhere |
| `src/data/seo-content.js` | Per-route title, description, summary, and the FAQ answers |
| `src/lib/schema.js` | schema.org builders (Organization, Store, Product, FAQ, HowTo…) |
| `src/lib/seo.js` | `usePageSeo()` — keeps the head correct during client navigation |
| `scripts/prerender.js` | Static HTML per route, plus `robots.txt`, `sitemap.xml`, `llms.txt` |

Two things follow from this that are easy to undo by accident:

**The shop is addressed by path.** `/shop/paper-and-canvas/art-card` is a real
page with its own title and its own static HTML file. It used to be React state
behind a single `/shop` URL, which meant ~175 catalogue views shared one
indexable page. Category tiles must stay `<Link>`s with real `href`s — a `<div>`
with an `onClick` is invisible to a crawler.

**Structured data must match what is on the page.** `faqSchema()` is only ever
emitted where the same questions and answers are rendered in the DOM. Marking up
content a visitor cannot see is a manual-action risk.

After the first deploy: submit `https://www.nazirandsons.shop/sitemap.xml` in
Google Search Console and Bing Webmaster Tools, and confirm the Google Business
Profile's name, address and phone match `BUSINESS` in `src/lib/site.js` exactly.

## Things worth knowing

**`.env` is currently tracked by git.** The `.gitignore` entry for it had been
written in UTF-16, so git was matching `.\0e\0n\0v\0` and never the real file.
The encoding is fixed now, but the file is still in the index. To untrack it
(the file stays on disk):

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
```

The key in there is the Supabase **anon** key, which is public by design — it
ships inside the client bundle either way — so this is hygiene, not a breach.
Row Level Security is what actually protects the data.

**The calculator does not read `products.json` at runtime.** Importing that file
put 428 kB of product rows into the JavaScript bundle. `npm run build:data`
distills it down to a ~2 kB rates table. Re-run it whenever `products.json`
changes.

**Product images live in `public/images` as WebP.** The originals were 1024×1024
PNGs at roughly 800 kB each; they are now ~65 kB. If you add a category image,
convert it rather than dropping a PNG in.

**Large media in the repo root** (`*.mp4`, the logo `.jpeg`) is not used by the
app. `.vercelignore` keeps it out of CLI deploys, but Git-integration deploys
clone the repo as-is — consider `git rm --cached` on those too.

**Some product names cannot become files.** Product URLs are the product name,
encoded — `/product/Water%20Proof%20Tape%202%22x5M%20China`. Characters that are
legal in a URL but not in a filename mean those pages cannot be prerendered and
stay client-rendered; the build prints how many. On Linux (so on Vercel) that is
only names containing `/`, about 20 of 542. Renaming those rows in Supabase is
all it takes to bring them in.

**The catalogue has duplicate product names.** 23 names appear on more than one
row — the same stock filed under two categories. The shop grid renders a tile
per row, so two tiles can lead to the same product page. `useProduct` folds
those rows together rather than failing, but deduplicating them in Supabase
would be better than papering over it here.

**Supabase returns at most 1000 rows per request by default.** The `products`
table is at 622. If it grows past 1000, `useProducts` and `useCategoryCounts`
will start silently truncating and will need pagination.
