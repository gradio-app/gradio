#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Installing requirements before running tests..."
pip install --upgrade pip
pip install -r test/requirements.txt
pip install -e client/python
