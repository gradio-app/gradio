"""A Space going viral: visitors arrive at a steady rate, each loads the page
(HTML, config, theme, main JS bundle), submits one request through the queue
like the browser does, and waits on its SSE stream.

usage: viral.py <app.py|chat.py> <executor> <arrivals_per_s> <seconds> <out.json>
"""

import asyncio
import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import time
import uuid

import httpx2
import psutil

HERE = os.path.dirname(os.path.abspath(__file__))
APP, EXECUTOR, RATE, SECONDS, OUT = (
    sys.argv[1],
    sys.argv[2],
    float(sys.argv[3]),
    float(sys.argv[4]),
    sys.argv[5],
)
PORT = int(os.environ.get("PORT", "7990"))
URL = f"http://127.0.0.1:{PORT}"
API = URL + "/gradio_api"
DATA = (
    ["golden retriever", int(os.environ.get("STEPS", "20")), 4, 0]
    if APP == "app.py"
    else ["Explain why the sky is blue.", 0]
)


def start_app():
    env = {
        **os.environ,
        "GRADIO_EXECUTOR": EXECUTOR,
        "BENCH_PORT": str(PORT),
        "HF_HUB_OFFLINE": "1",
        "GRADIO_ANALYTICS_ENABLED": "False",
        "PYTHONWARNINGS": "ignore",
        "TOKENIZERS_PARALLELISM": "false",
    }
    log = open(os.path.join(tempfile.gettempdir(), f"viral_{APP}_{EXECUTOR}.log"), "ab")
    proc = subprocess.Popen(
        [sys.executable, os.path.join(HERE, APP)],
        env=env,
        cwd=HERE,
        stdout=log,
        stderr=log,
        start_new_session=True,
    )
    t0 = time.perf_counter()
    while True:
        if proc.poll() is not None:
            raise RuntimeError(f"app exited, see {log.name}")
        try:
            if httpx2.get(URL + "/", timeout=2).status_code == 200:
                return proc
        except Exception:
            time.sleep(0.1)
        if time.perf_counter() - t0 > 300:
            raise RuntimeError("startup timeout")


def stop_app(proc):
    try:
        procs = [
            psutil.Process(proc.pid),
            *psutil.Process(proc.pid).children(recursive=True),
        ]
    except psutil.NoSuchProcess:
        procs = []
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    _, alive = psutil.wait_procs(procs, timeout=10)
    for p in alive:
        p.kill()


def pct(values, f):
    values = sorted(values)
    return (
        values[min(len(values) - 1, int(round(f * (len(values) - 1))))]
        if values
        else None
    )


def dist(values):
    return {
        "n": len(values),
        "p50": pct(values, 0.5),
        "p95": pct(values, 0.95),
        "p99": pct(values, 0.99),
        "max": max(values) if values else None,
    }


