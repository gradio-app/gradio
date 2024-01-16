#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

echo "Building the website..."
cd js/_website
pnpm dev
