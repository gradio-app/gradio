#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the backend... Our style follows the ruff code style."
python -c "import gradio"
python -m ruff --fix gradio test
python -m ruff format gradio test
bash scripts/type_check_backend.sh

bash client/python/scripts/format.sh  # Call the client library's formatting script
