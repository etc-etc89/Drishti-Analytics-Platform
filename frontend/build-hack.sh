#!/bin/bash
npm run build

# Find the generated JS and CSS files
JS_FILE=$(basename $(ls .output/public/assets/index-*.js | head -n 1))
CSS_FILE=$(basename $(ls .output/public/assets/styles-*.css | head -n 1))

# Stitch together the required index.html file for Zoho Catalyst
echo "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Drishti Analytics Platform</title><link rel='stylesheet' href='/assets/$CSS_FILE'></head><body><div id='root'></div><script type='module' src='/assets/$JS_FILE'></script></body></html>" > .output/public/index.html
