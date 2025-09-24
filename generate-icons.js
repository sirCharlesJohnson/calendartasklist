#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple SVG icon generator
function generateIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#3B82F6"/>
  <rect x="${size * 0.15}" y="${size * 0.25}" width="${size * 0.7}" height="${size * 0.5}" rx="${size * 0.05}" fill="white"/>
  <rect x="${size * 0.2}" y="${size * 0.35}" width="${size * 0.6}" height="${size * 0.03}" rx="${size * 0.015}" fill="#3B82F6"/>
  <rect x="${size * 0.2}" y="${size * 0.42}" width="${size * 0.4}" height="${size * 0.03}" rx="${size * 0.015}" fill="#3B82F6"/>
  <rect x="${size * 0.2}" y="${size * 0.49}" width="${size * 0.5}" height="${size * 0.03}" rx="${size * 0.015}" fill="#3B82F6"/>
  <circle cx="${size * 0.3}" cy="${size * 0.6}" r="${size * 0.03}" fill="#3B82F6"/>
  <circle cx="${size * 0.5}" cy="${size * 0.6}" r="${size * 0.03}" fill="#3B82F6"/>
  <circle cx="${size * 0.7}" cy="${size * 0.6}" r="${size * 0.03}" fill="#3B82F6"/>
</svg>`;
}

// Generate icons
const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = generateIcon(size);
  const filename = `icon-${size}x${size}.png`;
  
  // For now, we'll create SVG files and let the user convert them
  const svgFilename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, svgFilename), svg);
  
  console.log(`✅ Generated ${svgFilename}`);
});

console.log('\n📱 Icon generation complete!');
console.log('\nTo convert SVG to PNG:');
console.log('1. Open the SVG files in a browser');
console.log('2. Right-click and "Save as PNG"');
console.log('3. Or use an online converter like convertio.co');
console.log('\nAlternatively, you can use any 192x192 and 512x512 PNG icons.');

