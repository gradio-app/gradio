"""Launches one benchmark app and prints startup timestamps.

    python run.py {simple_gradio,many_tabs,simple_fastapi}

Prints one line `BENCH_STARTUP {...}` with wall-clock timestamps for: process
start (BENCH_T0, set by the caller just before spawning, so it includes
interpreter startup), framework imported, app built, and server listening.
SSR is controlled the same way users control it: GRADIO_SSR_MODE, or nothing.
"""

import importlib
import json
import os
import sys
import threading
import time

T0 = float(os.environ.get("BENCH_T0", time.time()))
APP = sys.argv[1]
HOST = os.environ.get("BENCH_HOST", "127.0.0.1")
PORT = int(os.environ.get("BENCH_PORT", "7860"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def report(**stamps):
    print("BENCH_STARTUP " + json.dumps({"t0": T0, **stamps}), flush=True)


if APP == "simple_fastapi":
    import fastapi  # noqa: F401
    import uvicorn

    t_import = time.time()
    app = importlib.import_module(APP).app
    t_build = time.time()
    server = uvicorn.Server(
        uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    )
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    while not server.started:
        time.sleep(0.001)
    report(t_import=t_import, t_build=t_build, t_launch=time.time())
    thread.join()
else:
    import gradio as gr

    t_import = time.time()
    demo = importlib.import_module(APP).demo
    t_build = time.time()
    demo.launch(server_name=HOST, server_port=PORT, prevent_thread_lock=True)
    report(
        t_import=t_import,
        t_build=t_build,
        t_launch=time.time(),
        ssr=bool(demo.ssr_mode),
        gradio=gr.__version__,
    )
    demo.block_thread()
