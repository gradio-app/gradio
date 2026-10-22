#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.11."

# Passing --exclude-newer on the CLI overrides the entire exclude-newer config
# (including the per-package exemptions in pyproject.toml's [tool.uv]), so the
# exemptions must be repeated here for the recent Starlette requirement and Pillow security release.
uv pip compile \
  --python-version 3.11 \
  --exclude-newer "${UV_EXCLUDE_NEWER:-7 days}" \
  --exclude-newer-package "starlette=false" \
  --exclude-newer-package "pillow=false" \
  test/requirements.in \
  -o test/requirements.txt
