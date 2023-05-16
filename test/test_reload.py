from pathlib import Path

import pytest

import gradio
import gradio as gr
from gradio.networking import Server
from gradio.reload import _setup_config


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
        reloader.close()

    def test_config_default_app(self, config):
        assert config.app == "demo.calculator.run:demo.app"

    @pytest.mark.parametrize("argv", [["demo/calculator/run.py", "test.app"]])
    def test_config_custom_app(self, config):
        assert config.app == "demo.calculator.run:test.app"

    def test_config_watch_gradio(self, config):
        gradio_dir = Path(gradio.__file__).parent
        assert gradio_dir in config.reload_dirs

    def test_config_watch_app(self, config):
        demo_dir = Path("demo/calculator/run.py").resolve().parent
        assert demo_dir in config.reload_dirs

<<<<<<< HEAD
@patch("gradio.reload.os.system")
@patch("gradio.cli.sys")
def test_run_in_reload_mode(mock_sys, mock_system_call):

    mock_sys.argv = ["gradio", "demo/calculator/run.py"]
    cli()
    reload_command = mock_system_call.call_args[0][0]
    gradio_dir = Path(gradio.__file__).parent
    demo_dir = Path("demo/calculator/run.py").resolve().parent
=======
    def test_config_load_default(self, config):
        config.load()
        assert config.loaded is True

    @pytest.mark.parametrize("argv", [["test/test_reload.py", "build_demo"]])
    def test_config_load_factory(self, config):
        config.load()
        assert config.loaded is True
>>>>>>> origin

    def test_reload_run_default(self, reloader):
        reloader.run_in_thread()
        assert reloader.started is True
