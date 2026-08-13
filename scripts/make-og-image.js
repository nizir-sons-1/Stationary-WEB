/*
 * ─────────────────────────────────────────────────────────────────────────────
 * SOCIAL CARD
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Builds public/og-image.png — the 1200×630 picture that WhatsApp, Facebook,
 * LinkedIn, Slack, X and every link-preview scraper show when someone shares a
 * page from this site. It is also what the Organization and Store schema point
 * at as the brand image.
 *
 * There was no such image: og:image had nothing to reference but a 512 px
 * square logo and a 180 px favicon, both below the 200 px minimum some
 * platforms enforce and neither anywhere near 1.91:1, so shares rendered as a
 * bare grey link.
 *
 * Run it by hand, not on every build — the output is committed:
 *
 *   npm run og
 *
 * No image library involved. PNG is zlib plus a one-byte filter tag per
 * scanline, and Node ships zlib, so decoding the source logo and encoding the
 * card is about a hundred lines of arithmetic rather than a dependency.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE = path.join(ROOT, 'ChatGPT Image Aug 12, 2026, 12_44_21 AM.png');
const OUTPUT = path.join(ROOT, 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO = 520; // Leaves a comfortable margin top and bottom at 630 tall.

/* ── decode ───────────────────────────────────────────────────────────────── */

/**
 * Minimal PNG reader: 8-bit, non-interlaced, truecolour with or without alpha.
 * Anything else throws rather than producing a quietly wrong picture.
 */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const interlace = buffer[28];

  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (colorType !== 2 && colorType !== 6) throw new Error(`unsupported colour type ${colorType}`);
  if (interlace !== 0) throw new Error('interlaced PNGs are not supported');

  const channels = colorType === 6 ? 4 : 3;

  const idat = [];
  let at = 8;
  while (at < buffer.length) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString('ascii', at + 4, at + 8);
    if (type === 'IDAT') idat.push(buffer.subarray(at + 8, at + 8 + length));
    if (type === 'IEND') break;
    at += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * channels);

  // Undo the per-scanline filters. Each row is prefixed with its filter type
  // and is predicted from the pixel to its left (a), the row above (b), and the
  // pixel above-left (c) — see PNG spec §9.
  let offset = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++];
    const row = raw.subarray(offset, offset + stride);
    offset += stride;

    const out = y * stride;
    const prev = out - stride;

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? pixels[out + x - channels] : 0;
      const b = y > 0 ? pixels[prev + x] : 0;
      const c = y > 0 && x >= channels ? pixels[prev + x - channels] : 0;
      const value = row[x];

      let restored;
      switch (filter) {
        case 0: restored = value; break;
        case 1: restored = value + a; break;
        case 2: restored = value + b; break;
        case 3: restored = value + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          restored = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`unknown filter ${filter} on row ${y}`);
      }
      pixels[out + x] = restored & 0xff;
    }
  }

  return { width, height, channels, pixels };
}

/* ── resample ─────────────────────────────────────────────────────────────── */

/** Box filter. The source is 1254 px and the target 520, so every output pixel
 *  averages roughly 5.8 input pixels — plenty to avoid the shimmer a nearest
 *  neighbour reduction would leave on the wordmark's serifs. */
function resize(image, size) {
  const { width, height, channels, pixels } = image;
  const out = Buffer.alloc(size * size * 3);

  for (let y = 0; y < size; y++) {
    const y0 = Math.floor((y * height) / size);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / size));

    for (let x = 0; x < size; x++) {
      const x0 = Math.floor((x * width) / size);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / size));

      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const at = (sy * width + sx) * channels;
          r += pixels[at];
          g += pixels[at + 1];
          b += pixels[at + 2];
          n++;
        }
      }

      const at = (y * size + x) * 3;
      out[at] = Math.round(r / n);
      out[at + 1] = Math.round(g / n);
      out[at + 2] = Math.round(b / n);
    }
  }

  return out;
}

/* ── encode ───────────────────────────────────────────────────────────────── */

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(rgb, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  // 10, 11, 12 stay zero: deflate, adaptive filtering, no interlace.

  // Filter type 0 on every row. The card is mostly flat colour, which deflate
  // handles well on its own; the adaptive filters buy little and cost clarity.
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── compose ──────────────────────────────────────────────────────────────── */

const source = decodePng(fs.readFileSync(SOURCE));
const logo = resize(source, LOGO);

// The background is taken from the source's own top-left pixel, so the card
// sits on whatever ground the artwork was drawn on and the logo has no seam
// around it.
const bg = [source.pixels[0], source.pixels[1], source.pixels[2]];

const canvas = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  canvas[i * 3] = bg[0];
  canvas[i * 3 + 1] = bg[1];
  canvas[i * 3 + 2] = bg[2];
}

const left = Math.round((WIDTH - LOGO) / 2);
const top = Math.round((HEIGHT - LOGO) / 2);
for (let y = 0; y < LOGO; y++) {
  logo.copy(canvas, ((top + y) * WIDTH + left) * 3, y * LOGO * 3, (y + 1) * LOGO * 3);
}

const png = encodePng(canvas, WIDTH, HEIGHT);
fs.writeFileSync(OUTPUT, png);

console.log(
  `[og-image] ${path.relative(ROOT, OUTPUT)} — ${WIDTH}×${HEIGHT}, ` +
    `${(png.length / 1024).toFixed(0)} kB, background rgb(${bg.join(',')})`
);
