import dataclasses
from pathlib import Path
from typing import List

import pytest

import gradio
import gradio as gr
from gradio.networking import Server
from gradio.reload import _setup_config


def build_demo():
    with gr.Blocks() as demo:
        gr.Textbox("")

    return demo


@dataclasses.dataclass
class Config:
    filename: str
    path: Path
    watch_dirs: List[str]
    demo_name: str


class TestReload:
    @pytest.fixture(autouse=True)
    def argv(self):
        return ["demo/calculator/run.py"]

    @pytest.fixture
    def config(self, monkeypatch, argv) -> Config:
        monkeypatch.setattr("sys.argv", ["gradio"] + argv)
        return Config(*_setup_config())

    @pytest.fixture(params=[{}])
    def reloader(self, config):
        reloader = Server(config)
        reloader.should_exit = True
        yield reloader
        reloader.close()

    def test_config_default_app(self, config):
        assert config.filename == "demo.calculator.run"

    @pytest.mark.parametrize("argv", [["demo/calculator/run.py", "test"]])
    def test_config_custom_app(self, config):
        assert config.filename == "demo.calculator.run"
        assert config.demo_name == "test"

    def test_config_watch_gradio(self, config):
        gradio_dir = str(Path(gradio.__file__).parent)
        assert gradio_dir in config.watch_dirs

    def test_config_watch_app(self, config):
        demo_dir = str(Path("demo/calculator/run.py").resolve().parent)
        assert demo_dir in config.watch_dirs
