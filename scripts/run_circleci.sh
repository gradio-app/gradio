#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

circleci_required

echo "Running CircleCI locally..."
circleci local execute
