#!/bin/bash
set -e

cd "$(dirname ${0})/.."

python3 -m pip install build
rm -rf dist/*
rm -rf build/*
python3 -m build
