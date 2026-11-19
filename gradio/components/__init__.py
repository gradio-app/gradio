"""The component classes that core Gradio needs. Every other component lives in the
`gradio_components` package and is looked up there on first use, so
`gradio.components.Textbox` and `from gradio.components import Textbox` keep working
when that package is installed."""

from typing import TYPE_CHECKING

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

if TYPE_CHECKING:
    # so that type checkers know the components that `__getattr__` returns below
    from gradio_components import *  # noqa: F403

__all__ = [
    "Component",
    "FormComponent",
    "State",
    "StreamingInput",
    "StreamingOutput",
    "_Keywords",
    "component",
    "get_component_instance",
]


def __getattr__(name: str):
    if name.startswith("_"):
        # no component is private, so that `getattr(module, "_x", None)` and
        # `hasattr` work with or without `gradio_components`
        raise AttributeError(f"module 'gradio.components' has no attribute {name!r}")
    if not _components_package.is_installed():
        import sys

        raise _components_package.missing_attribute_error(
            f"`gradio.components.{name}`", sys._getframe(1)
        )
    package = _components_package.require(f"`gradio.components.{name}`")
    try:
        return getattr(package, name)
    except AttributeError:
        raise AttributeError(
            f"module 'gradio.components' has no attribute {name!r}"
        ) from None
