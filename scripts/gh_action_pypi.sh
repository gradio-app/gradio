#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required
aws_required

# You should update the version in version.txt before running this script
new_version="$(cat gradio/version.txt)"
GRADIO_VERSION=$new_version

rm -rf gradio/templates/frontend
rm -rf gradio/templates/cdn
cd ui
pnpm i
GRADIO_VERSION=$new_version pnpm build
GRADIO_VERSION=$new_version pnpm build:cdn
cd ..
aws s3 cp gradio/templates/cdn "s3://gradio/${new_version}/" --recursive
cp gradio/templates/cdn/index.html gradio/templates/frontend/share.html

rm -r dist/*
rm -r build/*
python3 setup.py sdist bdist_wheel
