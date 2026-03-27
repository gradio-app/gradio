from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import subprocess
import sys
import time
from collections.abc import Callable
from datetime import datetime
from pathlib import Path

import httpx

"""Load testing orchestrator for Gradio apps.

Usage:
    GRADIO_PROFILING=1 python scripts/benchmark/load_runner.py \
        --app scripts/benchmark/apps/echo_text.py \
        --tiers 1,10,100 \
        --requests-per-user 10 \
        --output-dir benchmark_results

    # Wave mode (staggered arrivals instead of simultaneous burst)
    GRADIO_PROFILING=1 python scripts/benchmark/load_runner.py \
        --app scripts/benchmark/apps/echo_text.py \
        --tiers 1,10,100 \
        --mode wave \
        --output-dir benchmark_results
"""


def wait_for_server(url: str, timeout: float = 60.0) -> bool:
    """Wait for server to become available."""
    start = time.monotonic()
    while time.monotonic() - start < timeout:
        try:
            resp = httpx.get(f"{url}/gradio_api/info", timeout=2.0)
            if resp.status_code == 200:
                return True
        except (httpx.ConnectError, httpx.ReadTimeout):
            pass
        time.sleep(0.5)
    return False


async def resolve_fn_info(
    app_url: str, api_name: str | None = None
) -> tuple[int, list]:
    """Resolve the fn_index and build a data template for the given api_name.

    Returns (fn_index, data_template) where data_template has the right number
    of elements (string for textbox-like inputs, None for state/hidden inputs).
    """
    async with httpx.AsyncClient() as client:
        # If no api_name specified, get the first named endpoint from /info
        if api_name is None:
            try:
                info_resp = await client.get(f"{app_url}/gradio_api/info", timeout=5.0)
                info = info_resp.json()
                named = info.get("named_endpoints", {})
                if named:
                    api_name = list(named.keys())[0]  # e.g. "/echo_stream"
            except Exception:
                pass

        # Get config to find fn_index and input component IDs
        config_resp = await client.get(f"{app_url}/config", timeout=5.0)
        config = config_resp.json()

        deps = config.get("dependencies", [])
        components = {c["id"]: c for c in config.get("components", [])}

        # Find the right dependency by matching api_name
        target_dep = None
        if api_name:
            search_name = api_name.lstrip("/")
            for dep in deps:
                if dep.get("api_name") == search_name:
                    target_dep = dep
                    break

        if target_dep is None:
            # Fallback: first dependency
            target_dep = deps[0] if deps else None

        if target_dep is None:
            return 0, ["hello"]

        fn_index = target_dep["id"] if "id" in target_dep else deps.index(target_dep)

        # Build data template based on input components
        data_template = []
        for comp_id in target_dep.get("inputs", []):
            comp = components.get(comp_id, {})
            comp_type = comp.get("type", "")
            if comp_type in ("textbox", "textarea"):
                data_template.append("hello")
            elif comp_type in ["state", "chatbot"]:
                data_template.append(None)
            else:
                data_template.append("hello")

        if not data_template:
            data_template = ["hello"]

        return fn_index, data_template


def load_prompts(app_path: str) -> list[str] | None:
    """Load prompts from a sidecar .prompts.json file if it exists."""
    prompts_path = Path(app_path).with_suffix(".prompts.json")
    if prompts_path.exists():
        return json.loads(prompts_path.read_text())
    return None


