#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Running the tests"
  python -m pytest --cov=gradio --durations=20 --durations-min=1 test
fi
