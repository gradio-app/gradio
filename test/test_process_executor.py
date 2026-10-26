"""`launch(executor="process")`: a gateway process serves HTTP while this
process, which built the app, runs its events."""

import json
import os
import threading
import time
from contextlib import contextmanager

import httpx2
import pytest
from gradio_client import Client

import gradio as gr
from gradio.client_state import app_fingerprint

COUNTER = {"n": 0}


@contextmanager
def launched(demo, **kwargs):
    _, local_url, _ = demo.launch(
        executor="process", prevent_thread_lock=True, **kwargs
    )
    try:
        yield Client(local_url, verbose=False)
    finally:
        demo.close()


def test_events_run_in_the_launching_process():
    demo = gr.Interface(
        lambda x: f"{x} {os.getpid()}", "textbox", "textbox", api_name="predict"
    )
    with launched(demo) as client:
        assert client.predict("hi", api_name="/predict") == f"hi {os.getpid()}"
        gateway = demo._process_worker.gateway  # type: ignore[union-attr]
        assert gateway.pid != os.getpid()
        assert gateway.poll() is None
    gateway.wait(timeout=10)


def test_state_globals_and_closures_behave_as_with_threads():
    lock = threading.Lock()  # a closure over a live object that cannot be pickled

    with gr.Blocks() as demo:
        history = gr.State([])
        item = gr.Textbox()
        count = gr.Number()
        out = gr.Textbox()

        def add(x, h):
            h.append(x)  # changed in place, not returned
            return len(h)

        def bump():
            with lock:
                COUNTER["n"] += 1
                return COUNTER["n"]

        gr.Button().click(add, [item, history], count, api_name="add")
        gr.Button().click(lambda h: ",".join(h), history, out, api_name="show")
        gr.Button().click(bump, None, count, api_name="bump")

    COUNTER["n"] = 0
    with launched(demo) as a:
        b = Client(a.src, verbose=False)
        assert a.predict("x", api_name="/add") == 1
        assert a.predict("y", api_name="/add") == 2
        assert a.predict(api_name="/show") == "x,y"
        assert b.predict(api_name="/show") == ""
        assert a.predict(api_name="/bump") == 1
        assert b.predict(api_name="/bump") == 2
    assert COUNTER["n"] == 2


def test_streaming_logs_progress_and_errors():
    def chat(message, progress=gr.Progress()):
        gr.Info("starting")
        out = ""
        for i, word in enumerate(message.split()):
            progress((i, 2), desc="words")
            out += word
            yield out

    async def count(n):
        for i in range(int(n)):
            yield str(i)

    def fail(x):
        raise gr.Error(f"bad input: {x}")

    with gr.Blocks() as demo:
        t = gr.Textbox()
        o = gr.Textbox()
        gr.Button().click(chat, t, o, api_name="chat")
        gr.Button().click(count, t, o, api_name="count")
        gr.Button().click(fail, t, o, api_name="fail")

    with launched(demo) as client:
        job = client.submit("a b", api_name="/chat")
        assert job.result() == "ab"
        assert job.outputs() == ["a", "ab"]
        job = client.submit("3", api_name="/count")
        assert job.result() == "2"
        assert job.outputs() == ["0", "1", "2"]
        with pytest.raises(Exception, match="bad input: z"):
            client.predict("z", api_name="/fail")
        # A user error leaves the app serving
        assert client.predict("c d", api_name="/chat") == "cd"


def test_event_concurrency_settings_reach_the_gateway():
    running = []
    peak = []
    lock = threading.Lock()

    def slow(x):
        with lock:
            running.append(x)
            peak.append(len(running))
        time.sleep(0.5)
        with lock:
            running.remove(x)
        return x

    with gr.Blocks() as demo:
        t = gr.Textbox()
        # The app-wide default (1) would run these one at a time
        gr.Button().click(slow, t, t, api_name="slow", concurrency_limit=3)

    with launched(demo) as client:
        jobs = [client.submit(str(i), api_name="/slow") for i in range(3)]
        assert sorted(job.result() for job in jobs) == ["0", "1", "2"]
    assert max(peak) == 3


