#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

python scripts/generate_theme.py

echo "Building the frontend..."
pnpm i --frozen-lockfile --ignore-scripts
NODE_OPTIONS="--max-old-space-size=8192" pnpm build
