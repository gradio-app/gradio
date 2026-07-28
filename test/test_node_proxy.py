"""Tests for the Node-as-proxy architecture and static worker routing."""

import shutil
import sys
import time
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from gradio.static_server import StaticServerConfig, StaticWorkerPool, create_static_app


@pytest.fixture()
def upload_dir(tmp_path):
    d = str(tmp_path / "uploads")
    Path(d).mkdir(parents=True)
    return d


@pytest.fixture()
def static_app(upload_dir):
    config = StaticServerConfig(
        build_path=str(
            Path(__file__).parent.parent
            / "gradio"
            / "templates"
            / "frontend"
            / "assets"
        ),
        static_path=str(
            Path(__file__).parent.parent
            / "gradio"
            / "templates"
            / "frontend"
            / "static"
        ),
        uploaded_file_dir=upload_dir,
        allowed_paths=[],
        blocked_paths=[],
        max_file_size=None,
        favicon_path=None,
    )
    return create_static_app(config)


@pytest.fixture()
def static_client(static_app):
    return TestClient(static_app)


class TestStaticWorkerApp:
    """Test the static worker FastAPI app handles routes correctly."""

    def test_health_endpoint(self, static_client):
        resp = static_client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_favicon(self, static_client):
        resp = static_client.get("/favicon.ico")
        assert resp.status_code == 200

    def test_upload_bare_path(self, static_client):
        """Upload via /upload (bare path)."""
        resp = static_client.post(
            "/upload",
            files={"files": ("test.txt", b"hello world", "text/plain")},
        )
        assert resp.status_code == 200
        paths = resp.json()
        assert len(paths) == 1
        assert Path(paths[0]).exists()

    def test_upload_gradio_api_path(self, static_client):
        """Upload via /gradio_api/upload (client path)."""
        resp = static_client.post(
            "/gradio_api/upload",
            files={"files": ("test.txt", b"hello world", "text/plain")},
        )
        assert resp.status_code == 200
        paths = resp.json()
        assert len(paths) == 1
        assert Path(paths[0]).exists()

    def test_file_download_after_upload(self, static_client):
        """Upload a file then download it via /file= and /gradio_api/file=."""
        upload_resp = static_client.post(
            "/gradio_api/upload",
            files={"files": ("test.txt", b"hello world", "text/plain")},
        )
        assert upload_resp.status_code == 200
        file_path = upload_resp.json()[0]

        resp = static_client.get(f"/file={file_path}")
        assert resp.status_code == 200
        assert resp.content == b"hello world"

        resp2 = static_client.get(f"/gradio_api/file={file_path}")
        assert resp2.status_code == 200
        assert resp2.content == b"hello world"

    def test_static_assets(self, static_client):
        resp = static_client.get("/static/img/logo.svg")
        assert resp.status_code == 200

    def test_path_traversal_blocked(self, static_client):
        resp = static_client.get("/static/..%2f..%2fetc/passwd")
        assert resp.status_code == 403

    def test_upload_invalid_content_type(self, static_client):
        resp = static_client.post(
            "/upload",
            content=b"not multipart",
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400


class TestStaticWorkerPool:
    """Test that the worker pool starts processes and serves traffic."""

    def test_pool_starts_and_serves_health(self, upload_dir):
        config = StaticServerConfig(
            build_path=str(
                Path(__file__).parent.parent
                / "gradio"
                / "templates"
                / "frontend"
                / "assets"
            ),
            static_path=str(
                Path(__file__).parent.parent
                / "gradio"
                / "templates"
                / "frontend"
                / "static"
            ),
            uploaded_file_dir=upload_dir,
        )
        pool = StaticWorkerPool(num_workers=2, config=config, ports=[17860, 17861])
        try:
            pool.start()
            for port in [17860, 17861]:
                resp = httpx.get(f"http://127.0.0.1:{port}/health", timeout=5)
                assert resp.status_code == 200
                assert resp.json() == {"status": "ok"}
        finally:
            pool.shutdown()

    def test_pool_round_robin(self, upload_dir):
        config = StaticServerConfig(uploaded_file_dir=upload_dir)
        pool = StaticWorkerPool(
            num_workers=3, config=config, ports=[17870, 17871, 17872]
        )
        assert pool.get_next_url() == "http://127.0.0.1:17870"
        assert pool.get_next_url() == "http://127.0.0.1:17871"
        assert pool.get_next_url() == "http://127.0.0.1:17872"
        assert pool.get_next_url() == "http://127.0.0.1:17870"

    def test_pool_upload_across_workers(self, tmp_path):
        upload_dir = str(tmp_path / "uploads")
        Path(upload_dir).mkdir(parents=True)
        config = StaticServerConfig(
            build_path=str(
                Path(__file__).parent.parent
                / "gradio"
                / "templates"
                / "frontend"
                / "assets"
            ),
            static_path=str(
                Path(__file__).parent.parent
                / "gradio"
                / "templates"
                / "frontend"
                / "static"
            ),
            uploaded_file_dir=upload_dir,
        )
        pool = StaticWorkerPool(num_workers=2, config=config, ports=[17880, 17881])
        try:
            pool.start()
            for port in [17880, 17881]:
                resp = httpx.post(
                    f"http://127.0.0.1:{port}/gradio_api/upload",
                    files={"files": ("test.txt", b"hello", "text/plain")},
                    timeout=5,
                )
                assert resp.status_code == 200
                assert len(resp.json()) == 1
                assert Path(resp.json()[0]).exists()
        finally:
            pool.shutdown()


@pytest.mark.skipif(shutil.which("node") is None, reason="Node not installed")
class TestNodeProxyStartupOrdering:
    """Regression coverage for a race where the Node front proxy began
    accepting connections on the user-facing port before the Python
    backend was ready, causing 502 errors on hosts like HF Spaces that
    route traffic as soon as the port opens."""

    def _cleanup(self, demo):
        node_process = getattr(demo, "node_process", None)
        if node_process is not None:
            node_process.terminate()
            try:
                node_process.wait(timeout=5)
            except Exception:
                node_process.kill()
        try:
            demo.close()
        except Exception:
            pass

    def test_node_starts_after_python_is_listening(self, monkeypatch):
        """When Node is the front proxy, ``start_node_server`` must be
        invoked only after ``http_server.start_server`` returns (i.e.,
        after Python's uvicorn instance is listening)."""
        import gradio as gr
        import gradio.blocks as blocks_mod
        from gradio import http_server

        events: list[str] = []
        original_start_server = http_server.start_server
        original_start_node = blocks_mod.start_node_server

        def patched_start_server(*args, **kwargs):
            events.append("python_start")
            result = original_start_server(*args, **kwargs)
            events.append("python_ready")
            return result

        def patched_start_node(*args, **kwargs):
            events.append("node_start")
            result = original_start_node(*args, **kwargs)
            events.append("node_returned")
            return result

        monkeypatch.setattr(http_server, "start_server", patched_start_server)
        monkeypatch.setattr(blocks_mod, "start_node_server", patched_start_node)

        demo = gr.Interface(lambda x: x, "text", "text")
        try:
            demo.launch(
                ssr_mode=True,
                server_port=18860,
                prevent_thread_lock=True,
                quiet=True,
            )
            if not getattr(demo, "_node_is_proxy", False):
                pytest.skip("Node proxy mode did not engage in this environment")

            assert "python_ready" in events, (
                f"http_server.start_server never ran. Events: {events}"
            )
            assert "node_start" in events, (
                f"start_node_server never ran. Events: {events}"
            )
            python_ready_idx = events.index("python_ready")
            node_start_idx = events.index("node_start")
            assert python_ready_idx < node_start_idx, (
                "Node front proxy was started before the Python backend "
                "was listening. The Node port opens immediately when the "
                "process binds, so clients hitting the port during this "
                "window receive 502 errors from the proxy. "
                f"Observed event order: {events}"
            )
        finally:
            self._cleanup(demo)

    def test_node_port_does_not_serve_502_during_python_startup(self, monkeypatch):
        """Probe the user-facing Node port DURING the Python startup
        window (achieved by injecting a delay into start_server). If the
        proxy port becomes reachable before Python is up, the proxy
        returns 502 for any request that arrives in that window — which
        is exactly what HF Spaces saw."""
        import socket
        import threading
        import time

        import gradio as gr
        from gradio import http_server

        node_port = 18864
        delay = 2.0
        py_started = threading.Event()
        original_start_server = http_server.start_server

        def slow_start_server(*args, **kwargs):
            time.sleep(delay)
            result = original_start_server(*args, **kwargs)
            py_started.set()
            return result

        monkeypatch.setattr(http_server, "start_server", slow_start_server)

        race_observations: dict[str, object] = {}

        def probe():
            """Probe the Node port repeatedly until Python is ready.
            Record the first 502 we see (the bug symptom)."""
            stop_at = time.time() + delay + 5
            while time.time() < stop_at and not py_started.is_set():
                try:
                    with socket.create_connection(
                        ("127.0.0.1", node_port), timeout=0.1
                    ):
                        try:
                            resp = httpx.get(
                                f"http://127.0.0.1:{node_port}/config",
                                timeout=0.5,
                            )
                            if (
                                resp.status_code == 502
                                and "first_502_at" not in race_observations
                            ):
                                race_observations["first_502_at"] = time.time()
                                race_observations["python_ready_yet"] = (
                                    py_started.is_set()
                                )
                                return
                        except httpx.HTTPError:
                            pass
                except OSError:
                    pass
                time.sleep(0.02)

        probe_thread = threading.Thread(target=probe, daemon=True)

        demo = gr.Interface(lambda x: x, "text", "text")
        try:
            probe_thread.start()
            demo.launch(
                ssr_mode=True,
                server_port=node_port,
                prevent_thread_lock=True,
                quiet=True,
            )
            if not getattr(demo, "_node_is_proxy", False):
                pytest.skip("Node proxy mode did not engage in this environment")
            probe_thread.join(timeout=delay + 5)

            assert "first_502_at" not in race_observations, (
                "Node proxy returned 502 to a client probe BEFORE Python "
                "finished starting — the user-facing port was opened too "
                "early. This is the race condition that produces 502s on "
                "HF Spaces."
            )
        finally:
            self._cleanup(demo)


@pytest.mark.skipif(
    sys.platform == "win32", reason="uses a shell script to stand in for node"
)
class TestNodeStartupDiagnostics:
    """When the Node SSR server starts but can't serve a page, the reason it
    gives has to reach the user. It previously went to DEVNULL and the failure
    was reported as a missing Node installation — which is what made the
    unshipped-postcss regression so hard to diagnose on HF Spaces."""

    def _fake_node(self, tmp_path, message):
        """A stand-in for node that complains on stderr and then just sits there,
        like a Node server that binds its port but 500s on every render."""
        script = tmp_path / "fake_node.sh"
        script.write_text(f'#!/bin/sh\necho "{message}" >&2\nsleep 30\n')
        script.chmod(0o755)
        return str(script)

    def test_node_stderr_is_reported_on_failure(self, tmp_path, monkeypatch, capsys):
        from gradio import node_server

        message = "Error: Cannot find module 'postcss'"

        # Real verification polls for up to 30s, so give the process the moment it
        # needs to write its error out before we give up on it.
        def slow_failing_verify(*args, **kwargs):
            time.sleep(1)
            return False

        monkeypatch.setattr(node_server, "verify_server_startup", slow_failing_verify)

        process, port = node_server.start_node_process(
            node_path=self._fake_node(tmp_path, message),
            server_name="127.0.0.1",
            server_ports=[18871],
        )

        assert process is None and port is None
        out = capsys.readouterr().out
        assert message in out, f"Node's stderr was not surfaced. Got: {out}"
        assert "install Node 20" not in out, (
            "Blamed the Node installation even though Node ran and explained "
            f"itself. Got: {out}"
        )

    def test_missing_node_still_suggests_installing_node(self, monkeypatch, capsys):
        """With nothing on stderr to go on, the Node-installation hint is still
        the most useful thing to say."""
        from gradio import node_server

        monkeypatch.setattr(node_server, "verify_server_startup", lambda *a, **k: False)

        process, port = node_server.start_node_process(
            node_path="/nonexistent/node",
            server_name="127.0.0.1",
            server_ports=[18872],
        )

        assert process is None and port is None
        assert "install Node 20" in capsys.readouterr().out


@pytest.mark.skipif(shutil.which("node") is None, reason="Node not installed")
class TestNodeProxyFallback:
    """In proxy mode Python binds an internal port and lets Node own the
    user-facing one. If Node can't serve, the app has to move onto the
    user-facing port rather than answer only on a port nothing routes to —
    otherwise a Space is reported as crashed while Python is healthy."""

    def _cleanup(self, demo):
        try:
            demo.close()
        except Exception:
            pass

    def test_serves_on_user_facing_port_when_node_fails(self, monkeypatch):
        import gradio as gr
        import gradio.blocks as blocks_mod

        user_port = 18866

        def failing_start_node(**kwargs):
            return kwargs["server_name"], None, None

        monkeypatch.setattr(blocks_mod, "start_node_server", failing_start_node)

        demo = gr.Interface(lambda x: x, "text", "text")
        try:
            demo.launch(
                ssr_mode=True,
                server_port=user_port,
                prevent_thread_lock=True,
                quiet=True,
            )

            assert demo._ssr_degraded, (
                "Node failed to start but Gradio did not fall back to serving "
                "on the user-facing port"
            )
            assert demo.server_port == user_port, (
                f"Expected Python on the user-facing port {user_port}, "
                f"got {demo.server_port}"
            )
            assert f":{user_port}" in demo.local_url
            resp = httpx.get(f"http://127.0.0.1:{user_port}/", timeout=10)
            assert resp.status_code == 200
        finally:
            self._cleanup(demo)

    def test_keeps_internal_port_when_user_port_is_taken(self, monkeypatch):
        """If something else holds the user-facing port, the app has to keep
        serving where it already is rather than end up with no listener."""
        import socket

        import gradio as gr

        user_port = 18868
        squatter = socket.socket()
        squatter.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        squatter.bind(("127.0.0.1", user_port))
        squatter.listen(1)

        demo = gr.Interface(lambda x: x, "text", "text")
        try:
            demo.launch(
                ssr_mode=True,
                server_port=user_port,
                prevent_thread_lock=True,
                quiet=True,
            )

            assert not demo._ssr_degraded
            assert demo.server_port != user_port
            resp = httpx.get(f"http://127.0.0.1:{demo.server_port}/", timeout=10)
            assert resp.status_code == 200
        finally:
            squatter.close()
            self._cleanup(demo)
