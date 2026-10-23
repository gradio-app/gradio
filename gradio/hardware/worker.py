"""Private worker entrypoint. User stdout/stderr are never the IPC transport."""

import asyncio
import ctypes
import inspect
import json
import os
import runpy
import sys
import time
import traceback
from multiprocessing.connection import Client


def main():
    connection = Client(
        ("127.0.0.1", int(os.environ["GRADIO_HARDWARE_PORT"])),
        authkey=bytes.fromhex(os.environ["GRADIO_HARDWARE_AUTH"]),
    )
    try:
        path = os.environ["GRADIO_HARDWARE_APP"]
        sys.path.insert(0, os.path.dirname(path))
        sys.argv = [path, *json.loads(os.environ.get("GRADIO_HARDWARE_APP_ARGS", "[]"))]
        namespace = runpy.run_path(path, run_name="__main__")
        from gradio.server import Server

        apps = {
            id(value): value
            for value in namespace.values()
            if isinstance(value, Server)
        }
        if len(apps) != 1:
            raise RuntimeError(
                "Hardware preview currently requires exactly one gr.App/gr.Server in the app module."
            )
        app = next(iter(apps.values()))
        native = (
            ctypes.CDLL(os.environ["GRADIO_METAL_LIBRARY"])
            if os.environ.get("GRADIO_METAL_LIBRARY")
            else None
        )
        if native:
            native.gradio_metal_submissions.restype = ctypes.c_ulonglong
            native.gradio_metal_allocated.restype = ctypes.c_ulonglong
        while True:
            index, args, kwargs = connection.recv()
            start = time.monotonic()
            before = native.gradio_metal_submissions() if native else 0
            count = 0
            try:
                fn = app._deferred_apis[index][0]
                result = fn(*args, **kwargs)
                if inspect.isawaitable(result):
                    result = asyncio.run(result)
                if inspect.isasyncgen(result):

                    async def consume():
                        nonlocal count
                        async for item in result:
                            connection.send(("output", item))
                            count += 1

                    asyncio.run(consume())
                elif inspect.isgenerator(result):
                    for item in result:
                        connection.send(("output", item))
                        count += 1
                else:
                    connection.send(("output", result))
                    count += 1
                if native:
                    native.gradio_metal_drain()
                connection.send(
                    (
                        "done",
                        {
                            "execution_seconds": time.monotonic() - start,
                            "output_chunks": count,
                            "metal_submissions": native.gradio_metal_submissions()
                            - before
                            if native
                            else 0,
                            "metal_allocated_bytes": native.gradio_metal_allocated()
                            if native
                            else None,
                            "worker_pid": os.getpid(),
                            "telemetry_scope": "This worker only; native subprocesses report separately on stderr.",
                        },
                    )
                )
            except Exception:  # noqa: BLE001 - propagate arbitrary user failures over IPC
                connection.send(("error", traceback.format_exc()))
    except (EOFError, BrokenPipeError):
        pass
    except Exception:  # noqa: BLE001 - propagate arbitrary user failures over IPC
        try:
            connection.send(("error", traceback.format_exc()))
        except (EOFError, BrokenPipeError):
            pass
    finally:
        connection.close()


if __name__ == "__main__":
    main()
