#!/bin/bash

cd "$(dirname ${0})/.."
# source scripts/create_test_requirements.sh
# source scripts/install_test_requirements.sh

echo "Running the tests..."
python -m pytest --cov=gradio --durations=20 --durations-min=1 test
