#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

echo "Running the frontend..."
cd ui
pnpm i
pnpm dev
