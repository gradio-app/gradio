#!/usr/bin/env bash
#
# Upload a build of the website (js/_website/build) to S3.
#
#   upload_website_s3.sh <build dir> <bucket> <prefix> <cache mode>
#
# <prefix> is "" for gradio.app, or "pr-<number>" for a pull request preview.
# <cache mode> is "production" or "preview":
#
#   production  _app/immutable/* (content-hashed) is cached one year everywhere
#               and never deleted here, so a page that is still open keeps
#               finding its old chunks. Everything else is revalidated by the
#               browser on each visit and kept by CloudFront until the
#               invalidation that follows this script.
#   preview     every file revalidates. The previews distribution caches 60 s.
#
# Order matters: the hashed chunks go first, so that no page in the bucket ever
# refers to a chunk that is not there yet.
#
# The prerendered endpoints under api/ and search-api have no file extension,
# so their Content-Type is set by name instead of being guessed.

set -euo pipefail

build=${1:?build dir}
bucket=${2:?bucket}
prefix=${3-}
mode=${4:?production or preview}

dest="s3://${bucket}${prefix:+/${prefix}}"

case "$mode" in
production)
	immutable_cache="public, max-age=31536000, immutable"
	page_cache="public, max-age=0, must-revalidate, s-maxage=31536000"
	;;
preview)
	immutable_cache="public, max-age=0, must-revalidate"
	page_cache="public, max-age=0, must-revalidate"
	;;
*)
	echo "unknown cache mode: $mode" >&2
	exit 1
	;;
esac

if [ -d "$build/_app/immutable" ]; then
	echo "1/4 hashed chunks"
	aws s3 sync "$build/_app/immutable" "$dest/_app/immutable" \
		--only-show-errors --cache-control "$immutable_cache"
fi

# CloudFront compresses only responses up to 10 MB, so bigger pages (the theme
# gallery is about 22 MB) are uploaded gzipped in step 4 instead of step 2.
big_pages=()
while IFS= read -r file; do
	big_pages+=("${file#"$build"/}")
done < <(find "$build" -type f -name '*.html' -size +10M)

echo "2/4 pages and assets"
# A preview deletes what its previous push no longer has, chunks included.
# Production keeps its old chunks: an open page may still ask for them.
excludes=(--exclude "api/*" --exclude "search-api")
if [ "$mode" = production ]; then
	excludes+=(--exclude "_app/immutable/*")
fi
for key in ${big_pages[@]+"${big_pages[@]}"}; do
	excludes+=(--exclude "$key")
done
aws s3 sync "$build" "$dest" --delete --only-show-errors "${excludes[@]}" \
	--cache-control "$page_cache"

echo "3/4 extensionless endpoints"
if [ -d "$build/api/markdown" ]; then
	aws s3 sync "$build/api/markdown" "$dest/api/markdown" --delete --only-show-errors \
		--content-type "text/markdown; charset=utf-8" --cache-control "$page_cache"
fi
if [ -f "$build/search-api" ]; then
	aws s3 cp "$build/search-api" "$dest/search-api" --only-show-errors \
		--content-type "application/json" --cache-control "$page_cache"
fi

echo "4/4 pages above 10 MB, gzipped"
# Every client that runs the site accepts gzip.
for key in ${big_pages[@]+"${big_pages[@]}"}; do
	gzip -9 -c "$build/$key" | aws s3 cp - "$dest/$key" --only-show-errors \
		--content-type "text/html" --content-encoding gzip --cache-control "$page_cache"
done
