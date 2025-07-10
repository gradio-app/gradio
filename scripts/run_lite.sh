#!/bin/bash -eu

ROOTDIR=$(realpath $(dirname ${0})/..)

cd "${ROOTDIR}"
source scripts/helpers.sh

pnpm_required
jq_required

GRADIO_VERSION=$(jq -r .version ${ROOTDIR}/gradio/package.json)
GRADIO_CLIENT_VERSION=$(jq -r .version ${ROOTDIR}/client/python/gradio_client/package.json)
GRADIO_WHEEL_PATH="${ROOTDIR}/dist-lite/gradio-${GRADIO_VERSION}-py3-none-any.whl"
GRADIO_CLIENT_FILE_PATH="${ROOTDIR}/client/python/dist/gradio_client-${GRADIO_CLIENT_VERSION}-py3-none-any.whl"

echo "Checking for gradio and gradio_client wheel files..."
echo "GRADIO_WHEEL_PATH: ${GRADIO_WHEEL_PATH}"
echo "GRADIO_CLIENT_FILE_PATH: ${GRADIO_CLIENT_FILE_PATH}"

if [ -f "${GRADIO_WHEEL_PATH}" ] && [ -f "${GRADIO_CLIENT_FILE_PATH}" ]; then
  echo "Found gradio and gradio_client wheel files..."
else
  echo "Building gradio and gradio_client wheel files..."
  pnpm --filter @gradio/lite pybuild
fi

pnpm --filter @gradio/client build

pnpm dev:lite
