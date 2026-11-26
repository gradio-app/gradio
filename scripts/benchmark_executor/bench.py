"""Benchmark executor="thread" vs "process" on app.py.

usage: bench.py <device> <steps> <out.json>
"""

import json
import os
import signal
import statistics as st
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request

import psutil
from gradio_client import Client

HERE = os.path.dirname(os.path.abspath(__file__))
DEVICE, STEPS, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
SEQ_N = int(os.environ.get("SEQ_N", "20"))
USERS = int(os.environ.get("USERS", "8"))
PER_USER = int(os.environ.get("PER_USER", "3"))
STARTUPS = int(os.environ.get("STARTUPS", "3"))
SUBJECTS = ["golden retriever", "tabby", "macaw", "volcano", "espresso"]


def get(url, timeout=60):
    start = time.perf_counter()
    with urllib.request.urlopen(url, timeout=timeout) as r:
        r.read()
        status = r.status
    return status, time.perf_counter() - start


def start_app(executor, port):
    env = {
        **os.environ,
        "GRADIO_EXECUTOR": executor,
        "BENCH_PORT": str(port),
        "BENCH_DEVICE": DEVICE,
        "HF_HUB_OFFLINE": os.environ.get("HF_HUB_OFFLINE", "1"),
        "GRADIO_ANALYTICS_ENABLED": "False",
        "PYTHONWARNINGS": "ignore",
    }
    env.pop("GRADIO_PROCESS_REPLICAS", None)
    log = open(
        os.path.join(tempfile.gettempdir(), f"bench_{executor}_{DEVICE}.log"), "ab"
    )
    t0 = time.perf_counter()
    proc = subprocess.Popen(
        [sys.executable, os.path.join(HERE, "app.py")],
        env=env,
        cwd=HERE,
        stdout=log,
        stderr=log,
        start_new_session=True,
    )
    url = f"http://127.0.0.1:{port}"
    while True:
        if proc.poll() is not None:
            raise RuntimeError(f"app exited, see {log.name}")
        try:
            if get(url + "/", timeout=2)[0] == 200:
                break
        except Exception:
            time.sleep(0.05)
        if time.perf_counter() - t0 > 300:
            raise RuntimeError("startup timeout")
    return proc, url, time.perf_counter() - t0


def tree(proc):
    try:
        parent = psutil.Process(proc.pid)
        return [parent, *parent.children(recursive=True)]
    except psutil.NoSuchProcess:
        return []


def stop_app(proc):
    procs = tree(proc)
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    _, alive = psutil.wait_procs(procs, timeout=10)
    for p in alive:
        p.kill()


def memory(proc):
    out = []
    for p in tree(proc):
        try:
            cmd = " ".join(p.cmdline())
            role = (
                "app"
                if p.pid == proc.pid
                else ("gateway" if "gradio.processing" in cmd else "other")
            )
            out.append(
                {"pid": p.pid, "role": role, "rss_mb": p.memory_info().rss / 1e6}
            )
        except psutil.Error:
            pass
    return out


def summary(values):
    values = sorted(values)
    q = lambda f: values[min(len(values) - 1, int(round(f * (len(values) - 1))))]
    return {
        "n": len(values),
        "mean": st.mean(values),
        "p50": q(0.5),
        "p95": q(0.95),
        "max": values[-1],
    }


def call(client, i):
    start = time.perf_counter()
    _, fn_s = client.predict(
        SUBJECTS[i % len(SUBJECTS)], STEPS, 4, i, api_name="/generate"
    )
    e2e = time.perf_counter() - start
    return e2e, fn_s


def run(executor, port):
    result = {"executor": executor}
    startups = []
    for i in range(STARTUPS):
        proc, url, startup = start_app(executor, port + i)
        startups.append(startup)
        if i < STARTUPS - 1:
            stop_app(proc)
            time.sleep(1)
    result["startup_s"] = startups

    client = Client(url, verbose=False)
    for i in range(3):
        call(client, i)
    result["processes"] = memory(proc)

    # 1. one user, back-to-back requests
    e2e, fn, over = [], [], []
    for i in range(SEQ_N):
        a, b = call(client, i)
        e2e.append(a), fn.append(b), over.append(a - b)
    result["sequential"] = {
        "e2e_s": summary(e2e),
        "fn_s": summary(fn),
        "overhead_ms": summary([o * 1000 for o in over]),
    }

    # 2. idle server probes (baseline for 3)
    def probes(n, path):
        return summary([get(url + path)[1] * 1000 for _ in range(n)])

    result["idle_probe_ms"] = {"page": probes(40, "/"), "config": probes(40, "/config")}

    # 3. many users at once, probing the server meanwhile
    clients = [Client(url, verbose=False) for _ in range(USERS)]
    lat, fns, lock = [], [], threading.Lock()
    done = threading.Event()
    page_ms, config_ms = [], []

    def user(c, k):
        for j in range(PER_USER):
            a, b = call(c, k * PER_USER + j)
            with lock:
                lat.append(a), fns.append(b)

    def prober():
        while not done.is_set():
            page_ms.append(get(url + "/")[1] * 1000)
            config_ms.append(get(url + "/config")[1] * 1000)
            time.sleep(0.05)

    probe_thread = threading.Thread(target=prober)
    threads = [
        threading.Thread(target=user, args=(c, k)) for k, c in enumerate(clients)
    ]
    cpu_procs = tree(proc)
    for p in cpu_procs:
        p.cpu_percent(None)
    t0 = time.perf_counter()
    probe_thread.start()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    wall = time.perf_counter() - t0
    done.set()
    probe_thread.join()
    cpu = []
    for p in cpu_procs:
        try:
            cpu.append({"pid": p.pid, "cpu_percent": p.cpu_percent(None)})
        except psutil.Error:
            pass
    result["concurrent"] = {
        "users": USERS,
        "requests": len(lat),
        "wall_s": wall,
        "throughput_rps": len(lat) / wall,
        "e2e_s": summary(lat),
        "fn_s": summary(fns),
        "probe_page_ms": summary(page_ms),
        "probe_config_ms": summary(config_ms),
        "cpu": cpu,
    }
    result["processes_after"] = memory(proc)
    stop_app(proc)
    return result


if __name__ == "__main__":
    results = []
    order = os.environ.get("ORDER", "thread,process").split(",")
    for n, executor in enumerate(order):
        results.append(run(executor, 7950 + 10 * n))
        print(json.dumps(results[-1], indent=1), flush=True)
        time.sleep(2)
    with open(OUT, "w") as f:
        json.dump({"device": DEVICE, "steps": STEPS, "results": results}, f, indent=1)
