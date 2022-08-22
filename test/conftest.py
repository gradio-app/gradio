import inspect
import pathlib

import pytest

import gradio as gr


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "flaky: mark test as flaky. Failure will not cause te"
    )


@pytest.fixture
def test_file_dir():
    return pathlib.Path(pathlib.Path(__file__).parent, "test_files")


@pytest.fixture
def io_components():
    classes_to_check = gr.components.IOComponent.__subclasses__()
    subclasses = []

    while classes_to_check:
        subclass = classes_to_check.pop()
        children = subclass.__subclasses__()

        if children:
            classes_to_check.extend(children)
        if "value" in inspect.signature(subclass).parameters:
            subclasses.append(subclass)

    return subclasses
