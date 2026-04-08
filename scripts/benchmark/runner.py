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
from huggingface_hub import sync_bucket

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
            elif comp_type in ["image", "audio", "video"]:
                data_template.append({"is_file": True, "choices": [str(f.resolve()) for f in (Path("sample-inputs") / comp_type).iterdir() if f.is_file()]})
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


import shutil


def save_sample_outputs(
    results: list[dict],
    output_dir: Path,
    round_id: int,
    sample_count: int = 1,
):
    """Copy output files from a random sample of successful results to output_dir/samples/."""
    successful = [r for r in results if r.get("success") and r.get("output_data")]
    if not successful or output_dir is None:
        if output_dir is not None:
            with_data = sum(1 for r in results if r.get("output_data"))
            print(f"  [samples] Round {round_id}: {with_data}/{len(results)} results have output_data, {len(successful)} successful with data")
        return
    samples_dir = output_dir / "samples"
    samples_dir.mkdir(parents=True, exist_ok=True)
    sample = random.sample(successful, min(sample_count, len(successful)))
    for r in sample:
        for i, item in enumerate(r["output_data"]):
            if not isinstance(item, dict):
                continue
            # Gradio FileData has a "path" key pointing to the local file
            path = item.get("path")
            if not path or not Path(path).exists():
                continue
            ext = Path(path).suffix or ".bin"
            dest = samples_dir / f"round_{round_id}_user_{r['user_id']}_output_{i}{ext}"
            try:
                shutil.copy2(path, dest)
            except Exception as e:
                print(f"  WARNING: Failed to copy sample output: {e}")


