#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
It's recommended to run this script from a Unix-like system in Python 3.7 (or higher) environment."
cd test
pip install --upgrade pip-tools
pip-compile --output-file requirements.txt
