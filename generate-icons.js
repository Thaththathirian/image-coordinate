// Simple icon generator for PWA
// This creates basic colored square icons as placeholders
// Replace with proper icons later

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon
function createSVGIcon(size, text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d6efd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0b5ed7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="64"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${size * 0.4}" font-family="Arial, sans-serif" font-weight="bold">${text}</text>
</svg>`;
}

// Generate icons
const publicDir = path.join(__dirname, 'public');

// Create 192x192 icon
const icon192 = createSVGIcon(192, 'IC');
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192);

// Create 512x512 icon
const icon512 = createSVGIcon(512, 'IC');
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512);

console.log('✅ Icons generated successfully!');
console.log('Generated files:');
console.log('  - public/icon-192.svg');
console.log('  - public/icon-512.svg');
console.log('');
console.log('⚠️  Note: These are SVG files. For best compatibility, convert them to PNG using:');
console.log('  - An online tool like cloudconvert.com');
console.log('  - Or use these SVGs directly in the manifest');
