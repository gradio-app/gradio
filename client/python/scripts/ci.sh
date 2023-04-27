#!/bin/bash
set -e

cd "$(dirname ${0})/.."

echo "Linting..."
ruff test gradio_client
black --check test gradio_client
pyright gradio_client/*.py

echo "Testing..."
python -m pytest test
