#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

rm -rf gradio/_frontend_code
rm -rf gradio/templates/*

pnpm build:lite
