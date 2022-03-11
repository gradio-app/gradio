#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Formatting frontend with prettier, also type checking with TypeScript"
  cd ui
  pnpm i
  pnpm format:write
  pnpm ts:check
fi
