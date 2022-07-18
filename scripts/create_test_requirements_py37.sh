#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Creating requirements under test/requirements-python3.7.12.txt using requirements.in. Please run this script from unix or wsl in a python 3.7 env!"
  cd test
  pip install --upgrade pip-tools
  pip-compile --output-file requirements-python3.7.12.txt
fi
