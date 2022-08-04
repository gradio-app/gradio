#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

echo "Building the frontend..."
cd ui
pnpm i --frozen-lockfile
pnpm build
