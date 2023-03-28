#!/bin/bash

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pnpm_required

cmd="build"
if [[ "$1" == "dev" ]]; then
    echo "Building the frontend (development mode)..."
    cmd="build:dev"
else
    echo "Building the frontend..."
fi

pnpm i --frozen-lockfile
pnpm $cmd
