import inspect
import pathlib
from contextlib import contextmanager

import pytest
from gradio_client import Client

import gradio as gr
import gradio.utils


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "flaky: mark test as flaky. Failure will not cause te"
    )


@pytest.fixture
def test_file_dir():
    return pathlib.Path(pathlib.Path(__file__).parent, "test_files")


@pytest.fixture
def io_components():
    all_subclasses = gradio.utils.core_gradio_components()
    subclasses = []
    for subclass in all_subclasses:
        if subclass in [
            gr.components.FormComponent,
            gr.State,
            gr.LoginButton,
            gr.Timer,
            gr.Dialogue,
            gr.Navbar,
        ]:
            continue
        if subclass in gr.components.FormComponent.__subclasses__():
            continue

        if "value" in inspect.signature(subclass.__init__).parameters:
            subclasses.append(subclass)

    return subclasses


@pytest.fixture
def connect():
    @contextmanager
    def _connect(demo: gr.Blocks, **kwargs):
        _, local_url, _ = demo.launch(prevent_thread_lock=True, **kwargs)
        try:
            client = Client(local_url)
            yield client
        finally:
            client.close()  # type: ignore
            demo.close()

    return _connect


@pytest.fixture(autouse=True)
def gradio_temp_dir(monkeypatch, tmp_path):
    """tmp_path is unique to each test function.
    It will be cleared automatically according to pytest docs: https://docs.pytest.org/en/6.2.x/reference.html#tmp-path
    """
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    return tmp_path


@pytest.fixture(autouse=True)
def clear_static_files():
    """Clears all static files from the _StaticFiles class.

    This is necessary because the tests should be independent of one another.
    """
    yield
    from gradio import data_classes

    data_classes._StaticFiles.clear()


@pytest.fixture
def test_mcp_app():
    """Fixture that creates a test Gradio app with a simple text processing tool for MCP tests."""

    def test_tool(x: str) -> str:
        """
        This is a test tool.
        Parameters:
        - x: str
        Returns:
        - the original value as a string
        """
        return str(x)

    with gr.Blocks() as app:
        t1 = gr.Textbox(label="Test Textbox")
        t2 = gr.Textbox(label="Test Textbox 2")
        t1.submit(test_tool, t1, t2)

    return app


@pytest.fixture
def media_data():
    import sys
    from pathlib import Path

    sys.path.append(Path("..", "client", "python", "test").resolve().as_posix())
    from client.python.test import media_data

    return media_data


@pytest.fixture
def stateful_mcp_app():
    def process(name: str, hidden_state: str, flag: bool, gallery_images):
        """
        Process inputs and return a result.

        Args:
        name: A text input from user
        hidden_state: A value from gr.State (hidden from MCP)
        flag: A boolean checkbox
        gallery_images: Gallery images list

        Returns:
        str: Result showing all received values
        """
        return f"name={name}, hidden_state={hidden_state}, flag={flag}, gallery={gallery_images}"

    with gr.Blocks() as demo:
        gr.Markdown("# Gradio MCP Bug: gr.State breaks parameter order")

        name_input = gr.Textbox(label="Name", value="test")
        hidden_state = gr.State(value="hidden_value")
        flag_input = gr.Checkbox(label="Flag", value=True)
        gallery = gr.Number(label="Images")

        output = gr.Textbox(label="Result")

        btn = gr.Button("Process")
        btn.click(
            process,
            inputs=[name_input, hidden_state, flag_input, gallery],
            outputs=[output],
            api_visibility="public",
        )
    return demo
