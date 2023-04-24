#!/bin/bash

cd "$(dirname ${0})/.."

echo "Linting..."
ruff test gradio_client
black --check test gradio_client

echo "Type checking the client library with pyright"
pyright gradio_client/*.py
