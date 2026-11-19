"""The component classes that core Gradio needs. Every other component lives in the
`gradio_components` package and is looked up there on first use, so
`gradio.components.Textbox` and `from gradio.components import Textbox` keep working
when that package is installed."""

from gradio import _components_package
from gradio.components.base import (
    Component,
    FormComponent,
    StreamingInput,
    StreamingOutput,
    _Keywords,
    component,
    get_component_instance,
)
from gradio.components.state import State
from gradio.layouts import Form

__all__ = [
    "Component",
    "Form",
    "FormComponent",
    "State",
    "StreamingInput",
    "StreamingOutput",
    "_Keywords",
    "component",
    "get_component_instance",
]


def __getattr__(name: str):
    if name.startswith("__"):
        raise AttributeError(name)
    package = _components_package.require(f"`gradio.components.{name}`")
    try:
        return getattr(package, name)
    except AttributeError:
        raise AttributeError(
            f"module 'gradio.components' has no attribute {name!r}"
        ) from None
