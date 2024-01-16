#!/bin/bash -eu

cd "$(dirname ${0})/.."

echo "Testing..."
python -m pytest test
