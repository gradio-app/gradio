#!/bin/bash
set -e

cd "$(dirname ${0})"

# You should update the version in package.json before running this script
FILE="gradio/package.json"
new_version=$(python -c "import json; f = open('$FILE', 'r'); data = json.load(f); print(data['version']); f.close();")
GRADIO_VERSION=$new_version

rm -rf gradio/templates/frontend
pnpm i --frozen-lockfile --ignore-scripts
GRADIO_VERSION=$new_version pnpm build
aws s3 cp gradio/templates/frontend "s3://gradio/${new_version}/" --recursive --region us-west-2

rm -rf dist/*
rm -rf build/*
python3 -m build -w
