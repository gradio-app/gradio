#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  set -e
  aws configure list
  old_version=$(grep -Po "(?<=version=\")[^\"]+(?=\")" setup.py)
  read -r new_version < gradio/version.txt
  sed -i "s/version=\"$old_version\"/version=\"$new_version\"/g" setup.py

  rm -rf gradio/templates/frontend
  rm -rf gradio/templates/cdn
  cd ui
  pnpm i
  pnpm build
  GRADIO_VERSION=$new_version pnpm build:cdn
  cd ..
  echo "Before AWS"
  aws s3 cp gradio/templates/cdn s3://gradio/$new_version/ --recursive 
  echo "After AWS"
  cp gradio/templates/cdn/index.html gradio/templates/frontend/share.html

  rm -r dist/*
  rm -r build/*
  python3 setup.py sdist bdist_wheel
fi

