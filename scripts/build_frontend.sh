#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo export NODE_OPTIONS="--max-old-space-size=8192"
  echo "Building the frontend"
  cd ui
  pnpm i --frozen-lockfile
  pnpm build
fi
