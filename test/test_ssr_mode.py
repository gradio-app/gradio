"""Tests for how SSR mode is resolved and the Node version it requires."""

import socket
import subprocess
import warnings

import pytest

import gradio as gr
from gradio import blocks as blocks_mod
from gradio import node_server


@pytest.fixture
def demo():
    with gr.Blocks() as demo:
        gr.Textbox()
    return demo


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    monkeypatch.delenv("GRADIO_SSR_MODE", raising=False)
    monkeypatch.delenv("GRADIO_LOCAL_DEV_MODE", raising=False)
    monkeypatch.setenv("GRADIO_NODE_PATH", "/fake/node")


def set_ssr_available(monkeypatch, reason, reason_ignoring_version=None):
    """`reason` is what the full check returns; `reason_ignoring_version` is what it
    returns with check_version=False (None means a Node install was found)."""

    def fake(_, check_version=True):
        return reason if check_version else reason_ignoring_version

    monkeypatch.setattr(blocks_mod, "get_ssr_unavailable_reason", fake)


class TestGetNodeVersion:
    @pytest.mark.parametrize(
        "output,expected",
        [
            (b"v24.22.0\n", (24, 22, 0)),
            (b"v25.1.3", (25, 1, 3)),
            (b"Python 3.11.9", None),
            (b"", None),
        ],
    )
    def test_parses_output(self, monkeypatch, output, expected):
        monkeypatch.setattr(subprocess, "check_output", lambda *a, **k: output)
        assert node_server.get_node_version("node") == expected

    def test_missing_executable(self, monkeypatch):
        def raise_oserror(*args, **kwargs):
            raise FileNotFoundError

        monkeypatch.setattr(subprocess, "check_output", raise_oserror)
        assert node_server.get_node_version("node") is None


class TestGetSsrUnavailableReason:
    @pytest.fixture(autouse=True)
    def ssr_build(self, monkeypatch, tmp_path):
        monkeypatch.setattr(node_server, "SSR_APP_PATH", tmp_path)

    def set_version(self, monkeypatch, version):
        monkeypatch.setattr(node_server, "get_node_version", lambda _: version)

    @pytest.mark.parametrize(
        "version",
        [(22, 23, 4), (22, 24, 0), (24, 22, 1), (24, 23, 0), (26, 12, 1), (27, 0, 0)],
    )
    def test_supported_versions(self, monkeypatch, version):
        self.set_version(monkeypatch, version)
        assert node_server.get_ssr_unavailable_reason("node") is None

    @pytest.mark.parametrize(
        "version",
        [
            (22, 23, 3),
            (24, 22, 0),
            (24, 21, 9),
            (26, 12, 0),
            (26, 0, 0),
            (20, 20, 2),
            (21, 7, 3),
            (23, 11, 1),
            (25, 9, 0),
        ],
    )
    def test_unpatched_or_end_of_life_versions(self, monkeypatch, version):
        self.set_version(monkeypatch, version)
        reason = node_server.get_ssr_unavailable_reason("node")
        assert reason is not None
        assert "22.23.4+, 24.22.1+, 26.12.1+" in reason

    def test_version_check_can_be_skipped(self, monkeypatch):
        self.set_version(monkeypatch, (20, 20, 2))
        assert (
            node_server.get_ssr_unavailable_reason("node", check_version=False) is None
        )

    def test_no_node(self, monkeypatch):
        self.set_version(monkeypatch, None)
        assert node_server.get_ssr_unavailable_reason(None) is not None

    def test_missing_ssr_build(self, monkeypatch, tmp_path):
        monkeypatch.setattr(node_server, "SSR_APP_PATH", tmp_path / "missing")
        self.set_version(monkeypatch, (24, 22, 1))
        assert node_server.get_ssr_unavailable_reason("node") is not None


class TestResolveSsrMode:
    def test_on_by_default_with_supported_node(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, None)
        assert demo._resolve_ssr_mode(None) is True

    def test_silent_fallback_by_default_without_supported_node(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "too old")
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            assert demo._resolve_ssr_mode(None) is False

    def test_explicit_request_uses_older_node_with_warning(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "too old")
        with pytest.warns(UserWarning, match="too old.*Using SSR mode anyway"):
            assert demo._resolve_ssr_mode(True) is True

    def test_env_var_request_uses_older_node_with_warning(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "too old")
        monkeypatch.setenv("GRADIO_SSR_MODE", "true")
        with pytest.warns(UserWarning, match="Using SSR mode anyway"):
            assert demo._resolve_ssr_mode(None) is True

    def test_warns_and_falls_back_when_requested_without_node(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "no node", reason_ignoring_version="no node")
        with pytest.warns(UserWarning, match="no node.*Disabling SSR mode"):
            assert demo._resolve_ssr_mode(True) is False

    def test_explicit_false(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, None)
        assert demo._resolve_ssr_mode(False) is False

    @pytest.mark.parametrize("value,expected", [("false", False), ("True", True)])
    def test_env_var(self, monkeypatch, demo, value, expected):
        set_ssr_available(monkeypatch, None)
        monkeypatch.setenv("GRADIO_SSR_MODE", value)
        assert demo._resolve_ssr_mode(None) is expected

    def test_explicit_arg_beats_env_var(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, None)
        monkeypatch.setenv("GRADIO_SSR_MODE", "false")
        assert demo._resolve_ssr_mode(True) is True

    def test_mounted_apps_stay_opt_in(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, None)
        assert demo._resolve_ssr_mode(None, default=False) is False
        assert demo._resolve_ssr_mode(True, default=False) is True

    def test_server_mode_stays_opt_in(self, monkeypatch):
        # In gr.Server mode Node has nothing to render and only proxies requests,
        # which breaks WebSocket routes, so launch() must not turn SSR on by default.
        # (The process executor's gateway copies `mode` from the config, so it
        # resolves the same way.)
        set_ssr_available(monkeypatch, None)
        original = gr.Blocks._resolve_ssr_mode

        class ResolvedError(Exception):
            pass

        def resolve_then_stop(self, ssr_mode, **kwargs):
            raise ResolvedError(original(self, ssr_mode, **kwargs))

        monkeypatch.setattr(gr.Blocks, "_resolve_ssr_mode", resolve_then_stop)
        for ssr_mode, expected in [(None, False), (True, True)]:
            with pytest.raises(ResolvedError) as exc:
                gr.Server().launch(
                    ssr_mode=ssr_mode, executor="thread", prevent_thread_lock=True
                )
            assert exc.value.args[0] is expected

    def test_dev_mode_stays_opt_in(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "no build")
        monkeypatch.setenv("GRADIO_LOCAL_DEV_MODE", "1")
        assert demo._resolve_ssr_mode(None) is False
        assert demo._resolve_ssr_mode(True) is True


class TestFindFreePort:
    def test_skips_a_port_with_a_listener(self):
        # SSR puts Python on a port picked this way. On Windows, a check using
        # SO_REUSEADDR reported ports with a listener as free.
        listener = socket.socket()
        listener.bind(("127.0.0.1", 0))
        listener.listen(1)
        port = listener.getsockname()[1]
        try:
            assert not blocks_mod._port_is_free("127.0.0.1", port)
            with pytest.raises(OSError):
                blocks_mod._find_free_port("127.0.0.1", start=port, try_count=1)
        finally:
            listener.close()
