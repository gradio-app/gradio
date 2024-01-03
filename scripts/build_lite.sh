#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

pnpm --filter @gradio/app build:lite
