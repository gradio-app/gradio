#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.11."

# Passing --exclude-newer on the CLI overrides the entire exclude-newer config
# (including the per-package exemptions in pyproject.toml's [tool.uv]), so the
# starlette exemption must be repeated here to allow starlette>=1.0.1, which was
# released just inside the exclude-newer window.
uv pip compile \
  --python-version 3.11 \
  --exclude-newer "${UV_EXCLUDE_NEWER:-7 days}" \
  --exclude-newer-package "starlette=false" \
  test/requirements.in \
  -o test/requirements.txt
