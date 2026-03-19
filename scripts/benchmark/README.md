# Gradio Backend Profiling & Benchmarking

Tools for measuring Gradio server performance: per-phase request timing, load testing, and chart generation.

## Setup

```bash
bash scripts/install_gradio.sh
pip install tqdm httpx numpy matplotlib
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

---

## Analyses

### SSE Polling Fix (`avoid-asyncio-sleep-sse`)

Replaced the `get_nowait()` + `asyncio.sleep(0.001)` polling loop in the SSE stream with `await asyncio.Queue.get()`, which blocks efficiently until a message is available.

#### Reproducing

**1. Run "before" benchmarks on `main`:**

```bash
git checkout main

for app in echo_text file_heavy stateful_counter streaming_chat; do
    python scripts/benchmark/runner.py \
        --app scripts/benchmark/apps/${app}.py \
        --tiers 1,10,100 \
        --requests-per-user 3 \
        --output-dir benchmark_results/before
done
```

**2. Run "after" benchmarks on the fix branch:**

```bash
git checkout avoid-asyncio-sleep-sse

for app in echo_text file_heavy stateful_counter streaming_chat; do
    python scripts/benchmark/runner.py \
        --app scripts/benchmark/apps/${app}.py \
        --tiers 1,10,100 \
        --requests-per-user 3 \
        --output-dir benchmark_results/after
done
```

**3. Generate comparison charts:**

```bash
python scripts/benchmark/generate_charts.py \
    benchmark_results/before benchmark_results/after \
    --labels "before" "after" \
    --output-dir benchmark_results/sse_comparison
```

**4. Print client p50 comparison:**

```python
import json, numpy as np
from pathlib import Path

for label, base in [("BEFORE", "benchmark_results/before"), ("AFTER", "benchmark_results/after")]:
    print(f"=== {label} ===")
    for d in sorted(Path(base).iterdir()):
        if not (d / "summary.json").exists():
            continue
        s = json.loads((d / "summary.json").read_text())
        app = Path(s["app"]).stem
        tier_dir = d / "tier_100"
        if not tier_dir.exists():
            continue
        clients = [json.loads(l) for l in (tier_dir / "client_latencies.jsonl").read_text().splitlines() if l.strip()]
        lats = [c["latency_ms"] for c in clients if c.get("success")]
        print(f"  {app:20s}  p50={np.percentile(lats, 50):7.0f}ms  p90={np.percentile(lats, 90):7.0f}ms  p99={np.percentile(lats, 99):7.0f}ms")
    print()
```

**5. Print SSE overhead comparison:**

```python
import json, numpy as np
from pathlib import Path

for label, base in [("BEFORE", "benchmark_results/before"), ("AFTER", "benchmark_results/after")]:
    print(f"=== {label} ===")
    for d in sorted(Path(base).iterdir()):
        if not (d / "summary.json").exists():
            continue
        s = json.loads((d / "summary.json").read_text())
        app = Path(s["app"]).stem
        tier_dir = d / "tier_100"
        if not tier_dir.exists():
            continue
        traces = [json.loads(l) for l in (tier_dir / "traces.jsonl").read_text().splitlines() if l.strip()]
        clients = [json.loads(l) for l in (tier_dir / "client_latencies.jsonl").read_text().splitlines() if l.strip()]
        client_lats = [c["latency_ms"] for c in clients if c.get("success")]
        server_sums = [t["queue_wait_ms"] + t["total_ms"] for t in traces]
        client_p50 = np.percentile(client_lats, 50)
        server_p50 = np.percentile(server_sums, 50)
        overhead = client_p50 - server_p50
        pct = (overhead / client_p50 * 100) if client_p50 > 0 else 0
        print(f"  {app:20s}  client_p50={client_p50:7.0f}ms  server_p50={server_p50:7.0f}ms  overhead={overhead:7.0f}ms ({pct:.0f}%)")
    print()
```

#### Results (at 100 concurrent users, cl=1)

**Client p50 latency:**

| App | Before | After | Improvement |
|-----|--------|-------|-------------|
| echo_text | 850ms | 261ms | 3.3x |
| file_heavy | 1,261ms | 570ms | 2.2x |
| stateful_counter | 516ms | 234ms | 2.2x |
| streaming_chat | 2,811ms | 2,157ms | 1.3x |

**SSE overhead (client p50 − server p50):**

| App | Before | After | Reduction |
|-----|--------|-------|-----------|
| echo_text | 329ms | 48ms | 6.9x |
| file_heavy | 162ms | 43ms | 3.8x |
| stateful_counter | 130ms | 54ms | 2.4x |
| streaming_chat | 160ms | 54ms | 3.0x |

SSE overhead is now consistently 43–54ms (HTTP round-trip + SSE connection setup), down from 130–329ms.
