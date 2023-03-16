#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
It's recommended to run this script in a Python 3.7 (or higher) environment."
cd test
pip install --upgrade pip-tools
rm requirements.txt
pip-compile --output-file requirements.txt
