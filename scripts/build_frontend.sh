#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

download_offline_assets=true

while [[ $# -gt 0 ]]; do
	case "$1" in
	--no-download-offline-assets)
		download_offline_assets=false
		;;
	*)
		echo "Unknown argument: $1"
		exit 1
		;;
	esac
	shift
done

pnpm_required

python scripts/generate_theme.py

echo "Building the frontend..."
pnpm i --frozen-lockfile --ignore-scripts
pnpm build

if [[ "$download_offline_assets" == true ]]; then
	python scripts/download_offline_assets.py
fi
