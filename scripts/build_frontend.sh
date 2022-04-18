#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  export NODE_OPTIONS=--max_old_space_size=4096
  echo "Building the frontend"
  cd ui
  pnpm i --frozen-lockfile
  pnpm build
fi
