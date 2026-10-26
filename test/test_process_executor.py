"""`launch(executor="process")`: a gateway process serves HTTP while this
process, which built the app, runs its events."""

import json
import os
import threading
import time
from contextlib import contextmanager

import httpx2
import pytest
from fastapi import Depends, HTTPException, Request
from gradio_client import Client

import gradio as gr

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
    lock = threading.Lock()

    with gr.Blocks() as demo:
        history = gr.State([])
        item = gr.Textbox()
        count = gr.Number()
        out = gr.Textbox()

        def add(x, h):
            h.append(x)
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
    from websockets.exceptions import InvalidStatus  # ty: ignore[unresolved-import]
    from websockets.sync.client import connect  # ty: ignore[unresolved-import]

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
    worker.gateway.wait(timeout=10)


def test_max_threads_sets_the_app_process_limiter():
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    with launched(demo, max_threads=60):
        assert demo.limiter is not None
        assert demo.limiter.total_tokens == 60


def test_classes_defined_by_the_app():
    class MyTextbox(gr.Textbox):
        pass

    class Seafoam(gr.themes.Base):
        pass

    class QuotaError(Exception):
        pass

    def fail(x):
        raise QuotaError("over quota")

    Seafoam.__module__ = QuotaError.__module__ = "__main__"

    with gr.Blocks() as demo:
        t = MyTextbox(label="mine")
        t.submit(lambda x: x[::-1], t, t, api_name="reverse")
        t.change(fail, t, t, api_name="fail")
    with launched(demo, theme=Seafoam(primary_hue="green")) as client:
        with pytest.raises(Exception):
            client.predict("a", api_name="/fail")
        assert client.predict("abc", api_name="/reverse") == "cba"
        config = httpx2.get(f"{client.src}config").json()
        theme_css = httpx2.get(f"{client.src}theme.css").text
    (component,) = [c for c in config["components"] if c["id"] == t._id]
    assert component["props"]["name"] == "mytextbox"
    assert component["component_class_id"] == MyTextbox.get_component_class_id()
    assert gr.themes.colors.green.c500 in theme_css


def _require_key(request: Request):
    if (
        request.url.path.startswith("/gradio_api/call")
        and request.headers.get("x-key") != "secret"
    ):
        raise HTTPException(status_code=403, detail="forbidden")


def test_server_dependencies_guard_gradio_routes():
    ran = []
    app = gr.Server(dependencies=[Depends(_require_key)])

    @app.api(name="echo")
    def echo(x: str) -> str:
        ran.append(x)
        return x

    _, url, _ = app.launch(executor="process", prevent_thread_lock=True)
    try:
        refused = httpx2.post(f"{url}gradio_api/call/echo", json={"data": ["a"]})
        assert refused.status_code == 403
        assert refused.json()["detail"] == "forbidden"
        allowed = httpx2.post(
            f"{url}gradio_api/call/echo",
            json={"data": ["b"]},
            headers={"x-key": "secret"},
        )
        assert allowed.status_code == 200
        event_id = allowed.json()["event_id"]
        httpx2.get(f"{url}gradio_api/call/echo/{event_id}", headers={"x-key": "secret"})
        assert ran == ["b"]
    finally:
        app.get_blocks().close()


def test_auth_dependency_request_state_reaches_the_event():
    def auth_dependency(request):
        request.state.identity = "alice"
        return "alice"

    def whoami(request: gr.Request) -> str:
        return getattr(request.state, "identity", "MISSING")

    with gr.Blocks() as demo:
        out = gr.Textbox()
        gr.Button().click(whoami, None, out, api_name="whoami")
    with launched(demo, auth_dependency=auth_dependency) as client:
        assert client.predict(api_name="/whoami") == "alice"


