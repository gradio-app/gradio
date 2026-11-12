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
        io.flagging_callback.setup([gr.Number()], io.flagging_dir)
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


class _SocketThatCannotBind:
    def __init__(self, error: OSError):
        self.error = error

    def setsockopt(self, *args):
        pass

    def bind(self, address):
        raise self.error

    def close(self):
        pass


def _bind_error(winerror: int | None) -> OSError:
    error = OSError(13, "An attempt was made to access a socket in a way forbidden")
    error.winerror = winerror  # type: ignore[attr-defined]
    return error


class TestPortUnavailableMessage:
    @pytest.mark.parametrize(
        "platform,winerror,mentions_windows",
        [
            ("win32", 10013, True),  # port in a Windows excluded port range
            ("win32", 10048, False),  # port actually in use
            ("linux", 10013, False),
        ],
    )
    def test_mentions_windows_reserved_ports_only_when_relevant(
        self, monkeypatch, platform, winerror, mentions_windows
    ):
        monkeypatch.setattr(http_server.sys, "platform", platform)
        error = _bind_error(winerror)
        monkeypatch.setattr(
            http_server.socket, "socket", lambda *args: _SocketThatCannotBind(error)
        )

        with pytest.raises(OSError, match="Cannot find empty port") as excinfo:
            http_server.start_server(None, server_port=7865)  # type: ignore[arg-type]

        assert ("excludedportrange" in str(excinfo.value)) == mentions_windows
