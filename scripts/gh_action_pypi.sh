#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required
aws_required

# You should first run `upload_to_pypi.sh` to update the version number and
# pull the latest version of the code.
new_version="$(cat gradio/version.txt)"

rm -rf gradio/templates/frontend
rm -rf gradio/templates/cdn
cd ui
pnpm i
pnpm build
pnpm build:cdn
cd ..
aws s3 cp gradio/templates/cdn "s3://gradio/${new_version}/" --recursive
cp gradio/templates/cdn/index.html gradio/templates/frontend/share.html

rm -r dist/*
rm -r build/*
python3 setup.py sdist bdist_wheel
