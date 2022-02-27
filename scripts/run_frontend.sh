#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Running the frontend"
  cd ui
  pnpm i
  pnpm dev
fi
