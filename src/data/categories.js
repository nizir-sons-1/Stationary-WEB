import {
  Archive, Backpack, Badge, Banknote, Blocks, Book, BookOpen, Box, Boxes, Brush,
  Calculator, Camera, Candy, Clipboard, ClipboardList, Clock, Coins, Compass, Container,
  CreditCard, Droplet, Droplets, Eraser, Feather, FileText, Flame, Flower2, Folder, Frame,
  Gamepad2, Gift, Globe, Grid2x2, Hand, Hexagon, Highlighter, IdCard, Image,
  Lamp, Layers, LayoutGrid, KeyRound, Magnet, Milk, Newspaper, Notebook, NotebookPen, Package,
  PaintBucket, Paintbrush, Palette, Paperclip, PartyPopper, Pencil, PenTool, Percent,
  Presentation, Printer, Puzzle, Ribbon, Ruler, Scissors, Shapes, Shirt, ShoppingBag, Slice,
  Sparkles, Square, Stamp, Sticker, StickyNote, Tag, Ticket, Wallet, Wrench,
} from 'lucide-react';
import { slugify } from '../lib/site.js';

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CATALOGUE MAP
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Supabase's `products.category` column is free text that grew organically, so
 * the same shelf is spelled several different ways: "Art Pencil" and
 * "art pencil", "Modeling Clay" and "Modelling Clay", "Gift Bag" and
 * "Gift Bags", "kids Toys" and "kids toys". The shop grid used to render one
 * card per distinct string, which is why the same category appeared twice.
 *
 * Every entry below is one real shelf:
 *
 *   name  — what the customer sees (typos in the raw data fixed here, not in
 *           the database, so nothing downstream breaks)
 *   db    — every raw `category` string that belongs to this shelf. Counts are
 *           summed across all of them and selecting the card queries all of
 *           them, so a merged card genuinely shows everything it claims to.
 *   icon  — the lucide glyph used in the sidebar and the category header
 *   image — only Paper & Canvas pins one. Every other card takes its picture
 *           from a real product inside it (see representativeImages in
 *           useSupabase), which is the only way to guarantee that the picture
 *           actually matches the shelf and that no two cards share one.
 *
 * If a `category` value ever appears in the database that is not listed here it
 * still shows up — see `groupCategories` — so new stock is never invisible.
 */

export const PAPER_AND_CANVAS = 'Paper & Canvas';

