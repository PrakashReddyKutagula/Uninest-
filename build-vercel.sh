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
mv _site/privacy-policy/index.html _site/privacy-policy.html

cp -R terms _site/
mv _site/terms/index.html _site/terms.html

cp -R delete-account _site/
mv _site/delete-account/index.html _site/delete-account.html

# Copy standalone policy pages from public/
cp public/safety-standards.html _site/ 2>/dev/null || true
cp public/support.html _site/ 2>/dev/null || true

# Copy admin build output
mkdir -p _site/admin
cp -R uninest_aadmin/dist/* _site/admin/

echo "=== Build complete ==="
ls -la _site/
