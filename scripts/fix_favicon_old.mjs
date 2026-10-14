import sharp from 'sharp';
import path from 'path';

async function generateFavicon(size) {
  const inputPath = path.resolve('public', 'ns-logo.webp');
  const outputPath = path.resolve('public', `favicon-${size}.png`);

  try {
    // Resize the original image exactly as it was, maintaining its native spacing,
    // but using a high-quality resampling kernel (lanczos3) for maximum sharpness.
    const resizedLogo = await sharp(inputPath)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        kernel: 'lanczos3', // Best quality for downscaling
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Ensure white background
      })
      .toBuffer();

    // Create a rounded corners mask
    const radius = size * 0.22; // 22% radius for a premium iOS-like squircle
    const maskSvg = `
      <svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white" />
      </svg>
    `;

    // Apply the rounded mask
    await sharp(resizedLogo)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from(maskSvg),
          blend: 'dest-in'
        }
      ])
      .png({ quality: 100 }) // Max PNG quality
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
