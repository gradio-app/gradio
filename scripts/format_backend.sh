#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the backend... Our style follows the Black code style."
ruff --fix gradio test
black gradio test

bash client/python/scripts/format.sh  # Call the client library's formatting script
