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
                if len(status.get("processes", [])) == 2 and not status["starting"]:
                    break
            except (httpx2.HTTPError, ValueError):
                pass
            time.sleep(0.5)
        client = Client(url, verbose=False)
        client.predict("warm", api_name="/work")
        jobs = [client.submit("x", api_name="/work") for _ in range(2)]
        results = [job.result().split() for job in jobs]
        assert len({pid for pid, _ in results}) == 1
        assert max(int(peak) for _, peak in results) == 1
    finally:
        import signal

        os.killpg(proc.pid, signal.SIGTERM)
        proc.wait(timeout=30)


REPLICA_STREAM_APP = """
import os
import gradio as gr

with gr.Blocks() as demo:
    mic = gr.Audio(sources=["microphone"], streaming=True)
    out = gr.Textbox()
    mic.stream(lambda chunk: str(os.getpid()), mic, out, concurrency_limit=1)
    gr.Button().click(lambda: str(os.getpid()), None, out)

demo.launch(server_port=int(os.environ["PORT"]))
"""


def test_replicas_keep_a_running_stream_to_its_process(tmp_path):
    import subprocess
    import sys

    script = tmp_path / "app.py"
    script.write_text(REPLICA_STREAM_APP)
    port = 7992
    proc = subprocess.Popen(
        [sys.executable, str(script)],
        env={**os.environ, "GRADIO_PROCESS_REPLICAS": "2", "PORT": str(port)},
        start_new_session=True,
    )
    url = f"http://127.0.0.1:{port}/"
    try:
        deadline = time.time() + 120
        processes = []
        while time.time() < deadline:
            try:
                status = httpx2.get(f"{url}gradio_api/processes").json()
                processes = status.get("processes", [])
                if len(processes) == 2 and not status["starting"]:
                    break
            except (httpx2.HTTPError, ValueError):
                pass
            time.sleep(0.5)
        assert len(processes) == 2
        with open("test/test_files/audio_sample.wav", "rb") as f:
            (path,) = httpx2.post(f"{url}gradio_api/upload", files={"files": f}).json()
        pids = {"first": [], "second": []}
        # Each session first runs a quick event while nothing else runs, so the
        # processes look equally busy when they are placed
        for name in pids:
            body = {"data": [], "fn_index": 1, "session_hash": name}
            assert _queue_messages(url, body)[-1]["success"]
        stop = threading.Event()

        def stream(name):
            body = {
                "data": [{"path": path, "meta": {"_type": "gradio.FileData"}}],
                "fn_index": 0,
                "session_hash": name,
            }

            def on_message(http, event_id, message):
                if message["msg"] != "process_streaming":
                    return
                pids[name].append(message["output"]["data"][0])
                # The first stream keeps sending chunks, a little apart, until
                # the second one has started. They name no session, and still
                # run in the stream's session, on its process.
                if name == "first" and not stop.is_set():
                    time.sleep(0.2)
                    chunk = {"data": body["data"], "fn_index": 0}
                    http.post(f"gradio_api/stream/{event_id}", json=chunk)
                else:
                    http.post(f"gradio_api/stream/{event_id}/close")

            _queue_messages(url, body, on_message)

        first = threading.Thread(target=stream, args=("first",), daemon=True)
        first.start()
        deadline = time.time() + 30
        while len(pids["first"]) < 2 and time.time() < deadline:
            time.sleep(0.05)
        # Its later chunks run too, without waiting for the slot it holds
        assert len(pids["first"]) >= 2
        second = threading.Thread(target=stream, args=("second",), daemon=True)
        second.start()
        second.join(timeout=30)
        stop.set()
        first.join(timeout=30)
        assert not first.is_alive() and not second.is_alive()
        assert pids["second"]
        assert len(set(pids["first"])) == 1
        assert pids["first"][0] != pids["second"][0]
    finally:
        import signal

        os.killpg(proc.pid, signal.SIGTERM)
        proc.wait(timeout=30)


def test_custom_component_assets_are_served_by_the_gateway(tmp_path, monkeypatch):
    import sys

    from gradio import utils

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
        monkeypatch.setattr(utils, "get_all_components", lambda: [])
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


