#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the client library.. Our style follows the Black code style."
ruff --fix test gradio_client
black test gradio_client
