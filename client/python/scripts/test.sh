#!/bin/bash
set -e

cd "$(dirname ${0})/.."

echo "Testing..."
python -m pytest test
