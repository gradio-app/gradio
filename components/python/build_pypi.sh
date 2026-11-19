#!/bin/bash
set -e

cd "$(dirname ${0})"

# gradio_components ships the built frontend, which hatch_build.py copies from
# gradio/templates. Build it here, so that the wheel is complete whichever of the
# packages is published first.
FILE="gradio_components/package.json"
new_version=$(python -c "import json; f = open('$FILE', 'r'); data = json.load(f); print(data['version']); f.close();")
(
  cd ../..
  rm -rf gradio/templates/frontend
  pnpm i --frozen-lockfile --ignore-scripts
  GRADIO_VERSION=$new_version pnpm build
  python3 scripts/download_offline_assets.py
)

python3 -m pip install build
rm -rf dist/*
rm -rf build/*
python3 -m build

# never publish a wheel without the frontend
python3 - <<'PY'
import glob, sys, zipfile

(wheel,) = glob.glob("dist/*.whl")
names = set(zipfile.ZipFile(wheel).namelist())
for needed in (
    "gradio_components/_frontend/frontend/index.html",
    "gradio_components/_frontend/node/build/index.js",
    "gradio_components/media_assets/images/bus.png",
):
    if needed not in names:
        sys.exit(f"{wheel} does not contain {needed}")
PY
