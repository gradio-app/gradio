#!/bin/bash

cd "$(dirname ${0})/.."
python -c "import gradio"
python -m ruff gradio test client
python -m black --check gradio test client
