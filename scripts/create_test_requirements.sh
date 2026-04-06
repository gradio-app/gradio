#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.10."

uv pip compile \
  --exclude-newer "${UV_EXCLUDE_NEWER:-2026-04-06T23:59:59-07:00}" \
  test/requirements.in \
  -o test/requirements.txt