async def main():
    proc = start_app()
    limits = httpx2.Limits(max_connections=None, max_keepalive_connections=0)
    client = httpx2.AsyncClient(limits=limits, timeout=httpx2.Timeout(120, read=None))
    html = (await client.get(URL + "/")).text
    match = re.search(r'src="\.?/?(assets/[^"]+\.js)"', html)
    asset = "/" + match.group(1) if match else "/theme.css"
    config = (await client.get(URL + "/config")).json()
    fn_index = next(
        d["id"] for d in config["dependencies"] if d.get("api_name") == "generate"
    )

    stats = {
        "page_ms": [],  # (arrival offset, ms)
        "join_ms": [],
        "first_update_ms": [],
        "completed": [],  # (offset at completion, wait seconds, fn seconds)
        "errors": 0,
    }
    t_start = None

    async def visitor(record=True):
        arrived = time.perf_counter()
        session = uuid.uuid4().hex
        try:
            for path in ("/", "/config", "/theme.css", asset):
                r = await client.get(URL + path)
                r.raise_for_status()
            loaded = time.perf_counter()
            if record:
                stats["page_ms"].append((arrived - t_start, (loaded - arrived) * 1000))
            if record and submit_every > 1 and visitor.count % submit_every:
                visitor.count += 1
                return
            visitor.count += 1
            r = await client.post(
                API + "/queue/join",
                json={"data": DATA, "fn_index": fn_index, "session_hash": session},
            )
            r.raise_for_status()
            joined = time.perf_counter()
            if record:
                stats["join_ms"].append((joined - loaded) * 1000)
            first = True
            async with client.stream(
                "GET", API + "/queue/data", params={"session_hash": session}
            ) as stream:
                async for line in stream.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    message = json.loads(line[5:])
                    if first and record:
                        stats["first_update_ms"].append(
                            (time.perf_counter() - joined) * 1000
                        )
                    first = False
                    if message.get("msg") == "process_completed":
                        now = time.perf_counter()
                        if record and message.get("success"):
                            fn_s = message["output"]["data"][1]
                            if not isinstance(fn_s, (int, float)):
                                fn_s = message["output"]["duration"]
                            stats["completed"].append(
                                (now - t_start, now - arrived, fn_s)
                            )
                        elif record:
                            stats["errors"] += 1
                        return
        except asyncio.CancelledError:
            raise
        except Exception as err:
            if record:
                stats["errors"] += 1
                stats.setdefault("error_samples", [])
                if len(stats["error_samples"]) < 5:
                    stats["error_samples"].append(repr(err)[:200])

    visitor.count = 0
    submit_every = 1
    t_start = time.perf_counter()
    for _ in range(2):  # warm the model
        await visitor(record=False)

    # baseline: the same work with nobody else there
    solo = []
    for _ in range(5):
        before = len(stats["completed"])
        t_start = time.perf_counter()
        await visitor()
        solo.append(stats["completed"][before][2])
    idle_page = [ms for _, ms in stats["page_ms"]]
    for key in ("page_ms", "join_ms", "first_update_ms", "completed"):
        stats[key] = []

    submit_every = int(os.environ.get("SUBMIT_EVERY", "1"))
    tree = [
        psutil.Process(proc.pid),
        *psutil.Process(proc.pid).children(recursive=True),
    ]
    for p in tree:
        p.cpu_percent(None)
    tasks = []
    t_start = time.perf_counter()
    n = 0
    while True:
        elapsed = time.perf_counter() - t_start
        if elapsed >= SECONDS:
            break
        while n < elapsed * RATE:
            tasks.append(asyncio.create_task(visitor()))
            n += 1
        await asyncio.sleep(0.005)
    cpu = [round(p.cpu_percent(None)) for p in tree]
    rss = [round(p.memory_info().rss / 1e6) for p in tree]
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    await client.aclose()
    stop_app(proc)

    pages = [ms for _, ms in stats["page_ms"]]
    fn = [c[2] for c in stats["completed"]]
    buckets = {}
    for offset, ms in stats["page_ms"]:
        buckets.setdefault(int(offset // 10) * 10, []).append(ms)
    result = {
        "app": APP,
        "executor": EXECUTOR,
        "rate": RATE,
        "seconds": SECONDS,
        "visitors": n,
        "submit_every": submit_every,
        "pages_loaded": len(pages),
        "errors": stats["errors"],
        "error_samples": stats.get("error_samples", []),
        "idle_page_ms_p50": pct(idle_page, 0.5),
        "solo_fn_s_p50": pct(solo, 0.5),
        "page_ms": dist(pages),
        "page_over_1s": sum(ms > 1000 for ms in pages),
        "page_ms_p50_by_10s": {
            k: round(pct(v, 0.5)) for k, v in sorted(buckets.items())
        },
        "join_ms": dist(stats["join_ms"]),
        "first_update_ms": dist(stats["first_update_ms"]),
        "completed": len(fn),
        "throughput_per_min": len(fn) / SECONDS * 60,
        "fn_s": dist(fn),
        "cpu_percent": cpu,
        "rss_mb": rss,
    }
    print(json.dumps(result, indent=1))
    with open(OUT, "w") as f:
        json.dump(result, f, indent=1)


asyncio.run(main())
