"""The "model" that ml_gradio.py and ml_fastapi.py call: about 1 s of work per call.

BENCH_WORK=cpu: pure-Python compute that holds the GIL, like CPU inference or
pre/post-processing in Python. The harness measures BENCH_WORK_ITERS once and
passes the same number to every arm, so each call is the same amount of work.

BENCH_WORK=gpu: waits BENCH_WORK_S seconds without holding the GIL, like a GPU
kernel or a call to a remote model.
"""

import os
import time

WORK = os.environ.get("BENCH_WORK", "cpu")
WORK_S = float(os.environ.get("BENCH_WORK_S", "1"))
WORK_ITERS = int(os.environ.get("BENCH_WORK_ITERS", "0"))


def spin(n: int) -> int:
    x = 0
    for i in range(n):
        x += i * i
    return x


def work():
    if WORK == "cpu":
        spin(WORK_ITERS)
    else:
        time.sleep(WORK_S)
