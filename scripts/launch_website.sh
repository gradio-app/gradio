#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

npm_required

echo "Building the website..."
set -e
cd website/homepage
npm install
npm run build
cd build
python -m http.server