GATEWAY_MODULE = """
import os

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
def landing():
    return f"<p>welcome {os.getpid()}</p>"


class Tag(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["x-tag"] = response.headers.get("x-tag", "") + "t"
        return response


middleware = [Middleware(Tag)]
"""


@pytest.mark.parametrize("executor", ["process", "thread"])
def test_gateway_module_serves_routes_and_middleware(executor, tmp_path, monkeypatch):
    import sys

    from fastapi import APIRouter
    from fastapi.staticfiles import StaticFiles

    (tmp_path / "webgate.py").write_text(GATEWAY_MODULE)
    (tmp_path / "site").mkdir()
    (tmp_path / "site" / "index.html").write_text("<h1>landing</h1>")
    monkeypatch.syspath_prepend(str(tmp_path))

    app = gr.App(gateway="webgate:router")
    routed = APIRouter(prefix="/routed")

    @routed.get("/pid")
    def routed_pid():
        return os.getpid()

    @app.get("/here")
    def here():
        return os.getpid()

    @app.queue(name="echo")
    def echo(x: str) -> str:
        return f"{x} {os.getpid()}"

    app.include_router(routed)
    app.mount("/site", StaticFiles(directory=tmp_path / "site", html=True))
    _, url, _ = app.launch(executor=executor, prevent_thread_lock=True)
    try:
        worker = getattr(app.get_blocks(), "_process_worker", None)
        landing_pid = worker.gateway.pid if worker else os.getpid()
        landing = httpx2.get(url)
        assert landing.text == f"<p>welcome {landing_pid}</p>"
        for path in ("", "config", "here", "routed/pid"):
            assert httpx2.get(f"{url}{path}").headers["x-tag"] == "t"
        assert httpx2.get(f"{url}here").json() == os.getpid()
        assert httpx2.get(f"{url}routed/pid").json() == os.getpid()
        assert "landing" in httpx2.get(f"{url}site/").text
        assert Client(url, verbose=False).predict("a", api_name="/echo") == (
            f"a {os.getpid()}"
        )
    finally:
        app.get_blocks().close()
        sys.modules.pop("webgate", None)


def test_gateway_paths_are_checked():
    with pytest.raises(ValueError, match="import paths"):
        gr.App(gateway="webgate.router")
    app = gr.App(gateway="os:path")
    with pytest.raises(ValueError, match="APIRouter"):
        app.launch(executor="thread", prevent_thread_lock=True)


def test_server_middleware_points_to_the_gateway_module():
    from starlette.middleware.base import BaseHTTPMiddleware

    server = gr.App()
    server.add_middleware(
        BaseHTTPMiddleware,  # type: ignore[arg-type]
        dispatch=lambda r, call_next: call_next(r),
    )

    @server.api(name="echo")
    def echo(x: str) -> str:
        return x

    with pytest.raises(ValueError, match="gateway="):
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


def test_render_registers_its_events_in_the_session():
    with gr.Blocks() as demo:
        n = gr.Number(value=1)

        @gr.render(inputs=n)
        def show(k):
            for i in range(int(k)):
                t = gr.Textbox(value=str(i), key=f"t{i}")
                gr.Button(f"b{i}").click(
                    lambda x: f"{x}! {os.getpid()}", t, t, api_name=f"bang{i}"
                )

    with launched(demo) as client:
        config = httpx2.get(f"{client.src}config").json()
        (render,) = [
            d for d in config["dependencies"] if d.get("render_id") is not None
        ]

        def run(fn_index, data):
            messages = _queue_messages(
                client.src,
                {"data": data, "fn_index": fn_index, "session_hash": "render"},
            )
            return messages[-1]["output"]

        for count in (1, 2):
            output = run(render["id"], [count])
            rendered = output["render_config"]["dependencies"]
            assert len(rendered) == count
        last = rendered[-1]
        assert run(last["id"], ["x"])["data"] == [f"x! {os.getpid()}"]


def _queue_messages(base_url: str, body: dict, on_message=None) -> list[dict]:
    """Joins the queue with `body` and returns the event's messages, up to
    `process_completed`."""
    messages = []
    with httpx2.Client(base_url=base_url, timeout=15) as client:
        event_id = client.post("gradio_api/queue/join", json=body).json()["event_id"]
        with client.stream(
            "GET",
            "gradio_api/queue/data",
            params={"session_hash": body["session_hash"]},
        ) as sse:
            for line in sse.iter_lines():
                if not line.startswith("data:"):
                    continue
                message = json.loads(line[5:])
                messages.append(message)
                if on_message is not None:
                    on_message(client, event_id, message)
                if message["msg"] == "process_completed":
                    return messages
    return messages


