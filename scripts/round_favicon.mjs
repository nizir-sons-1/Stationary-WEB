import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function makeRounded(filename, size) {
  const inputPath = path.resolve('public', filename);
  const outputPath = path.resolve('public', filename.replace('.png', '_temp.png'));

  // A rounded rectangle svg mask
  const radius = size * 0.22; // 22% radius
  const svg = `
    <svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white" />
    </svg>
  `;

  await sharp(inputPath)
    .resize(size, size)
    .ensureAlpha()
    .composite([{
      input: Buffer.from(svg),
      blend: 'dest-in'
    }])
    .toFile(outputPath);

  fs.renameSync(outputPath, inputPath);
  console.log(`Updated ${filename} to have rounded corners!`);
}

async function main() {
  try {
    await makeRounded('favicon-32.png', 32);
    await makeRounded('favicon-180.png', 180);
    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
}

main();