async def run_httpx_tier(
    app_url: str,
    num_users: int,
    requests_per_user: int,
    fn_index: int = 0,
    data_template: list | None = None,
    mode: str = "burst",
    on_round_complete: Callable | None = None,
    prompts: list[str] | None = None,
    output_dir: Path | None = None,
    sample_count: int = 1,
) -> list[dict]:
    """Run a tier using httpx via /queue/join + /queue/data.

    Modes:
        burst: All N users fire simultaneously per round.
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

    async def _do_upload(client: httpx.AsyncClient, filepath: str, app_url: str):
        start = time.monotonic()
        result = None
        with open(filepath, "rb") as f:
            files = {"files": (filepath, f, "text/plain")}
            response = await client.post(f"{app_url}/gradio_api/upload", files=files, timeout=60, follow_redirects=True)
            result = response.json()[0]
            return result, time.monotonic() - start

    async def _do_request(
        client: httpx.AsyncClient, user_id: int, req_id: int, session_hash: str
    ) -> dict:
        """Send a single request and return the latency result."""
        data = []
        start = time.monotonic()
        upload_ms = None
        # If prompts are full data payloads (list of lists), use them directly
        if prompts and isinstance(prompts[0], list):
            data = list(random.choice(prompts))
        else:
            for item in data_template:
                if prompts and isinstance(item, str):
                    data.append(random.choice(prompts))
                elif prompts and isinstance(item, dict) and item['is_file'] is True:
                    file = random.choice(prompts)
                    path, upload_ms = await _do_upload(client, file['path'], app_url)
                    data.append({'path': path, "meta": {'_type': 'gradio.FileData'}})
                elif isinstance(item, str):
                    data.append(f"hello from user {user_id} req {req_id}")
                elif isinstance(item, dict) and item['is_file'] is True:
                    path, upload_ms = await _do_upload(client, random.choice(item['choices']), app_url)
                    data.append({'path': path, "meta": {'_type': 'gradio.FileData'}})
                else:
                    data.append(item)
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
            output_data = None
            async with client.stream(
                "GET",
                f"{app_url}/gradio_api/queue/data",
                params={"session_hash": session_hash},
                timeout=120.0,
            ) as stream:
                deadline = start + request_timeout
                buffer = b""
                async for chunk in stream.aiter_bytes():
                    buffer += chunk
                    while b"\n\n" in buffer:
                        message, buffer = buffer.split(b"\n\n", 1)
                        line = message.decode("utf-8").rstrip("\n")
                        if not line or not line.startswith("data:"):
                            continue
                        msg = json.loads(line[5:])
                        if msg.get("msg") == "process_completed":
                            completed = True
                            output_data = msg.get("output", {}).get("data")
                            break
                    if completed or time.monotonic() > deadline:
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
                "upload_ms": upload_ms * 1000 if upload_ms is not None else None,
                "output_data": output_data,
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
                "upload_ms": upload_ms * 1000 if upload_ms is not None else None
            }

    # Overall timeout for an entire round. If the server deadlocks,
    # individual request timeouts may not fire (e.g. stuck in C-level
    # socket reads). This ensures the benchmark always makes progress.
    round_timeout = request_timeout + 30

    for req_id in range(requests_per_user):
        async with httpx.AsyncClient() as client:
            if mode == "burst":
                # Use an Event + counter instead of asyncio.Barrier (3.11+)
                _arrived = 0
                _go = asyncio.Event()

                async def burst_request(
                    uid: int, rid: int = req_id,
                ):
                    nonlocal _arrived
                    session_hash = f"bench_{uid}_{rid}_{id(_go)}"
                    _arrived += 1
                    if _arrived >= num_users:
                        _go.set()
                    else:
                        await _go.wait()
                    return await _do_request(client, uid, rid, session_hash)

                try:
                    results = await asyncio.wait_for(
                        asyncio.gather(*[burst_request(i) for i in range(num_users)]),
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
                        asyncio.gather(*[wave_request(i) for i in range(num_users)]),
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
                            "upload_ms": None,
                            "success": False,
                            "error": f"Round timed out after {round_timeout:.0f}s",
                        }
                        for i in range(num_users)
                    ]
        latencies.extend(results)
        if on_round_complete is not None:
            successful = sum(1 for r in results if r.get("success"))
            on_round_complete(req_id + 1, requests_per_user, successful, num_users)
        # Save sample outputs after the round (doesn't affect latency measurements)
        if output_dir is not None:
            save_sample_outputs(results, output_dir, req_id, sample_count)

    # Strip output_data before returning (it would bloat the JSONL files)
    for lat in latencies:
        lat.pop("output_data", None)
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


async def _discover_asset_urls(client, app_url):
    """Fetch the main page and extract static/asset URLs from the HTML."""
    import re
    urls = []
    try:
        resp = await client.get(f"{app_url}/", timeout=10.0)
        if resp.status_code == 200:
            html = resp.text
            # Match src="..." and href="..." pointing to assets/ or static/
            # URLs may be relative ("./assets/...") or absolute ("/assets/...")
            for match in re.findall(r'(?:src|href)="\.?(/?(?:assets|static)/[^"]+)"', html):
                # Normalize to absolute path
                if not match.startswith("/"):
                    match = "/" + match
                urls.append(match)
    except Exception:
        pass
    return urls


async def _bg_page_loads(client, app_url, results, stop_event, asset_urls=None):
    """Simulate users loading the app page, including static asset fetches."""
    endpoints = ["/", "/config", "/gradio_api/info", "/theme.css"]
    if asset_urls:
        endpoints.extend(asset_urls)
    while not stop_event.is_set():
        endpoint = random.choice(endpoints)
        start = time.monotonic()
        try:
            resp = await client.get(f"{app_url}{endpoint}", timeout=10.0)
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "endpoint": endpoint, "success": resp.status_code == 200})
        except Exception as e:
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "endpoint": endpoint, "success": False, "error": str(e)})
        await asyncio.sleep(random.uniform(0.05, 0.5))


async def _bg_uploads(client, app_url, results, stop_event, upload_files):
    """Simulate users uploading files."""
    while not stop_event.is_set():
        filepath = random.choice(upload_files)
        start = time.monotonic()
        try:
            with open(filepath, "rb") as f:
                files = {"files": (Path(filepath).name, f, "application/octet-stream")}
                resp = await client.post(f"{app_url}/gradio_api/upload", files=files, timeout=60.0)
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "success": resp.status_code == 200, "file_size_bytes": Path(filepath).stat().st_size})
        except Exception as e:
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "success": False, "error": str(e)})
        await asyncio.sleep(random.uniform(0.1, 0.5))


async def _bg_downloads(client, app_url, results, stop_event, file_urls):
    """Simulate users downloading output files."""
    while not stop_event.is_set():
        url = random.choice(file_urls)
        full_url = f"{app_url}{url}" if url.startswith("/") else url
        start = time.monotonic()
        try:
            resp = await client.get(full_url, timeout=30.0)
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "success": resp.status_code == 200, "response_size_bytes": len(resp.content)})
        except Exception as e:
            results.append({"latency_ms": (time.monotonic() - start) * 1000, "success": False, "error": str(e)})
        await asyncio.sleep(random.uniform(0.05, 0.5))


async def run_background_traffic(app_url, num_users, stop_event, file_urls, upload_files):
    """Spawn background traffic workers and return results when stopped."""
    bg_results = {"page_loads": [], "uploads": [], "downloads": []}
    tasks = []

    async with httpx.AsyncClient(
        limits=httpx.Limits(max_connections=200, max_keepalive_connections=50), follow_redirects=True
    ) as client:
        # Discover static/asset URLs from the HTML page
        asset_urls = await _discover_asset_urls(client, app_url)
        if asset_urls:
            print(f"  Discovered {len(asset_urls)} static asset URLs for background traffic")

        # Cap worker counts to avoid exhausting file descriptors
        # Each worker holds ~1 connection, plus prediction users need their own
        max_bg_workers = 50

        # Page loaders: 2x prediction users (capped)
        for _ in range(min(max(1, num_users * 2), max_bg_workers)):
            tasks.append(asyncio.create_task(_bg_page_loads(client, app_url, bg_results["page_loads"], stop_event, asset_urls)))

        # Uploaders: 1x prediction users (capped)
        if upload_files:
            for _ in range(min(max(1, num_users), max_bg_workers)):
                tasks.append(asyncio.create_task(_bg_uploads(client, app_url, bg_results["uploads"], stop_event, upload_files)))

        # Downloaders: 2x prediction users (capped)
        if file_urls:
            for _ in range(min(max(1, num_users * 2), max_bg_workers)):
                tasks.append(asyncio.create_task(_bg_downloads(client, app_url, bg_results["downloads"], stop_event, file_urls)))

        # Wait for stop signal, then let workers finish their current request
        await stop_event.wait()
        await asyncio.gather(*tasks, return_exceptions=True)

    return bg_results



def compute_background_summary(bg_results):
    """Compute p50/p90/p99 for each background traffic type."""
    import numpy as np
    summary = {}
    for traffic_type, results in bg_results.items():
        if not results:
            continue
        successful = [r["latency_ms"] for r in results if r.get("success")]
        total = len(results)
        if not successful:
            summary[traffic_type] = {"count": total, "success_rate": 0}
            continue
        arr = np.array(successful)
        summary[traffic_type] = {
            "count": total,
            "success_count": len(successful),
            "success_rate": len(successful) / total,
            "p50": float(np.percentile(arr, 50)),
            "p90": float(np.percentile(arr, 90)),
            "p99": float(np.percentile(arr, 99)),
            "mean": float(np.mean(arr)),
        }
    return summary


NGINX_CONF_TEMPLATE = """\
worker_processes auto;
pid /tmp/nginx.pid;
error_log /tmp/nginx_error.log;