def test_streamed_input_to_a_generator_answers_every_chunk():
    def on_chunk(chunk):
        yield "got a chunk"

    with gr.Blocks() as demo:
        mic = gr.Audio(sources=["microphone"], streaming=True)
        out = gr.Textbox()
        mic.stream(on_chunk, mic, out)

    with launched(demo) as client:
        with httpx2.Client(base_url=client.src) as http:
            with open("test/test_files/audio_sample.wav", "rb") as f:
                (path,) = http.post("gradio_api/upload", files={"files": f}).json()
        body = {
            "data": [{"path": path, "meta": {"_type": "gradio.FileData"}}],
            "fn_index": 0,
            "session_hash": "chunks",
        }
        chunks = [1]

        def send_chunks(http, event_id, message):
            if message["msg"] != "process_streaming":
                return
            if chunks[0] < 3:
                chunks[0] += 1
                http.post(f"gradio_api/stream/{event_id}", json=body)
            else:
                http.post(f"gradio_api/stream/{event_id}/close")

        messages = _queue_messages(client.src, body, send_chunks)
    assert chunks[0] == 3
    assert messages[-1]["success"]


@pytest.mark.parametrize("end", ["close", "error", "cancel"])
def test_an_ended_stream_lets_the_next_one_run(end):
    def on_chunk(chunk):
        if chunk == "fail":
            raise gr.Error("bad chunk")
        return chunk

    with gr.Blocks() as demo:
        mic = gr.Audio(sources=["microphone"], streaming=True)
        chunk = gr.Textbox()
        out = gr.Textbox()
        mic.stream(on_chunk, chunk, out, concurrency_limit=1)

    with launched(demo) as client:
        results = {}

        def stream(session_hash, chunks, end="close"):
            def send_next(http, event_id, message):
                if message["msg"] != "process_streaming":
                    return
                if chunks:
                    body = {
                        "data": [chunks.pop(0)],
                        "fn_index": 0,
                        "session_hash": session_hash,
                    }
                    http.post(f"gradio_api/stream/{event_id}", json=body)
                elif end == "cancel":
                    body = {
                        "session_hash": session_hash,
                        "fn_index": 0,
                        "event_id": event_id,
                    }
                    http.post("gradio_api/cancel", json=body)
                else:
                    http.post(f"gradio_api/stream/{event_id}/close")

            body = {"data": ["first"], "fn_index": 0, "session_hash": session_hash}
            results[session_hash] = _queue_messages(client.src, body, send_next)

        stream("a", ["more", "fail" if end == "error" else "more"], end)
        assert results["a"][-1]["success"] == (end != "error")
        # The slot that the first stream held in the app's process is free again
        second = threading.Thread(target=stream, args=("b", []), daemon=True)
        second.start()
        second.join(timeout=30)
        assert not second.is_alive()
        assert results["b"][-1]["success"]


def test_a_chunk_does_not_continue_the_last_chunks_generator():
    def on_chunk(chunk):
        yield f"{chunk}-1"
        yield f"{chunk}-2"

    with gr.Blocks() as demo:
        mic = gr.Audio(sources=["microphone"], streaming=True)
        chunk = gr.Textbox()
        out = gr.Textbox()
        mic.stream(on_chunk, chunk, out)

    with launched(demo) as client:
        outputs = []
        chunks = ["b"]

        def send_next(http, event_id, message):
            if message["msg"] != "process_streaming":
                return
            outputs.append(message["output"]["data"][0])
            if chunks:
                # A client that sends the event's id with its chunk
                body = {
                    "data": [chunks.pop(0)],
                    "fn_index": 0,
                    "session_hash": "s",
                    "event_id": event_id,
                }
                http.post(f"gradio_api/stream/{event_id}", json=body)
            else:
                http.post(f"gradio_api/stream/{event_id}/close")

        body = {"data": ["a"], "fn_index": 0, "session_hash": "s"}
        _queue_messages(client.src, body, send_next)
    assert outputs[:2] == ["a-1", "b-1"]


