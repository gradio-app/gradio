#!/bin/bash

cd "$(dirname ${0})/.."

python -m black --check gradio test client/python
python -m isort --profile=black --check-only gradio test client/python
python -m  flake8 --ignore=E731,E501,E722,W503,E126,E203,F403,F541 gradio test client/python --exclude gradio/__init__.py