"""Tests for how SSR mode is resolved and the Node version it requires."""

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


def set_ssr_available(monkeypatch, reason):
    monkeypatch.setattr(blocks_mod, "get_ssr_unavailable_reason", lambda _: reason)


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

    @pytest.mark.parametrize("version", [(24, 22, 0), (24, 22, 1), (25, 0, 0)])
    def test_supported_versions(self, monkeypatch, version):
        self.set_version(monkeypatch, version)
        assert node_server.get_ssr_unavailable_reason("node") is None

    @pytest.mark.parametrize("version", [(24, 21, 9), (22, 12, 0), (20, 0, 0)])
    def test_old_versions(self, monkeypatch, version):
        self.set_version(monkeypatch, version)
        reason = node_server.get_ssr_unavailable_reason("node")
        assert reason is not None
        assert "24.22.0" in reason

    def test_no_node(self, monkeypatch):
        self.set_version(monkeypatch, None)
        assert node_server.get_ssr_unavailable_reason(None) is not None

    def test_missing_ssr_build(self, monkeypatch, tmp_path):
        monkeypatch.setattr(node_server, "SSR_APP_PATH", tmp_path / "missing")
        self.set_version(monkeypatch, (24, 22, 0))
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

    def test_warns_when_requested_without_supported_node(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "too old")
        with pytest.warns(UserWarning, match="too old"):
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

    def test_dev_mode_stays_opt_in(self, monkeypatch, demo):
        set_ssr_available(monkeypatch, "no build")
        monkeypatch.setenv("GRADIO_LOCAL_DEV_MODE", "1")
        assert demo._resolve_ssr_mode(None) is False
        assert demo._resolve_ssr_mode(True) is True
