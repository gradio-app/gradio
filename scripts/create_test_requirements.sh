#!/bin/bash -eu

cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Creating test requirements...
To match the CI environment, this script should be run from a Unix-like system in Python 3.10."

EXCLUDE_NEWER="${UV_EXCLUDE_NEWER:-$(
  python - <<'PY'
from datetime import UTC, datetime, timedelta

print((datetime.now(UTC) - timedelta(days=7)).date().isoformat())
PY
)}"

uv pip compile \
  --exclude-newer "$EXCLUDE_NEWER" \
  test/requirements.in \
  -o test/requirements.txt