def test_app_process_exits_when_the_gateway_dies(tmp_path):
    import signal
    import subprocess
    import sys

    script = tmp_path / "app.py"
    script.write_text(
        "import gradio as gr\n"
        "demo = gr.Interface(lambda x: x, 'textbox', 'textbox')\n"
        "demo.launch(prevent_thread_lock=True)\n"
        "print('gateway', demo._process_worker.gateway.pid, flush=True)\n"
        "demo.block_thread()\n"
        "print('exited', flush=True)\n"
    )
    proc = subprocess.Popen(
        [sys.executable, str(script)], stdout=subprocess.PIPE, text=True
    )
    try:
        assert proc.stdout is not None
        line = next(line for line in proc.stdout if line.startswith("gateway"))
        os.kill(int(line.split()[1]), signal.SIGKILL)
        assert proc.wait(timeout=20) == 0
        assert "exited" in proc.stdout.read()
    finally:
        if proc.poll() is None:
            proc.kill()


REPLICA_LIFESPAN_APP = """
import os
from contextlib import asynccontextmanager
import gradio as gr

@asynccontextmanager
async def lifespan(_app):
    yield
    with open(os.environ["LOG"], "a") as f:
        f.write(f"teardown {os.getpid()}\\n")

demo = gr.Interface(lambda x: x, "textbox", "textbox")
demo.launch(server_port=int(os.environ["PORT"]), app_kwargs={"lifespan": lifespan})
"""


def test_replicas_run_their_lifespan_teardown(tmp_path):
    import signal
    import subprocess
    import sys

    script = tmp_path / "app.py"
    script.write_text(REPLICA_LIFESPAN_APP)
    log = tmp_path / "log.txt"
    port = 7991
    proc = subprocess.Popen(
        [sys.executable, str(script)],
        env={
            **os.environ,
            "GRADIO_PROCESS_REPLICAS": "2",
            "PORT": str(port),
            "LOG": str(log),
        },
        start_new_session=True,
    )
    try:
        deadline = time.time() + 120
        while time.time() < deadline:
            try:
                status = httpx2.get(
                    f"http://127.0.0.1:{port}/gradio_api/processes"
                ).json()
                if len(status.get("processes", [])) == 2 and not status["starting"]:
                    break
            except (httpx2.HTTPError, ValueError):
                pass
            time.sleep(0.5)
        os.killpg(proc.pid, signal.SIGINT)
        proc.wait(timeout=30)
        deadline = time.time() + 15
        while time.time() < deadline and (
            not log.exists() or len(log.read_text().splitlines()) < 2
        ):
            time.sleep(0.2)
        assert len(set(log.read_text().splitlines())) == 2
    finally:
        if proc.poll() is None:
            os.killpg(proc.pid, signal.SIGKILL)


def test_errors_keep_the_app_traceback():
    import traceback

    from gradio.processing import protocol

    def divide(x):
        return 1 / int(x)

    try:
        divide("0")
    except ZeroDivisionError as err:
        restored = protocol.restore_error(protocol.portable_error(err))
    printed = "".join(traceback.format_exception(restored))
    assert "in divide" in printed
    assert "1 / int(x)" in printed
    assert printed.rstrip().splitlines()[-1].startswith("ZeroDivisionError")


def test_error_subclass_defined_in_the_script():
    from gradio_client.exceptions import AppError

    class QuotaError(gr.Error):
        pass

    QuotaError.__module__ = "__main__"

    def fail(x):
        raise QuotaError("Out of credits", title="Quota")

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(fail, t, t, api_name="fail")
    with launched(demo) as client:
        with pytest.raises(AppError, match="Out of credits") as err:
            client.predict("x", api_name="/fail")
    assert err.value.title == "Quota"


def test_cached_call_skips_a_busy_concurrency_group():
    def slow(x):
        time.sleep(3)
        return x

    @gr.cache
    def cached(x):
        time.sleep(1)
        return x * 2

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(slow, t, t, api_name="slow", concurrency_id="g", concurrency_limit=1)
        t.change(
            cached, t, t, api_name="cached", concurrency_id="g", concurrency_limit=1
        )
    with launched(demo) as client:
        assert client.predict("a", api_name="/cached") == "aa"
        busy = client.submit("b", api_name="/slow")
        time.sleep(0.5)
        start = time.monotonic()
        assert client.predict("a", api_name="/cached") == "aa"
        assert time.monotonic() - start < 1.5
        busy.result()


