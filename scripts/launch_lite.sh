#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

pnpm --filter @gradio/app dev:lite
python -m http.server -d js/lite