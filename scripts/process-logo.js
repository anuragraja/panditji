const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.resolve('public/images/logo.jpg');
  const outputPath = path.resolve('public/images/logo.png');
  const faviconPath = path.resolve('public/favicon.ico');
  const appIconPath = path.resolve('src/app/icon.png');

  // Exact bounds of the white emblem circle:
  // Center is ~500, ~448. Size ~776
  const size = 776;
  const left = 112;
  const top = 60;

  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#fff"/></svg>`
  );

  await sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    .composite([{
      input: circleMask,
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);

  console.log('Clean logo.png created at 776x776 with transparent circular background!');

  // Also create a sharp appIcon and favicon
  await sharp(outputPath)
    .resize(192, 192)
    .png()
    .toFile(appIconPath);

  await sharp(outputPath)
    .resize(64, 64)
    .toFile(faviconPath);

  console.log('App icons and favicons regenerated successfully!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
