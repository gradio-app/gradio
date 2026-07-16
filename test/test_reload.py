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


def test_reassign_pending_event_fns():
    """Events that are pending or running when the app is hot-reloaded should
    be pointed at the new app's BlockFunction objects (matched by api_name)
    so that in-flight generators keep working after the reload.

    Regression test for https://github.com/gradio-app/gradio/issues/8712
    """
    from gradio.queueing import Event, EventQueue, Queue
    from gradio.utils import reassign_pending_event_fns

    def greet():
        return "hi"

    with gr.Blocks() as demo1:
        t1 = gr.Textbox(key="t")
        btn1 = gr.Button()
        btn1.click(greet, None, t1)

    with gr.Blocks() as demo2:
        gr.Markdown("added by the reload")
        t2 = gr.Textbox(key="t")
        btn2 = gr.Button()
        btn2.click(greet, None, t2)

    old_fn = next(
        fn for fn in demo1.default_config.fns.values() if fn.api_name == "greet"
    )
    new_fn = next(
        fn for fn in demo2.default_config.fns.values() if fn.api_name == "greet"
    )
    assert old_fn is not new_fn

    queue = Queue(
        live_updates=True,
        concurrency_count=1,
        update_intervals=1,
        max_size=None,
        blocks=demo1,
    )
    running_event = Event(session_hash="abc", fn=old_fn, request=None, username=None)
    queue.active_jobs = [[running_event]]
    pending_event = Event(session_hash="abc", fn=old_fn, request=None, username=None)
    event_queue = EventQueue(old_fn.concurrency_id, None)
    event_queue.queue.append(pending_event)
    queue.event_queue_per_concurrency_id[old_fn.concurrency_id] = event_queue
    demo2._queue = queue

    reassign_pending_event_fns(demo2)

    assert running_event.fn is new_fn
    assert pending_event.fn is new_fn


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
