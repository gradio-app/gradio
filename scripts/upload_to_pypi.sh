#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

git_required
pnpm_required
aws_required

echo "Uploading to PyPI..."
set -e
git pull origin main
old_version="$(cat gradio/version.txt)"
read -p "Current version is ${old_version}. What is the new version? " new_version
echo "So you want to release version ${new_version}. Updating gradio/version.txt..."
echo "${new_version}" > gradio/version.txt

rm -rf gradio/templates/frontend
rm -rf gradio/templates/cdn
cd ui
pnpm i
pnpm build
pnpm build:cdn
cd ..
aws s3 cp gradio/templates/cdn "s3://gradio/${new_version}/" --recursive  # Contact maintainers for credentials
cp gradio/templates/cdn/index.html gradio/templates/frontend/share.html

rm -r dist/*
rm -r build/*
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/*
git add -A
git commit -m "Updated version to ${new_version}"
