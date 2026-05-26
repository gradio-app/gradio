"""Tests for the Node-as-proxy architecture and static worker routing."""

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
