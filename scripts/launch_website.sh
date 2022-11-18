#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

npm_required

echo "Building the website..."
set -e
cd website/homepage
LATEST_COMMIT=$(git log -1 --format="%H")
npm install
npm run build --url=https://gradio-main-build.s3.amazonaws.com/$LATEST_COMMIT/
cd build
python -m http.server
