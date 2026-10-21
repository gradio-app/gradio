"""Persistent, authenticated local workers for experimental hardware preview."""

import asyncio
import atexit
import functools
import inspect
import os
import secrets
import signal
import subprocess
import sys
import threading
import time
from dataclasses import asdict
from multiprocessing.connection import Listener

from gradio.hardware.native import build, calibrate
from gradio.hardware.profiles import choices, resolve


class Executor:
    def __init__(self, path: str, profile: str = "host"):
        self.path = os.path.abspath(path)
        self.profile = resolve(profile)
        self.lock = threading.Lock()
        self.state_lock = threading.Lock()
        self.local_jobs = 0
        self.process = None
        self.connection = None
        self.last_run = None
        self.active = False
        self.host = None
        atexit.register(self.close)

    def status(self):
        return {
            "profile": asdict(self.profile),
            "profiles": choices(),
            "active": self.active,
            "host_calibration": self.host,
            "last_run": self.last_run,
            "experimental": True,
            "mechanism": "Metal submission pacing; selected buffer allocation checks. Not physical bandwidth partitioning.",
        }

    def select(self, name):
        profile = resolve(name)
        if not self.lock.acquire(blocking=False):
            raise RuntimeError(
                "Wait for the active job to finish before changing hardware."
            )
        try:
            with self.state_lock:
                if self.local_jobs:
                    raise RuntimeError(
                        "Wait for the active job to finish before changing hardware."
                    )
            if profile != self.profile:
                if profile.id != "host":
                    build()  # Fail before changing configuration on unsupported hosts.
                    if self.host is None:
                        self.host = calibrate()
                self.close()
                with self.state_lock:
                    self.profile = profile
                    self.last_run = None
        finally:
            self.lock.release()

    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None
        if self.process:
            if self.process.poll() is None:
                try:
                    os.killpg(self.process.pid, signal.SIGTERM)
                    self.process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    os.killpg(self.process.pid, signal.SIGKILL)
                    self.process.wait(timeout=3)
                except ProcessLookupError:
                    pass
            self.process = None

    def start(self, cancelled=None):
        if self.process and self.process.poll() is None:
            return
        self.close()
        if self.profile.id != "host" and self.host is None:
            self.host = calibrate()
        auth = secrets.token_bytes(32)
        with Listener(("127.0.0.1", 0), authkey=auth) as listener:
            listener._listener._socket.settimeout(1)  # ty: ignore[unresolved-attribute] - multiprocessing exposes no public accept timeout
            env = dict(os.environ)
            env.update(
                GRADIO_HARDWARE_WORKER="1",
                GRADIO_HARDWARE=self.profile.id,
                GRADIO_HARDWARE_APP=self.path,
                GRADIO_HARDWARE_AUTH=auth.hex(),
                GRADIO_HARDWARE_PORT=str(listener.address[1]),
            )
            if self.profile.id != "host":
                library = str(build())
                env["DYLD_INSERT_LIBRARIES"] = library + (
                    ":" + env["DYLD_INSERT_LIBRARIES"]
                    if env.get("DYLD_INSERT_LIBRARIES")
                    else ""
                )
                env["GRADIO_METAL_LIBRARY"] = library
                env["GRADIO_METAL_RATE"] = str(self.profile.rate)
                if self.profile.buffer_budget_gb:
                    env["GRADIO_METAL_MEMORY_BYTES"] = str(
                        int(self.profile.buffer_budget_gb * 1024**3)
                    )
            self.process = subprocess.Popen(
                [sys.executable, "-m", "gradio.hardware.worker"],
                env=env,
                start_new_session=True,
            )
            deadline = time.monotonic() + 60
            while True:
                if cancelled is not None and cancelled.is_set():
                    self.close()
                    raise RuntimeError("Hardware job cancelled")
                try:
                    self.connection = listener.accept()
                    break
                except TimeoutError:
                    if self.process.poll() is not None or time.monotonic() > deadline:
                        self.close()
                        raise RuntimeError(
                            "Hardware worker failed to start; see its stderr output."
                        ) from None

    def run(self, index, args, kwargs, cancelled=None):
        with self.lock:
            self.active = True
            complete = False
            started = time.monotonic()
            try:
                if cancelled is not None and cancelled.is_set():
                    return
                self.start(cancelled)
                connection, process = self.connection, self.process
                if connection is None or process is None:
                    raise RuntimeError("Hardware worker did not connect")
                connection.send((index, args, kwargs))
                while True:
                    if cancelled is not None and cancelled.is_set():
                        return
                    if not connection.poll(0.2):
                        if process.poll() is not None:
                            raise RuntimeError(
                                "Hardware worker exited, possibly after a rejected Metal allocation. See worker stderr."
                            )
                        continue
                    kind, value = connection.recv()
                    if kind == "output":
                        yield value
                    elif kind == "done":
                        self.last_run = {
                            **value,
                            "wall_seconds": time.monotonic() - started,
                        }
                        complete = True
                        break
                    elif kind == "error":
                        complete = True
                        raise RuntimeError(value)
            except (EOFError, BrokenPipeError, ConnectionError) as error:
                raise RuntimeError(
                    "Hardware worker disconnected; it will restart for the next job."
                ) from error
            finally:
                self.active = False
                if not complete:
                    self.close()

    def begin_local(self):
        with self.state_lock:
            # select() holds the worker lock while switching/rebuilding.
            if self.lock.locked() or self.profile.id != "host":
                return False
            self.local_jobs += 1
            self.active = True
            return True

    def end_local(self):
        with self.state_lock:
            self.local_jobs -= 1
            self.active = self.local_jobs > 0

    async def events(self, index, args, kwargs):
        """Async cancellation stops native work, then joins the IPC reader."""
        cancelled = threading.Event()
        iterator = self.run(index, args, kwargs, cancelled)
        sentinel = object()
        task = None
        try:
            while True:
                task = asyncio.create_task(asyncio.to_thread(next, iterator, sentinel))
                value = await asyncio.shield(task)
                if value is sentinel:
                    break
                yield value
        finally:
            cancelled.set()
            if task is not None and not task.done():
                # Reader polls the cancellation event; it owns process teardown.
                import anyio

                with anyio.CancelScope(shield=True):
                    try:
                        await task
                    except (RuntimeError, OSError):
                        pass
            iterator.close()

    def wrap(self, fn, index):
        if inspect.isgeneratorfunction(fn) or inspect.isasyncgenfunction(fn):

            @functools.wraps(fn)
            async def stream(*args, **kwargs):
                if self.begin_local():
                    try:
                        if inspect.isasyncgenfunction(fn):
                            async for value in fn(*args, **kwargs):
                                yield value
                        else:
                            import anyio

                            iterator = fn(*args, **kwargs)
                            sentinel = object()
                            try:
                                while True:
                                    value = await anyio.to_thread.run_sync(
                                        lambda: next(iterator, sentinel)
                                    )
                                    if value is sentinel:
                                        break
                                    yield value
                            finally:
                                iterator.close()
                    finally:
                        self.end_local()
                    return
                async for value in self.events(index, args, kwargs):
                    yield value

            return stream

        @functools.wraps(fn)
        async def predict(*args, **kwargs):
            if self.begin_local():
                try:
                    if inspect.iscoroutinefunction(fn):
                        return await fn(*args, **kwargs)
                    import anyio

                    return await anyio.to_thread.run_sync(
                        functools.partial(fn, *args, **kwargs)
                    )
                finally:
                    self.end_local()
            result = None
            async for value in self.events(index, args, kwargs):
                result = value
            return result

        return predict
