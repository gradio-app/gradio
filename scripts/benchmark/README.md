# Gradio Backend Profiling & Benchmarking

Tools for measuring Gradio server performance: per-phase request timing, load testing, and chart generation.

## Setup

```bash
bash scripts/install_gradio.sh
pip install tqdm httpx numpy matplotlib huggingface-hub
```

## Quick Start

Run a benchmark against one of the included test apps:

```bash
python scripts/benchmark/runner.py \
    --app scripts/benchmark/apps/echo_text.py \
    --tiers 1,10,100 \
    --requests-per-user 10 \
    --output-dir benchmark_results/my_run
```

This will:
1. Launch the app with `GRADIO_PROFILING=1`
2. Run warmup requests
3. For each tier, fire N concurrent users in burst mode for 10 rounds
4. Collect client latencies and server-side per-phase traces
5. Save results to `benchmark_results/my_run/<timestamp>/`

## Test Apps

| App | What it tests |
|-----|---------------|
| `echo_text.py` | `lambda x: x` — pure framework overhead |
| `file_heavy.py` | 256x256 random image — exercises postprocess serialization |
| `stateful_counter.py` | `gr.State` with dict — tests session state handling |
| `streaming_chat.py` | `ChatInterface` generator with 6 yields — tests streaming |

## Runner Options

```
--app               Path to the Gradio app to test (required)
--tiers             Comma-separated concurrency tiers (default: 1,10,100)
--requests-per-user Number of rounds per tier (default: 10)
--mode              Load pattern: "burst" or "wave" (default: burst)
--concurrency-limit Concurrency limit for the app (default: 1, use "none" for unlimited)
--output-dir        Output directory (default: benchmark_results)
--port              Port for the Gradio app (default: 7860)
--api-name          API endpoint name (auto-detected if not specified)
```

### Burst vs Wave Mode

- **burst**: All N users fire simultaneously per round via `asyncio.Barrier`. Measures worst-case queue contention.
- **wave**: Each user waits a random 0–500ms jitter before firing. Simulates realistic staggered traffic.

## Remote Benchmarking (HF Jobs)

For reproducible results on standardized hardware, use the remote runner to submit benchmarks to HF Jobs infrastructure.

### Single Branch

```bash
python scripts/benchmark/remote_runner.py run \
    --apps scripts/benchmark/apps/echo_text.py scripts/benchmark/apps/streaming_chat.py \
    --branch main \
    --tiers 1,10,100 \
    --requests-per-user 50 \
    --hardware cpu-upgrade
```

### A/B Testing Two Branches

```bash
python scripts/benchmark/remote_runner.py ab \
    --apps scripts/benchmark/apps/echo_text.py scripts/benchmark/apps/stateful_counter.py \
          scripts/benchmark/apps/file_heavy.py scripts/benchmark/apps/streaming_chat.py \
    --base main \
    --branch avoid-asyncio-sleep-sse \
    --tiers 1,10,100 \
    --requests-per-user 50 \
    --hardware cpu-upgrade
```

This submits two identical jobs (one per branch) to HF Jobs. Results are uploaded to a shared HF bucket path for easy comparison:

```
hf://buckets/gradio/backend-benchmarks/{run_name}/
  main/
    run_params.json
    runner.py              # exact runner script used
    echo_text/summary.json
    streaming_chat/...
  avoid-asyncio-sleep-sse/
    ...
```

Use `--dry-run` to preview the generated bash script without submitting.

### Remote Runner Options

```
--apps              One or more paths to local Gradio app files (required)
--branch/--base     Git branches to benchmark (resolved to commit SHA)
--commit            Direct commit SHA (overrides --branch, run subcommand only)
--hardware          HF Jobs hardware flavor (default: cpu-basic)
--tiers             Comma-separated concurrency tiers (default: 1,10,100)
--requests-per-user Rounds per tier (default: 10)
--mode              Load pattern: "burst" or "wave" (default: burst)
--concurrency-limit App concurrency limit (default: 1)
--timeout           Job timeout (default: 90m)
--run-name          Human-readable label (default: auto-generated)
--dry-run           Print generated script without submitting
```

### Monitoring Jobs

```bash
# Check job logs
hf jobs logs <job_id>

# Inspect job status
hf jobs inspect <job_id>
```

## Comparing Results

Generate comparison charts from multiple benchmark runs:

```bash
# Run benchmarks at different concurrency limits
python scripts/benchmark/runner.py \
    --app scripts/benchmark/apps/echo_text.py \
    --tiers 1,10,100 \
    --concurrency-limit 1 \
    --output-dir benchmark_results/cl1

python scripts/benchmark/runner.py \
    --app scripts/benchmark/apps/echo_text.py \
    --tiers 1,10,100 \
    --concurrency-limit 10 \
    --output-dir benchmark_results/cl10

# Generate comparison charts
python scripts/benchmark/generate_charts.py \
    benchmark_results/cl1 benchmark_results/cl10 \
    --labels "cl=1" "cl=10" \
    --output-dir benchmark_results/charts
```

Charts produced:
- `client_latency_by_label.png` — Client p50/p90/p99 at max tier, per app
- `latency_vs_tier.png` — Client p50 across tiers, per app
- `phase_breakdown.png` — Stacked server phases (queue_wait, preprocess, fn_call, postprocess, streaming_diff) at max tier
- `improvement_factor.png` — Paired bars showing speedup vs baseline
- `sse_overhead.png` — Client latency vs server time (gap = SSE protocol overhead)

## Server-Side Profiling

The instrumentation (enabled via `GRADIO_PROFILING=1`) traces six phases per request:

| Phase | What it measures |
|-------|-----------------|
| `queue_wait` | Time from event creation to processing start |
| `preprocess` | Input deserialization |
| `fn_call` | User function execution (accumulated across generator yields) |
| `postprocess` | Output serialization (e.g. numpy → image → file cache) |
| `streaming_diff` | Computing incremental diffs for streaming output |
| `total` | Wall-clock time for the full `process_api()` call |

Profiling endpoints (only available when `GRADIO_PROFILING=1`):

```bash
# View all traces
curl http://localhost:7860/gradio_api/profiling/traces | python -m json.tool

# View summary with percentiles
curl http://localhost:7860/gradio_api/profiling/summary | python -m json.tool

# Clear collected traces
curl -X POST http://localhost:7860/gradio_api/profiling/clear
```
