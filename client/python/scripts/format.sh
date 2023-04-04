#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the client library.. Our style follows the Black code style."
ruff --fix .
black .

echo "Type checking the client library with pyright"
pyright gradio_client/*.py
