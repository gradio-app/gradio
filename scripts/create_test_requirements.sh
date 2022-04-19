#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  if [[ $OSTYPE = "msys" ]]; then
    echo "Please run this script not from Windows but from Unix or Wsl!"
    exit -1
  fi
  echo "Creating requirements under test/requirements.txt using requirements.in."
  cd test
  pip install --upgrade pip-tools
  pip-compile > requirements.txt
fi
