"""Tests for the Node-as-proxy architecture and static worker routing."""

import shutil
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