const ENTRIES = [
  // ── Paper & Canvas ────────────────────────────────────────────────────────
  // Untouched: these keep their hand-picked local artwork.
  { dept: PAPER_AND_CANVAS, name: 'Bleach Card', icon: CreditCard, image: '/images/white_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Art Card', icon: Sparkles, image: '/images/art_card.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Art Paper', icon: FileText, image: '/images/art_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Matte Paper', icon: Layers, image: '/images/matte_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Copy Paper', icon: FileText, image: '/images/copy_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Offset Paper', icon: Archive, image: '/images/offset_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Ivory Card', icon: CreditCard, image: '/images/ivory_card.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Color Card', icon: Layers, image: '/images/color_card.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Carbonless', icon: FileText, image: '/images/carbonless.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Stickers', icon: Tag, image: '/images/stickers.webp' },
  { dept: PAPER_AND_CANVAS, name: 'Local Paper', icon: FileText, image: '/images/local_paper.webp' },
  { dept: PAPER_AND_CANVAS, name: 'News', icon: Newspaper, image: '/images/news_paper.webp' },
  // kraft.webp had been sitting unused in /public/images while this card
  // pointed at a stock photo; the local file is both the better picture and
  // one fewer third-party request.
  { dept: PAPER_AND_CANVAS, name: 'Kraft Card', icon: Package, image: '/images/kraft.webp' },
  // The three without local artwork keep the stock photos they have always had.
  { dept: PAPER_AND_CANVAS, name: 'BoxBoard', icon: Box, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=600&q=80' },
  { dept: PAPER_AND_CANVAS, name: 'Butter Paper', icon: Feather, image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80' },
  { dept: PAPER_AND_CANVAS, name: 'Book Paper', icon: BookOpen, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },

  // ── Fine Arts ─────────────────────────────────────────────────────────────
  { dept: 'Fine Arts', name: 'Silicone Mold', icon: Shapes },
  { dept: 'Fine Arts', name: 'Epoxy Resin', icon: Droplets },
  { dept: 'Fine Arts', name: 'Resin Pigment Paste', icon: Droplet },
  { dept: 'Fine Arts', name: 'Modeling Clay', icon: Blocks, db: ['Modeling Clay', 'Modelling Clay'] },
  { dept: 'Fine Arts', name: 'Modelling Paste', icon: Container, db: ['Modelling paste'] },
  { dept: 'Fine Arts', name: 'Modelling Tools', icon: Wrench, db: ['Modelling tools'] },
  { dept: 'Fine Arts', name: 'Molds & Paints', icon: Palette, db: ['Mols & Paints'] },
  { dept: 'Fine Arts', name: 'Slime', icon: Droplets },
  { dept: 'Fine Arts', name: 'Art Marker', icon: Highlighter },
  { dept: 'Fine Arts', name: 'Paint Marker', icon: Highlighter },
  { dept: 'Fine Arts', name: 'Drawing Marker', icon: Highlighter },
  { dept: 'Fine Arts', name: 'Micron Fineliner Pen', icon: PenTool },
  { dept: 'Fine Arts', name: 'Art Pencil', icon: Pencil, db: ['Art Pencil', 'art pencil'] },
  { dept: 'Fine Arts', name: 'Color Pencil', icon: Pencil },
  { dept: 'Fine Arts', name: 'Drawing Pencil Set', icon: Pencil },
  { dept: 'Fine Arts', name: 'Crayon', icon: Pencil },
  { dept: 'Fine Arts', name: 'Coloring Kit', icon: Palette, db: ['Coloring Kit', 'Color Kit'] },
  { dept: 'Fine Arts', name: 'Arts & Crafts Deals', icon: Percent },
  { dept: 'Fine Arts', name: 'Art Glue', icon: Droplet },
  { dept: 'Fine Arts', name: 'Art Glitters', icon: Sparkles },
  { dept: 'Fine Arts', name: 'Mica Powder', icon: Sparkles },
  { dept: 'Fine Arts', name: 'Acrylic Powder', icon: Sparkles, db: ['Acrylic powder'] },
  { dept: 'Fine Arts', name: 'Art Brush', icon: Brush, db: ['Art Brush', 'Brushes', 'BRUSH'] },
  { dept: 'Fine Arts', name: 'Painting Accessories', icon: Paintbrush },
  { dept: 'Fine Arts', name: 'Paint Accessories', icon: Paintbrush },
  { dept: 'Fine Arts', name: 'Painting Medium', icon: Droplet },
  { dept: 'Fine Arts', name: 'Oil Painting Medium', icon: Droplet, db: ['Oil Painitng Medium'] },
  { dept: 'Fine Arts', name: 'Matt Varnish', icon: Droplet },
  { dept: 'Fine Arts', name: 'Gesso', icon: PaintBucket, db: ['Gesso', 'gesso'] },
  { dept: 'Fine Arts', name: 'Paint', icon: PaintBucket },
  { dept: 'Fine Arts', name: 'Poster Paints', icon: Palette },
  { dept: 'Fine Arts', name: 'Acrylic Paints', icon: Palette, db: ['Acryli Paints'] },
  { dept: 'Fine Arts', name: 'Fabric Paint', icon: Shirt },
  { dept: 'Fine Arts', name: 'Watercolor Paints', icon: Droplets, db: ['Watercolor', 'Watercolor paints'] },
  { dept: 'Fine Arts', name: 'Calligraphy Pen', icon: Feather },
  { dept: 'Fine Arts', name: 'Calligraphy Marker', icon: Feather },
  { dept: 'Fine Arts', name: 'Calligraphy Set', icon: Feather },
  { dept: 'Fine Arts', name: 'Fountain Pen', icon: PenTool },
  { dept: 'Fine Arts', name: 'Fancy Pen', icon: PenTool },
  { dept: 'Fine Arts', name: 'Gel Pens', icon: PenTool },
  { dept: 'Fine Arts', name: 'Canvas Board', icon: Frame },
  { dept: 'Fine Arts', name: 'Sketch Pad', icon: Notebook },
  { dept: 'Fine Arts', name: 'Soya Wax', icon: Flame },
  { dept: 'Fine Arts', name: 'Bee Wax', icon: Flame, db: ['BEE WAX'] },
  { dept: 'Fine Arts', name: 'Gel Wax', icon: Flame, db: ['gel wax'] },
  { dept: 'Fine Arts', name: 'Detail Knife', icon: Slice, db: ['Detail knife'] },
  { dept: 'Fine Arts', name: 'Water Proof Tape', icon: Sticker, db: ['water tape'] },

  // ── Stationery ────────────────────────────────────────────────────────────
  { dept: 'Stationery', name: 'Name Plate', icon: Badge, db: ['Name Plate', 'name plate'] },
  { dept: 'Stationery', name: 'Name Badge', icon: IdCard },
  { dept: 'Stationery', name: 'Id Card Holder', icon: IdCard },
  { dept: 'Stationery', name: 'Card Holder', icon: CreditCard },
  { dept: 'Stationery', name: 'Paper Cutter', icon: Slice },
  { dept: 'Stationery', name: 'Rotary Cutter', icon: Slice, db: ['Rottery Cutter'] },
  { dept: 'Stationery', name: 'Corner Cutter', icon: Slice, db: ['corner cutter'] },
  { dept: 'Stationery', name: 'Scissor', icon: Scissors },
  { dept: 'Stationery', name: 'Calculator', icon: Calculator },
  { dept: 'Stationery', name: 'Geometry Pouch', icon: Ruler },
  { dept: 'Stationery', name: 'Geometry Box', icon: Ruler },
  { dept: 'Stationery', name: 'Compass', icon: Compass },
  { dept: 'Stationery', name: 'Photo Paper', icon: Printer },
  { dept: 'Stationery', name: 'Ballpoint Pen', icon: PenTool },
  { dept: 'Stationery', name: 'Counter Pen', icon: PenTool },
  { dept: 'Stationery', name: 'Roller Refills', icon: PenTool },
  { dept: 'Stationery', name: 'Markers', icon: Highlighter },
  { dept: 'Stationery', name: 'Highlighters', icon: Highlighter },
  { dept: 'Stationery', name: 'Cute Highlighters', icon: Highlighter },
  { dept: 'Stationery', name: 'Cute Pencil', icon: Pencil },
  { dept: 'Stationery', name: 'Mechanical Pencil', icon: Pencil },
  { dept: 'Stationery', name: 'Lead', icon: Pencil },
  { dept: 'Stationery', name: 'Pen Stand', icon: Container },
  { dept: 'Stationery', name: 'Desk Organizer', icon: Container, db: ['Desk Organzier'] },
  { dept: 'Stationery', name: 'Whiteboard', icon: Presentation, db: ['White board'] },
  { dept: 'Stationery', name: 'Whiteboard Eraser', icon: Eraser },
  { dept: 'Stationery', name: 'Whiteboard Marker Ink', icon: Droplet },
  { dept: 'Stationery', name: 'Notice Board', icon: Presentation },
  { dept: 'Stationery', name: 'Board Magnet', icon: Magnet },
  { dept: 'Stationery', name: 'Menu Folder', icon: Folder },
  { dept: 'Stationery', name: 'Receipt Folder', icon: Folder },
  { dept: 'Stationery', name: 'Binder Clips', icon: Paperclip },
  { dept: 'Stationery', name: 'Binding Machine', icon: Wrench },
  { dept: 'Stationery', name: 'Punch Machine', icon: Wrench },
  { dept: 'Stationery', name: 'Numbering Stamps', icon: Stamp },
  { dept: 'Stationery', name: 'Sticky Notes', icon: StickyNote },
  { dept: 'Stationery', name: 'Table Planner', icon: ClipboardList },
  { dept: 'Stationery', name: 'Tape Dispenser', icon: Sticker },
  { dept: 'Stationery', name: 'Magnifying Glass', icon: Hexagon },
  { dept: 'Stationery', name: 'Money Box', icon: Banknote },
  { dept: 'Stationery', name: 'Coin Box', icon: Coins, db: ['coin Box'] },
  { dept: 'Stationery', name: 'Key Chain', icon: KeyRound, db: ['key chain'] },
  { dept: 'Stationery', name: 'Paper Soap', icon: Square, db: ['paper soap'] },
  { dept: 'Stationery', name: 'Digital Lockers', icon: KeyRound, db: ['Stationery'] },
  { dept: 'Stationery', name: 'Stationery Set', icon: Clipboard, db: ['Stationery set'] },
  { dept: 'Stationery', name: 'Office Supplies Deals', icon: Percent },

  // ── Notebooks ─────────────────────────────────────────────────────────────
  { dept: 'Notebooks', name: 'Diary', icon: Book, db: ['Diary', 'diary'] },
  { dept: 'Notebooks', name: 'Note Book', icon: NotebookPen, db: ['Note book'] },
  { dept: 'Notebooks', name: 'Leaf Paper', icon: FileText },

  // ── Accessories ───────────────────────────────────────────────────────────
  { dept: 'Accessories', name: 'Craft Accessories', icon: Sparkles },
  { dept: 'Accessories', name: 'Educational Wooden Toy', icon: Blocks },
  { dept: 'Accessories', name: 'Educational Toy', icon: Puzzle },
  { dept: 'Accessories', name: 'Learning & Activity Toys', icon: Gamepad2 },
  { dept: 'Accessories', name: 'Kids Toys', icon: Gamepad2, db: ['kids Toys', 'kids toys'] },
  { dept: 'Accessories', name: 'Wooden Plate', icon: Grid2x2 },
  { dept: 'Accessories', name: 'Wooden Puzzle Plate', icon: Puzzle },
  { dept: 'Accessories', name: 'Fishing Game', icon: Gamepad2 },
  { dept: 'Accessories', name: 'Letter & Number', icon: LayoutGrid },
  { dept: 'Accessories', name: 'Foaming Sheet', icon: Layers },
  { dept: 'Accessories', name: 'Foaming Alphabets', icon: LayoutGrid },
  { dept: 'Accessories', name: 'Foaming Flower', icon: Flower2, db: ['FOAMING FLOWER'] },
  { dept: 'Accessories', name: 'School Supplies Deals', icon: Percent },
  { dept: 'Accessories', name: 'School Accessories', icon: Backpack },
  { dept: 'Accessories', name: 'Pom Pom', icon: Candy, db: ['Pom pom'] },
  { dept: 'Accessories', name: 'Confetti Beads', icon: PartyPopper },
  { dept: 'Accessories', name: 'Birthday Balloon', icon: PartyPopper },
  { dept: 'Accessories', name: 'Ribbons', icon: Ribbon, db: ['RIBBONS'] },
  { dept: 'Accessories', name: 'Water Bottles', icon: Milk, db: ['Water Bottles', 'water bottles'] },
  { dept: 'Accessories', name: 'Lunch Box', icon: Box },
  { dept: 'Accessories', name: 'Gift Bag', icon: Gift, db: ['Gift Bag', 'Gift Bags'] },
  { dept: 'Accessories', name: 'Gift Box', icon: Gift },
  { dept: 'Accessories', name: 'Gift Paper', icon: Gift },
  { dept: 'Accessories', name: 'Glitter Sticker', icon: Sticker, db: ['Glitter sticker'] },
  { dept: 'Accessories', name: 'Sign Sticker', icon: Sticker },
  { dept: 'Accessories', name: 'Washi Tapes', icon: Ticket },
  { dept: 'Accessories', name: 'Globe', icon: Globe },
  { dept: 'Accessories', name: 'Digital Clock', icon: Clock },
  { dept: 'Accessories', name: 'Table Lamp & Clock', icon: Lamp, db: ['Table Lamp&Clock'] },
  { dept: 'Accessories', name: 'Wall Art Rolls', icon: Image, db: ['Wall'] },
  { dept: 'Accessories', name: 'Candle', icon: Flame },
  { dept: 'Accessories', name: 'Wallet', icon: Wallet },
  { dept: 'Accessories', name: 'Gloves', icon: Hand },
  { dept: 'Accessories', name: 'Brush Case', icon: Camera },
  { dept: 'Accessories', name: 'Sponge', icon: Boxes },
  { dept: 'Accessories', name: 'Thread Cutter', icon: Scissors },
  { dept: 'Accessories', name: 'Tube Extractor', icon: Wrench },
];

/*
 * Departments, in the order the shop shows them. Paper & Canvas is the
 * flagship and gets the wide tile.
 */
export const DEPARTMENTS = [
  { name: PAPER_AND_CANVAS, icon: Layers, bg: 'bg-emerald-50', color: 'text-emerald-600', featured: true },
  { name: 'Fine Arts', icon: Palette, bg: 'bg-orange-50', color: 'text-orange-600' },
  { name: 'Stationery', icon: PenTool, bg: 'bg-blue-50', color: 'text-blue-600' },
  { name: 'Notebooks', icon: BookOpen, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  { name: 'Accessories', icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600' },
];

const DEPARTMENT_NAMES = DEPARTMENTS.map((d) => d.name);

// Anything the database grows that this file has not been taught about lands
// here rather than vanishing from the shop entirely.
const CATCH_ALL_DEPARTMENT = 'Accessories';

// Every entry, normalised: `db` defaults to just the display name.
const CATALOGUE = ENTRIES.map((e) => ({ ...e, db: e.db || [e.name] }));

// raw supabase category string (lowercased) -> catalogue entry
const BY_DB_NAME = new Map();
for (const entry of CATALOGUE) {
  for (const raw of entry.db) BY_DB_NAME.set(raw.toLowerCase(), entry);
}

/** Every raw `category` string that makes up a customer-facing category name. */
export function dbNamesFor(displayName) {
  const entry = CATALOGUE.find((e) => e.name === displayName);
  return entry ? entry.db : [displayName];
}

/** Which department a category card belongs to — used to deep-link from search. */
export function departmentOf(rawCategory) {
  const entry = BY_DB_NAME.get(String(rawCategory || '').toLowerCase());
  return entry ? entry.dept : CATCH_ALL_DEPARTMENT;
}

/** The customer-facing name for a raw database category. */
export function displayNameOf(rawCategory) {
  const entry = BY_DB_NAME.get(String(rawCategory || '').toLowerCase());
  return entry ? entry.name : rawCategory;
}

const PALETTE = [
  { color: 'text-blue-600', bg: 'bg-blue-50' },
  { color: 'text-purple-600', bg: 'bg-purple-50' },
  { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { color: 'text-amber-600', bg: 'bg-amber-50' },
  { color: 'text-rose-600', bg: 'bg-rose-50' },
  { color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { color: 'text-orange-600', bg: 'bg-orange-50' },
];

/**
 * Folds the raw per-string counts and images coming out of Supabase into the
 * customer-facing category cards.
 *
 * @param {Record<string, number>} counts  raw category string -> product count
 * @param {Record<string, string>} images  raw category string -> product photo
 * @param {Record<string, string>} overrides  artwork chosen in the admin panel,
 *        keyed by either the customer-facing name or any of the raw database
 *        spellings — the panel lists shelves by their raw `products.category`
 *        value, while this file has already merged those into one display name,
 *        so a saved image has to be findable under both.
 * @returns {Record<string, Array>} department name -> cards, busiest first
 */
export function groupCategories(counts, images = {}, overrides = {}) {
  const merged = new Map(); // display name -> card

  const overrideFor = (entry) => {
    if (overrides[entry.name]) return overrides[entry.name];
    for (const raw of entry.db) {
      if (overrides[raw]) return overrides[raw];
    }
    return null;
  };

  const push = (entry, rawName) => {
    const n = counts[rawName] || 0;
    if (n === 0) return;
    let card = merged.get(entry.name);
    if (!card) {
      card = {
        name: entry.name,
        dept: entry.dept,
        icon: entry.icon || Box,
        // Admin artwork outranks the bundled art, which outranks a borrowed
        // product photo — a picture someone deliberately chose should never be
        // overruled by a default.
        image: overrideFor(entry) || entry.image || null,
        count: 0,
        // Kept so a merged card can query every spelling it stands for.
        dbNames: [],
      };
      merged.set(entry.name, card);
    }
    card.count += n;
    card.dbNames.push(rawName);
    // Paper & Canvas pins its own art; everything else borrows a real product
    // photo, preferring the busiest spelling so the picture is representative.
    if (!entry.image && !card.image && images[rawName]) card.image = images[rawName];
  };

  for (const rawName of Object.keys(counts)) {
    const entry = BY_DB_NAME.get(rawName.toLowerCase());
    if (entry) {
      push(entry, rawName);
    } else {
      // Unknown shelf: surface it under the catch-all rather than dropping it.
      push({ dept: CATCH_ALL_DEPARTMENT, name: rawName, icon: Box, db: [rawName] }, rawName);
    }
  }

  const byDept = {};
  for (const dept of DEPARTMENT_NAMES) byDept[dept] = [];
  for (const card of merged.values()) {
    (byDept[card.dept] || byDept[CATCH_ALL_DEPARTMENT]).push(card);
  }

  for (const dept of DEPARTMENT_NAMES) {
    byDept[dept].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    byDept[dept].forEach((card, i) => Object.assign(card, PALETTE[i % PALETTE.length]));
  }

  return byDept;
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * SLUG ↔ NAME
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The shop is addressed by path — /shop/paper-and-canvas/art-card — so a URL
 * has to be turned back into the department and category it names. The map is
 * built from the catalogue above, which covers every shelf this file knows
 * about; anything the database has grown since is resolved against the live
 * category list instead (see Shop.jsx), so a new shelf is never a dead URL.
 */
const BY_DEPT_SLUG = new Map(DEPARTMENT_NAMES.map((name) => [slugify(name), name]));
const BY_CATEGORY_SLUG = new Map(CATALOGUE.map((e) => [slugify(e.name), e]));

/** "paper-and-canvas" → "Paper & Canvas", or null if no department matches. */
export function departmentFromSlug(slug) {
  return BY_DEPT_SLUG.get(String(slug || '').toLowerCase()) || null;
}

/** "art-card" → "Art Card", or null if the catalogue map has no such shelf. */
export function categoryFromSlug(slug) {
  const entry = BY_CATEGORY_SLUG.get(String(slug || '').toLowerCase());
  return entry ? entry.name : null;
}

/** Cards whose stock is priced by weight/GSM and so can be bought in instalments. */
export const PAPER_CATEGORY_NAMES = new Set(
  CATALOGUE.filter((e) => e.dept === PAPER_AND_CANVAS)
    .flatMap((e) => e.db)
    .map((n) => n.toLowerCase())
);
