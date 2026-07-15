#!/usr/bin/env node
// Converts gosurf_icon.png → build/icons/icon.icns (macOS) + icon.ico (Windows)
const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../gosurf_icon.png');
const outDir = path.resolve(__dirname, '../build/icons');
fs.mkdirSync(outDir, { recursive: true });

const input = fs.readFileSync(src);

const icns = png2icons.createICNS(input, png2icons.BILINEAR, 0);
if (!icns) { console.error('ICNS creation failed'); process.exit(1); }
fs.writeFileSync(path.join(outDir, 'icon.icns'), icns);
console.log('Created build/icons/icon.icns');

const ico = png2icons.createICO(input, png2icons.BILINEAR, 0, true);
if (!ico) { console.error('ICO creation failed'); process.exit(1); }
fs.writeFileSync(path.join(outDir, 'icon.ico'), ico);
console.log('Created build/icons/icon.ico');
