#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Installing gradio"
  pip install -e .
fi

