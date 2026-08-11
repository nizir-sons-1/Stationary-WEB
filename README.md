# Nazir & Sons — storefront

React 19 + Vite 8 + Tailwind, backed by Supabase, deployed on Vercel.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |
| `npm run build:data` | Regenerate `src/data/calculator-rates.json` from `products.json` |

## Environment

Set these in `.env` locally and in **Vercel → Settings → Environment Variables**:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`VITE_SUPABASE_URL` is also read by `index.html` to emit a `<link rel="preconnect">`,
so the browser can open the connection to Supabase before the bundle asks for data.

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

**Supabase returns at most 1000 rows per request by default.** The `products`
table is at 622. If it grows past 1000, `useProducts` and `useCategoryCounts`
will start silently truncating and will need pagination.