def test_validation_errors_name_the_function_parameters():
    def validate(name, age):
        return [gr.validate(len(name) > 0, "empty"), gr.validate(age > 0, "too young")]

    with gr.Blocks() as demo:
        name = gr.Textbox()
        age = gr.Number()
        out = gr.Textbox()
        gr.Button().click(
            lambda name, age: name, [name, age], out, validator=validate, api_name="go"
        )
    with launched(demo) as client:
        response = httpx2.post(
            f"{client.src}gradio_api/queue/join",
            json={"data": ["", 0], "fn_index": 0, "session_hash": "v"},
        )
    assert response.status_code == 422
    assert [item["parameter_name"] for item in response.json()["detail"]] == [
        "name",
        "age",
    ]


def test_failed_events_do_not_leak_their_sessions():
    def fail(x):
        raise ValueError(x)

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(fail, t, t, api_name="fail")
    with launched(demo) as client:
        for _ in range(5):
            with pytest.raises(Exception):
                client.predict("x", api_name="/fail")
        assert demo._process_worker.event_sessions == {}  # type: ignore[union-attr]


def test_processes_route_needs_login():
    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    _, local_url, _ = demo.launch(
        executor="process", prevent_thread_lock=True, auth=("u", "p")
    )
    try:
        assert httpx2.get(f"{local_url}gradio_api/processes").status_code == 401
        assert httpx2.get(f"{local_url}config").status_code == 401
    finally:
        demo.close()


def test_mcp_server_knows_its_local_url():
    pytest.importorskip("mcp")

    def echo(x: str) -> str:
        """Echoes x.

        Args:
            x: the text
        """
        return x

    demo = gr.Interface(echo, "textbox", "textbox")
    _, local_url, _ = demo.launch(
        executor="process", prevent_thread_lock=True, mcp_server=True
    )
    try:
        assert demo.mcp_server_obj._local_url == local_url  # type: ignore[union-attr]
    finally:
        demo.close()


RELOAD_APP = """
import gradio as gr

with gr.Blocks() as demo:
    t = gr.Textbox(label="before")
    t.submit(lambda x: "v1 " + x, t, t, api_name="echo")

if __name__ == "__main__":
    demo.launch(server_port={port})
"""


def test_reload_mode_serves_the_reloaded_app(tmp_path):
    import signal
    import subprocess
    import sys

    port = 7994
    script = tmp_path / "app.py"
    script.write_text(RELOAD_APP.format(port=port))
    proc = subprocess.Popen(
        [sys.executable, "-m", "gradio", str(script)],
        cwd=tmp_path,
        env={**os.environ, "PYTHONPATH": os.getcwd()},
        start_new_session=True,
    )
    url = f"http://127.0.0.1:{port}/"

    def labels():
        config = httpx2.get(f"{url}config").json()
        return [
            c["props"]["label"] for c in config["components"] if c["props"].get("label")
        ]

    try:
        deadline = time.time() + 60
        while time.time() < deadline:
            try:
                if "before" in labels():
                    break
            except (httpx2.HTTPError, ValueError):
                pass
            time.sleep(0.5)
        assert Client(url, verbose=False).predict("a", api_name="/echo") == "v1 a"
        status = httpx2.get(f"{url}gradio_api/processes").json()
        assert status["processes"][0]["pid"] != proc.pid
        script.write_text(
            RELOAD_APP.format(port=port)
            .replace('"before"', '"after"')
            .replace('"v1 "', '"v2 "')
        )
        deadline = time.time() + 30
        while time.time() < deadline and "after" not in labels():
            time.sleep(0.5)
        assert labels() == ["after"]
        assert Client(url, verbose=False).predict("a", api_name="/echo") == "v2 a"
    finally:
        os.killpg(proc.pid, signal.SIGTERM)
        proc.wait(timeout=30)


