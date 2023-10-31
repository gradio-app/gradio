#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the backend... Our style follows the Black code style."
python -c "import gradio"
ruff --fix gradio test
black gradio test
bash scripts/type_check_backend.sh

bash client/python/scripts/format.sh  # Call the client library's formatting script
