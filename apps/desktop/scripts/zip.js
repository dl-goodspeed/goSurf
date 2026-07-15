#!/usr/bin/env node
// Cross-platform zip with proper symlink and Unix permission support.
// Replaces PowerShell Compress-Archive which silently drops symlinks inside
// macOS .app bundles and strips Unix execute bits (Windows NTFS has no +x).
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const [,, sourcePath, destPath] = process.argv;

if (!sourcePath || !destPath) {
  console.error('Usage: node scripts/zip.js <source-dir> <dest.zip>');
  process.exit(1);
}

const absSource = path.resolve(sourcePath);
const absDest = path.resolve(destPath);

if (!fs.existsSync(absSource)) {
  console.error(`Source not found: ${absSource}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(absDest), { recursive: true });

const output = fs.createWriteStream(absDest);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('warning', err => {
  if (err.code === 'ENOENT') console.warn('Warning:', err.message);
  else throw err;
});
archive.on('error', err => { throw err; });
output.on('close', () =>
  console.log(`Created ${path.basename(absDest)} (${(archive.pointer() / 1024 / 1024).toFixed(1)} MB)`)
);

archive.pipe(output);

// Windows NTFS doesn't store Unix execute bits; restore them for macOS binaries.
function macMode(entryName) {
  const fwd = entryName.replace(/\\/g, '/');
  if (
    fwd.includes('/Contents/MacOS/') ||          // main + helper executables
    fwd.endsWith('.dylib') ||                     // dynamic libraries
    (fwd.includes('.framework/Versions/') && path.extname(fwd) === '')  // framework binaries
  ) return 0o755;
  return 0o644;
}

function addDir(dirPath, entryPrefix) {
  for (const entry of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const entryName = entryPrefix ? `${entryPrefix}/${entry}` : entry;
    const stat = fs.lstatSync(fullPath);

    if (stat.isSymbolicLink()) {
      // Windows stores symlink targets with backslashes; normalize for macOS/Linux.
      const target = fs.readlinkSync(fullPath).replace(/\\/g, '/');
      archive.symlink(entryName, target, stat.mode);
    } else if (stat.isDirectory()) {
      addDir(fullPath, entryName);
    } else {
      archive.file(fullPath, { name: entryName, stats: stat, mode: macMode(entryName) });
    }
  }
}

addDir(absSource, path.basename(absSource));
archive.finalize();