CUSTOM_COMPONENT = """
from gradio.components.base import Component


class Shout(Component):
    TEMPLATE_DIR = "templates"
    EVENTS = ["change", "submit"]

    def preprocess(self, payload):
        return payload.upper()

    def postprocess(self, value):
        return f"{value}!"

    def api_info(self):
        return {"type": "string"}

    def example_payload(self):
        return "hi"

    def example_value(self):
        return "hi"
"""


def test_custom_component_with_its_own_frontend(tmp_path, monkeypatch):
    import sys

    package = tmp_path / "shout"
    (package / "templates" / "component").mkdir(parents=True)
    (package / "templates" / "component" / "index.js").write_text("export default 2;")
    (package / "__init__.py").write_text(CUSTOM_COMPONENT)
    monkeypatch.syspath_prepend(str(tmp_path))
    from shout import Shout  # ty: ignore[unresolved-import]

    with gr.Blocks() as demo:
        box = Shout()
        box.submit(lambda x: x, box, box, api_name="shout")
    try:
        with launched(demo) as client:
            assert client.predict("hey", api_name="/shout") == "HEY!"
            config = httpx2.get(f"{client.src}config").json()
            class_id = Shout.get_component_class_id()
            asset = httpx2.get(
                f"{client.src}gradio_api/custom_component/{class_id}/client/component/index.js"
            )
    finally:
        sys.modules.pop("shout", None)
    (component,) = [c for c in config["components"] if c["id"] == box._id]
    assert component["props"]["name"] == "shout"
    assert "export default 2" in asset.text


def test_spaces_dev_mode_reload_reaches_the_gateway(monkeypatch):
    import sys

    from gradio import utils

    started = []
    monkeypatch.setattr(utils, "get_space", lambda: "user/space")
    monkeypatch.setattr(utils, "watchfn_spaces", started.append)
    main = sys.modules["__main__"]

    with gr.Blocks() as demo:
        gr.Textbox(label="before")
    monkeypatch.setattr(main, "demo", demo, raising=False)
    with launched(demo) as client:
        (reloader,) = started
        with gr.Blocks() as edited:
            t = gr.Textbox(label="after")
            t.submit(lambda x: f"{x} {os.getpid()}", t, t, api_name="echo")
        monkeypatch.setattr(main, "demo", edited)
        swapped = []

        def edit():
            reloader.prerun()
            swapped.append(reloader.postrun())

        thread = threading.Thread(target=edit)
        thread.start()
        thread.join()
        assert swapped == [True]
        deadline = time.time() + 10
        labels: list = []
        while time.time() < deadline and "after" not in labels:
            config = httpx2.get(f"{client.src}config").json()
            labels = [c["props"].get("label") for c in config["components"]]
            time.sleep(0.2)
        assert "after" in labels
        result = Client(client.src, verbose=False).predict("a", api_name="/echo")
        assert result == f"a {os.getpid()}"


def test_files_cross_by_value(monkeypatch, tmp_path):
    import hashlib

    from gradio_client import handle_file

    monkeypatch.setenv("GRADIO_PROCESS_FILES", "value")
    received = []

    def flip(path):
        received.append(path)
        out = tmp_path / "flipped.txt"
        with open(path) as f:
            out.write_text(f.read()[::-1])
        return str(out)

    with gr.Blocks() as demo:
        inp = gr.File()
        out = gr.File()
        inp.upload(flip, inp, out, api_name="flip")

    source = tmp_path / "source.txt"
    source.write_text("abc")
    with launched(demo) as client:
        result = client.predict(handle_file(str(source)), api_name="/flip")
    (path,) = received
    digest = hashlib.sha256(b"abc").hexdigest()
    assert os.path.basename(os.path.dirname(path)) == digest
    with open(result) as f:
        assert f.read() == "cba"


def test_file_copies_send_each_file_once(tmp_path):
    from gradio.processing import protocol

    path = tmp_path / "a.txt"
    path.write_text("hello")
    file_data = {"path": str(path), "meta": {"_type": "gradio.FileData"}}
    copies = protocol.FileCopies()
    first = copies.pack({"data": [file_data]})
    second = copies.pack([file_data])
    assert first["data"][0][protocol.FILE]["data"] == b"hello"
    assert second[0][protocol.FILE]["data"] is None
    message = protocol.decode(b"".join(protocol.encode(first)))
    unpacked = protocol.unpack_files(message, str(tmp_path / "landed"))
    landed = unpacked["data"][0]["path"]
    assert landed != str(path)
    with open(landed) as f:
        assert f.read() == "hello"
    assert protocol.unpack_files(second, str(tmp_path / "landed"))[0]["path"] == landed


