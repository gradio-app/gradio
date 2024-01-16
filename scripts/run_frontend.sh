#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

echo "Running the frontend..."
pnpm i
pnpm dev
