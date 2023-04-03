"""Contains tests for networking.py and app.py"""

import os
import urllib
import warnings

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio import Interface, networking

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestPort:
    def test_port_is_in_range(self):
        start = 7860
        end = 7960
        try:
            port = networking.get_first_available_port(start, end)
            assert start <= port <= end
        except OSError:
            warnings.warn("Unable to test, no ports available")

    def test_same_port_is_returned(self):
        start = 7860
        end = 7960
        try:
            port1 = networking.get_first_available_port(start, end)
            port2 = networking.get_first_available_port(start, end)
            assert port1 == port2
        except OSError:
            warnings.warn("Unable to test, no ports available")


class TestInterfaceErrors:
    def test_processing_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/predict/", json={"data": [0], "fn_index": 0})
        assert response.status_code == 500
        assert "error" in response.json()
        io.close()

    def test_validation_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/predict/", json={"fn_index": [0]})
        assert response.status_code == 422
        io.close()


class TestStartServer:

    # Test IPv4 and IPv6 hostnames as they would be passed from --server-name.
    @pytest.mark.parametrize("host", ["127.0.0.1", "[::1]"])
    def test_start_server(self, host):
        io = Interface(lambda x: x, "number", "number")
        io.favicon_path = None
        io.config = io.get_config_file()
        io.show_error = True
        io.flagging_callback.setup(gr.Number(), io.flagging_dir)
        io.auth = None
        io.host = host

        port = networking.get_first_available_port(
            networking.INITIAL_PORT_VALUE,
            networking.INITIAL_PORT_VALUE + networking.TRY_NUM_PORTS,
        )
        io.enable_queue = False
        _, _, local_path, _, server = networking.start_server(io, server_port=port)
        url = urllib.parse.urlparse(local_path)
        assert url.scheme == "http"
        assert url.port == port
        server.close()


class TestURLs:
    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        assert res
