#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

python scripts/generate_theme.py

echo "Building the frontend..."
pnpm i --frozen-lockfile --ignore-scripts
pnpm build
