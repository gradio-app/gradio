#!/bin/bash
set -e

cd "$(dirname ${0})/.."

python -m pip install build twine
rm -rf dist/*
python -m build