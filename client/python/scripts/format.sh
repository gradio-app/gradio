#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the client library.. Our style follows the Black code style."
python -m ruff --fix .
python -m black .

echo "Type checking the client library with pyright"
python -m pyright gradio_client/*.py
