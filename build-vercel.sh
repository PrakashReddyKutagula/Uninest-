#!/bin/bash
set -e

echo "=== Building UniNest Admin App ==="
cd uninest_aadmin
npm install
npm run build
cd ..

echo "=== Assembling full site into _site/ ==="
rm -rf _site
mkdir -p _site

# Copy main static website files
cp index.html _site/
cp styles.css _site/
cp script.js _site/
cp logo.jpg _site/
cp penguin.png _site/
cp penguin_guide.png _site/

# Copy logo.png from public (the symlink target)
cp public/logo.png _site/ 2>/dev/null || true

# Copy static subpages
cp -R privacy-policy _site/
cp -R terms _site/
cp -R delete-account _site/

# Copy standalone policy pages from public/
cp public/safety-standards.html _site/ 2>/dev/null || true
cp public/support.html _site/ 2>/dev/null || true

# Copy admin build output
mkdir -p _site/admin
cp -R uninest_aadmin/dist/* _site/admin/

echo "=== Build complete ==="
ls -la _site/
