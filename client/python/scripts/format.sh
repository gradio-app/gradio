#!/bin/bash -eu

cd "$(dirname ${0})/.."

echo "Formatting the client library.. Our style follows the ruff code style."
python -m ruff --fix .
python -m ruff format .

echo "Type checking the client library with pyright"
python -m pyright gradio_client/*.py
