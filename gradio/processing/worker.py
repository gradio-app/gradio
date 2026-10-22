"""Trusted same-user subprocess; only the authenticated socket carries results."""

import asyncio
import inspect
import os
import runpy
import sys
import time
import traceback
from multiprocessing.connection import Client


def main():
    connection = Client(
        ("127.0.0.1", int(os.environ["GRADIO_PROCESS_PORT"])),
        authkey=bytes.fromhex(os.environ["GRADIO_PROCESS_AUTH"]),
    )
    try:
        path = os.environ["GRADIO_PROCESS_APP"]
        sys.path.insert(0, os.path.dirname(path))
        sys.argv = [path]
        namespace = runpy.run_path(path, run_name="__main__")
        from gradio.server import Server

        apps = {id(x): x for x in namespace.values() if isinstance(x, Server)}
        if len(apps) != 1:
            raise RuntimeError(
                "Process queue requires exactly one App/Server in the module"
            )
        app = next(iter(apps.values()))
        started = time.monotonic()
        for resource in app._process_resources:
            resource()
        connection.send(
            (
                "ready",
                {
                    "pid": os.getpid(),
                    "load_seconds": time.monotonic() - started,
                    "resource_initializations": [
                        r.initializations for r in app._process_resources
                    ],
                },
            )
        )
        while True:
            index, args, kwargs = connection.recv()
            started = time.monotonic()
            try:
                result = app._process_functions[index](*args, **kwargs)
                if inspect.isawaitable(result):
                    result = asyncio.run(result)
                if inspect.isasyncgen(result):

                    async def consume():
                        async for item in result:
                            connection.send(("output", item))

                    asyncio.run(consume())
                elif inspect.isgenerator(result):
                    for item in result:
                        connection.send(("output", item))
                else:
                    connection.send(("output", result))
                connection.send(
                    (
                        "done",
                        {
                            "seconds": time.monotonic() - started,
                            "resource_initializations": [
                                r.initializations for r in app._process_resources
                            ],
                        },
                    )
                )
            except Exception:  # noqa: BLE001 -- propagate arbitrary user failures across IPC
                connection.send(("error", traceback.format_exc()))
    except (EOFError, BrokenPipeError):
        pass
    except Exception:  # noqa: BLE001 -- propagate arbitrary user failures across IPC
        try:
            connection.send(("error", traceback.format_exc()))
        except (EOFError, BrokenPipeError):
            pass
    finally:
        connection.close()


if __name__ == "__main__":
    main()
