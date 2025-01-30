#!/bin/bash -eu

cd "$(dirname ${0})/.."
python -c "import gradio"
python -m ruff check gradio test client
python -m ruff format --check gradio test client