def test_cancelled_generator_is_closed_in_the_app_process():
    closed = threading.Event()

    def slow(x):
        try:
            for i in range(200):
                time.sleep(0.02)
                yield str(i)
        finally:
            closed.set()

    with gr.Blocks() as demo:
        t = gr.Textbox()
        gr.Button().click(slow, t, t, api_name="slow")

    with launched(demo) as client:
        job = client.submit("x", api_name="/slow")
        while not job.outputs():
            time.sleep(0.02)
        job.cancel()
        assert closed.wait(10)


def test_gateway_keeps_component_and_event_ids():
    with gr.Blocks() as demo:
        gr.Markdown("spacer")
        state = gr.State([])
        t = gr.Textbox()
        gr.Button().click(lambda s: s, state, t)
    config = demo.get_config_file()
    for component in config["components"]:
        if component["props"].get("name") == "state":
            component["props"].pop("delete_callback", None)
    rebuilt = gr.Blocks.from_config(
        config, [lambda s: s], "http://127.0.0.1", preserve_ids=True
    )
    assert sorted(rebuilt.blocks) == sorted(demo.blocks)
    assert sorted(rebuilt.fns) == sorted(demo.fns)
    assert app_fingerprint(rebuilt) == app_fingerprint(demo)


def test_gateway_config_keeps_listener_props_and_local_files():
    with gr.Blocks() as demo:
        t = gr.Textbox()
        o = gr.Textbox()
        gr.Button().click(lambda x: x, t, o, show_progress_on=[o]).failure(
            lambda: "failed", None, o
        )
        chatbot = gr.Chatbot()
        chatbot.like(lambda: None)
        chatbot.undo(lambda: None)
        chatbot.retry(lambda: None)
        image = gr.Image(value=gr.get_image("cheetah.jpg"))
        gr.Examples([[gr.get_image("bus.png")]], [image])
    with launched(demo) as client:
        config = httpx2.get(f"{client.src}config").json()
    props = {c["id"]: c["props"] for c in config["components"]}
    assert props[chatbot._id]["_undoable"] is True
    assert props[chatbot._id]["_retryable"] is True
    assert props[chatbot._id]["likeable"] is True
    deps = config["dependencies"]
    assert [d["show_progress_on"] for d in deps if d["show_progress_on"]] == [[o._id]]
    assert any(d["trigger_only_on_failure"] for d in deps)
    # Files are served by the gateway itself, not through a proxy URL
    assert "proxy=" not in json.dumps(config)


def test_validator_runs_in_the_app_process():
    def validate(x):
        return gr.validate(x != "bad", f"bad input {os.getpid()}")

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(lambda x: x, t, t, validator=validate, api_name="echo")
    with launched(demo) as client:
        assert client.predict("ok", api_name="/echo") == "ok"
        with pytest.raises(Exception, match=f"bad input {os.getpid()}"):
            client.predict("bad", api_name="/echo")


def test_static_paths_are_served_by_the_gateway(tmp_path, monkeypatch):
    from gradio.data_classes import _StaticFiles

    monkeypatch.setattr(_StaticFiles, "all_paths", [])
    static = tmp_path / "logo.txt"
    static.write_text("hello")
    gr.set_static_paths([tmp_path])
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    with launched(demo) as client:
        response = httpx2.get(f"{client.src}gradio_api/file={static}")
    assert response.status_code == 200
    assert response.text == "hello"


