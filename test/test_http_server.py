import urllib.parse

import pytest

import gradio as gr
from gradio import http_server, routes


class TestStartServer:
    # Test IPv4 and IPv6 hostnames as they would be passed from --server-name.
    @pytest.mark.parametrize("host", ["127.0.0.1", "[::1]"])
    def test_start_server(self, host):
        io = gr.Interface(lambda x: x, "number", "number")
        io.favicon_path = None
        io.config = io.get_config_file()
        io.show_error = True
        io.flagging_callback.setup(gr.Number(), io.flagging_dir)
        io.auth = None
        app = routes.App.create_app(io)

        _, _, local_path, server = http_server.start_server(app)
        url = urllib.parse.urlparse(local_path)
        assert url.scheme == "http"
        assert url.port is not None
        assert (
            http_server.INITIAL_PORT_VALUE
            <= url.port
            <= http_server.INITIAL_PORT_VALUE + http_server.TRY_NUM_PORTS
        )
        server.close()
