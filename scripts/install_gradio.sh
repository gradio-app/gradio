#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Installing Gradio..."
pip install -e .

echo "Installing Gradio Client..."
pip install -e client/python

echo "Installing Gradio Components..."
pip install -e components/python
