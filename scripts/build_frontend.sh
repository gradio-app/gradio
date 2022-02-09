#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Building the frontend"
  cd frontend
  pnpm i --frozen-lockfile
  pnpm build
fi



