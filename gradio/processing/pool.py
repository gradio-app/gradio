"""One persistent subprocess per queued function; no autoscaling or telemetry."""

import asyncio
import atexit
import concurrent.futures
import functools
import inspect
import os
import secrets
import signal
import subprocess
import sys
import threading
import time
from multiprocessing.connection import Listener


class Worker:
    def __init__(self):
        self.process = None
        self.connection = None
        self.ready = False
        self.busy = False
        self.info = {}
        self.completed = 0

    def close(self):
        if self.process and self.process.poll() is None:
            if os.name == "posix":
                try:
                    os.killpg(self.process.pid, signal.SIGTERM)
                except ProcessLookupError:
                    pass
            else:
                self.process.terminate()
            try:
                self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait(timeout=3)
        if self.connection:
            self.connection.close()

    def start(self, path, environment):
        auth = secrets.token_bytes(32)
        with Listener(("127.0.0.1", 0), authkey=auth) as listener:
            listener._listener._socket.settimeout(1)
            env = dict(
                {**os.environ, **environment},
                GRADIO_PROCESS_WORKER="1",
                GRADIO_PROCESS_APP=path,
                GRADIO_PROCESS_PORT=str(listener.address[1]),
                GRADIO_PROCESS_AUTH=auth.hex(),
                TOKENIZERS_PARALLELISM="false",
            )
            self.process = subprocess.Popen(
                [sys.executable, "-m", "gradio.processing.worker"],
                env=env,
                start_new_session=True,
            )
            deadline = time.monotonic() + 600
            while time.monotonic() < deadline:
                if self.process.poll() is not None:
                    raise RuntimeError("Worker exited during initialization")
                try:
                    self.connection = listener.accept()
                    break
                except TimeoutError:
                    continue
            if self.connection is None:
                raise TimeoutError("Worker did not connect")
        while time.monotonic() < deadline:
            if self.connection.poll(0.25):
                kind, payload = self.connection.recv()
                if kind != "ready":
                    raise RuntimeError(payload)
                self.info = payload
                self.ready = True
                return
            if self.process.poll() is not None:
                raise RuntimeError("Worker exited during model initialization")
        raise TimeoutError("Resource initialization exceeded 10 minutes")


class Pool:
    def __init__(self, path, max_workers=1):
        if max_workers != 1:
            raise ValueError("The process executor supports exactly one worker")
        self.path = os.path.abspath(path)
        self.environment = {}
        self.max_workers = 1
        self.condition = threading.Condition(threading.RLock())
        self.workers = []
        self.pending = 0
        self.closed = False
        self.starting = False
        self.failure = None
        self.events = []
        atexit.register(self.close)

    def record(self, reason, **extra):
        if self.events and self.events[-1]["reason"] == reason:
            return
        self.events.append({"time": time.time(), "reason": reason, **extra})
        self.events = self.events[-100:]

    def status(self):
        with self.condition:
            return {
                "policy_version": "process-only",
                "pending": self.pending,
                "failure": self.failure,
                "starting": self.starting,
                "max_workers": self.max_workers,
                "events": list(self.events),
                "workers": [
                    {
                        **w.info,
                        "ready": w.ready,
                        "busy": w.busy,
                        "completed": w.completed,
                    }
                    for w in self.workers
                ],
            }

    def spawn(self):
        # Caller holds condition. Only one worker may initialize at a time.
        self.starting = True
        worker = Worker()
        self.workers.append(worker)
        self.record("Initializing replica", workers=len(self.workers))

        def initialize():
            try:
                worker.start(self.path, self.environment)
                with self.condition:
                    if self.closed:
                        worker.close()
                        return
                    self.record("Replica ready", pid=worker.process.pid)
            except Exception as exc:  # noqa: BLE001 -- isolate arbitrary worker/provider failures
                worker.close()
                with self.condition:
                    if worker in self.workers:
                        self.workers.remove(worker)
                    self.record("Replica initialization failed", error=str(exc))
                    if not self.workers:
                        self.failure = str(exc) or repr(exc)
            finally:
                with self.condition:
                    self.starting = False
                    self.condition.notify_all()

        threading.Thread(target=initialize, daemon=True).start()

    def run(self, index, args, kwargs, cancelled):
        worker = None
        success = False
        with self.condition:
            self.pending += 1
            if (
                not self.workers
                and not self.starting
                and not self.failure
                and not self.closed
            ):
                self.spawn()
            try:
                while worker is None:
                    if cancelled.is_set() or self.closed:
                        return
                    if self.failure:
                        raise RuntimeError(self.failure)
                    worker = next(
                        (w for w in self.workers if w.ready and not w.busy),
                        None,
                    )
                    if worker:
                        worker.busy = True
                    else:
                        self.condition.wait(0.2)
            finally:
                self.pending -= 1
        try:
            worker.connection.send((index, args, kwargs))
            while not cancelled.is_set():
                if not worker.connection.poll(0.2):
                    if worker.process.poll() is not None:
                        raise RuntimeError("Worker exited; request was not retried")
                    continue
                kind, value = worker.connection.recv()
                if kind == "output":
                    yield value
                elif kind == "done":
                    success = True
                    with self.condition:
                        worker.completed += 1
                        worker.info["resource_initializations"] = value[
                            "resource_initializations"
                        ]
                    return
                elif kind == "error":
                    # Treat arbitrary user failures conservatively; don't replay them.
                    raise RuntimeError(value)
        finally:
            with self.condition:
                worker.busy = False
                if not success:
                    worker.close()
                    if worker in self.workers:
                        self.workers.remove(worker)
                    if not self.workers and self.pending and not self.closed:
                        self.spawn()
                self.condition.notify_all()

    async def events_stream(self, index, args, kwargs):
        # One thread owns the entire generator. Scheduling each next() separately
        # can deadlock when waiting requests exhaust asyncio's executor threads.
        cancelled = threading.Event()
        loop = asyncio.get_running_loop()
        queue = asyncio.Queue(maxsize=8)

        def deliver(message):
            future = asyncio.run_coroutine_threadsafe(queue.put(message), loop)
            while not cancelled.is_set():
                try:
                    future.result(timeout=0.2)
                    return True
                except concurrent.futures.TimeoutError:
                    pass
            future.cancel()
            return False

        def pump():
            iterator = self.run(index, args, kwargs, cancelled)
            try:
                for item in iterator:
                    if not deliver(("output", item)):
                        break
            except Exception as exc:  # noqa: BLE001 -- isolate arbitrary worker/provider failures
                deliver(("error", exc))
            finally:
                iterator.close()
                deliver(("done", None))

        task = asyncio.create_task(asyncio.to_thread(pump))
        try:
            while True:
                kind, item = await queue.get()
                if kind == "done":
                    return
                if kind == "error":
                    raise item
                yield item
        finally:
            cancelled.set()
            import anyio

            with anyio.CancelScope(shield=True):
                await asyncio.shield(task)

    def wrap(self, fn, index):
        if inspect.isgeneratorfunction(fn) or inspect.isasyncgenfunction(fn):

            @functools.wraps(fn)
            async def stream(*args, **kwargs):
                async for item in self.events_stream(index, args, kwargs):
                    yield item

            return stream

        @functools.wraps(fn)
        async def call(*args, **kwargs):
            result = None
            async for item in self.events_stream(index, args, kwargs):
                result = item
            return result

        return call

    def close(self):
        with self.condition:
            self.closed = True
            for worker in self.workers:
                worker.close()
            self.condition.notify_all()
