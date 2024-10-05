from __future__ import annotations

import inspect

from rich.console import Console
from rich.table import Table

import gradio._simple_templates
import gradio.components
import gradio.layouts
from gradio.analytics import custom_component_analytics
from gradio.blocks import BlockContext
from gradio.components import Component, FormComponent

_IGNORE = {
    "Text",
    "Dataframe",
    "Highlightedtext",
    "Annotatedimage",
    "Checkboxgroup",
    "Json",
    "Highlight",
    "Component",
    "Form",
    "Dataset",
    "FormComponent",
    "Fallback",
    "State",
    "LogoutButton",
}

_BEGINNER_FRIENDLY = {"Slider", "Radio", "Checkbox", "Number", "CheckboxGroup", "File"}


def _get_table_items(module):
    items = []
    for name in module.__all__:
        if name in _IGNORE:
            continue
        gr_cls = getattr(module, name)
        if not (
            inspect.isclass(gr_cls) and issubclass(gr_cls, (Component, BlockContext))
        ):
            continue
        tags = []
        if "Simple" in name or name in _BEGINNER_FRIENDLY:
            tags.append(":seedling::handshake:Beginner Friendly:seedling::handshake:")
        if issubclass(gr_cls, FormComponent):
            tags.append(":pencil::jigsaw:Form Component:pencil::jigsaw:")
        if name in gradio.layouts.__all__:
            tags.append(":triangular_ruler:Layout:triangular_ruler:")
        doc = inspect.getdoc(gr_cls) or "No description available."
        doc = doc.split(".")[0]
        if tags:
            doc = f"[{', '.join(tags)}]" + " " + doc
        items.append((name, doc))

    return items


def _show():
    custom_component_analytics(
        "show",
        None,
        upload_demo=None,
        upload_pypi=None,
        upload_source=None,
    )
    items = (
        _get_table_items(gradio._simple_templates)
        + _get_table_items(gradio.components)
        + _get_table_items(gradio.layouts)
    )
    table = Table(show_header=True, header_style="orange1", show_lines=True)
    table.add_column("Name", justify="center")
    table.add_column("Description", justify="center")

    for item in items:
        table.add_row(*item)

    console = Console()
    with console.pager():
        console.print(table)