REPLICA_APP = """
import os, threading, time
import gradio as gr

lock = threading.Lock()
state = {"running": 0, "peak": 0}

def work(x):
    with lock:
        state["running"] += 1
        state["peak"] = max(state["peak"], state["running"])
    time.sleep(1)
    with lock:
        state["running"] -= 1
    return f"{os.getpid()} {state['peak']}"

with gr.Blocks() as demo:
    t = gr.Textbox()
    t.submit(work, t, t, api_name="work", concurrency_limit=1)

demo.launch(server_port=int(os.environ["PORT"]))
"""


def test_replicas_keep_concurrency_limit_per_process(tmp_path):
    import subprocess
    import sys

    script = tmp_path / "app.py"
    script.write_text(REPLICA_APP)
    port = 7990
    proc = subprocess.Popen(
        [sys.executable, str(script)],
        env={**os.environ, "GRADIO_PROCESS_REPLICAS": "2", "PORT": str(port)},
        start_new_session=True,
    )
    url = f"http://127.0.0.1:{port}/"
    try:
        deadline = time.time() + 120
        while time.time() < deadline:
            try:
                status = httpx2.get(f"{url}gradio_api/processes").json()
                if len(status["processes"]) == 2 and not status["starting"]:
                    break
            except (httpx2.HTTPError, ValueError):
                pass
            time.sleep(0.5)
        client = Client(url, verbose=False)
        client.predict("warm", api_name="/work")
        # One client is one session, which stays on one process
        jobs = [client.submit("x", api_name="/work") for _ in range(2)]
        results = [job.result().split() for job in jobs]
        assert len({pid for pid, _ in results}) == 1
        assert max(int(peak) for _, peak in results) == 1
    finally:
        import signal

        os.killpg(proc.pid, signal.SIGTERM)
        proc.wait(timeout=30)


def test_custom_component_assets_come_from_the_app(tmp_path, monkeypatch):
    import sys

    package = tmp_path / "mycomp"
    (package / "templates" / "component").mkdir(parents=True)
    (package / "templates" / "component" / "index.js").write_text("export default 1;")
    (package / "__init__.py").write_text(
        "import gradio as gr\n\n"
        "class MyComp(gr.Textbox):\n"
        "    TEMPLATE_DIR = 'templates'\n"
    )
    monkeypatch.syspath_prepend(str(tmp_path))
    from mycomp import MyComp  # ty: ignore[unresolved-import]

    with gr.Blocks() as demo:
        MyComp()
    with launched(demo) as client:
        class_id = MyComp.get_component_class_id()
        response = httpx2.get(
            f"{client.src}gradio_api/custom_component/{class_id}/client/component/index.js"
        )
    sys.modules.pop("mycomp", None)
    assert response.status_code == 200, response.text
    assert "export default 1" in response.text


async def _check_body(request: Request):
    if (
        request.method == "POST"
        and request.url.path.startswith("/gradio_api/call")
        and (await request.json()).get("data") != ["ok"]
    ):
        raise HTTPException(status_code=400, detail="bad data")


def test_server_dependencies_can_read_the_body():
    app = gr.Server(dependencies=[Depends(_check_body)])

    @app.api(name="echo")
    def echo(x: str) -> str:
        return x

    _, url, _ = app.launch(prevent_thread_lock=True)
    try:
        assert httpx2.post(
            f"{url}gradio_api/call/echo", json={"data": ["ok"]}
        ).is_success
        assert (
            httpx2.post(f"{url}gradio_api/call/echo", json={"data": ["no"]}).status_code
            == 400
        )
    finally:
        app.get_blocks().close()


def test_page_api_info_has_only_its_endpoints():
    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(lambda x: x, t, t, api_name="home")
    with demo.route("Details", "/details"):
        d = gr.Textbox()
        d.submit(lambda x: x, d, d, api_name="details")
    with launched(demo) as client:
        info = httpx2.get(f"{client.src}gradio_api/info", params={"page": "details"})
    assert list(info.json()["named_endpoints"]) == ["/details"]


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
