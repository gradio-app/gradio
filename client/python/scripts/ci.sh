#!/bin/bash
set -e

cd "$(dirname ${0})/.."

echo "Linting..."
ruff test gradio_client
black --check test gradio_client
pyright gradio_client/*.py

echo "Testing..."
python -m pip install -e ../../.  # Install gradio from local source (as the latest version may not yet be published to PyPI)
python -m pytest test
