#!/bin/bash
if [ -z "$(ls | grep CONTRIBUTING.md)" ]; then
  echo "Please run the script from repo directory"
  exit -1
else
  echo "Uploading to pypi"
  set -e
  git pull origin main
  old_version=$(ggrep -Po "(?<=version=\")[^\"]+(?=\")" setup.py)
  echo "Current version is $old_version. New version?"
  read new_version
  gsed -i "s/version=\"$old_version\"/version=\"$new_version\"/g" setup.py

  echo -n $new_version > gradio/version.txt
  rm -rf gradio/templates/frontend
  rm -rf gradio/templates/cdn
  cd ui
  pnpm i
  pnpm build
  GRADIO_VERSION=$new_version pnpm build:cdn
  cd ..
  aws s3 cp gradio/templates/cdn s3://gradio/$new_version/ --recursive  # requires aws cli (contact maintainers for credentials)
  cp gradio/templates/cdn/index.html gradio/templates/frontend/share.html

  rm -r dist/*
  rm -r build/*
  python3 setup.py sdist bdist_wheel
  python3 -m twine upload dist/*
  # git add -A
  # git commit -m "updated PyPi version to $new_version"
fi

