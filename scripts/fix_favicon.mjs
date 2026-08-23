import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicon(size) {
  const inputPath = path.resolve('public', 'ns-logo.webp');
  const outputPath = path.resolve('public', `favicon-${size}.png`);

  try {
    // 1. Trim the excess whitespace from the original logo
    const trimmed = await sharp(inputPath)
      .trim() 
      .toBuffer();

    // 2. Resize it so the logo takes up ~85% of the total favicon box
    const logoSize = Math.floor(size * 0.85);
    const resizedLogo = await sharp(trimmed)
      .resize({
        width: logoSize,
        height: logoSize,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // 3. Create a white square with rounded corners as the background
    const radius = size * 0.22;
    const bgSvg = `
      <svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white" />
      </svg>
    `;

    // 4. Composite the logo onto the rounded white background
    await sharp(Buffer.from(bgSvg))
      .composite([
        {
          input: resizedLogo,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(outputPath);

    console.log(`Generated favicon-${size}.png successfully!`);
  } catch (err) {
    console.error(`Error generating ${size}x${size} favicon:`, err);
  }
}

async function main() {
  await generateFavicon(32);
  await generateFavicon(180);
}

main();