events {{
    worker_connections 1024;
}}

http {{
    access_log off;
    client_max_body_size 100m;

    upstream gradio_main {{
        server 127.0.0.1:{gradio_port};
    }}

    upstream static_workers {{
{upstream_servers}
    }}

    server {{
        listen {nginx_port};

        # Static routes -> worker processes (direct, no double-send)
        location /gradio_api/upload {{
            proxy_pass http://static_workers/upload;
            proxy_set_header Host $host;
            proxy_request_buffering off;
        }}
        location /gradio_api/file= {{
            proxy_pass http://static_workers/file=;
            proxy_set_header Host $host;
        }}
        location /gradio_api/file/ {{
            proxy_pass http://static_workers/file/;
            proxy_set_header Host $host;
        }}
        location /static/ {{
            proxy_pass http://static_workers;
            proxy_set_header Host $host;
        }}
        location /assets/ {{
            proxy_pass http://static_workers;
            proxy_set_header Host $host;
        }}
        location /svelte/ {{
            proxy_pass http://static_workers;
            proxy_set_header Host $host;
        }}
        location /favicon.ico {{
            proxy_pass http://static_workers;
            proxy_set_header Host $host;
        }}
        location /custom_component/ {{
            proxy_pass http://static_workers/custom_component/;
            proxy_set_header Host $host;
        }}

        # Everything else -> main Gradio server
        location / {{
            proxy_pass http://gradio_main;
            proxy_set_header Host $host;
            proxy_set_header Connection '';
            proxy_http_version 1.1;
            chunked_transfer_encoding off;
            proxy_buffering off;
            proxy_cache off;
        }}
    }}
}}
"""


def _start_nginx(gradio_port: int, worker_ports: list[int], nginx_port: int) -> subprocess.Popen | None:
    """Generate nginx config and start nginx to front the Gradio app + static workers."""
    if not worker_ports:
        return None

    upstream_servers = "\n".join(
        f"        server 127.0.0.1:{p};" for p in worker_ports
    )
    conf = NGINX_CONF_TEMPLATE.format(
        gradio_port=gradio_port,
        nginx_port=nginx_port,
        upstream_servers=upstream_servers,
    )
    conf_path = Path("/tmp/gradio_nginx.conf")
    conf_path.write_text(conf)

    proc = subprocess.Popen(
        ["nginx", "-c", str(conf_path), "-g", "daemon off;"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    # Wait for nginx to be ready
    for _ in range(50):
        try:
            r = httpx.get(f"http://127.0.0.1:{nginx_port}/gradio_api/info", timeout=2)
            if r.status_code == 200:
                print(f"  nginx ready on port {nginx_port}, proxying to gradio:{gradio_port} + workers:{worker_ports}")
                return proc
        except Exception:
            time.sleep(0.1)
    print("  WARNING: nginx did not become ready in time")
    return proc


async def run_benchmark(
    app_path: str,
    tiers: list[int],
    requests_per_user: int,
    output_dir: str,
    port: int = 7860,
    api_name: str | None = None,
    concurrency_limit: int | None = 1,
    mode: str = "burst",
    max_threads: int = 40,
    mixed_traffic: bool = False,
    num_workers: int = 1,
    use_nginx: bool = False,
):
    import socket

    def find_available_port(start_port):
        """Find an available port starting from start_port."""
        p = start_port
        while True:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", p)) != 0:
                    return p
            p += 1

    port = find_available_port(port)
    app_url = f"http://127.0.0.1:{port}"

    # Launch the target app
    env = os.environ.copy()
    env["GRADIO_PROFILING"] = "1"
    env["GRADIO_SERVER_PORT"] = str(port)
    cl_str = "none" if concurrency_limit is None else str(concurrency_limit)
    env["GRADIO_CONCURRENCY_LIMIT"] = cl_str
    env["GRADIO_MAX_THREADS"] = str(max_threads)
    if concurrency_limit is not None:
        # Need this for ZeroGPU spaces
        env["GRADIO_DEFAULT_CONCURRENCY_LIMIT"] = str(concurrency_limit)
    if num_workers > 1:
        env["GRADIO_NUM_WORKERS"] = str(num_workers)
    env["PYTHONUNBUFFERED"] = "1"

    print(f"Synching sample-inputs to {(Path(os.getcwd()) / 'sample-inputs')}")
    sync_bucket("hf://buckets/gradio/sample-inputs", "sample-inputs")
    env["GRADIO_ALLOWED_PATHS"] = str((Path(os.getcwd()) / 'sample-inputs').resolve())

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

    output_thread = threading.Thread(
        target=_stream_app_output, args=(proc,), daemon=True
    )
    output_thread.start()

    try:
        if not wait_for_server(app_url):
            print("ERROR: Server did not start in time")
            proc.terminate()
            output_thread.join(timeout=5)
            return

        print(f"Server ready at {app_url}")

        # Start nginx if requested and workers are available
        nginx_proc = None
        if use_nginx and num_workers > 1:
            worker_ports = [port + 1 + i for i in range(num_workers)]
            nginx_port = find_available_port(8080)
            nginx_proc = _start_nginx(port, worker_ports, nginx_port)
            if nginx_proc:
                app_url = f"http://127.0.0.1:{nginx_port}"
                print(f"Benchmark will use nginx at {app_url}")
            else:
                print("WARNING: nginx failed to start, falling back to direct connection")

        print(f"Benchmark app_url = {app_url}")

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

        # Seed mixed traffic data if enabled
        download_urls = []
        upload_files = []
        if mixed_traffic:
            print("Mixed traffic enabled — collecting upload/download files...")
            sample_inputs = Path("sample-inputs")
            if sample_inputs.exists():
                sample_files = [str(f) for f in sample_inputs.rglob("*") if f.is_file()]
                upload_files = sample_files
                # Build download URLs from sample-inputs (served via /gradio_api/file=)
                # Requires "sample-inputs" in the app's allowed_paths
                download_urls = [
                    f"/gradio_api/file={str(Path(f).resolve())}" for f in sample_files
                ]
            if upload_files:
                print(f"  Found {len(upload_files)} files for upload/download traffic")
            else:
                print("  No sample-inputs found — upload/download traffic will be skipped")

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

            is_tty = sys.stdout.isatty()
            if is_tty:
                from tqdm import tqdm

                pbar = tqdm(
                    total=requests_per_user, desc=f"  Tier {tier}", unit="round", leave=True,
                )

                def on_round_complete(round_num, total_rounds, successful, num_users):
                    failed = num_users - successful
                    pbar.set_postfix(ok=successful, fail=failed, refresh=True)
                    pbar.update(1)
            else:
                pbar = None

                def on_round_complete(round_num, total_rounds, successful, num_users):
                    failed = num_users - successful
                    print(
                        f"  Round {round_num}/{total_rounds} — ok={successful} fail={failed}",
                        flush=True,
                    )

            # Start background traffic if enabled
            bg_task = None
            stop_event = None
            if mixed_traffic:
                stop_event = asyncio.Event()
                bg_task = asyncio.create_task(
                    run_background_traffic(app_url, tier, stop_event, download_urls, upload_files)
                )

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
                output_dir=tier_dir,
            )
            if pbar is not None:
                pbar.close()
            elapsed = time.monotonic() - start

            # Stop background traffic and collect results
            bg_results = None
            if bg_task is not None:
                stop_event.set()
                bg_results = await bg_task

                # Save background traffic JSONL files
                for traffic_type, results in bg_results.items():
                    if results:
                        with open(tier_dir / f"background_{traffic_type}.jsonl", "w") as f:
                            for r in results:
                                f.write(json.dumps(r) + "\n")

                bg_summary = compute_background_summary(bg_results)
                total_bg = sum(len(v) for v in bg_results.values())
                print(f"  Background traffic: {total_bg} requests across {len(bg_summary)} types")
                for ttype, s in bg_summary.items():
                    if s.get("p50"):
                        print(f"    {ttype}: p50={s['p50']:.1f}ms p90={s['p90']:.1f}ms ({s['count']} reqs, {s['success_rate']:.0%} ok)")

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
            if bg_results is not None:
                tier_result["background_traffic"] = compute_background_summary(bg_results)
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
        if nginx_proc is not None:
            nginx_proc.terminate()
            nginx_proc.wait(timeout=3)
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
    parser.add_argument(
        "--max-threads",
        default="40",
        help="Concurrency limit for the app (default: 1, use 'none' for unlimited)",
    )
    parser.add_argument(
        "--mixed-traffic",
        action="store_true",
        help="Run background traffic (page loads, uploads, downloads, heartbeats) alongside predictions",
    )
    parser.add_argument(
        "--num-workers",
        type=int,
        default=1,
        help="Number of Gradio workers (sets GRADIO_NUM_WORKERS). Default: 1",
    )
    parser.add_argument(
        "--nginx",
        action="store_true",
        help="Put nginx in front to route static traffic to workers (requires nginx installed)",
    )

    args = parser.parse_args()
    tiers = [int(t.strip()) for t in args.tiers.split(",")]
    cl = None if args.concurrency_limit == "none" else int(args.concurrency_limit)
    max_threads = int(args.max_threads)

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
            max_threads=max_threads,
            mixed_traffic=args.mixed_traffic,
            num_workers=args.num_workers,
            use_nginx=args.nginx,
        )
    )


if __name__ == "__main__":
    # Force line-buffered stdout/stderr so output streams in real-time
    # when running in containers (e.g. HF Jobs) where stdout is not a TTY.
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
    main()
