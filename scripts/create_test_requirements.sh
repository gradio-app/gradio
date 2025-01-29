#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.10."

uv pip compile test/requirements.in -o test/requirements.txt