def test_process_alive():
    import subprocess
    import sys

    from gradio.processing.gateway import process_alive

    assert process_alive(os.getpid())
    proc = subprocess.Popen([sys.executable, "-c", "pass"])
    proc.wait()
    assert not process_alive(proc.pid)


def test_errors_from_user_code_answer_the_call():
    import asyncio

    from gradio_client.exceptions import AppError

    async def cancelled(x):
        raise asyncio.CancelledError()

    def upstream(x):
        raise AppError("the upstream Space failed")

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(cancelled, t, t, api_name="cancelled", concurrency_limit=1)
        t.change(upstream, t, t, api_name="upstream")
        t.blur(lambda x: x, t, t, api_name="echo", concurrency_id="cancelled")
    with launched(demo) as client:
        for _ in range(2):
            with pytest.raises(AppError):
                client.predict("a", api_name="/cancelled")
        assert client.predict("b", api_name="/echo") == "b"
        with pytest.raises(AppError, match="the upstream Space failed"):
            client.predict("c", api_name="/upstream")


def test_builtin_functions_are_events():
    import time as time_module

    with gr.Blocks() as demo:
        out = gr.Textbox()
        demo.load(time_module.ctime, None, out, api_name="now")
    with launched(demo) as client:
        assert client.predict(api_name="/now")


def test_file_copies_keep_files_with_the_same_bytes(tmp_path):
    from gradio.processing import protocol

    paths = []
    for name in ("a.txt", "b.txt"):
        path = tmp_path / name
        path.write_text("same")
        paths.append({"path": str(path), "meta": {"_type": "gradio.FileData"}})
    packed = protocol.FileCopies().pack(paths)
    landed = protocol.unpack_files(packed, str(tmp_path / "landed"))
    assert [os.path.basename(f["path"]) for f in landed] == ["a.txt", "b.txt"]
    assert all(os.path.exists(f["path"]) for f in landed)


COUNTING_MIDDLEWARE = """
from starlette.middleware.base import BaseHTTPMiddleware


class Count(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["x-count"] = response.headers.get("x-count", "") + "c"
        return response
"""


def test_app_kwargs_middleware_runs_once(tmp_path, monkeypatch):
    import sys

    from starlette.middleware import Middleware

    (tmp_path / "countmw.py").write_text(COUNTING_MIDDLEWARE)
    monkeypatch.syspath_prepend(str(tmp_path))
    from countmw import Count  # ty: ignore[unresolved-import]

    demo = gr.Interface(lambda x: x, "textbox", "textbox")
    try:
        with launched(demo, app_kwargs={"middleware": [Middleware(Count)]}) as client:
            for path in ("config", "gradio_api/deep_link?session_hash=s"):
                assert httpx2.get(f"{client.src}{path}").headers["x-count"] == "c"
    finally:
        sys.modules.pop("countmw", None)


def test_unresponsive_process_fails_its_calls(monkeypatch):
    monkeypatch.setenv("GRADIO_PROCESS_UNRESPONSIVE_SECONDS", "2")

    async def block_loop(x):
        time.sleep(6)
        return x

    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(block_loop, t, t, api_name="stuck", concurrency_limit=1)
        t.change(lambda x: x, t, t, api_name="echo")
    with launched(demo) as client:
        start = time.time()
        with pytest.raises(Exception):  # noqa: B017
            client.predict("a", api_name="/stuck")
        assert time.time() - start < 5.5
        time.sleep(start + 7 - time.time())
        assert client.predict("b", api_name="/echo") == "b"


def test_gateway_imports_the_app_gradio(tmp_path, monkeypatch):
    (tmp_path / "gradio").mkdir()
    (tmp_path / "gradio" / "__init__.py").write_text("raise ImportError('wrong')")
    monkeypatch.chdir(tmp_path)
    with gr.Blocks() as demo:
        t = gr.Textbox()
        t.submit(lambda x: x, t, t, api_name="echo")
    with launched(demo) as client:
        assert client.predict("hi", api_name="/echo") == "hi"
