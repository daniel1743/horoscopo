/**
 * Script CORREGIDO para reconstruir los brand assets de Creovision
 * Versión 2: Maneja el SVG con más cuidado para evitar corrupción
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_SVG = path.join(__dirname, '../public/LOGO_CREOVISION.svg');
const BRAND_DIR = path.join(__dirname, '../public/brand');
const PUBLIC_DIR = path.join(__dirname, '../public');

if (!fs.existsSync(BRAND_DIR)) fs.mkdirSync(BRAND_DIR, { recursive: true });

console.log('🎨 Reconstruyendo brand assets - Versión 2 (Corregida)\n');

// 1. Leer SVG fuente
console.log('📖 Leyendo LOGO_CREOVISION.svg...');
let svgContent = fs.readFileSync(SOURCE_SVG, 'utf8');
console.log(`   Tamaño original: ${svgContent.length} bytes`);

// 2. Eliminar SOLO la capa BACKGROUND de forma segura
console.log('🗑️  Eliminando capa BACKGROUND (fondo azul)...');

// Buscar y eliminar solo el grupo completo de BACKGROUND
const backgroundStart = svgContent.indexOf('<g id="BACKGROUND">');
const backgroundEnd = svgContent.indexOf('</g>', backgroundStart);

if (backgroundStart !== -1 && backgroundEnd !== -1) {
  const before = svgContent.substring(0, backgroundStart);
  const after = svgContent.substring(backgroundEnd + 4); // +4 para incluir </g>
  svgContent = before + after;
  console.log('   ✅ Capa BACKGROUND eliminada');
} else {
  console.log('   ⚠️  Capa BACKGROUND no encontrada o ya eliminada');
}

// 3. Ajustar viewBox
console.log('✂️  Ajustando viewBox...');
svgContent = svgContent.replace(
  /viewBox="0 0 500 500"/,
  'viewBox="70 70 360 360"'
);

// 4. Limpiar metadatos
console.log('🧹 Limpiando metadatos...');
svgContent = svgContent.replace(/<!-- Generator:.*?-->\n?/g, '');
svgContent = svgContent.replace(/style="enable-background:new[^"]*"/g, '');

// 5. Generar logo master y header
console.log('💾 Generando logo master y header...');
const masterPath = path.join(BRAND_DIR, 'creovision-logo-master.svg');
const logoPath = path.join(BRAND_DIR, 'creovision-logo.svg');
fs.writeFileSync(masterPath, svgContent);
fs.writeFileSync(logoPath, svgContent);

// 6. Extraer símbolo (eliminar WORDMARK)
console.log('✂️  Extrayendo símbolo (sin wordmark)...');
let symbolSvg = svgContent;

// Buscar y eliminar el grupo WORDMARK
const wordmarkStart = symbolSvg.indexOf('<g id="WORDMARK">');
const wordmarkEnd = symbolSvg.indexOf('</g>', wordmarkStart);

if (wordmarkStart !== -1 && wordmarkEnd !== -1) {
  const beforeWM = symbolSvg.substring(0, wordmarkStart);
  const afterWM = symbolSvg.substring(wordmarkEnd + 4);
  symbolSvg = beforeWM + afterWM;
  console.log('   ✅ Wordmark eliminado');
} else {
  console.log('   ⚠️  Wordmark no encontrado (puede estar en otra estructura)');
}

// Ajustar viewBox para símbolo (centrado en el círculo principal)
symbolSvg = symbolSvg.replace(
  /viewBox="70 70 360 360"/,
  'viewBox="135 135 230 230"'
);

const symbolPath = path.join(BRAND_DIR, 'creovision-symbol.svg');
fs.writeFileSync(symbolPath, symbolSvg);

// 7. Favicon (viewBox más ajustado para mejor ocupación)
console.log('🎯 Generando favicon.svg...');
let faviconSvg = symbolSvg.replace(
  /viewBox="135 135 230 230"/,
  'viewBox="145 145 210 210"'
);

const faviconPath = path.join(PUBLIC_DIR, 'favicon.svg');
fs.writeFileSync(faviconPath, faviconSvg);

console.log('\n✅ Assets generados con éxito:\n');

// Verificar tamaños
const files = [
  { path: masterPath, name: 'Logo master' },
  { path: logoPath, name: 'Logo header' },
  { path: symbolPath, name: 'Símbolo' },
  { path: faviconPath, name: 'Favicon SVG' },
];

files.forEach(file => {
  const size = fs.statSync(file.path).size;
  console.log(`  📁 ${file.name}: ${(size / 1024).toFixed(1)} KB`);
});

// Validar que los archivos no estén corruptos
console.log('\n🔍 Validando archivos generados...');
files.forEach(file => {
  const content = fs.readFileSync(file.path, 'utf8');
  const hasOpenSvg = content.includes('<svg');
  const hasCloseSvg = content.includes('</svg>');
  const isValid = hasOpenSvg && hasCloseSvg;

  if (isValid) {
    console.log(`  ✅ ${file.name} - Válido`);
  } else {
    console.log(`  ❌ ${file.name} - CORRUPTO`);
  }
});

console.log('\n✨ Regeneración completada\n');
