from pathlib import Path
from unittest.mock import patch
import asyncio
import pytest

import gradio
import gradio as gr
from gradio.reload import _setup_config, Server


def build_demo():
    with gr.Blocks() as demo:
        gr.Textbox("")

    return demo


class TestReload:
    @pytest.fixture(autouse=True)
    def argv(self):
        return ["demo/calculator/run.py"]

    @pytest.fixture
    def config(self, monkeypatch, argv):
        monkeypatch.setattr("sys.argv", ["gradio"] + argv)
        return _setup_config()

    @pytest.fixture(params=[{}])
    def reloader(self, config):
        reloader = Server(config)
        reloader.should_exit = True
        yield reloader
        reloader.handle_exit(2, None)

    def test_config_default_app(self, config):
        assert "demo.calculator.run:demo.app" == config.app

    @pytest.mark.parametrize("argv", [["demo/calculator/run.py", "test.app"]])
    def test_config_custom_app(self, config):
        assert "demo.calculator.run:test.app" == config.app

    def test_config_watch_gradio(self, config):
        gradio_dir = Path(gradio.__file__).parent
        assert gradio_dir in config.reload_dirs

    def test_config_watch_app(self, config):
        demo_dir = Path("demo/calculator/run.py").resolve().parent
        assert demo_dir in config.reload_dirs

    def test_config_load_default(self, config):
        config.load()
        assert config.loaded == True

    @pytest.mark.parametrize("argv", [["test/test_reload.py", "build_demo"]])
    def test_config_load_factory(self, config):
        config.load()
        assert config.loaded == True

    def test_reload_run_default(self, reloader):
        asyncio.run(reloader.serve())
        assert reloader.started == True