async def run_httpx_tier(
    app_url: str,
    num_users: int,
    requests_per_user: int,
    fn_index: int = 0,
    data_template: list | None = None,
    mode: str = "burst",
    on_round_complete: Callable | None = None,
    prompts: list[str] | None = None,
) -> list[dict]:
    """Run a tier using httpx via /queue/join + /queue/data.

    Modes:
        burst: All N users fire simultaneously per round (asyncio.Barrier).
        wave:  Each user waits a random delay (0 to 500ms) before firing,
               simulating staggered real-world arrivals.
    """
    if data_template is None:
        data_template = ["hello"]

    latencies = []

    # Wall-clock timeout per request. The httpx timeout only triggers when no
    # data arrives, but SSE heartbeats can keep a dead connection alive forever.
    # Scale with num_users since all requests queue behind concurrency_limit.
    request_timeout = max(120.0, num_users * 5.0)

    async def _do_request(
        client: httpx.AsyncClient, user_id: int, req_id: int, session_hash: str
    ) -> dict:
        """Send a single request and return the latency result."""
        data = []
        for item in data_template:
            if isinstance(item, str):
                if prompts:
                    data.append(random.choice(prompts))
                else:
                    data.append(f"hello from user {user_id} req {req_id}")
            else:
                data.append(item)

        start = time.monotonic()
        try:
            resp = await client.post(
                f"{app_url}/gradio_api/queue/join",
                json={
                    "data": data,
                    "fn_index": fn_index,
                    "session_hash": session_hash,
                },
                timeout=120.0,
            )
            if resp.status_code != 200:
                raise Exception(
                    f"POST /queue/join failed: {resp.status_code} {resp.text[:200]}"
                )

            completed = False
            async with client.stream(
                "GET",
                f"{app_url}/gradio_api/queue/data",
                params={"session_hash": session_hash},
                timeout=120.0,
            ) as stream:
                deadline = start + request_timeout
                async for line in stream.aiter_lines():
                    if "process_completed" in line:
                        completed = True
                        break
                    if time.monotonic() > deadline:
                        break

            if not completed:
                raise TimeoutError(
                    f"Request did not complete within {request_timeout:.0f}s"
                )

            duration_ms = (time.monotonic() - start) * 1000
            return {
                "user_id": user_id,
                "request_id": req_id,
                "latency_ms": duration_ms,
                "success": True,
            }
        except Exception as e:
            duration_ms = (time.monotonic() - start) * 1000
            error_type = type(e).__name__
            return {
                "user_id": user_id,
                "request_id": req_id,
                "latency_ms": duration_ms,
                "success": False,
                "error": f"{error_type}: {e}" if str(e) else error_type,
            }

    # Overall timeout for an entire round. If the server deadlocks,
    # individual request timeouts may not fire (e.g. stuck in C-level
    # socket reads). This ensures the benchmark always makes progress.
    round_timeout = request_timeout + 30

    for req_id in range(requests_per_user):
        async with httpx.AsyncClient() as client:
            if mode == "burst":
                barrier = asyncio.Barrier(num_users)

                async def burst_request(
                    uid: int, rid: int = req_id, b: asyncio.Barrier = barrier
                ):
                    session_hash = f"bench_{uid}_{rid}_{id(b)}"
                    await b.wait()
                    return await _do_request(client, uid, rid, session_hash)

                try:
                    results = await asyncio.wait_for(
                        asyncio.gather(
                            *[burst_request(i) for i in range(num_users)]
                        ),
                        timeout=round_timeout,
                    )
                except (asyncio.TimeoutError, TimeoutError):
                    print(
                        f"  WARNING: Round {req_id} timed out after {round_timeout:.0f}s "
                        f"(server may be deadlocked)"
                    )
                    results = [
                        {
                            "user_id": i,
                            "request_id": req_id,
                            "latency_ms": round_timeout * 1000,
                            "success": False,
                            "error": f"Round timed out after {round_timeout:.0f}s",
                        }
                        for i in range(num_users)
                    ]
            else:
                # wave mode: random jitter per user (0–500ms)
                async def wave_request(uid: int, rid: int = req_id):
                    jitter = random.uniform(0, 0.5)
                    await asyncio.sleep(jitter)
                    session_hash = f"bench_{uid}_{rid}_{time.monotonic_ns()}"
                    return await _do_request(client, uid, rid, session_hash)

                try:
                    results = await asyncio.wait_for(
                        asyncio.gather(
                            *[wave_request(i) for i in range(num_users)]
                        ),
                        timeout=round_timeout,
                    )
                except (asyncio.TimeoutError, TimeoutError):
                    print(
                        f"  WARNING: Round {req_id} timed out after {round_timeout:.0f}s "
                        f"(server may be deadlocked)"
                    )
                    results = [
                        {
                            "user_id": i,
                            "request_id": req_id,
                            "latency_ms": round_timeout * 1000,
                            "success": False,
                            "error": f"Round timed out after {round_timeout:.0f}s",
                        }
                        for i in range(num_users)
                    ]
        latencies.extend(results)
        if on_round_complete is not None:
            successful = sum(1 for r in results if r.get("success"))
            on_round_complete(req_id + 1, requests_per_user, successful, num_users)

    return latencies


async def fetch_profiling_data(app_url: str) -> tuple[list, dict]:
    """Fetch traces and summary from the profiling endpoints."""
    async with httpx.AsyncClient() as client:
        try:
            traces_resp = await client.get(
                f"{app_url}/gradio_api/profiling/traces", timeout=10.0
            )
            traces = traces_resp.json() if traces_resp.status_code == 200 else []
        except Exception:
            traces = []

        try:
            summary_resp = await client.get(
                f"{app_url}/gradio_api/profiling/summary", timeout=10.0
            )
            summary = summary_resp.json() if summary_resp.status_code == 200 else {}
        except Exception:
            summary = {}

    return traces, summary


