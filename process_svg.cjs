const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const pngToIco = require("png-to-ico");

async function main() {
  const svgPath = path.join(__dirname, "public", "LOGO_CREOVISION.svg");
  let svgContent = fs.readFileSync(svgPath, "utf-8");

  // Remove background rect
  svgContent = svgContent.replace(/<rect[^>]*fill:#E9F7FF[^>]*\/>/g, "");
  const cleanSvgBuffer = Buffer.from(svgContent);

  // Generate full logo
  const logoBuffer = await sharp(cleanSvgBuffer, { density: 300 })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const padX = Math.round(logoMeta.width * 0.04);
  const padY = Math.round(logoMeta.height * 0.04);
  
  await sharp(logoBuffer)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(__dirname, "public", "brand", "creovision-logo.png"));

  console.log("Full logo generated: public/brand/creovision-logo.png");

  // Extract symbol
  let symbolSvgContent = svgContent
    .replace(/<path[^>]*fill:#00288C[^>]*\/>/gi, "")
    .replace(/<path[^>]*fill:#003FDE[^>]*\/>/gi, "")
    .replace(/<path[^>]*fill:#007EDE[^>]*\/>/gi, "")
    .replace(/<path[^>]*fill:#001752[^>]*\/>/gi, "")
    .replace(/<g[^>]*>\s*<\/g>/g, "");

  const symbolBuffer = await sharp(Buffer.from(symbolSvgContent), { density: 600 })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
    .toBuffer();

  const bgColor = "#171526";
  const symMeta = await sharp(symbolBuffer).metadata();
  const symSize = Math.max(symMeta.width, symMeta.height);
  const padding = Math.round(symSize * 0.055);
  const targetSize = symSize + (padding * 2);

  const faviconBaseBuffer = await sharp({
    create: { width: targetSize, height: targetSize, channels: 4, background: bgColor }
  })
    .composite([{ input: symbolBuffer, gravity: 'center' }])
    .png().toBuffer();

  async function resizeAndSave(buffer, size, outPath) {
    await sharp(buffer).resize(size, size, { kernel: "lanczos3" }).toFile(path.join(__dirname, "public", outPath));
    console.log("Generated:", outPath);
  }

  await resizeAndSave(faviconBaseBuffer, 16, "favicon-16x16.png");
  await resizeAndSave(faviconBaseBuffer, 32, "favicon-32x32.png");
  await resizeAndSave(faviconBaseBuffer, 48, "favicon-48x48.png");
  await resizeAndSave(faviconBaseBuffer, 180, "apple-touch-icon.png");

  // Create favicon.ico from 32x32 by just copying it
  fs.copyFileSync(path.join(__dirname, "public", "favicon-32x32.png"), path.join(__dirname, "public", "favicon.ico"));
  console.log("Copied: favicon.ico");

  // Maskable
  const maskablePadding = Math.round(symSize * 0.25);
  const maskableSize = symSize + (maskablePadding * 2);
  const maskableBaseBuffer = await sharp({
    create: { width: maskableSize, height: maskableSize, channels: 4, background: bgColor }
  })
    .composite([{ input: symbolBuffer, gravity: 'center' }])
    .png().toBuffer();

  await resizeAndSave(maskableBaseBuffer, 192, "icons/icon-maskable-192x192.png");
  await resizeAndSave(maskableBaseBuffer, 512, "icons/icon-maskable-512x512.png");

  // Transparent icons
  const normalBaseBuffer = await sharp({
    create: { width: targetSize, height: targetSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: symbolBuffer, gravity: 'center' }])
    .png().toBuffer();

  await resizeAndSave(normalBaseBuffer, 192, "icons/icon-192x192.png");
  await resizeAndSave(normalBaseBuffer, 512, "icons/icon-512x512.png");
}

main().catch(err => { console.error(err); process.exit(1); });
