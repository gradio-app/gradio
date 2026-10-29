"""Benchmark app.py over real HTTP/SSE: one process vs `replicas="auto"`.

For each configuration it starts app.py, makes 3 warm calls, then sends a
scale-up burst and, once any replica has finished starting, a steady burst,
each of N requests from 12 concurrent clients. It saves every request, the
serving PIDs and /gradio_api/processes snapshots.

    python benchmark.py --workload python --requests 12 --output python.json
"""

import argparse
import concurrent.futures
import json
import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

import requests

HERE = Path(__file__).parent
parser = argparse.ArgumentParser()
parser.add_argument("--workload", default="python")
parser.add_argument("--requests", type=int, default=12)
parser.add_argument("--configs", default="1,auto")
parser.add_argument("--port", type=int, default=7869)
parser.add_argument("--output", required=True)
args = parser.parse_args()
URL = f"http://127.0.0.1:{args.port}"


def call(_=None):
    start = time.monotonic()
    r = requests.post(
        URL + "/gradio_api/call/predict",
        json={"data": ["Explain why the sky is blue in a few sentences."]},
        timeout=60,
    )
    r.raise_for_status()
    last, event = None, None
    with requests.get(
        URL + "/gradio_api/call/predict/" + r.json()["event_id"],
        stream=True,
        timeout=900,
    ) as stream:
        for line in stream.iter_lines(decode_unicode=True):
            if line.startswith("event: "):
                event = line[7:]
            if line.startswith("data: "):
                payload = json.loads(line[6:])
                if event == "error":
                    raise RuntimeError(payload)
                if event in ("generating", "complete"):
                    last = payload
                if event == "complete":
                    break
    if not last or last[0].get("phase") != "complete":
        raise RuntimeError("Missing prediction output")
    return {"latency": time.monotonic() - start, "output": last[0]}


def status():
    return requests.get(URL + "/gradio_api/processes", timeout=10).json()


def burst():
    stop = threading.Event()
    snapshots = []

    def monitor():
        while not stop.is_set():
            try:
                snapshots.append({"time": time.time(), **status()})
            except requests.RequestException as e:
                snapshots.append({"error": str(e)})
            stop.wait(0.5)

    thread = threading.Thread(target=monitor)
    thread.start()
    started = time.monotonic()
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
            results = list(executor.map(call, range(args.requests)))
    finally:
        stop.set()
        thread.join()
    return {
        "seconds": time.monotonic() - started,
        "results": results,
        "serving_pids": sorted({r["output"]["pid"] for r in results}),
        "max_workers": max((len(s.get("processes", [])) for s in snapshots), default=0),
        "snapshots": snapshots,
    }


def run(replicas):
    env = {
        **os.environ,
        "AUTOSCALE_WORKLOAD": args.workload,
        "GRADIO_PROCESS_REPLICAS": replicas,
        "PORT": str(args.port),
        "GRADIO_ANALYTICS_ENABLED": "False",
    }
    t0 = time.monotonic()
    app = subprocess.Popen(
        [sys.executable, str(HERE / "app.py")], env=env, start_new_session=True
    )
    try:
        while True:
            if app.poll() is not None:
                raise RuntimeError("app.py exited during startup")
            try:
                status()
                break
            except requests.RequestException:
                time.sleep(0.25)
        startup = time.monotonic() - t0
        warm = [call()["latency"] for _ in range(3)]
        scale_up = burst()
        while status()["starting"]:
            time.sleep(1)
        steady = burst()
        return {
            "replicas": replicas,
            "startup_seconds": startup,
            "warm": warm,
            "scale_up": scale_up,
            "steady": steady,
            "final_status": status(),
        }
    finally:
        try:
            os.killpg(app.pid, signal.SIGTERM)
            app.wait(timeout=30)
        except (ProcessLookupError, PermissionError, subprocess.TimeoutExpired):
            pass
        time.sleep(3)


report = {"workload": args.workload, "requests": args.requests, "runs": []}
for replicas in args.configs.split(","):
    result = run(replicas)
    report["runs"].append(result)
    Path(args.output).write_text(json.dumps(report, indent=2))
    print(
        json.dumps(
            {
                "workload": args.workload,
                "replicas": replicas,
                "scale_up_seconds": round(result["scale_up"]["seconds"], 2),
                "steady_seconds": round(result["steady"]["seconds"], 2),
                "max_workers": result["steady"]["max_workers"],
                "serving_pids": len(result["steady"]["serving_pids"]),
            }
        ),
        flush=True,
    )