async def clear_profiling_data(app_url: str):
    """Clear profiling data between tiers."""
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{app_url}/gradio_api/profiling/clear", timeout=10.0)
        except Exception:
            pass


def compute_client_summary(latencies: list[dict]) -> dict:
    """Compute p50/p90/p95/p99 from client latencies."""
    import numpy as np

    successful = [r["latency_ms"] for r in latencies if r.get("success")]
    if not successful:
        return {"count": 0, "success_rate": 0}

    arr = np.array(successful)
    total = len(latencies)
    return {
        "count": total,
        "success_count": len(successful),
        "success_rate": len(successful) / total if total > 0 else 0,
        "p50": float(np.percentile(arr, 50)),
        "p90": float(np.percentile(arr, 90)),
        "p95": float(np.percentile(arr, 95)),
        "p99": float(np.percentile(arr, 99)),
        "mean": float(np.mean(arr)),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
    }


async def run_benchmark(
    app_path: str,
    tiers: list[int],
    requests_per_user: int,
    output_dir: str,
    port: int = 7860,
    api_name: str | None = None,
    concurrency_limit: int | None = 1,
    mode: str = "burst",
):
    app_url = f"http://127.0.0.1:{port}"

    # Launch the target app
    env = os.environ.copy()
    env["GRADIO_PROFILING"] = "1"
    env["GRADIO_SERVER_PORT"] = str(port)
    cl_str = "none" if concurrency_limit is None else str(concurrency_limit)
    env["GRADIO_CONCURRENCY_LIMIT"] = cl_str
    env["PYTHONUNBUFFERED"] = "1"

    print(f"Launching app: {app_path}")
    proc = subprocess.Popen(
        [sys.executable, app_path],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    import threading

    def _stream_app_output(process):
        """Stream app stdout/stderr line by line with a prefix."""
        for line in iter(process.stdout.readline, b""):
            print(f"  [app] {line.decode(errors='replace').rstrip()}")

    output_thread = threading.Thread(target=_stream_app_output, args=(proc,), daemon=True)
    output_thread.start()

    try:
        if not wait_for_server(app_url):
            print("ERROR: Server did not start in time")
            proc.terminate()
            output_thread.join(timeout=5)
            return

        print(f"Server ready at {app_url}")

        # Resolve fn_index and data template
        fn_index, data_template = await resolve_fn_info(app_url, api_name)
        print(f"Using fn_index={fn_index}, data_template={data_template}")

        # Load prompts from sidecar file if available
        prompts = load_prompts(app_path)
        if prompts:
            print(f"Loaded {len(prompts)} prompts from sidecar file")

        # Warmup
        print("Running warmup...")
        await clear_profiling_data(app_url)
        try:
            await run_httpx_tier(
                app_url,
                2,
                3,
                fn_index=fn_index,
                data_template=data_template,
                mode=mode,
                prompts=prompts,
            )
        except Exception:
            pass
        await clear_profiling_data(app_url)

        # Create output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_dir = Path(output_dir) / timestamp
        base_dir.mkdir(parents=True, exist_ok=True)

        all_tier_results = []

        for tier in tiers:
            print(f"\n--- Tier: {tier} concurrent users ---")
            await clear_profiling_data(app_url)

            tier_dir = base_dir / f"tier_{tier}"
            tier_dir.mkdir(exist_ok=True)

            from tqdm import tqdm

            pbar = tqdm(
                total=requests_per_user, desc=f"  Tier {tier}", unit="round", leave=True
            )

            def on_round_complete(round_num, total_rounds, successful, num_users):
                failed = num_users - successful
                pbar.set_postfix(ok=successful, fail=failed, refresh=True)
                pbar.update(1)

            # Run the tier
            start = time.monotonic()
            client_latencies = await run_httpx_tier(
                app_url,
                tier,
                requests_per_user,
                fn_index=fn_index,
                data_template=data_template,
                mode=mode,
                on_round_complete=on_round_complete,
                prompts=prompts,
            )
            pbar.close()
            elapsed = time.monotonic() - start

            # Fetch server profiling data
            traces, server_summary = await fetch_profiling_data(app_url)

            # Compute client summary
            client_summary = compute_client_summary(client_latencies)

            tier_result = {
                "tier": tier,
                "requests_per_user": requests_per_user,
                "total_requests": tier * requests_per_user,
                "elapsed_seconds": elapsed,
                "client_summary": client_summary,
                "server_summary": server_summary,
            }
            all_tier_results.append(tier_result)

            # Save tier data
            with open(tier_dir / "client_latencies.jsonl", "w") as f:
                for lat in client_latencies:
                    f.write(json.dumps(lat) + "\n")

            with open(tier_dir / "traces.jsonl", "w") as f:
                for trace in traces:
                    f.write(json.dumps(trace) + "\n")

            # Print tier summary
            print(f"  Elapsed: {elapsed:.1f}s")
            cp50 = client_summary.get("p50")
            cp90 = client_summary.get("p90")
            cp99 = client_summary.get("p99")
            if cp50 is not None:
                print(f"  Client p50={cp50:.1f}ms p90={cp90:.1f}ms p99={cp99:.1f}ms")
            else:
                print("  Client: no successful requests")
            if server_summary.get("phases"):
                total = server_summary["phases"].get("total", {})
                sp50 = total.get("p50")
                if sp50 is not None:
                    print(
                        f"  Server total p50={sp50:.1f}ms "
                        f"p90={total.get('p90', 0):.1f}ms "
                        f"p99={total.get('p99', 0):.1f}ms"
                    )

        # Save overall summary
        summary = {
            "app": app_path,
            "timestamp": timestamp,
            "tiers": all_tier_results,
        }
        with open(base_dir / "summary.json", "w") as f:
            json.dump(summary, f, indent=2)

        # Generate summary table
        _write_summary_table(base_dir, all_tier_results)

        print(f"\nResults saved to {base_dir}")

    finally:
        exit_code = proc.poll()
        if exit_code is not None:
            print(f"\nWARNING: App process already exited with code {exit_code}")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        output_thread.join(timeout=5)


def _write_summary_table(base_dir: Path, tier_results: list[dict]):
    """Write a human-readable summary table."""
    lines = []
    lines.append(
        f"{'Tier':>8} | {'Reqs':>8} | {'Client p50':>12} | {'Client p90':>12} | "
        f"{'Client p99':>12} | {'Success%':>9} | {'Server p50':>12} | {'Server p90':>12}"
    )
    lines.append("-" * 110)
    for r in tier_results:
        cs = r.get("client_summary", {})
        ss = r.get("server_summary", {}).get("phases", {}).get("total", {})
        lines.append(
            f"{r['tier']:>8} | {r['total_requests']:>8} | "
            f"{cs.get('p50', 0):>10.1f}ms | {cs.get('p90', 0):>10.1f}ms | "
            f"{cs.get('p99', 0):>10.1f}ms | {cs.get('success_rate', 0):>8.1%} | "
            f"{ss.get('p50', 0):>10.1f}ms | {ss.get('p90', 0):>10.1f}ms"
        )
    table = "\n".join(lines)
    with open(base_dir / "summary_table.txt", "w") as f:
        f.write(table + "\n")
    print(f"\n{table}")


def main():
    parser = argparse.ArgumentParser(description="Gradio Load Testing Tool")
    parser.add_argument("--app", required=True, help="Path to the Gradio app to test")
    parser.add_argument(
        "--tiers",
        default="1,10,100",
        help="Comma-separated concurrency tiers (default: 1,10,100)",
    )
    parser.add_argument(
        "--requests-per-user",
        type=int,
        default=10,
        help="Requests per virtual user / number of rounds (default: 10)",
    )
    parser.add_argument(
        "--output-dir",
        default="benchmark_results",
        help="Output directory (default: benchmark_results)",
    )
    parser.add_argument(
        "--mode",
        choices=["burst", "wave"],
        default="burst",
        help="Load pattern: 'burst' fires all requests simultaneously per round, "
        "'wave' staggers arrivals with random jitter (default: burst)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=7860,
        help="Port for the Gradio app (default: 7860)",
    )
    parser.add_argument(
        "--api-name",
        default=None,
        help="API endpoint name (auto-detected if not specified)",
    )
    parser.add_argument(
        "--concurrency-limit",
        default="1",
        help="Concurrency limit for the app (default: 1, use 'none' for unlimited)",
    )

    args = parser.parse_args()
    tiers = [int(t.strip()) for t in args.tiers.split(",")]
    cl = None if args.concurrency_limit == "none" else int(args.concurrency_limit)

    asyncio.run(
        run_benchmark(
            app_path=args.app,
            tiers=tiers,
            requests_per_user=args.requests_per_user,
            output_dir=args.output_dir,
            port=args.port,
            api_name=args.api_name,
            concurrency_limit=cl,
            mode=args.mode,
        )
    )


if __name__ == "__main__":
    main()
