#!/usr/bin/env bash
# Run the playwright e2e suite serially with the sampler attached.
#
# Usage:
#   run.sh <label>            # non-SSR
#   GRADIO_SSR_MODE=true run.sh <label>
#
# Output goes to scripts/profile_e2e/results/<label>/
#
# Important: tests are serialized via --workers=1. fullyParallel is already
# false in playwright.config.js so this is just belt-and-braces.

set -u

LABEL="${1:?label required (e.g. ssr or no-ssr)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT_DIR="$SCRIPT_DIR/results/$LABEL"

mkdir -p "$OUT_DIR"

echo "[run] label=$LABEL"
echo "[run] repo_root=$REPO_ROOT"
echo "[run] out_dir=$OUT_DIR"
echo "[run] GRADIO_SSR_MODE=${GRADIO_SSR_MODE:-<unset>}"

# Start sampler in background
"$SCRIPT_DIR/sampler.sh" "$OUT_DIR" 2 &
SAMPLER_PID=$!
echo "[run] sampler pid=$SAMPLER_PID"

cleanup() {
    if kill -0 "$SAMPLER_PID" 2>/dev/null; then
        kill -TERM "$SAMPLER_PID" 2>/dev/null || true
        wait "$SAMPLER_PID" 2>/dev/null || true
    fi
    echo "[run] sampler stopped"
}
trap cleanup EXIT INT TERM

# Record start timestamp so analyze.py knows where the suite begins
date +%s > "$OUT_DIR/start_ts.txt"

# Note: test:browser uses `pnpm exec playwright test js/spa/test/ --grep-invert 'reload.spec.ts' --config=...`.
# We replicate it but force --workers=1 and add JSON+list reporters.
cd "$REPO_ROOT/js/spa"

# PLAYWRIGHT_JSON_OUTPUT_NAME makes the json reporter write to a file instead
# of stdout, so we can use --reporter=list,json without interleaving.
export PLAYWRIGHT_JSON_OUTPUT_NAME="$OUT_DIR/playwright.json"

set +e
pnpm exec playwright test js/spa/test/ \
    --grep-invert 'reload.spec.ts' \
    --config=../../.config/playwright.config.js \
    --workers=1 \
    --reporter=list,json \
    > "$OUT_DIR/playwright.stdout.log" 2> "$OUT_DIR/playwright.stderr.log"
PW_EXIT=$?
set -e

date +%s > "$OUT_DIR/end_ts.txt"

# Final orphan sweep — playwright workers can be SIGKILLed (test timeout +
# graceful-shutdown timeout exceeded), bypassing tootils' process.on("exit")
# hook. Their spawned demo apps survive as PPID=1 orphans. Clean them up
# here so they don't pollute subsequent runs or hold ports.
ORPHANS=$(ps -A -o pid=,ppid=,command= | awk '$2 == 1 && /python.*\/demo\/[^\/]+\/[^\/]+\.py/ && /\/gradio\// {print $1}')
if [ -n "$ORPHANS" ]; then
    echo "[run] reaping $(echo "$ORPHANS" | wc -l | tr -d ' ') orphaned demo apps"
    echo "$ORPHANS" | xargs -I{} kill -TERM {} 2>/dev/null || true
fi

echo "[run] playwright exit=$PW_EXIT"
echo "[run] outputs in $OUT_DIR"
echo "[run] tail totals.csv:"
tail -5 "$OUT_DIR/totals.csv" 2>/dev/null || true

exit "$PW_EXIT"
