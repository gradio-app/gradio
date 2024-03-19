from typing import Callable
import asyncio

def run_coro_in_background(func: Callable, *args, **kwargs):
    event_loop = asyncio.get_event_loop()
    return event_loop.create_task(func(*args, **kwargs))

async def test():
    print("running")
    while True:
        print(1)
        await asyncio.sleep(0.05)

run_coro_in_background(test)


while True:
    import time
    time.sleep(1)

