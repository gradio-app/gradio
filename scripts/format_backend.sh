#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Formatting backend and tests with black and isort, also checking for standards with flake8"
  python3 -m black gradio test
  python3 -m isort --profile=black gradio test
  python3 -m  flake8 --ignore=E731,E501,E722,W503,E126,F401,E203 gradio test
fi
