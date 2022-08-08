#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

echo "Formatting the frontend... Also we'll do type checking with TypeScript."
cd ui
pnpm i
pnpm format:write
pnpm ts:check
