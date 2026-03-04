import dataclasses
from pathlib import Path

import pytest

import gradio as gr
from gradio.cli.commands.reload import _setup_config
from gradio.http_server import Server


def build_demo():
    with gr.Blocks() as demo:
        gr.Textbox("")

    return demo


@dataclasses.dataclass
class Config:
    module_name: str
    path: Path
    watch_dirs: list[str]
    demo_name: str


class TestReload:
    @pytest.fixture(autouse=True)
    def argv(self):
        return ["demo/calculator/run.py"]

    @pytest.fixture
    def config(self, monkeypatch, argv) -> Config:
        monkeypatch.setattr("sys.argv", ["gradio"] + argv)
        name = argv[1].replace("--demo-name", "").strip() if len(argv) > 1 else "demo"
        return Config(*_setup_config(argv[0]), demo_name=name)  # ty: ignore error[parameter-already-assigned]

    @pytest.fixture(params=[{}])
    def reloader(self, config):
        reloader = Server(config)
        reloader.should_exit = True
        yield reloader
        reloader.close()

    def test_config_default_app(self, config):
        assert config.module_name == "demo.calculator.run"

    @pytest.mark.parametrize("argv", [["demo/calculator/run.py", "--demo-name test"]])
    def test_config_custom_app(self, config):
        assert config.module_name == "demo.calculator.run"
        assert config.demo_name == "test"

    def test_config_watch_app(self, config):
        demo_dir = str(Path("demo/calculator/run.py").resolve().parent)
        assert demo_dir in config.watch_dirs


def test_watchfn_does_not_inherit_future_annotations():
    """The watchfn function must not carry CO_FUTURE_ANNOTATIONS.

    When a module uses `from __future__ import annotations`, every
    exec(source_string, ...) called from that module inherits the flag and
    stringifies all annotations in the exec'd code.  This breaks libraries
    (e.g. langgraph) that call get_type_hints() on user-defined classes with
    Annotated types during hot reload.

    Regression test for https://github.com/gradio-app/gradio/issues/12090
    """
    import __future__

    from gradio.utils import watchfn

    flag = __future__.annotations.compiler_flag
    assert not (watchfn.__code__.co_flags & flag), (
        "watchfn has CO_FUTURE_ANNOTATIONS set. "
        "Remove `from __future__ import annotations` from gradio/utils.py "
        "to prevent exec() from stringifying user annotations during reload."
    )
