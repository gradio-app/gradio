"""Contains tests for networking.py and app.py"""

import os

from fastapi.testclient import TestClient

from gradio import Interface, networking
from gradio.route_utils import API_PREFIX

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestInterfaceErrors:
    def test_processing_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            f"{API_PREFIX}/api/predict/", json={"data": [0], "fn_index": 0}
        )
        assert response.status_code == 500
        assert "error" in response.json()
        io.close()

    def test_validation_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(f"{API_PREFIX}/api/predict/", json={"fn_index": [0]})
        assert response.status_code == 422
        io.close()


class TestURLs:
    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        assert res


def test_start_server_app_kwargs():
    """
    Test that start_server accepts app_kwargs and they're propagated to FastAPI.
    """
    io = Interface(lambda x: x, "number", "number")
    app, _, _ = io.launch(
        show_error=True,
        prevent_thread_lock=True,
        app_kwargs={
            "docs_url": f"{API_PREFIX}/docs",
        },
    )
    client = TestClient(app)
    assert client.get(f"{API_PREFIX}/docs").status_code == 200
    io.close()
