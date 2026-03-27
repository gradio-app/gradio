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

Replaced the `get_nowait()` + `asyncio.sleep(0.001)` polling loop in the SSE stream with `await asyncio.Queue.get()`, which blocks efficiently until a message is available. Also changed the message queue from `queue.Queue` (thread-safe) to `asyncio.Queue` (async-native).

The improvement is most visible under heavy concurrent load — when many SSE connections are open simultaneously, the polling loop creates significant event loop contention that the async queue eliminates.

#### Reproducing

The benchmark launches all 4 test apps simultaneously on separate ports, then fires 100 concurrent burst requests at each — simulating a realistic production scenario with multiple Gradio apps sharing the same machine.

**1. Save this script as `scripts/benchmark/sse_bench.py`:**

```python
import asyncio, time, httpx, json, sys, os, subprocess, numpy as np
from pathlib import Path

async def resolve_fn(app_url):
    async with httpx.AsyncClient() as c:
        info = (await c.get(f"{app_url}/gradio_api/info", timeout=5)).json()
        api_name = list(info.get("named_endpoints", {}).keys())[0]
        config = (await c.get(f"{app_url}/config", timeout=5)).json()
        for dep in config.get("dependencies", []):
            if dep.get("api_name") == api_name.lstrip("/"):
                fn_index = dep.get("id", 0)
                components = {c["id"]: c for c in config.get("components", [])}
                data = []
                for cid in dep.get("inputs", []):
                    ct = components.get(cid, {}).get("type", "")
                    data.append(None if ct == "state" else "hello")
                return fn_index, data or ["hello"]
    return 0, ["hello"]

async def bench(app_url, name):
    fn_index, data = await resolve_fn(app_url)
    # Warmup
    async with httpx.AsyncClient() as c:
        for i in range(3):
            sh = f"wu_{name}_{i}"
            try:
                await c.post(f"{app_url}/gradio_api/queue/join",
                    json={"data": data, "fn_index": fn_index, "session_hash": sh}, timeout=10)
                async with c.stream("GET", f"{app_url}/gradio_api/queue/data",
                    params={"session_hash": sh}, timeout=10) as s:
                    async for line in s.aiter_lines():
                        if "process_completed" in line: break
            except: pass

    # Tier 100, 3 rounds, shared client
    latencies = []
    async with httpx.AsyncClient() as client:
        for rid in range(3):
            barrier = asyncio.Barrier(100)
            async def burst(uid, rid=rid, b=barrier):
                sh = f"b_{name}_{uid}_{rid}_{id(b)}"
                await b.wait()
                start = time.monotonic()
                try:
                    await client.post(f"{app_url}/gradio_api/queue/join",
                        json={"data": data, "fn_index": fn_index, "session_hash": sh}, timeout=120)
                    async with client.stream("GET", f"{app_url}/gradio_api/queue/data",
                        params={"session_hash": sh}, timeout=120) as stream:
                        async for line in stream.aiter_lines():
                            if "process_completed" in line: break
                    return (time.monotonic() - start) * 1000
                except:
                    return -1
            results = await asyncio.gather(*[burst(i) for i in range(100)])
            latencies.extend([r for r in results if r > 0])
    arr = np.array(latencies)
    print(f"{name:20s}: p50={np.percentile(arr,50):.0f}ms p90={np.percentile(arr,90):.0f}ms n={len(latencies)}", flush=True)

async def main():
    apps = [
        ("scripts/benchmark/apps/echo_text.py", 7891),
        ("scripts/benchmark/apps/file_heavy.py", 7892),
        ("scripts/benchmark/apps/stateful_counter.py", 7893),
        ("scripts/benchmark/apps/streaming_chat.py", 7894),
    ]
    procs = []
    for app_path, port in apps:
        env = os.environ.copy()
        env["GRADIO_PROFILING"] = "1"
        env["GRADIO_SERVER_PORT"] = str(port)
        p = subprocess.Popen([sys.executable, app_path], env=env,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        procs.append(p)

    for _, port in apps:
        for _ in range(60):
            try:
                r = httpx.get(f"http://127.0.0.1:{port}/gradio_api/info", timeout=2)
                if r.status_code == 200: break
            except: pass
            time.sleep(0.5)
    print("All servers ready", flush=True)

    await asyncio.gather(*[
        bench(f"http://127.0.0.1:{port}", Path(app).stem)
        for app, port in apps
    ])

    for p in procs:
        p.terminate()
        p.wait(timeout=5)

asyncio.run(main())
```

**2. Run before/after:**

```bash
git checkout main
python scripts/benchmark/sse_bench.py

git checkout avoid-asyncio-sleep-sse
python scripts/benchmark/sse_bench.py
```

#### Results (4 apps × 100 concurrent users, cl=1)

| App | Before (main) | After (fix) | Improvement |
|-----|--------------|-------------|-------------|
| echo_text | 988ms | 336ms | 2.9x |
| stateful_counter | 957ms | 319ms | 3.0x |
| file_heavy | 958ms | 711ms | 1.3x |
| streaming_chat | — | 2,293ms | — |

The improvement is driven by eliminating event loop contention from 400 concurrent SSE connections (4 apps × 100 users) all polling at 1ms intervals. With `asyncio.Queue.get()`, idle connections sleep efficiently until a message is available, freeing the event loop for actual work.
