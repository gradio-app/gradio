#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Building the website"
  cd website/homepage
  npm install
  npm run build
  cd dist
  rm -rf ./gradio_static/
  mkdir ./gradio_static/
  cp -r ../../../gradio/templates/frontend/. ./gradio_static/
  python -m http.server
fi
