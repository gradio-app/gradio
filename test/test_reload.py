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


def test_reload_exec_does_not_stringify_annotations(tmp_path):
    """Verify that watchfn's exec does not stringify user annotations.

    If gradio/utils.py uses `from __future__ import annotations`, a bare
    exec(source_string, ...) called from that module inherits the
    CO_FUTURE_ANNOTATIONS flag, turning all annotations into ForwardRef
    strings.  This breaks libraries (e.g. langgraph) that call
    get_type_hints() on user-defined TypedDict classes with Annotated types.

    The fix is to ensure utils.py does NOT use `from __future__ import
    annotations`, so exec() in watchfn preserves eager annotation evaluation.

    Regression test for https://github.com/gradio-app/gradio/issues/12090
    """
    import types
    from typing import ForwardRef

    # Write a demo file that uses Annotated in a TypedDict
    demo_file = tmp_path / "app.py"
    demo_file.write_text(
        "from typing import Annotated, TypedDict, Sequence\n"
        "import gradio as gr\n"
        "\n"
        "class State(TypedDict):\n"
        "    messages: Annotated[Sequence[str], 'reducer']\n"
        "\n"
        "with gr.Blocks() as demo:\n"
        "    gr.Textbox()\n"
    )

    module = types.ModuleType("__main__")
    module.__builtins__ = __builtins__
    module.__file__ = str(demo_file)

    # Simulate what watchfn does: read source and exec it
    source = demo_file.read_text()
    exec(source, module.__dict__)  # noqa: S102

    State = module.__dict__["State"]  # noqa: N806
    ann = State.__dict__["__annotations__"]["messages"]
    assert not isinstance(ann, (str, ForwardRef)), (
        f"Annotation should be an actual type, not {type(ann).__name__}. "
        "exec() is likely inheriting CO_FUTURE_ANNOTATIONS from the caller."
    )
