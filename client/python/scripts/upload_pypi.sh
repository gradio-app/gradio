#!/bin/bash

cd "$(dirname ${0})/.."

python -m pip install build twine
python -m build
twine upload dist/*