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

# Copy static subpages without copying directories (to prevent Vercel trailing slash redirects)
cp privacy-policy/index.html _site/privacy-policy.html
cp privacy-policy/privacy-policy.css _site/privacy-policy.css

cp terms/index.html _site/terms.html
cp terms/terms.css _site/terms.css

cp delete-account/index.html _site/delete-account.html
cp delete-account/delete-account.css _site/delete-account.css

# Copy standalone policy pages from public/
cp public/safety-standards.html _site/ 2>/dev/null || true
cp public/support.html _site/ 2>/dev/null || true

# Copy admin build output
mkdir -p _site/admin
cp -R uninest_aadmin/dist/* _site/admin/

echo "=== Build complete ==="
ls -la _site/
