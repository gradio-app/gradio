#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Installing Gradio..."
pip install -e .

echo "Installing Gradio Client..."
pip install -e client/python