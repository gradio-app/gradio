#!/bin/bash

cd "$(dirname ${0})/.."

echo "Formatting the client library.. Our style follows the Black code style."
python -m black test gradio_client
python -m isort --profile=black test gradio_client
python -m flake8 --ignore=E731,E501,E722,W503,E126,E203,F403 test gradio_client --exclude gradio_client/__init__.py
