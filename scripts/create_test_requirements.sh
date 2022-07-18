#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Creating requirements under test/requirements.txt using requirements.in. Please run this script from unix or wsl in a python3.9 env!"
    python -c "import sys; assert sys.version_info >= (3, 9) and sys.version_info < (3, 10), 'Run from python 3.9!'" || exit 1
  cd test
  pip install --upgrade pip-tools
  pip-compile --output-file requirements-python3.9.2.txt
fi
