#!/bin/bash

cd "$(dirname ${0})/.."

echo "Linting..."
python -m black --check test gradio_client
python -m isort --profile=black --check-only test gradio_client
python -m  flake8 --ignore=E731,E501,E722,W503,E126,E203,F403,F541 test gradio_client --exclude gradio_client/__init__.py

echo "Testing..."
python -m pytest test