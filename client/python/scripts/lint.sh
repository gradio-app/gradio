#!/bin/bash

cd "$(dirname ${0})/.."

echo "Linting..."
python -m ruff test gradio_client
python -m black --check test gradio_client

echo "Type checking the client library with pyright"
python -m pyright gradio_client/*.py
