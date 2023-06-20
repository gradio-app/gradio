#!/bin/bash

cd "$(dirname ${0})/.."
python -m ruff gradio test client
python -m black --check gradio test client
