import asyncio
import os
import time

import pytest

from gradio.processing.pool import Pool


@pytest.fixture
def pool(tmp_path):
    path = tmp_path / "app.py"
    path.write_text("""import os,time
import gradio as gr
app=gr.App()
@app.resource()
def model(): return []
@app.queue()
def predict(delay=0.1):
    values=model();values.append(1)
    time.sleep(delay)
    yield {"pid":os.getpid(),"count":len(values)}
if __name__=='__main__':app.launch()
""")
    pool = Pool(str(path))
    yield pool
    pool.close()


async def call(pool, delay=0.1):
    return [x async for x in pool.events_stream(0, (delay,), {})][-1]


@pytest.mark.asyncio
async def test_explicit_one(pool):
    pool.max_workers = 1
    results = await asyncio.gather(*(call(pool, 0.1) for _ in range(8)))
    assert len({x["pid"] for x in results}) == 1
    assert pool.status()["workers"][0]["resource_initializations"] == [1]


@pytest.mark.asyncio
async def test_cancel_and_recover(pool):
    await call(pool)
    task = asyncio.create_task(call(pool, 30))
    await asyncio.sleep(0.3)
    start = time.monotonic()
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert time.monotonic() - start < 5
    assert not pool.workers
    assert (await call(pool))["count"] == 1


@pytest.mark.asyncio
async def test_high_concurrency_does_not_starve_stream_readers(pool):
    pool.max_workers = 1
    results = await asyncio.wait_for(
        asyncio.gather(*(call(pool, 0.01) for _ in range(64))), timeout=20
    )
    assert len(results) == 64
    assert len({x["pid"] for x in results}) == 1


@pytest.mark.asyncio
async def test_startup_exit_surfaces_error(tmp_path):
    path = tmp_path / "bad.py"
    path.write_text("""import gradio as gr
app=gr.App()
@app.resource()
def model(): raise SystemExit(1)
@app.queue()
def predict(): return 1
""")
    pool = Pool(str(path))
    try:
        with pytest.raises(RuntimeError):
            await asyncio.wait_for(call(pool), timeout=10)
    finally:
        pool.close()


@pytest.mark.parametrize(
    "body",
    [
        "def predict(value): return value + 1",
        "async def predict(value): return value + 1",
        "async def predict(value):\n    yield value\n    yield value + 1",
    ],
)
@pytest.mark.asyncio
async def test_function_kinds(tmp_path, body):
    path = tmp_path / "kinds.py"
    path.write_text("import gradio as gr\napp=gr.App()\n@app.queue()\n" + body)
    pool = Pool(str(path), max_workers=1)
    try:
        result = [x async for x in pool.events_stream(0, (41,), {})]
        assert result[-1] == 42
    finally:
        pool.close()


@pytest.mark.asyncio
async def test_endpoints_have_distinct_persistent_processes(tmp_path):
    import runpy

    path = tmp_path / "separate.py"
    path.write_text("""import os
import gradio as gr
app=gr.App()
@app.resource()
def model(): return []
@app.queue()
def first():
    model().append(1)
    return (os.getpid(), len(model()))
@app.queue()
def second():
    model().append(1)
    return (os.getpid(), len(model()))
""")
    app = runpy.run_path(str(path))["app"]

    async def invoke(index):
        return [
            x async for x in app._process_pools[index].events_stream(index, (), {})
        ][-1]

    try:
        first, second = await asyncio.gather(invoke(0), invoke(1))
        assert first[0] != second[0]
        assert first[0] != os.getpid()
        assert first[1] == second[1] == 1
        assert await invoke(0) == (first[0], 2)
        assert await invoke(1) == (second[0], 2)
    finally:
        for pool in app._process_pools.values():
            pool.close()


@pytest.mark.asyncio
async def test_unpickleable_result_surfaces_error_and_recovers(tmp_path):
    path = tmp_path / "bad_result.py"
    path.write_text("""import gradio as gr
app=gr.App()
@app.queue()
def predict(bad): return (lambda: 1) if bad else 42
""")
    pool = Pool(str(path))
    try:
        with pytest.raises(RuntimeError, match="local object"):
            _ = [x async for x in pool.events_stream(0, (True,), {})]
        assert [x async for x in pool.events_stream(0, (False,), {})] == [42]
    finally:
        pool.close()


def test_reject_scaling_and_async_resources():
    import gradio as gr

    app = gr.App()
    with pytest.raises(ValueError):
        app.queue(workers="auto")
    with pytest.raises(ValueError):

        @app.resource()
        async def model():
            return 1


def test_http_queue_and_worker_shutdown(tmp_path):
    import runpy

    from gradio_client import Client

    import gradio as gr

    path = tmp_path / "http_app.py"
    path.write_text("""import os
import gradio as gr
app = gr.App()
@app.queue()
def pid(value: str) -> str:
    return str(os.getpid()) + ':' + value
""")
    server = runpy.run_path(str(path))["app"]
    _, url, _ = server.launch(prevent_thread_lock=True, ssr_mode=False)
    pool = server._process_pools[0]
    try:
        client = Client(url)
        try:
            result = client.predict("hello", api_name="/pid")
            assert result.endswith(":hello")
            assert int(result.split(":")[0]) != os.getpid()
            assert client.predict("hello", api_name="/pid") == result
        finally:
            client.close()
        process = pool.workers[0].process
    finally:
        gr.close_all()
    assert pool.closed
    assert process.poll() is not None
