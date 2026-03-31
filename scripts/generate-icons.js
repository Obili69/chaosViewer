#!/usr/bin/env node
/**
 * Generates simple PWA icons using canvas-like SVG converted to PNG.
 * Requires: sharp (already in dependencies)
 * Usage: node scripts/generate-icons.js
 */
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0f14"/>
  <rect x="${size*0.1}" y="${size*0.1}" width="${size*0.8}" height="${size*0.8}" rx="${size*0.15}" fill="#111827"/>
  <path d="M${size*0.3} ${size*0.5} L${size*0.45} ${size*0.35} L${size*0.7} ${size*0.65}"
    stroke="#06b6d4" stroke-width="${size*0.07}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="${size*0.7}" cy="${size*0.35}" r="${size*0.07}" fill="#10b981"/>
</svg>`

async function main() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg(size)))
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`))
    await sharp(Buffer.from(svg(size)))
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
}

main().catch(console.error)
