#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.9."

cd test
pip install --upgrade pip-tools
pip-compile requirements.in --output-file requirements.txt
