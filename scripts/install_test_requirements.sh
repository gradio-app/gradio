#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Installing requirements for tests"
  pip install --upgrade pip
  pip install -r gradio.egg-info/requires.txt
  pip install -r test/requirements.txt
fi