def test_examples_are_cached_before_the_gateway_serves(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_EXAMPLES_CACHE", str(tmp_path))
    calls = []

    def fn(x):
        calls.append(x)
        return x

    with gr.Blocks() as demo:
        t = gr.Textbox()
        o = gr.Textbox()
        gr.Examples([["a"], ["b"]], t, o, fn, cache_examples=True)
    with launched(demo):
        assert calls == ["a", "b"]


def test_running_event_and_server_are_visible_to_the_app():
    # What ZeroGPU reads while an event runs: the event in the queue's active
    # jobs, to see if its client left, and the server's port
    from gradio.context import LocalContext

    def fn():
        blocks = LocalContext.blocks.get()
        assert blocks is not None and blocks.server is not None
        event_id = LocalContext.event_id.get()
        events = [e for job in blocks._queue.active_jobs for e in job or []]
        alive = [e.alive for e in events if e._id == event_id]
        return f"{alive} {isinstance(blocks.server.config.port, int)}"

    with gr.Blocks() as demo:
        t = gr.Textbox()
        gr.Button().click(fn, None, t, api_name="fn")
    with launched(demo) as client:
        assert client.predict(api_name="/fn") == "[True] True"


def test_oauth_login_reaches_the_app_process():
    pytest.importorskip("authlib")

    def whoami(profile: gr.OAuthProfile | None) -> str:
        return profile.username if profile else "nobody"

    with gr.Blocks() as demo:
        gr.LoginButton()
        out = gr.Textbox()
        gr.Button().click(whoami, None, out, api_name="whoami")
    _, url, _ = demo.launch(executor="process", prevent_thread_lock=True)
    try:
        with httpx2.Client(base_url=url) as http:
            # Locally, the login is mocked: the session holds a fake profile.
            # Its cookie is Secure, which browsers send to localhost and
            # httpx does not, so it is sent by hand.
            login = http.get("login/callback", params={"_target_url": "/"})
            cookie = {"cookie": f"session={login.cookies['session']}"}
            event = http.post(
                "gradio_api/call/whoami", json={"data": []}, headers=cookie
            ).json()
            result = http.get(
                f"gradio_api/call/whoami/{event['event_id']}", headers=cookie
            ).text
        assert "nobody" not in result
        assert "event: complete" in result
    finally:
        demo.close()


def test_forwarded_routes_see_the_gateway_login(tmp_path):
    (tmp_path / "a.txt").write_text("a")
    with gr.Blocks() as demo:
        explorer = gr.FileExplorer(root_dir=str(tmp_path))
    _, url, _ = demo.launch(
        executor="process", prevent_thread_lock=True, auth=("u", "p")
    )
    try:
        with httpx2.Client(base_url=url) as http:
            assert http.post(
                "login", data={"username": "u", "password": "p"}
            ).is_success
            response = http.post(
                "gradio_api/component_server",
                json={
                    "data": None,
                    "fn_name": "ls",
                    "session_hash": "s",
                    "component_id": explorer._id,
                },
            )
        assert response.status_code == 200, response.text
        assert "a.txt" in response.text
    finally:
        demo.close()


def test_server_routes_come_before_gradio_routes():
    app = gr.Server()

    @app.get("/")
    def root():
        return {"message": "Hello World"}

    _, url, _ = app.launch(executor="process", prevent_thread_lock=True)
    try:
        assert httpx2.get(url).json() == {"message": "Hello World"}
    finally:
        app.get_blocks().close()


def test_server_websockets_are_relayed():
    pytest.importorskip("websockets")
    from fastapi import WebSocket
    from websockets.exceptions import InvalidStatus
    from websockets.sync.client import connect

    app = gr.Server()

    @app.websocket("/ws")
    async def ws(websocket: WebSocket):
        await websocket.accept()
        text = await websocket.receive_text()
        await websocket.send_text(f"{text} {os.getpid()}")
        await websocket.close()

    _, url, _ = app.launch(executor="process", prevent_thread_lock=True)
    try:
        with connect(url.replace("http", "ws", 1) + "ws") as websocket:
            websocket.send("hi")
            assert websocket.recv() == f"hi {os.getpid()}"
        # The app's private server takes websockets only from the gateway
        port = app.get_blocks()._process_worker.http_port  # type: ignore[attr-defined]
        with pytest.raises(InvalidStatus):
            connect(f"ws://127.0.0.1:{port}/ws")
    finally:
        app.get_blocks().close()


def test_lifespan_runs_before_events_on_their_loop():
    import asyncio
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def lifespan(_app):
        await asyncio.sleep(1)
        yield {"ready": asyncio.Event()}

    async def fn(request: gr.Request) -> str:
        event = request.state.ready
        event.set()
        await event.wait()
        return "ok"

    with gr.Blocks() as demo:
        out = gr.Textbox()
        gr.Button().click(fn, None, out, api_name="fn")
    with launched(demo, app_kwargs={"lifespan": lifespan}) as client:
        assert client.predict(api_name="/fn") == "ok"


def test_launch_again_keeps_the_running_server():
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    _, first_url, _ = demo.launch(executor="process", prevent_thread_lock=True)
    worker = demo._process_worker  # type: ignore[attr-defined]
    assert worker is not None and worker.gateway is not None
    try:
        _, second_url, _ = demo.launch(executor="process", prevent_thread_lock=True)
        assert second_url == first_url
        assert demo._process_worker is worker  # type: ignore[attr-defined]
    finally:
        demo.close()
    assert worker.gateway.poll() is not None or worker.gateway.wait(timeout=10) == 0


def test_max_threads_sets_the_app_process_limiter():
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    with launched(demo, max_threads=60):
        assert demo.limiter is not None
        assert demo.limiter.total_tokens == 60


def test_app_classes_from_the_script_cross():
    class MainError(Exception):
        pass

    # Defined as if in the app's script, which the gateway cannot import
    MainError.__module__ = "__main__"

    def fail(x):
        raise MainError("over quota")

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(fail, t, t, api_name="fail")
        t.change(lambda x: x, t, t, api_name="echo")
    with launched(demo) as client:
        with pytest.raises(Exception):
            client.predict("a", api_name="/fail")
        # The connection to the app's process is still up
        assert client.predict("b", api_name="/echo") == "b"


def test_run_history_is_recorded_once(monkeypatch):
    from gradio import history

    recorded = []
    monkeypatch.setattr(
        history, "schedule_record_run", lambda *a, **k: recorded.append(k)
    )
    demo = gr.Interface(lambda x: x, "textbox", "textbox", api_name="echo")
    with launched(demo) as client:
        assert client.predict("a", api_name="/echo") == "a"
    # The gateway records it, in its own process
    assert recorded == []


def test_uploads_in_the_gateway_follow_delete_cache(tmp_path):
    upload = tmp_path / "upload.txt"
    upload.write_text("hello")
    with gr.Blocks(delete_cache=(1, 1)) as demo:
        gr.File()
    with launched(demo) as client:
        with open(upload, "rb") as f:
            response = httpx2.post(f"{client.src}gradio_api/upload", files={"files": f})
        path = response.json()[0]
        assert os.path.exists(path)
        deadline = time.time() + 15
        while os.path.exists(path) and time.time() < deadline:
            time.sleep(0.5)
        assert not os.path.exists(path)


def test_caching_examples_does_not_count_toward_the_startup_timeout(
    tmp_path, monkeypatch
):
    from gradio.processing import worker

    monkeypatch.setenv("GRADIO_EXAMPLES_CACHE", str(tmp_path))
    monkeypatch.setattr(worker, "STARTUP_TIMEOUT", 1)

    def slow(x):
        time.sleep(2)
        return x

    with gr.Blocks() as demo:
        t = gr.Textbox()
        gr.Examples([["a"]], t, t, slow, cache_examples=True)
    with launched(demo):
        pass


def test_stopping_a_generator_does_not_hold_up_other_events():
    def slow():
        yield "start"
        time.sleep(4)
        yield "end"

    with gr.Blocks() as demo:
        out = gr.Textbox()
        gr.Button().click(slow, None, out, api_name="slow")
        gr.Button().click(lambda x: x, out, out, api_name="echo")
    with launched(demo) as client:
        job = client.submit(api_name="/slow")
        while not job.outputs():
            time.sleep(0.05)
        job.cancel()
        start = time.time()
        assert Client(client.src, verbose=False).predict("b", api_name="/echo") == "b"
        assert time.time() - start < 3


def test_component_subclasses_and_themes_of_the_app():
    class MyTextbox(gr.Textbox):
        pass

    class Seafoam(gr.themes.Base):
        pass

    # Defined as if in the app's script, which the gateway cannot import
    Seafoam.__module__ = "__main__"

    with gr.Blocks() as demo:
        t = MyTextbox(label="mine")
        t.submit(lambda x: x[::-1], t, t, api_name="reverse")
    with launched(demo, theme=Seafoam(primary_hue="green")) as client:
        assert client.predict("abc", api_name="/reverse") == "cba"
        config = httpx2.get(f"{client.src}config").json()
        theme_css = httpx2.get(f"{client.src}theme.css").text
    (component,) = [c for c in config["components"] if c["id"] == t._id]
    assert component["props"]["name"] == "mytextbox"
    assert component["component_class_id"] == MyTextbox.get_component_class_id()
    assert gr.themes.colors.green.c500 in theme_css


def test_invalid_executor():
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    with pytest.raises(ValueError, match="must be 'thread' or 'process'"):
        demo.launch(executor="fork", prevent_thread_lock=True)  # type: ignore


def test_auth_function_runs_in_the_app_process():
    seen = []

    def auth(username, password):
        seen.append(os.getpid())
        return (username, password) == ("admin", "secret")

    demo = gr.Interface(lambda x: x, "textbox", "textbox", api_name="echo")
    _, local_url, _ = demo.launch(
        executor="process", prevent_thread_lock=True, auth=auth
    )
    try:
        import httpx2

        bad = httpx2.post(f"{local_url}login", data={"username": "a", "password": "b"})
        assert bad.status_code == 400
        good = httpx2.post(
            f"{local_url}login", data={"username": "admin", "password": "secret"}
        )
        assert good.status_code == 200
        assert seen == [os.getpid(), os.getpid()]
    finally:
        demo.close()


def test_server_custom_routes_and_lifespan_work():
    from contextlib import asynccontextmanager

    import httpx2

    @asynccontextmanager
    async def lifespan(_):
        yield {"model": "loaded"}

    server = gr.Server(lifespan=lifespan)

    @server.get("/health")
    def health():
        return {"pid": os.getpid()}

    @server.api(name="echo")
    def echo(x: str) -> str:
        return x

    _, local_url, _ = server.launch(executor="process", prevent_thread_lock=True)
    try:
        assert httpx2.get(f"{local_url}health").json() == {"pid": os.getpid()}
        client = Client(local_url, verbose=False)
        assert client.predict("hi", api_name="/echo") == "hi"
    finally:
        server.get_blocks().close()


def test_server_with_middleware_is_refused():
    from starlette.middleware.base import BaseHTTPMiddleware

    server = gr.Server()
    server.add_middleware(
        BaseHTTPMiddleware,  # type: ignore[arg-type]
        dispatch=lambda r, call_next: call_next(r),
    )

    @server.api(name="echo")
    def echo(x: str) -> str:
        return x

    with pytest.raises(ValueError, match="middleware"):
        server.launch(executor="process", prevent_thread_lock=True)


def test_server_queue_and_app_alias():
    app = gr.App()

    @app.queue(name="echo")
    def echo(x: str) -> str:
        return f"{x} {os.getpid()}"

    returned, local_url, _ = app.launch(executor="process", prevent_thread_lock=True)
    try:
        assert returned is app
        client = Client(local_url, verbose=False)
        assert client.predict("hi", api_name="/echo") == f"hi {os.getpid()}"
    finally:
        app.get_blocks().close()


def test_render_is_refused():
    with gr.Blocks() as demo:
        n = gr.Number(value=1)

        @gr.render(inputs=n)
        def show(k):
            gr.Textbox(value=str(k))

    with pytest.raises(ValueError, match="gr.render is not supported"):
        demo.launch(executor="process", prevent_thread_lock=True)
