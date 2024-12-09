#!/bin/bash -eu

cd "$(dirname ${0})/.."

echo "Running the backend unit tests..."
python -m pytest test -m "not flaky"
