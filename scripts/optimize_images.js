const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');

// Clean up any temp files first
fs.readdirSync(imgDir).forEach(f => {
  if (f.startsWith('temp_')) {
    try { fs.unlinkSync(path.join(imgDir, f)); } catch (_) {}
  }
});

const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.webp') && !f.endsWith('_thumb.webp'));

async function optimize() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = path.join(imgDir, file);
    const beforeSize = fs.statSync(filePath).size;
    totalBefore += beforeSize;

    const inputBuffer = fs.readFileSync(filePath);
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75, effort: 4 })
      .toBuffer();

    fs.writeFileSync(filePath, outputBuffer);
    const afterSize = outputBuffer.length;
    totalAfter += afterSize;

    console.log(`${file}: ${(beforeSize/1024).toFixed(1)} KB -> ${(afterSize/1024).toFixed(1)} KB`);
  }

  console.log(`\nTotal images size before: ${(totalBefore/(1024*1024)).toFixed(2)} MB`);
  console.log(`Total images size after: ${(totalAfter/(1024*1024)).toFixed(2)} MB`);
}

optimize().catch(console.error);
