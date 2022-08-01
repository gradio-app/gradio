#!/bin/bash

cd "$(dirname ${0})/.."

echo "Running the tests..."
python -m pytest --cov=gradio --durations=20 --durations-min=1 test
