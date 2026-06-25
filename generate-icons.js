import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = path.join(__dirname, 'public', 'taxi-livo-logo.png');
const outputDir = path.join(__dirname, 'public');

const iconSizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(inputImage)) {
    console.error('Input image not found:', inputImage);
    return;
  }

  for (const size of iconSizes) {
    const outputPath = path.join(outputDir, `pwa-${size}x${size}.png`);
    await sharp(inputImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  // Apple touch icon (usually 180x180)
  const appleTouchIconPath = path.join(outputDir, `apple-touch-icon.png`);
  await sharp(inputImage)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFile(appleTouchIconPath);
  console.log(`Generated ${appleTouchIconPath}`);
}

generateIcons().catch(console.error);
